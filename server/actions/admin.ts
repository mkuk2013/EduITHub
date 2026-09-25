/**
 * Admin server actions — Edu IT Hub Academy.
 *
 * Every action calls `requireAdmin()` FIRST (never trust client role) and
 * writes an `AuditLog` row for every mutation.
 *
 * Cross-workstream integrations (payments / email / notify / upload) are
 * loaded with runtime dynamic imports behind `loadOptionalModule()` so a
 * missing sibling file can NEVER break an admin action: email/notify fall
 * back to direct Prisma writes, payments list calls fall back to direct
 * Prisma reads, and `verifyPayment` degrades to an explicit error that QA
 * can reconcile against the payments agent's contract.
 */
"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  AnnouncementStatus,
  CourseStatus,
  EnrollmentStatus,
  NotificationType,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  UserStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PAGINATION, SETTING_KEYS } from "@/lib/constants";
import {
  announcementSchema,
  pakistaniPhoneRegex,
  strongPasswordRegex,
} from "@/lib/validators";
import { currentMonthKey } from "@/lib/format";

// ---------------------------------------------------------------------------
// Result + helpers
// ---------------------------------------------------------------------------

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Optional sibling modules (owned by other workstream agents) are loaded with
 * `await import()` inside try/catch. The specifier is a static literal so the
 * bundler resolves `@/` correctly; the try/catch guarantees a missing or
 * failing sibling module can NEVER break an admin action — every helper below
 * degrades to a safe fallback.
 */

type SendEmailFn = (opts: {
  to: string;
  subject: string;
  html: string;
  type: string;
  userId?: string;
}) => Promise<{ ok: boolean }>;

type NotifyUserFn = (
  userId: string,
  payload: { title: string; message: string; type: NotificationType; link?: string },
) => Promise<unknown>;

/** Write a Notification row; prefer the payments-owned notifyUser, fall back to Prisma. */
async function notifyStudent(
  userId: string,
  payload: { title: string; message: string; type: NotificationType; link?: string },
): Promise<void> {
  try {
    const mod = (await import("@/lib/notify")) as { notifyUser?: NotifyUserFn };
    if (typeof mod.notifyUser === "function") {
      await mod.notifyUser(userId, payload);
      return;
    }
  } catch {
    // fall through to direct write
  }
  try {
    await prisma.notification.create({
      data: { userId, title: payload.title, message: payload.message, type: payload.type, link: payload.link },
    });
  } catch {
    // notifications must never break the admin action
  }
}

/** Send an email; silently skipped when the email lib is unavailable. */
async function sendAdminEmail(opts: {
  to: string;
  subject: string;
  html: string;
  type: string;
  userId?: string;
}): Promise<void> {
  try {
    const mod = (await import("@/lib/email")) as { sendEmail?: SendEmailFn };
    if (typeof mod.sendEmail === "function") {
      await mod.sendEmail(opts);
    }
  } catch {
    // missing email lib never breaks admin actions
  }
}

/** Every admin mutation writes an AuditLog row. Failures here never break the action. */
async function auditLog(
  adminId: string,
  action: string,
  entity: string,
  entityId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        entity,
        entityId,
        metadata: (metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch {
    // audit must never break the admin action
  }
}

function paginationParams(page?: unknown, pageSize?: unknown) {
  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(
    PAGINATION.maxPageSize,
    Math.max(1, Number(pageSize) || PAGINATION.defaultPageSize),
  );
  return { page: p, pageSize: ps, skip: (p - 1) * ps, take: ps };
}

function pageWrap<T>(items: T[], total: number, page: number, pageSize: number): PageResult<T> {
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

const idSchema = z.string().trim().min(1, "Invalid id");

/** Parse a textarea / JSON-encoded string list into string[]. */
function parseStringList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v).trim()).filter(Boolean);
      }
    } catch {
      return [];
    }
    return [];
  }
  return trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const DAY_CODES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// ---------------------------------------------------------------------------
// Upload helper (thumbnail). Prefers the payments-owned saveUpload; falls
// back to a safe local implementation with identical behavior.
// ---------------------------------------------------------------------------

type SaveUploadFn = (file: File, subdir: string) => Promise<string>;

const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function saveUploadLocal(file: File, subdir: string): Promise<string> {
  const { randomUUID } = await import("node:crypto");
  const { mkdir, writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { UPLOADS, MAX_UPLOAD_MB } = await import("@/lib/constants");

  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    throw new Error("Only JPG, PNG, WEBP or GIF images are allowed");
  }
  const maxBytes = MAX_UPLOAD_MB * 1024 * 1024;
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error(`Image must be smaller than ${MAX_UPLOAD_MB} MB`);
  }
  const now = new Date();
  const folder = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const filename = `${randomUUID()}.${MIME_EXT[file.type]}`;
  const relativePath = `${subdir}/${folder}/${filename}`;
  const absoluteDir = join(process.cwd(), UPLOADS.dir, subdir, folder);
  await mkdir(absoluteDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(absoluteDir, filename), buffer);
  return relativePath;
}

/** Save an uploaded File; returns the DB-stored relative path (never an absolute path). */
async function saveUploadFile(file: File, subdir: string): Promise<string> {
  try {
    const mod = (await import("@/lib/upload")) as { saveUpload?: SaveUploadFn };
    if (typeof mod.saveUpload === "function") {
      return await mod.saveUpload(file, subdir);
    }
  } catch {
    // fall through to the local implementation
  }
  return saveUploadLocal(file, subdir);
}

// ---------------------------------------------------------------------------
// Sidebar badge counts
// ---------------------------------------------------------------------------

export async function getPendingCounts(): Promise<{
  pendingStudents: number;
  pendingPayments: number;
}> {
  await requireAdmin();
  const [pendingStudents, pendingPayments] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", status: UserStatus.PENDING_APPROVAL } }),
    prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
  ]);
  return { pendingStudents, pendingPayments };
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

const studentListSchema = z.object({
  search: z.string().trim().max(100).optional().default(""),
  status: z.enum(["PENDING_APPROVAL", "APPROVED", "REJECTED", "SUSPENDED"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(PAGINATION.maxPageSize).optional(),
});

export type StudentListItem = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: Date;
  phone: string | null;
  city: string | null;
  profileImage: string | null;
  enrollmentsCount: number;
};

export async function getStudents(input: {
  search?: string;
  status?: string;
  page?: number | string;
  pageSize?: number | string;
}): Promise<PageResult<StudentListItem>> {
  await requireAdmin();
  const parsed = studentListSchema.safeParse(input);
  const { search, status, page, pageSize } = parsed.success
    ? parsed.data
    : { search: "", status: undefined, page: 1, pageSize: undefined };
  const { skip, take } = paginationParams(page, pageSize);

  const where: Prisma.UserWhereInput = {
    role: "STUDENT",
    ...(status ? { status: status as UserStatus } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { studentProfile: { phone: { contains: search } } },
          ],
        }
      : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        studentProfile: { select: { phone: true, city: true, profileImage: true } },
        _count: { select: { enrollments: true } },
      },
    }),
  ]);

  return pageWrap(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      createdAt: u.createdAt,
      phone: u.studentProfile?.phone ?? null,
      city: u.studentProfile?.city ?? null,
      profileImage: u.studentProfile?.profileImage ?? null,
      enrollmentsCount: u._count.enrollments,
    })),
    total,
    page,
    pageSize ?? PAGINATION.defaultPageSize,
  );
}

