"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import {
  pakistaniPhoneRegex,
  strongPasswordRegex,
} from "@/lib/validators";
import {
  CourseStatus,
  EnrollmentStatus,
  PaymentStatus,
} from "@prisma/client";
import { currentMonthKey } from "@/lib/format";

/**
 * Student-scoped server actions for the /dashboard area.
 *
 * SECURITY: every action derives the user id from the session via
 * requireStudent(). No action accepts a user id from the client — all
 * queries are scoped by the session user id (IDOR-safe by construction).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EnrollmentScheduleInfo {
  days: string[];
  startTime: string;
  endTime: string;
  timezone: string;
  instructions: string | null;
}

export interface EnrollmentMaterialInfo {
  id: string;
  title: string;
  type: string;
  url: string;
  order: number;
}

export interface EnrollmentModuleInfo {
  id: string;
  title: string;
  description: string | null;
  order: number;
  materials: EnrollmentMaterialInfo[];
}

export interface EnrollmentPaymentInfo {
  id: string;
  month: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  paymentDate: Date;
}

export interface MyEnrollment {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  expiresAt: Date | null;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    monthlyFee: number;
    duration: string;
    mode: string;
    shortDescription: string;
    instructors: Array<{ id: string; name: string }>;
    schedule: EnrollmentScheduleInfo | null;
    modules: EnrollmentModuleInfo[];
  };
  /** Latest payment submitted for the current billing month, if any. */
  currentMonthPayment: EnrollmentPaymentInfo | null;
}

export interface DashboardStats {
  totalEnrollments: number;
  activeEnrollments: number;
  pendingPayments: number;
  unreadNotifications: number;
}

export interface StudentProfileData {
  name: string;
  email: string;
  status: string;
  phone: string;
  address: string;
  city: string;
  extraInfo: string;
  profileImage: string | null;
}

export type ActionResult = { ok: true } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Enrollments
// ---------------------------------------------------------------------------

const courseIdSchema = z.string().min(1, "Course is required").max(64);

/**
 * Enroll the signed-in student in a published course.
 * Creates an Enrollment in PENDING_PAYMENT status; the client then
 * redirects to /dashboard/payments?enroll=<id> to submit the fee.
 */
export async function requestEnrollment(
  courseId: string,
): Promise<{ ok: boolean; enrollmentId?: string; error?: string }> {
  const user = await requireStudent();

  const parsed = courseIdSchema.safeParse(courseId);
  if (!parsed.success) {
    return { ok: false, error: "Invalid course selected." };
  }

  const course = await prisma.course.findFirst({
    where: { id: parsed.data, status: CourseStatus.PUBLISHED },
    select: { id: true },
  });
  if (!course) {
    return { ok: false, error: "This course is not available for enrollment." };
  }

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: user.id, courseId: course.id } },
    select: { id: true, status: true },
  });
  if (existing) {
    return {
      ok: false,
      error: "You are already enrolled in this course.",
    };
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: user.id,
      courseId: course.id,
      status: EnrollmentStatus.PENDING_PAYMENT,
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/my-courses");

  return { ok: true, enrollmentId: enrollment.id };
}

/**
 * All enrollments of the signed-in student, with course details,
 * class schedule (WITHOUT meetingUrl), syllabus modules + materials,
 * and the latest payment for the current billing month.
 */
export async function getMyEnrollments(): Promise<MyEnrollment[]> {
  const user = await requireStudent();
  const monthKey = currentMonthKey();

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          instructors: {
            include: { instructor: { select: { id: true, name: true } } },
          },
          // SECURITY: meetingUrl is deliberately NOT selected here.
          schedule: {
            select: {
              days: true,
              startTime: true,
              endTime: true,
              timezone: true,
              instructions: true,
            },
          },
          modules: {
            orderBy: { order: "asc" },
            include: {
              materials: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                  type: true,
                  url: true,
                  order: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return Promise.all(
    enrollments.map(async (enrollment) => {
      const latest = await prisma.payment.findFirst({
        where: {
          studentId: user.id,
          courseId: enrollment.courseId,
          month: monthKey,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          month: true,
          amount: true,
          status: true,
          paymentMethod: true,
          transactionId: true,
          paymentDate: true,
        },
      });

      return {
        id: enrollment.id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        expiresAt: enrollment.expiresAt,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          slug: enrollment.course.slug,
          thumbnail: enrollment.course.thumbnail,
          monthlyFee: enrollment.course.monthlyFee,
          duration: enrollment.course.duration,
          mode: enrollment.course.mode,
          shortDescription: enrollment.course.shortDescription,
          instructors: enrollment.course.instructors.map((ci) => ({
            id: ci.instructor.id,
            name: ci.instructor.name,
          })),
          schedule: enrollment.course.schedule,
          modules: enrollment.course.modules.map((m) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            order: m.order,
            materials: m.materials.map((mat) => ({
              id: mat.id,
              title: mat.title,
              type: mat.type,
              url: mat.url,
              order: mat.order,
            })),
          })),
        },
        currentMonthPayment: latest
          ? {
              id: latest.id,
              month: latest.month,
              amount: latest.amount,
              status: latest.status,
              paymentMethod: latest.paymentMethod,
              transactionId: latest.transactionId,
              paymentDate: latest.paymentDate,
            }
          : null,
      };
    }),
  );
}

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------

