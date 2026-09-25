"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireInstructor } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Returns the currently logged in instructor profile and all courses assigned to them.
 */
export async function getInstructorDashboardData() {
  const user = await requireInstructor();

  // Find instructor record by userId, or link via email if not yet linked
  let instructor = await prisma.instructor.findFirst({
    where: {
      OR: [{ userId: user.id }, { email: user.email }],
    },
    include: {
      courses: {
        include: {
          course: {
            include: {
              schedule: true,
              _count: {
                select: {
                  enrollments: {
                    where: {
                      status: { in: ["ACTIVE", "PENDING_VERIFICATION"] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // If user is ADMIN or instructor record doesn't exist yet, allow fallback
  if (!instructor && user.role === "ADMIN") {
    // If admin is viewing instructor dashboard, show all courses
    const allCourses = await prisma.course.findMany({
      include: {
        schedule: true,
        _count: {
          select: {
            enrollments: {
              where: {
                status: { in: ["ACTIVE", "PENDING_VERIFICATION"] },
              },
            },
          },
        },
      },
      orderBy: { title: "asc" },
    });

    return {
      instructor: {
        id: "admin",
        name: user.name || "Administrator",
        email: user.email,
        bio: "Academy Administrator & Master Instructor",
        experience: "Senior Administrator",
        contact: "",
        courses: allCourses.map((c) => ({ course: c })),
      },
      stats: {
        totalCourses: allCourses.length,
        totalStudents: allCourses.reduce((acc, c) => acc + c._count.enrollments, 0),
        activeSchedules: allCourses.filter((c) => Boolean(c.schedule?.meetingUrl)).length,
      },
    };
  }

  // Auto-link userId if found by email
  if (instructor && !instructor.userId) {
    await prisma.instructor.update({
      where: { id: instructor.id },
      data: { userId: user.id },
    });
  }

  if (!instructor) {
    // Auto-create instructor profile for this INSTRUCTOR user if missing
    instructor = await prisma.instructor.create({
      data: {
        userId: user.id,
        name: user.name || "Instructor",
        email: user.email,
        experience: "Qualified IT Instructor",
      },
      include: {
        courses: {
          include: {
            course: {
              include: {
                schedule: true,
                _count: {
                  select: {
                    enrollments: {
                      where: {
                        status: { in: ["ACTIVE", "PENDING_VERIFICATION"] },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  const assignedCourses = instructor.courses.map((ci) => ci.course);
  const totalStudents = assignedCourses.reduce((acc, c) => acc + c._count.enrollments, 0);
  const activeSchedules = assignedCourses.filter((c) => Boolean(c.schedule?.meetingUrl)).length;

  return {
    instructor: {
      id: instructor.id,
      name: instructor.name,
      email: instructor.email || user.email,
      bio: instructor.bio || "",
      experience: instructor.experience || "",
      contact: instructor.contact || "",
      courses: instructor.courses,
    },
    stats: {
      totalCourses: assignedCourses.length,
      totalStudents,
      activeSchedules,
    },
  };
}

const updateMeetSchema = z.object({
  courseId: z.string().min(1),
  meetingUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL (e.g. https://meet.google.com/abc-defg-hij)")
    .refine(
      (val) => val.includes("meet.google.com") || val.includes("zoom.us") || val.includes("teams.microsoft.com") || val.startsWith("https://"),
      "Please enter a valid live meeting link",
    ),
  days: z.array(z.string()).default(["Mon", "Wed", "Fri"]),
  startTime: z.string().default("18:00"),
  endTime: z.string().default("19:30"),
  instructions: z.string().optional(),
});

/**
 * Updates or sets the Google Meet link and class schedule for a course.
 */
export async function updateCourseGoogleMeet(input: z.infer<typeof updateMeetSchema>): Promise<ActionResult> {
  const user = await requireInstructor();
  const parsed = updateMeetSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { courseId, meetingUrl, days, startTime, endTime, instructions } = parsed.data;

  // Authorization check: Verify instructor teaches this course (unless ADMIN)
  if (user.role !== "ADMIN") {
    const isAssigned = await prisma.courseInstructor.findFirst({
      where: {
        courseId,
        instructor: {
          OR: [{ userId: user.id }, { email: user.email }],
        },
      },
    });

    if (!isAssigned) {
      return { ok: false, error: "You are not assigned as the instructor for this course." };
    }
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, schedule: true },
  });

  if (!course) {
    return { ok: false, error: "Course not found" };
  }

  // Upsert schedule
  await prisma.classSchedule.upsert({
    where: { courseId },
    create: {
      courseId,
      meetingUrl,
      days,
      startTime,
      endTime,
      instructions: instructions || null,
      timezone: "Asia/Karachi",
    },
    update: {
      meetingUrl,
      days,
      startTime,
      endTime,
      instructions: instructions || null,
    },
  });

  // Notify active enrolled students in this course
  try {
    const activeEnrollments = await prisma.enrollment.findMany({
      where: { courseId, status: "ACTIVE" },
      select: { studentId: true },
    });

    if (activeEnrollments.length > 0) {
      await prisma.notification.createMany({
        data: activeEnrollments.map((enr) => ({
          userId: enr.studentId,
          type: "COURSE_UPDATE",
          title: `Live Class Link Updated: ${course.title}`,
          message: `Your instructor updated the Google Meet link for ${course.title}. Log in to your student portal to join!`,
          link: `/dashboard/courses/${courseId}`,
        })),
      });
    }
  } catch (notifyErr) {
    console.warn("Failed to create student notifications:", notifyErr);
  }

  revalidatePath("/instructor");
  revalidatePath(`/dashboard`);
  revalidatePath(`/api/meet/${courseId}`);

  return { ok: true };
}

/**
 * Returns the list of enrolled students for a specific course assigned to the instructor.
 */
export async function getCourseStudents(courseId: string) {
  const user = await requireInstructor();

  // Authorization check
  if (user.role !== "ADMIN") {
    const isAssigned = await prisma.courseInstructor.findFirst({
      where: {
        courseId,
        instructor: {
          OR: [{ userId: user.id }, { email: user.email }],
        },
      },
    });

    if (!isAssigned) {
      throw new Error("Unauthorized");
    }
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          studentProfile: {
            select: { phone: true, city: true },
          },
        },
      },
      payments: {
        select: { id: true, amount: true, month: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments;
}