export async function getPendingStudents(): Promise<StudentListItem[]> {
  await requireAdmin();
  const users = await prisma.user.findMany({
    where: { role: "STUDENT", status: UserStatus.PENDING_APPROVAL },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      studentProfile: { select: { phone: true, city: true, profileImage: true } },
      _count: { select: { enrollments: true } },
    },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    status: u.status,
    createdAt: u.createdAt,
    phone: u.studentProfile?.phone ?? null,
    city: u.studentProfile?.city ?? null,
    profileImage: u.studentProfile?.profileImage ?? null,
    enrollmentsCount: u._count.enrollments,
  }));
}

export async function getStudentDetail(id: string) {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.user.findFirst({
    where: { id: parsed.data, role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
      studentProfile: true,
      enrollments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          enrolledAt: true,
          expiresAt: true,
          course: { select: { id: true, title: true, slug: true, monthlyFee: true } },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          amount: true,
          month: true,
          paymentMethod: true,
          transactionId: true,
          paymentDate: true,
          status: true,
          adminNote: true,
          createdAt: true,
          course: { select: { id: true, title: true } },
        },
      },
      notifications: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, title: true, message: true, type: true, readAt: true, createdAt: true },
      },
    },
  });
}

const studentDecisionSchema = z.object({
  userId: z.string().trim().min(1),
  note: z.string().trim().max(1000).optional().default(""),
});

async function setStudentStatus(
  userId: string,
  status: UserStatus,
  action: string,
  note: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = studentDecisionSchema.safeParse({ userId, note });
  if (!parsed.success) return { ok: false, error: "Invalid request" };

  const student = await prisma.user.findFirst({
    where: { id: parsed.data.userId, role: "STUDENT" },
    select: { id: true, name: true, email: true, status: true },
  });
  if (!student) return { ok: false, error: "Student not found" };

  const updated = await prisma.user.update({
    where: { id: student.id },
    data: { status },
    select: { id: true, name: true, email: true, status: true },
  });

  await auditLog(admin.id, action, "User", student.id, {
    previousStatus: student.status,
    newStatus: status,
    note: parsed.data.note || undefined,
  });

  const copies: Record<UserStatus, { title: string; message: string; type: NotificationType }> = {
    APPROVED: {
      title: "Account approved",
      message: `Assalam-o-Alaikum ${updated.name}, your Edu IT Hub Academy account has been approved. You can now sign in and enroll in courses.`,
      type: NotificationType.ACCOUNT_APPROVED,
    },
    REJECTED: {
      title: "Account application declined",
      message: `Assalam-o-Alaikum ${updated.name}, your Edu IT Hub Academy account application was not approved.${parsed.data.note ? ` Reason: ${parsed.data.note}` : " Please contact support for details."}`,
      type: NotificationType.ACCOUNT_REJECTED,
    },
    SUSPENDED: {
      title: "Account suspended",
      message: `Assalam-o-Alaikum ${updated.name}, your Edu IT Hub Academy account has been suspended.${parsed.data.note ? ` Reason: ${parsed.data.note}` : " Please contact support for details."}`,
      type: NotificationType.GENERAL,
    },
    PENDING_APPROVAL: {
      title: "Account under review",
      message: `Assalam-o-Alaikum ${updated.name}, your account is under review again. We will notify you once a decision is made.`,
      type: NotificationType.REGISTRATION_RECEIVED,
    },
  };
  const copy = copies[status];

  await notifyStudent(updated.id, {
    title: copy.title,
    message: copy.message,
    type: copy.type,
    link: "/pending-approval",
  });
  await sendAdminEmail({
    to: updated.email,
    subject: `Edu IT Hub Academy — ${copy.title}`,
    html: `<p>Assalam-o-Alaikum ${updated.name},</p><p>${copy.message}</p><p>— Edu IT Hub Academy</p>`,
    type: copy.type,
    userId: updated.id,
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/approvals");
  return { ok: true };
}

export async function approveStudent(userId: string, note?: string): Promise<ActionResult> {
  return setStudentStatus(userId, UserStatus.APPROVED, "student.approved", note ?? "");
}

export async function rejectStudent(userId: string, note?: string): Promise<ActionResult> {
  return setStudentStatus(userId, UserStatus.REJECTED, "student.rejected", note ?? "");
}

export async function suspendStudent(userId: string, note?: string): Promise<ActionResult> {
  return setStudentStatus(userId, UserStatus.SUSPENDED, "student.suspended", note ?? "");
}

export async function reactivateStudent(userId: string): Promise<ActionResult> {
  return setStudentStatus(userId, UserStatus.APPROVED, "student.reactivated", "");
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

const courseFormSchema = z.object({
  id: z.string().trim().min(1).optional(),
  title: z.string().trim().min(3).max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly (lowercase letters, numbers, hyphens)")
    .max(200),
  shortDescription: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20),
  monthlyFee: z.coerce.number().int("Fee must be a whole PKR amount").min(0).max(10000000),
  duration: z.string().trim().min(2).max(50),
  mode: z.string().trim().min(2).max(50).default("Online"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  requirements: z.array(z.string().trim().min(1).max(300)).max(50).default([]),
  benefits: z.array(z.string().trim().min(1).max(300)).max(50).default([]),
  instructorIds: z.array(z.string().trim().min(1)).max(20).default([]),
});

const courseListSchema = z.object({
  search: z.string().trim().max(100).optional().default(""),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(PAGINATION.maxPageSize).optional(),
});

export async function getCourses(input: {
  search?: string;
  status?: string;
  page?: number | string;
  pageSize?: number | string;
}) {
  await requireAdmin();
  const parsed = courseListSchema.safeParse(input);
  const { search, status, page, pageSize } = parsed.success
    ? parsed.data
    : { search: "", status: undefined, page: 1, pageSize: undefined };
  const { skip, take } = paginationParams(page, pageSize);

  const where: Prisma.CourseWhereInput = {
    ...(status ? { status: status as CourseStatus } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        monthlyFee: true,
        duration: true,
        mode: true,
        status: true,
        updatedAt: true,
        _count: { select: { enrollments: true, modules: true } },
        schedule: { select: { id: true, meetingUrl: true } },
      },
    }),
  ]);

  return pageWrap(
    courses.map((c) => ({ ...c, hasMeetingUrl: Boolean(c.schedule?.meetingUrl) })),
    total,
    page,
    pageSize ?? PAGINATION.defaultPageSize,
  );
}

