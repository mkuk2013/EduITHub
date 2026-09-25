"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function listAdminInstructors() {
  await requireAdmin();

  const [instructors, allCourses] = await Promise.all([
    prisma.instructor.findMany({
      include: {
        user: {
          select: { id: true, email: true, status: true, createdAt: true },
        },
        courses: {
          include: {
            course: {
              select: { id: true, title: true, slug: true, status: true },
            },
          },
        },
        schedules: {
          select: { id: true, courseId: true, meetingUrl: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return { instructors, allCourses };
}

const createInstructorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  experience: z.string().optional(),
  bio: z.string().optional(),
  contact: z.string().optional(),
  courseIds: z.array(z.string()).default([]),
});

export async function createInstructorAction(data: z.infer<typeof createInstructorSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = createInstructorSchema.safeParse(data);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { name, email, password, experience, bio, contact, courseIds } = parsed.data;
  const lowerEmail = email.toLowerCase();

  // Check if user email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: lowerEmail },
  });

  if (existingUser) {
    return { ok: false, error: "A user with this email address already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Create User with INSTRUCTOR role
  const user = await prisma.user.create({
    data: {
      name,
      email: lowerEmail,
      passwordHash,
      role: "INSTRUCTOR",
      status: "APPROVED",
    },
  });

  // Create Instructor profile
  const instructor = await prisma.instructor.create({
    data: {
      userId: user.id,
      name,
      email: lowerEmail,
      experience: experience || "Qualified IT Instructor",
      bio: bio || null,
      contact: contact || null,
    },
  });

  // Link selected courses
  if (courseIds.length > 0) {
    await prisma.courseInstructor.createMany({
      data: courseIds.map((courseId) => ({
        courseId,
        instructorId: instructor.id,
      })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/admin/instructors");
  revalidatePath("/admin/classes");
  return { ok: true };
}

const updateInstructorSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().optional(),
  experience: z.string().optional(),
  bio: z.string().optional(),
  contact: z.string().optional(),
  courseIds: z.array(z.string()).default([]),
});

export async function updateInstructorAction(data: z.infer<typeof updateInstructorSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = updateInstructorSchema.safeParse(data);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { id, name, email, password, experience, bio, contact, courseIds } = parsed.data;
  const lowerEmail = email.toLowerCase();

  const instructor = await prisma.instructor.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!instructor) {
    return { ok: false, error: "Instructor not found" };
  }

  // Update or create linked User account
  if (instructor.userId) {
    const updateData: { name: string; email: string; passwordHash?: string } = {
      name,
      email: lowerEmail,
    };
    if (password && password.trim().length >= 6) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 12);
    }
    await prisma.user.update({
      where: { id: instructor.userId },
      data: updateData,
    });
  } else {
    // If no user was linked, create or link
    const userUpdate = await prisma.user.upsert({
      where: { email: lowerEmail },
      create: {
        name,
        email: lowerEmail,
        passwordHash: await bcrypt.hash(password?.trim() || "change-me-123", 12),
        role: "INSTRUCTOR",
        status: "APPROVED",
      },
      update: {
        name,
        role: "INSTRUCTOR",
        status: "APPROVED",
        ...(password && password.trim().length >= 6
          ? { passwordHash: await bcrypt.hash(password.trim(), 12) }
          : {}),
      },
    });

    await prisma.instructor.update({
      where: { id },
      data: { userId: userUpdate.id },
    });
  }

  // Update instructor profile
  await prisma.instructor.update({
    where: { id },
    data: {
      name,
      email: lowerEmail,
      experience: experience || instructor.experience,
      bio: bio ?? instructor.bio,
      contact: contact ?? instructor.contact,
    },
  });

  // Re-sync course assignments
  await prisma.courseInstructor.deleteMany({
    where: { instructorId: id },
  });

  if (courseIds.length > 0) {
    await prisma.courseInstructor.createMany({
      data: courseIds.map((courseId) => ({
        courseId,
        instructorId: id,
      })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/admin/instructors");
  revalidatePath("/admin/classes");
  return { ok: true };
}

export async function deleteInstructorAction(instructorId: string): Promise<ActionResult> {
  await requireAdmin();

  const instructor = await prisma.instructor.findUnique({
    where: { id: instructorId },
  });

  if (!instructor) {
    return { ok: false, error: "Instructor not found" };
  }

  if (instructor.userId) {
    await prisma.user.delete({
      where: { id: instructor.userId },
    }).catch(() => null);
  }

  await prisma.instructor.delete({
    where: { id: instructorId },
  });

  revalidatePath("/admin/instructors");
  return { ok: true };
}