/** Real Prisma counts for the signed-in student's dashboard. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const user = await requireStudent();

  const [totalEnrollments, activeEnrollments, pendingPayments, unreadNotifications] =
    await Promise.all([
      prisma.enrollment.count({ where: { studentId: user.id } }),
      prisma.enrollment.count({
        where: { studentId: user.id, status: EnrollmentStatus.ACTIVE },
      }),
      prisma.payment.count({
        where: { studentId: user.id, status: PaymentStatus.PENDING },
      }),
      prisma.notification.count({
        where: { userId: user.id, readAt: null },
      }),
    ]);

  return { totalEnrollments, activeEnrollments, pendingPayments, unreadNotifications };
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

/** Profile data for the signed-in student (for the profile page). */
export async function getStudentProfile(): Promise<StudentProfileData> {
  const user = await requireStudent();

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      status: true,
      studentProfile: {
        select: {
          phone: true,
          address: true,
          city: true,
          extraInfo: true,
          profileImage: true,
        },
      },
    },
  });

  if (!record) {
    throw new Error("Student account not found.");
  }

  return {
    name: record.name,
    email: record.email,
    status: record.status,
    phone: record.studentProfile?.phone ?? "",
    address: record.studentProfile?.address ?? "",
    city: record.studentProfile?.city ?? "",
    extraInfo: record.studentProfile?.extraInfo ?? "",
    profileImage: record.studentProfile?.profileImage ?? null,
  };
}

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .trim()
    .regex(pakistaniPhoneRegex, "Enter a valid Pakistani mobile number (03XXXXXXXXX)")
    .max(20)
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  extraInfo: z.string().trim().max(2000).optional().or(z.literal("")),
});

/**
 * Update the signed-in student's name and profile fields, plus an
 * optional profile picture upload. Identity always comes from the
 * session — never from client params.
 */
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();

  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    extraInfo: formData.get("extraInfo"),
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Please check the form and try again." };
  }

  const phone = parsed.data.phone?.trim() ? parsed.data.phone.trim() : null;

  // Phone numbers are unique across profiles — ensure no other student uses it.
  if (phone) {
    const clash = await prisma.studentProfile.findFirst({
      where: { phone, userId: { not: user.id } },
      select: { id: true },
    });
    if (clash) {
      return { ok: false, error: "This phone number is already registered to another account." };
    }
  }

  // Optional profile picture upload (validated server-side by saveUpload).
  // Subdir must be one of the allowed UPLOADS subdirs — "avatars" is the
  // contract's designated directory for profile images.
  let profileImage: string | undefined;
  const file = formData.get("profileImage");
  if (file instanceof File && file.size > 0) {
    try {
      profileImage = await saveUpload(file, "avatars");
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Could not upload the profile picture.",
      };
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name },
    }),
    prisma.studentProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        phone,
        address: parsed.data.address?.trim() || null,
        city: parsed.data.city?.trim() || null,
        extraInfo: parsed.data.extraInfo?.trim() || null,
        ...(profileImage ? { profileImage } : {}),
      },
      update: {
        phone,
        address: parsed.data.address?.trim() || null,
        city: parsed.data.city?.trim() || null,
        extraInfo: parsed.data.extraInfo?.trim() || null,
        ...(profileImage ? { profileImage } : {}),
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  return { ok: true };
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(128),
    newPassword: z
      .string()
      .regex(
        strongPasswordRegex,
        "New password must be 8+ characters with uppercase, lowercase, number and symbol",
      )
      .max(128),
    confirmPassword: z.string().min(1, "Please confirm the new password").max(128),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

/** Change the signed-in student's password after verifying the current one. */
export async function changePassword(formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Please check the form and try again." };
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!record) {
    return { ok: false, error: "Account not found." };
  }

  const matches = await bcrypt.compare(parsed.data.currentPassword, record.passwordHash);
  if (!matches) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { ok: true };
}