export async function getCourseForEdit(id: string) {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  const course = await prisma.course.findUnique({
    where: { id: parsed.data },
    include: {
      instructors: { include: { instructor: { select: { id: true, name: true } } } },
      modules: { orderBy: { order: "asc" }, select: { id: true, title: true, description: true, order: true } },
    },
  });
  if (!course) return null;
  return {
    ...course,
    requirements: Array.isArray(course.requirements) ? (course.requirements as string[]) : [],
    benefits: Array.isArray(course.benefits) ? (course.benefits as string[]) : [],
  };
}

export async function getInstructors() {
  await requireAdmin();
  return prisma.instructor.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, experience: true },
  });
}

export async function upsertCourse(formData: FormData): Promise<ActionResult & { id?: string }> {
  const admin = await requireAdmin();

  const raw = {
    id: (formData.get("id") as string) || undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    monthlyFee: formData.get("monthlyFee"),
    duration: formData.get("duration"),
    mode: formData.get("mode") || "Online",
    status: formData.get("status") || "DRAFT",
    requirements: parseStringList(formData.get("requirements")),
    benefits: parseStringList(formData.get("benefits")),
    instructorIds: formData.getAll("instructorIds").map(String).filter(Boolean),
  };

  const parsed = courseFormSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid course data" };
  }
  const data = parsed.data;

  // Slug must stay unique across courses.
  const slugClash = await prisma.course.findFirst({
    where: { slug: data.slug, ...(data.id ? { NOT: { id: data.id } } : {}) },
    select: { id: true },
  });
  if (slugClash) return { ok: false, error: "This URL slug is already used by another course" };

  // Instructors must exist.
  if (data.instructorIds.length > 0) {
    const count = await prisma.instructor.count({ where: { id: { in: data.instructorIds } } });
    if (count !== data.instructorIds.length) return { ok: false, error: "One or more selected instructors do not exist" };
  }

  // Optional thumbnail upload (File). Keep existing thumbnail when none is uploaded.
  const thumbnailFile = formData.get("thumbnail");
  let thumbnailPath: string | undefined;
  if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
    try {
      thumbnailPath = await saveUploadFile(thumbnailFile, "materials");
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Thumbnail upload failed" };
    }
  }

  const courseData = {
    title: data.title,
    slug: data.slug,
    shortDescription: data.shortDescription,
    description: data.description,
    monthlyFee: data.monthlyFee,
    duration: data.duration,
    mode: data.mode,
    status: data.status as CourseStatus,
    requirements: data.requirements as Prisma.InputJsonValue,
    benefits: data.benefits as Prisma.InputJsonValue,
    ...(thumbnailPath ? { thumbnail: `/uploads/${thumbnailPath}` } : {}),
  };

  let courseId: string;
  if (data.id) {
    const existing = await prisma.course.findUnique({ where: { id: data.id }, select: { id: true } });
    if (!existing) return { ok: false, error: "Course not found" };
    await prisma.course.update({ where: { id: data.id }, data: courseData });
    courseId = data.id;
    await auditLog(admin.id, "course.updated", "Course", courseId, {
      title: data.title,
      status: data.status,
      thumbnailUpdated: Boolean(thumbnailPath),
    });
  } else {
    const created = await prisma.course.create({ data: courseData });
    courseId = created.id;
    await auditLog(admin.id, "course.created", "Course", courseId, {
      title: data.title,
      status: data.status,
    });
  }

  // Sync instructor links.
  await prisma.courseInstructor.deleteMany({ where: { courseId } });
  if (data.instructorIds.length > 0) {
    await prisma.courseInstructor.createMany({
      data: data.instructorIds.map((instructorId) => ({ courseId, instructorId })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  return { ok: true, id: courseId };
}

const moduleInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional().default(""),
});

/** Replace a course's module list (order = array order). Keeps materials of retained modules. */
export async function saveCourseModules(
  courseId: string,
  modules: Array<{ id?: string; title: string; description?: string }>,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const idParsed = idSchema.safeParse(courseId);
  if (!idParsed.success) return { ok: false, error: "Invalid course id" };
  if (modules.length > 100) return { ok: false, error: "Too many modules (max 100)" };

  const parsedModules: Array<{ id?: string; title: string; description: string }> = [];
  for (const m of modules) {
    const p = moduleInputSchema.safeParse(m);
    if (!p.success) {
      const first = p.error.issues[0];
      return { ok: false, error: first ? `Module: ${first.message}` : "Invalid module data" };
    }
    parsedModules.push({ id: p.data.id, title: p.data.title, description: p.data.description ?? "" });
  }

  const course = await prisma.course.findUnique({
    where: { id: idParsed.data },
    select: { id: true, modules: { select: { id: true } } },
  });
  if (!course) return { ok: false, error: "Course not found" };

  const keepIds = new Set(parsedModules.map((m) => m.id).filter((v): v is string => Boolean(v)));
  const removeIds = course.modules.map((m) => m.id).filter((mid) => !keepIds.has(mid));

  await prisma.$transaction(async (tx) => {
    if (removeIds.length > 0) {
      // CourseMaterial cascades on module delete.
      await tx.courseModule.deleteMany({ where: { id: { in: removeIds }, courseId: course.id } });
    }
    for (let i = 0; i < parsedModules.length; i++) {
      const m = parsedModules[i];
      if (m.id && keepIds.has(m.id)) {
        await tx.courseModule.updateMany({
          where: { id: m.id, courseId: course.id },
          data: { title: m.title, description: m.description || null, order: i },
        });
      } else {
        await tx.courseModule.create({
          data: { courseId: course.id, title: m.title, description: m.description || null, order: i },
        });
      }
    }
  }, {
    maxWait: 15000,
    timeout: 30000,
  });

  await auditLog(admin.id, "course.modules_updated", "Course", course.id, {
    moduleCount: parsedModules.length,
  });
  revalidatePath("/admin/courses");
  return { ok: true };
}

export async function setCourseStatus(id: string, status: CourseStatus): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z.object({ id: idSchema, status: z.nativeEnum(CourseStatus) }).safeParse({ id, status });
  if (!parsed.success) return { ok: false, error: "Invalid request" };

  const course = await prisma.course.findUnique({ where: { id: parsed.data.id }, select: { id: true, status: true, title: true } });
  if (!course) return { ok: false, error: "Course not found" };

  await prisma.course.update({ where: { id: course.id }, data: { status: parsed.data.status } });
  await auditLog(admin.id, "course.status_changed", "Course", course.id, {
    from: course.status,
    to: parsed.data.status,
  });

  // Notify actively enrolled students when a course is published or archived.
  if (parsed.data.status === CourseStatus.PUBLISHED || parsed.data.status === CourseStatus.ARCHIVED) {
    const students = await prisma.enrollment.findMany({
      where: { courseId: course.id, status: EnrollmentStatus.ACTIVE },
      select: { student: { select: { id: true, name: true, email: true } } },
    });
    const title =
      parsed.data.status === CourseStatus.PUBLISHED ? "Course published" : "Course archived";
    const message =
      parsed.data.status === CourseStatus.PUBLISHED
        ? `Good news! The course "${course.title}" is now published.`
        : `Please note: the course "${course.title}" has been archived. Contact support if you need help.`;
    for (const s of students) {
      await notifyStudent(s.student.id, {
        title,
        message: `Assalam-o-Alaikum ${s.student.name}, ${message}`,
        type: NotificationType.COURSE_UPDATE,
        link: "/dashboard",
      });
    }
  }

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  return { ok: true };
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid course id" };

  const course = await prisma.course.findUnique({
    where: { id: parsed.data },
    select: { id: true, title: true, _count: { select: { enrollments: true } } },
  });
  if (!course) return { ok: false, error: "Course not found" };

  if (course._count.enrollments > 0) {
    // Courses with history are archived, never hard-deleted.
    await prisma.course.update({ where: { id: course.id }, data: { status: CourseStatus.ARCHIVED } });
    await auditLog(admin.id, "course.archived_instead_of_delete", "Course", course.id, {
      title: course.title,
      enrollmentCount: course._count.enrollments,
    });
    revalidatePath("/admin/courses");
    return { ok: true, error: undefined };
  }

  await prisma.course.delete({ where: { id: course.id } });
  await auditLog(admin.id, "course.deleted", "Course", course.id, { title: course.title });
  revalidatePath("/admin/courses");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Enrollments
// ---------------------------------------------------------------------------

const enrollmentListSchema = z.object({
  search: z.string().trim().max(100).optional().default(""),
  status: z.nativeEnum(EnrollmentStatus).optional(),
  courseId: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(PAGINATION.maxPageSize).optional(),
});

export async function getEnrollments(input: {
  search?: string;
  status?: string;
  courseId?: string;
  page?: number | string;
  pageSize?: number | string;
}) {
  await requireAdmin();
  const parsed = enrollmentListSchema.safeParse(input);
  const { search, status, courseId, page, pageSize } = parsed.success
    ? parsed.data
    : { search: "", status: undefined, courseId: undefined, page: 1, pageSize: undefined };
  const { skip, take } = paginationParams(page, pageSize);

  const where: Prisma.EnrollmentWhereInput = {
    ...(status ? { status } : {}),
    ...(courseId ? { courseId } : {}),
    ...(search
      ? {
          OR: [
            { student: { name: { contains: search, mode: "insensitive" } } },
            { student: { email: { contains: search, mode: "insensitive" } } },
            { course: { title: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, enrollments] = await Promise.all([
    prisma.enrollment.count({ where }),
    prisma.enrollment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        expiresAt: true,
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, monthlyFee: true } },
      },
    }),
  ]);

  return pageWrap(enrollments, total, page, pageSize ?? PAGINATION.defaultPageSize);
}

export async function setEnrollmentStatus(id: string, status: EnrollmentStatus): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z.object({ id: idSchema, status: z.nativeEnum(EnrollmentStatus) }).safeParse({ id, status });
  if (!parsed.success) return { ok: false, error: "Invalid request" };

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: parsed.data.id },
    select: {
      id: true,
      status: true,
      student: { select: { id: true, name: true, email: true } },
      course: { select: { title: true } },
    },
  });
  if (!enrollment) return { ok: false, error: "Enrollment not found" };

  await prisma.enrollment.update({ where: { id: enrollment.id }, data: { status: parsed.data.status } });
  await auditLog(admin.id, "enrollment.status_changed", "Enrollment", enrollment.id, {
    from: enrollment.status,
    to: parsed.data.status,
    course: enrollment.course.title,
  });

  await notifyStudent(enrollment.student.id, {
    title: "Enrollment status updated",
    message: `Assalam-o-Alaikum ${enrollment.student.name}, your enrollment in "${enrollment.course.title}" is now ${parsed.data.status.replace(/_/g, " ").toLowerCase()}.`,
    type: NotificationType.ENROLLMENT_ACTIVATED,
    link: "/dashboard",
  });

  revalidatePath("/admin/enrollments");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Payments (owned by the payments workstream; accessed via contract API with
// direct-Prisma fallbacks for reads so the admin area never breaks)
// ---------------------------------------------------------------------------

export interface PendingPaymentItem {
  id: string;
  amount: number;
  month: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  paymentDate: Date;
  proofImage: string | null;
  status: PaymentStatus;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  submittedAt: Date;
}

function mapPaymentRow(p: {
  id: string;
  amount: number;
  month: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  paymentDate: Date;
  proofImage: string | null;
  status: PaymentStatus;
  createdAt: Date;
  student: { name: string; email: string };
  course: { title: string };
}): PendingPaymentItem {
  return {
    id: p.id,
    amount: p.amount,
    month: p.month,
    paymentMethod: p.paymentMethod,
    transactionId: p.transactionId,
    paymentDate: p.paymentDate,
    proofImage: p.proofImage,
    status: p.status,
    studentName: p.student.name,
    studentEmail: p.student.email,
    courseTitle: p.course.title,
    submittedAt: p.createdAt,
  };
}

const paymentSelect = {
  id: true,
  amount: true,
  month: true,
  paymentMethod: true,
  transactionId: true,
  paymentDate: true,
  proofImage: true,
  status: true,
  adminNote: true,
  createdAt: true,
  verifiedAt: true,
  student: { select: { id: true, name: true, email: true } },
  course: { select: { id: true, title: true } },
  verifiedBy: { select: { name: true } },
} as const;

export async function getPendingPayments(): Promise<PendingPaymentItem[]> {
  await requireAdmin();
  try {
    const mod = (await import("@/server/actions/payments")) as {
      getPendingPayments?: () => Promise<PendingPaymentItem[]>;
    };
    if (typeof mod.getPendingPayments === "function") {
      return await mod.getPendingPayments();
    }
  } catch {
    // fall through to direct read
  }
  const rows = await prisma.payment.findMany({
    where: { status: PaymentStatus.PENDING },
    orderBy: { createdAt: "asc" },
    select: paymentSelect,
  });
  return rows.map(mapPaymentRow);
}

export async function getPayments(input: {
  search?: string;
  status?: string;
  method?: string;
  month?: string;
  page?: number | string;
  pageSize?: number | string;
}) {
  await requireAdmin();
  const schema = z.object({
    search: z.string().trim().max(100).optional().default(""),
    status: z.nativeEnum(PaymentStatus).optional(),
    method: z.nativeEnum(PaymentMethod).optional(),
    month: z.string().trim().max(7).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(PAGINATION.maxPageSize).optional(),
  });
  const parsed = schema.safeParse(input);
  const { search, status, method, month, page, pageSize } = parsed.success
    ? parsed.data
    : { search: "", status: undefined, method: undefined, month: undefined, page: 1, pageSize: undefined };

  // Prefer the payments workstream's own listing when it is available and the
  // requested filters are within its contract ({ search, status, page, pageSize }).
  // method/month filters are only supported by the direct-Prisma path below.
  const useWorkstreamList = !method && !month;
  if (useWorkstreamList) {
    try {
      const mod = (await import("@/server/actions/payments")) as {
        getAllPayments?: (filters: Record<string, unknown>) => Promise<{ items: unknown[]; total: number }>;
      };
      if (typeof mod.getAllPayments === "function") {
        const res = await mod.getAllPayments({ search, status, page, pageSize: pageSize ?? PAGINATION.defaultPageSize });
        const items = res.items as Array<Record<string, unknown>>;
        const totalPages = Math.max(1, Math.ceil(res.total / (pageSize ?? PAGINATION.defaultPageSize)));
        return { items, total: res.total, page, pageSize: pageSize ?? PAGINATION.defaultPageSize, totalPages };
      }
    } catch {
      // fall through to direct read
    }
  }

  const { skip, take } = paginationParams(page, pageSize);
  const where: Prisma.PaymentWhereInput = {
    ...(status ? { status } : {}),
    ...(method ? { paymentMethod: method } : {}),
    ...(month ? { month } : {}),
    ...(search
      ? {
          OR: [
            { transactionId: { contains: search, mode: "insensitive" } },
            { student: { name: { contains: search, mode: "insensitive" } } },
            { student: { email: { contains: search, mode: "insensitive" } } },
            { course: { title: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({ where, orderBy: { createdAt: "desc" }, skip, take, select: paymentSelect }),
  ]);
  return pageWrap(rows, total, page, pageSize ?? PAGINATION.defaultPageSize);
}

export async function getPaymentDetail(id: string) {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.payment.findUnique({
    where: { id: parsed.data },
    select: {
      ...paymentSelect,
      enrollment: { select: { id: true, status: true } },
    },
  });
}

const verifyDecisionSchema = z.object({
  paymentId: idSchema,
  decision: z.enum(["APPROVED", "REJECTED", "CORRECTION_REQUESTED"]),
  adminNote: z.string().trim().max(2000).optional().default(""),
});

/**
 * Verify a payment via the payments workstream's `verifyPayment` contract.
 * Also writes an admin AuditLog row. If the payments module is not available
 * yet, returns an explicit error (QA reconciles).
 */
export async function verifyPaymentAdmin(
  paymentId: string,
  decision: "APPROVED" | "REJECTED" | "CORRECTION_REQUESTED",
  adminNote?: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = verifyDecisionSchema.safeParse({ paymentId, decision, adminNote: adminNote ?? "" });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first ? first.message : "Invalid verification request" };
  }

  let verifyPayment: ((paymentId: string, decision: "APPROVED" | "REJECTED" | "CORRECTION_REQUESTED", adminNote?: string) => Promise<{ ok: boolean; error?: string }>) | undefined;
  try {
    const mod = (await import("@/server/actions/payments")) as {
      verifyPayment?: (paymentId: string, decision: "APPROVED" | "REJECTED" | "CORRECTION_REQUESTED", adminNote?: string) => Promise<{ ok: boolean; error?: string }>;
    };
    verifyPayment = mod.verifyPayment;
  } catch {
    verifyPayment = undefined;
  }

  if (typeof verifyPayment !== "function") {
    return {
      ok: false,
      error: "Payment verification service is not available yet. Please try again later.",
    };
  }

  const result = await verifyPayment(parsed.data.paymentId, parsed.data.decision, parsed.data.adminNote || undefined);
  if (!result.ok) return { ok: false, error: result.error ?? "Verification failed" };

  await auditLog(admin.id, `payment.${parsed.data.decision.toLowerCase()}`, "Payment", parsed.data.paymentId, {
    decision: parsed.data.decision,
    adminNote: parsed.data.adminNote || undefined,
  });

  revalidatePath("/admin/payments");
  revalidatePath("/admin/verification");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Class schedules (per-course; changing one course's URL never affects others)
// ---------------------------------------------------------------------------

const scheduleSchema = z.object({
  meetingUrl: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https?:\/\//i.test(v), "Meeting URL must start with http(s)://"),
  days: z.array(z.enum(DAY_CODES)).min(1, "Select at least one day").max(7),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "End time must be HH:MM"),
  timezone: z.string().trim().min(1).max(60).default("Asia/Karachi"),
  instructorId: z.string().trim().min(1).optional().nullable(),
  instructions: z.string().trim().max(5000).optional().default(""),
});

export async function getClassScheduleList() {
  await requireAdmin();
  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      schedule: {
        // meetingUrl is deliberately NOT selected in list views (§8).
        select: {
          id: true,
          days: true,
          startTime: true,
          endTime: true,
          timezone: true,
          updatedAt: true,
          instructor: { select: { id: true, name: true } },
        },
      },
    },
  });
  // Fetch "has meeting url" flags without exposing URLs in the list.
  const withUrl = await prisma.classSchedule.findMany({
    where: { courseId: { in: courses.map((c) => c.id) }, NOT: { meetingUrl: null } },
    select: { courseId: true, meetingUrl: true },
  });
  const urlSet = new Set(withUrl.filter((s) => s.meetingUrl && s.meetingUrl.trim() !== "").map((s) => s.courseId));
  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    status: c.status,
    schedule: c.schedule,
    hasMeetingUrl: urlSet.has(c.id),
  }));
}

export async function getClassSchedule(courseId: string) {
  await requireAdmin();
  const parsed = idSchema.safeParse(courseId);
  if (!parsed.success) return null;
  const course = await prisma.course.findUnique({
    where: { id: parsed.data },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      schedule: {
        select: {
          id: true,
          meetingUrl: true,
          days: true,
          startTime: true,
          endTime: true,
          timezone: true,
          instructions: true,
          instructorId: true,
          instructor: { select: { id: true, name: true } },
        },
      },
    },
  });
  return course;
}

export async function upsertClassSchedule(
  courseId: string,
  input: {
    meetingUrl?: string;
    days: string[];
    startTime: string;
    endTime: string;
    timezone?: string;
    instructorId?: string | null;
    instructions?: string;
  },
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z
    .object({ courseId: idSchema, schedule: scheduleSchema })
    .safeParse({ courseId, schedule: input });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid schedule data" };
  }

  const { courseId: cid, schedule } = parsed.data;
  const course = await prisma.course.findUnique({
    where: { id: cid },
    select: { id: true, title: true, schedule: { select: { meetingUrl: true } } },
  });
  if (!course) return { ok: false, error: "Course not found" };

  if (schedule.instructorId) {
    const exists = await prisma.instructor.findUnique({
      where: { id: schedule.instructorId },
      select: { id: true },
    });
    if (!exists) return { ok: false, error: "Selected instructor does not exist" };
  }

  if (schedule.startTime >= schedule.endTime) {
    return { ok: false, error: "End time must be after start time" };
  }

  const previousUrl = course.schedule?.meetingUrl?.trim() || "";
  const nextUrl = (schedule.meetingUrl ?? "").trim();

  await prisma.classSchedule.upsert({
    where: { courseId: cid },
    create: {
      courseId: cid,
      meetingUrl: nextUrl || null,
      days: [...schedule.days],
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      timezone: schedule.timezone,
      instructorId: schedule.instructorId || null,
      instructions: schedule.instructions || null,
    },
    update: {
      meetingUrl: nextUrl || null,
      days: [...schedule.days],
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      timezone: schedule.timezone,
      instructorId: schedule.instructorId || null,
      instructions: schedule.instructions || null,
    },
  });

  if (previousUrl !== nextUrl) {
    const change: Record<string, unknown> = {
      meetingUrlChanged: true,
      hadPreviousUrl: previousUrl !== "",
      hasNewUrl: nextUrl !== "",
    };
    await auditLog(
      admin.id,
      nextUrl && !previousUrl ? "class_schedule.meet_link_added" : !nextUrl && previousUrl ? "class_schedule.meet_link_removed" : "class_schedule.meet_link_changed",
      "ClassSchedule",
      cid,
      change,
    );
    // Never include the URL itself in logs/emails (§8).
  } else {
    await auditLog(admin.id, "class_schedule.updated", "ClassSchedule", cid, {
      days: schedule.days,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
  }

  revalidatePath("/admin/classes");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

const announcementListSchema = z.object({
  search: z.string().trim().max(100).optional().default(""),
  status: z.nativeEnum(AnnouncementStatus).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(PAGINATION.maxPageSize).optional(),
});

export async function getAnnouncements(input: {
  search?: string;
  status?: string;
  page?: number | string;
  pageSize?: number | string;
}) {
  await requireAdmin();
  const parsed = announcementListSchema.safeParse(input);
  const { search, status, page, pageSize } = parsed.success
    ? parsed.data
    : { search: "", status: undefined, page: 1, pageSize: undefined };
  const { skip, take } = paginationParams(page, pageSize);

  const where: Prisma.AnnouncementWhereInput = {
    ...(status ? { status } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.announcement.count({ where }),
    prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        title: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        course: { select: { id: true, title: true } },
        createdBy: { select: { name: true } },
      },
    }),
  ]);

  return pageWrap(items, total, page, pageSize ?? PAGINATION.defaultPageSize);
}

export async function getAnnouncement(id: string) {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.announcement.findUnique({
    where: { id: parsed.data },
    include: { course: { select: { id: true, title: true } } },
  });
}

export async function createAnnouncement(input: {
  title: string;
  content: string;
  courseId?: string | null;
}): Promise<ActionResult & { id?: string }> {
  const admin = await requireAdmin();
  const parsed = announcementSchema.safeParse({
    title: input.title,
    content: input.content,
    courseId: input.courseId || null,
    status: "DRAFT",
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first ? first.message : "Invalid announcement data" };
  }

  if (parsed.data.courseId) {
    const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId }, select: { id: true } });
    if (!course) return { ok: false, error: "Selected course does not exist" };
  }

  const created = await prisma.announcement.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      courseId: parsed.data.courseId,
      createdById: admin.id,
      status: AnnouncementStatus.DRAFT,
    },
  });
  await auditLog(admin.id, "announcement.created", "Announcement", created.id, { title: created.title });
  revalidatePath("/admin/announcements");
  return { ok: true, id: created.id };
}

export async function updateAnnouncement(
  id: string,
  input: { title: string; content: string; courseId?: string | null },
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z
    .object({
      id: idSchema,
      data: announcementSchema.omit({ status: true }),
    })
    .safeParse({ id, data: { ...input, courseId: input.courseId || null } });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first ? first.message : "Invalid announcement data" };
  }

  const existing = await prisma.announcement.findUnique({ where: { id: parsed.data.id }, select: { id: true } });
  if (!existing) return { ok: false, error: "Announcement not found" };

  if (parsed.data.data.courseId) {
    const course = await prisma.course.findUnique({ where: { id: parsed.data.data.courseId }, select: { id: true } });
    if (!course) return { ok: false, error: "Selected course does not exist" };
  }

  await prisma.announcement.update({
    where: { id: existing.id },
    data: {
      title: parsed.data.data.title,
      content: parsed.data.data.content,
      courseId: parsed.data.data.courseId,
    },
  });
  await auditLog(admin.id, "announcement.updated", "Announcement", existing.id, {
    title: parsed.data.data.title,
  });
  revalidatePath("/admin/announcements");
  return { ok: true };
}

export async function publishAnnouncement(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid announcement id" };

  const announcement = await prisma.announcement.findUnique({
    where: { id: parsed.data },
    include: { course: { select: { id: true, title: true } } },
  });
  if (!announcement) return { ok: false, error: "Announcement not found" };

  await prisma.announcement.update({
    where: { id: announcement.id },
    data: { status: AnnouncementStatus.PUBLISHED, publishedAt: new Date() },
  });
  await auditLog(admin.id, "announcement.published", "Announcement", announcement.id, {
    title: announcement.title,
    target: announcement.course ? `course:${announcement.course.title}` : "all",
  });

  // Notify the target audience (contract §10).
  let targets: Array<{ id: string; name: string; email: string }>;
  if (announcement.courseId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: announcement.courseId, status: EnrollmentStatus.ACTIVE },
      select: { student: { select: { id: true, name: true, email: true } } },
    });
    targets = enrollments.map((e) => e.student);
  } else {
    targets = await prisma.user.findMany({
      where: { role: "STUDENT", status: UserStatus.APPROVED },
      select: { id: true, name: true, email: true },
    });
  }

  const message = `Assalam-o-Alaikum! New announcement from Edu IT Hub Academy: "${announcement.title}". ${announcement.content.slice(0, 160)}${announcement.content.length > 160 ? "…" : ""}`;
  if (targets.length > 0) {
    await prisma.notification.createMany({
      data: targets.map((t) => ({
        userId: t.id,
        title: `Announcement: ${announcement.title}`,
        message,
        type: NotificationType.ANNOUNCEMENT,
        link: "/dashboard/announcements",
      })),
      skipDuplicates: true,
    });
    for (const t of targets) {
      await sendAdminEmail({
        to: t.email,
        subject: `Edu IT Hub Academy — ${announcement.title}`,
        html: `<p>Assalam-o-Alaikum ${t.name},</p><h2>${announcement.title}</h2><p>${announcement.content.replace(/\n/g, "<br/>")}</p><p>— Edu IT Hub Academy</p>`,
        type: NotificationType.ANNOUNCEMENT,
        userId: t.id,
      });
    }
  }

  revalidatePath("/admin/announcements");
  return { ok: true };
}

export async function setAnnouncementStatus(id: string, status: AnnouncementStatus): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z.object({ id: idSchema, status: z.nativeEnum(AnnouncementStatus) }).safeParse({ id, status });
  if (!parsed.success) return { ok: false, error: "Invalid request" };

  const existing = await prisma.announcement.findUnique({ where: { id: parsed.data.id }, select: { id: true } });
  if (!existing) return { ok: false, error: "Announcement not found" };

  await prisma.announcement.update({
    where: { id: existing.id },
    data: {
      status: parsed.data.status,
      ...(parsed.data.status === AnnouncementStatus.PUBLISHED ? { publishedAt: new Date() } : {}),
    },
  });
  await auditLog(admin.id, "announcement.status_changed", "Announcement", existing.id, {
    to: parsed.data.status,
  });
  revalidatePath("/admin/announcements");
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invalid announcement id" };

  const existing = await prisma.announcement.findUnique({ where: { id: parsed.data }, select: { id: true, title: true } });
  if (!existing) return { ok: false, error: "Announcement not found" };

  await prisma.announcement.delete({ where: { id: existing.id } });
  await auditLog(admin.id, "announcement.deleted", "Announcement", existing.id, { title: existing.title });
  revalidatePath("/admin/announcements");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Notifications (admin broadcast)
// ---------------------------------------------------------------------------

const broadcastSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
  type: z.nativeEnum(NotificationType).default(NotificationType.GENERAL),
  link: z.string().trim().max(500).optional().or(z.literal("")),
  courseId: z.string().trim().min(1).optional().nullable(),
  sendEmail: z.boolean().optional().default(false),
});

/** Send a notification to all approved students or to one course's active students. */
export async function sendBroadcast(input: {
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  courseId?: string | null;
  sendEmail?: boolean;
}): Promise<ActionResult & { recipientCount?: number }> {
  const admin = await requireAdmin();
  const parsed = broadcastSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first ? first.message : "Invalid notification data" };
  }
  const data = parsed.data;

  let courseTitle: string | null = null;
  if (data.courseId) {
    const course = await prisma.course.findUnique({ where: { id: data.courseId }, select: { title: true } });
    if (!course) return { ok: false, error: "Selected course does not exist" };
    courseTitle = course.title;
  }

  const recipients = data.courseId
    ? (
        await prisma.enrollment.findMany({
          where: { courseId: data.courseId, status: EnrollmentStatus.ACTIVE },
          select: { student: { select: { id: true, name: true, email: true } } },
        })
      ).map((e) => e.student)
    : await prisma.user.findMany({
        where: { role: "STUDENT", status: UserStatus.APPROVED },
        select: { id: true, name: true, email: true },
      });

  if (recipients.length === 0) return { ok: false, error: "No recipients found for this target" };

  await prisma.notification.createMany({
    data: recipients.map((r) => ({
      userId: r.id,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link || null,
    })),
    skipDuplicates: true,
  });

  if (data.sendEmail) {
    for (const r of recipients) {
      await sendAdminEmail({
        to: r.email,
        subject: `Edu IT Hub Academy — ${data.title}`,
        html: `<p>Assalam-o-Alaikum ${r.name},</p><p>${data.message.replace(/\n/g, "<br/>")}</p><p>— Edu IT Hub Academy</p>`,
        type: data.type,
        userId: r.id,
      });
    }
  }

  await auditLog(admin.id, "notification.broadcast", "Notification", "broadcast", {
    title: data.title,
    type: data.type,
    target: courseTitle ? `course:${courseTitle}` : "all",
    recipientCount: recipients.length,
    emailAlsoSent: data.sendEmail,
  });

  revalidatePath("/admin/notifications");
  return { ok: true, recipientCount: recipients.length };
}

export async function getRecentNotifications(input: { page?: number | string; pageSize?: number | string; search?: string }) {
  await requireAdmin();
  const { page, pageSize, skip, take } = paginationParams(input.page, input.pageSize);
  const search = (input.search ?? "").trim();
  const where: Prisma.NotificationWhereInput = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};
  const [total, items] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        readAt: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);
  return pageWrap(items, total, page, pageSize);
}

// ---------------------------------------------------------------------------
// Settings (backed by the Setting table; keys limited to the known list)
// ---------------------------------------------------------------------------

const ALLOWED_SETTING_KEYS = new Set<string>([...SETTING_KEYS]);

export async function getSettings(): Promise<Record<string, string>> {
  await requireAdmin();
  const rows = await prisma.setting.findMany();
  const out: Record<string, string> = {};
  for (const row of rows) out[row.key] = row.value;
  return out;
}

const testimonialsSchema = z.array(
  z.object({
    name: z.string().trim().min(1).max(100),
    role: z.string().trim().max(100).optional().default(""),
    text: z.string().trim().min(1).max(1000),
    rating: z.number().int().min(1).max(5).optional().default(5),
  }),
);

export async function updateSettings(entries: Record<string, string>): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (typeof entries !== "object" || entries === null) return { ok: false, error: "Invalid settings payload" };

  const keys = Object.keys(entries);
  if (keys.length === 0) return { ok: false, error: "Nothing to save" };
  if (keys.length > 50) return { ok: false, error: "Too many settings at once" };

  for (const key of keys) {
    if (!ALLOWED_SETTING_KEYS.has(key)) return { ok: false, error: `Unknown setting key: ${key}` };
    const value = entries[key];
    if (typeof value !== "string" || value.length > 10000) {
      return { ok: false, error: `Invalid value for ${key}` };
    }
  }

  // Validate special keys.
  if (entries["site.testimonials"] !== undefined) {
    const raw = entries["site.testimonials"].trim();
    if (raw) {
      try {
        const parsedJson: unknown = JSON.parse(raw);
        const check = testimonialsSchema.safeParse(parsedJson);
        if (!check.success) return { ok: false, error: "Testimonials must be a JSON array of {name, role?, text, rating?}" };
      } catch {
        return { ok: false, error: "Testimonials is not valid JSON" };
      }
    }
  }
  if (entries["email.notificationsEnabled"] !== undefined) {
    if (!["true", "false"].includes(entries["email.notificationsEnabled"])) {
      return { ok: false, error: "email.notificationsEnabled must be true or false" };
    }
  }
  if (entries["contact.email"] !== undefined && entries["contact.email"].trim()) {
    const emailCheck = z.string().email().safeParse(entries["contact.email"].trim());
    if (!emailCheck.success) return { ok: false, error: "contact.email is not a valid email" };
  }
  if (entries["contact.phone"] !== undefined && entries["contact.phone"].trim()) {
    if (!pakistaniPhoneRegex.test(entries["contact.phone"].trim())) {
      return { ok: false, error: "contact.phone must look like 03XXXXXXXXX" };
    }
  }
  if (entries["contact.whatsapp"] !== undefined && entries["contact.whatsapp"].trim()) {
    if (!pakistaniPhoneRegex.test(entries["contact.whatsapp"].trim())) {
      return { ok: false, error: "contact.whatsapp must look like 03XXXXXXXXX" };
    }
  }

  await prisma.$transaction(
    keys.map((key) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: entries[key] },
        update: { value: entries[key] },
      }),
    ),
  );

  await auditLog(admin.id, "settings.updated", "Setting", "batch", { keys });
  revalidatePath("/admin/settings");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Dashboard stats (all real aggregations)
// ---------------------------------------------------------------------------

const karachiTz = "Asia/Karachi";

function tzParts(date: Date): { year: string; month: string; day: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: karachiTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { year: get("year"), month: get("month"), day: get("day") };
}

function dayKey(date: Date): string {
  const { year, month, day } = tzParts(date);
  return `${year}-${month}-${day}`;
}

function monthKeyOf(date: Date): string {
  const { year, month } = tzParts(date);
  return `${year}-${month}`;
}

export interface AdminStats {
  totalStudents: number;
  pendingStudents: number;
  approvedStudents: number;
  suspendedStudents: number;
  totalCourses: number;
  publishedCourses: number;
  pendingPayments: number;
  approvedPayments: number;
  activeEnrollments: number;
  monthlyRevenue: number;
  currentMonth: string;
  registrationsLast14Days: Array<{ date: string; count: number }>;
  revenueLast6Months: Array<{ month: string; total: number }>;
  recentStudents: Array<{ id: string; name: string; email: string; createdAt: Date }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    month: string;
    status: PaymentStatus;
    createdAt: Date;
    studentName: string;
    courseTitle: string;
  }>;
}

export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 190 * 24 * 60 * 60 * 1000);
  const currentMonth = currentMonthKey();

  const [
    totalStudents,
    pendingStudents,
    approvedStudents,
    suspendedStudents,
    totalCourses,
    publishedCourses,
    pendingPayments,
    approvedPayments,
    activeEnrollments,
    monthlyRevenueAgg,
    recentRegistrations,
    revenueRows,
    recentStudents,
    recentPayments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "STUDENT", status: UserStatus.PENDING_APPROVAL } }),
    prisma.user.count({ where: { role: "STUDENT", status: UserStatus.APPROVED } }),
    prisma.user.count({ where: { role: "STUDENT", status: UserStatus.SUSPENDED } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: CourseStatus.PUBLISHED } }),
    prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
    prisma.payment.count({ where: { status: PaymentStatus.APPROVED } }),
    prisma.enrollment.count({ where: { status: EnrollmentStatus.ACTIVE } }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.APPROVED, month: currentMonth },
      _sum: { amount: true },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.payment.findMany({
      where: { status: PaymentStatus.APPROVED, paymentDate: { gte: sixMonthsAgo } },
      select: { amount: true, paymentDate: true },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        amount: true,
        month: true,
        status: true,
        createdAt: true,
        student: { select: { name: true } },
        course: { select: { title: true } },
      },
    }),
  ]);

  // Registrations per day, last 14 days (Asia/Karachi), zero-filled.
  const regBuckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    regBuckets.set(dayKey(new Date(now.getTime() - i * 24 * 60 * 60 * 1000)), 0);
  }
  for (const r of recentRegistrations) {
    const key = dayKey(r.createdAt);
    if (regBuckets.has(key)) regBuckets.set(key, (regBuckets.get(key) ?? 0) + 1);
  }
  const registrationsLast14Days = [...regBuckets.entries()].map(([date, count]) => ({ date, count }));

  // Revenue per billing month, last 6 months, zero-filled.
  const revBuckets = new Map<string, number>();
  const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthLabels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    const key = monthKeyOf(d);
    monthLabels.push(key);
    revBuckets.set(key, 0);
  }
  for (const row of revenueRows) {
    const key = monthKeyOf(row.paymentDate);
    if (revBuckets.has(key)) revBuckets.set(key, (revBuckets.get(key) ?? 0) + row.amount);
  }
  const revenueLast6Months = monthLabels.map((month) => ({ month, total: revBuckets.get(month) ?? 0 }));

  return {
    totalStudents,
    pendingStudents,
    approvedStudents,
    suspendedStudents,
    totalCourses,
    publishedCourses,
    pendingPayments,
    approvedPayments,
    activeEnrollments,
    monthlyRevenue: monthlyRevenueAgg._sum.amount ?? 0,
    currentMonth,
    registrationsLast14Days,
    revenueLast6Months,
    recentStudents,
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amount: p.amount,
      month: p.month,
      status: p.status,
      createdAt: p.createdAt,
      studentName: p.student.name,
      courseTitle: p.course.title,
    })),
  };
}

// ---------------------------------------------------------------------------
// Audit logs & email logs
// ---------------------------------------------------------------------------

export async function getAuditLogs(input: { page?: number | string; pageSize?: number | string; search?: string }) {
  await requireAdmin();
  const { page, pageSize, skip, take } = paginationParams(input.page, input.pageSize);
  const search = (input.search ?? "").trim();
  const where: Prisma.AuditLogWhereInput = search
    ? {
        OR: [
          { action: { contains: search, mode: "insensitive" } },
          { entity: { contains: search, mode: "insensitive" } },
          { admin: { email: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};
  const [total, items] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        metadata: true,
        createdAt: true,
        admin: { select: { name: true, email: true } },
      },
    }),
  ]);
  return pageWrap(items, total, page, pageSize);
}

export async function getEmailLogs(input: { page?: number | string; pageSize?: number | string; search?: string }) {
  await requireAdmin();
  const { page, pageSize, skip, take } = paginationParams(input.page, input.pageSize);
  const search = (input.search ?? "").trim();
  const where: Prisma.EmailLogWhereInput = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { subject: { contains: search, mode: "insensitive" } },
          { type: { contains: search, mode: "insensitive" } },
          { status: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};
  const [total, items] = await Promise.all([
    prisma.emailLog.count({ where }),
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        email: true,
        type: true,
        subject: true,
        status: true,
        error: true,
        sentAt: true,
        user: { select: { name: true } },
      },
    }),
  ]);
  return pageWrap(items, total, page, pageSize);
}

// ---------------------------------------------------------------------------
// Admin profile
// ---------------------------------------------------------------------------

export async function getAdminProfile() {
  const admin = await requireAdmin();
  return prisma.user.findUnique({
    where: { id: admin.id },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
}

export async function updateAdminProfile(input: { name: string }): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z.object({ name: z.string().trim().min(2).max(100) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Name must be at least 2 characters" };

  await prisma.user.update({ where: { id: admin.id }, data: { name: parsed.data.name } });
  await auditLog(admin.id, "admin.profile_updated", "User", admin.id, { name: parsed.data.name });
  revalidatePath("/admin/profile");
  return { ok: true };
}

export async function changeAdminPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .regex(
          strongPasswordRegex,
          "New password must be 8+ characters with uppercase, lowercase, number and symbol",
        )
        .max(128),
    })
    .safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first ? first.message : "Invalid password" };
  }

  const user = await prisma.user.findUnique({ where: { id: admin.id }, select: { passwordHash: true } });
  if (!user) return { ok: false, error: "Account not found" };
  const matches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!matches) return { ok: false, error: "Current password is incorrect" };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: admin.id }, data: { passwordHash } });
  await auditLog(admin.id, "admin.password_changed", "User", admin.id, {});
  return { ok: true };
}
