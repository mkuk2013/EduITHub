"use server";

/**
 * Payment server actions for Edu IT Hub Academy.
 *
 * All money is integer PKR. Authz: student actions derive the user from the
 * session (requireStudent); admin actions go through requireAdmin. Every
 * input is zod-validated before any DB access.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  type EnrollmentStatus,
  type PaymentStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStudent, requireAdmin, getSessionUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import * as templates from "@/lib/email-templates";
import { notifyAdmins, notifyUser } from "@/lib/notify";
import { saveUpload } from "@/lib/upload";
import { currentMonthKey, formatPKR, formatDate } from "@/lib/format";
import { paymentSubmissionSchema } from "@/lib/validators";
import { ROUTES, BRAND, PAGINATION } from "@/lib/constants";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

async function getAcademyName(): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "academy.name" },
      select: { value: true },
    });
    return setting?.value?.trim() || BRAND.name;
  } catch {
    return BRAND.name;
  }
}

/** Expiry for an approved payment: last day of the billing month, 23:59 Asia/Karachi. */
export async function paymentMonthExpiry(month: string): Promise<Date> {
  const [year, m] = month.split("-").map(Number);
  // First instant of the next month in Asia/Karachi (UTC+5, no DST), minus 1s.
  const nextMonthStartUtc = Date.UTC(year, m, 1) - 5 * 60 * 60 * 1000;
  return new Date(nextMonthStartUtc - 1000);
}

/**
 * The canonical validity rule for enrollments (also implemented by the
 * /api/meet route): ACTIVE status AND (expiresAt == null → an APPROVED
 * payment exists for the current month; otherwise expiresAt >= now).
 */
export async function isEnrollmentCurrentlyValid(
  enrollment: { status: EnrollmentStatus; expiresAt: Date | string | null },
  payments: Array<{ status: PaymentStatus; month: string }>,
): Promise<boolean> {
  if (enrollment.status !== "ACTIVE") return false;
  if (enrollment.expiresAt === null) {
    const month = currentMonthKey();
    return payments.some((p) => p.status === "APPROVED" && p.month === month);
  }
  return new Date(enrollment.expiresAt).getTime() >= Date.now();
}

const submitPaymentFormSchema = z.object({
  enrollmentId: z.string().min(1, "Enrollment is required"),
  amount: z
    .number()
    .int("Amount must be a whole PKR number")
    .positive("Amount must be positive"),
  paymentMethod: paymentSubmissionSchema.shape.paymentMethod,
  transactionId: z
    .string()
    .trim()
    .min(4, "Transaction ID looks too short")
    .max(100, "Transaction ID is too long"),
  paymentDate: z.coerce.date(),
});

/* ------------------------------------------------------------------ */
/* Student actions                                                     */
/* ------------------------------------------------------------------ */

/**
 * Submit a fee payment for verification. The enrollment must belong to the
 * signed-in student and be in PENDING_PAYMENT (first payment) or ACTIVE
 * (monthly renewal) status.
 */
export async function submitPayment(formData: FormData): Promise<ActionResult> {
  const me = await requireStudent();

  const parsed = submitPaymentFormSchema.safeParse({
    enrollmentId: formData.get("enrollmentId"),
    amount: formData.get("amount") !== null ? Number(formData.get("amount")) : undefined,
    paymentMethod: formData.get("paymentMethod"),
    transactionId: formData.get("transactionId"),
    paymentDate: formData.get("paymentDate"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid payment data" };
  }
  const { enrollmentId, amount, paymentMethod, transactionId, paymentDate } = parsed.data;

  const month = currentMonthKey();

  const enrollment = await prisma.enrollment.findFirst({
    where: { id: enrollmentId, studentId: me.id },
    include: { course: { select: { id: true, title: true } } },
  });
  if (!enrollment) {
    return { ok: false, error: "Enrollment not found" };
  }
  if (enrollment.status !== "PENDING_PAYMENT" && enrollment.status !== "ACTIVE") {
    return {
      ok: false,
      error: "This enrollment cannot accept a payment right now",
    };
  }

  const existingPending = await prisma.payment.findFirst({
    where: { enrollmentId, month, status: "PENDING" },
    select: { id: true },
  });
  if (existingPending) {
    return {
      ok: false,
      error: "You already have a payment pending verification for this month",
    };
  }

  let proofImage: string | undefined;
  const file = formData.get("proofImage");
  if (file instanceof File && file.size > 0) {
    try {
      proofImage = await saveUpload(file, "payments");
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Could not save the payment proof image",
      };
    }
  }

  const created = await prisma.payment.create({
    data: {
      studentId: me.id,
      courseId: enrollment.courseId,
      enrollmentId: enrollment.id,
      amount,
      month,
      paymentMethod,
      transactionId,
      paymentDate,
      proofImage: proofImage ?? null,
      status: "PENDING",
    },
    select: { id: true },
  });
  void created;

  if (enrollment.status === "PENDING_PAYMENT") {
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "PENDING_VERIFICATION" },
    });
  }

  const academyName = await getAcademyName();

  await notifyAdmins({
    title: "New payment submitted",
    message: `${me.name} submitted ${formatPKR(amount)} for ${enrollment.course.title} (${month}).`,
    type: "PAYMENT_SUBMITTED",
    link: ROUTES.adminPayments,
  });

  try {
    const { subject, html } = templates.paymentSubmitted({
      academyName,
      studentName: me.name,
      courseTitle: enrollment.course.title,
      amount,
      month,
      transactionId,
    });
    await sendEmail({
      to: me.email,
      subject,
      html,
      type: "PAYMENT_SUBMITTED",
      userId: me.id,
    });
  } catch {
    // Email must never fail the action.
  }

  revalidatePath(ROUTES.dashboardPayments);
  return { ok: true };
}

/**
 * Payment verification by an admin. APPROVED activates the enrollment and
 * sets expiry to the end of the payment month; REJECTED / CORRECTION_REQUESTED
 * leave the enrollment non-active. Always writes an AuditLog row.
 */
export async function verifyPayment(
  paymentId: string,
  decision: "APPROVED" | "REJECTED" | "CORRECTION_REQUESTED",
  adminNote?: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsed = z
    .object({
      paymentId: z.string().min(1),
      decision: z.enum(["APPROVED", "REJECTED", "CORRECTION_REQUESTED"]),
      adminNote: z.string().trim().max(1000).optional(),
    })
    .safeParse({ paymentId, decision, adminNote });
  if (!parsed.success) {
    return { ok: false, error: "Invalid verification data" };
  }

  const payment = await prisma.payment.findUnique({
    where: { id: parsed.data.paymentId },
    include: {
      enrollment: true,
      course: { select: { id: true, title: true } },
      student: { select: { id: true, name: true, email: true } },
    },
  });
  if (!payment) {
    return { ok: false, error: "Payment not found" };
  }
  if (payment.status !== "PENDING") {
    return { ok: false, error: "This payment has already been reviewed" };
  }

  const note = parsed.data.adminNote?.trim() || null;
  const verifiedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: parsed.data.decision,
        verifiedById: admin.id,
        verifiedAt,
        adminNote: note,
      },
    });

    if (parsed.data.decision === "APPROVED" && payment.enrollment) {
      await tx.enrollment.update({
        where: { id: payment.enrollment.id },
        data: {
          status: "ACTIVE",
          expiresAt: await paymentMonthExpiry(payment.month),
        },
      });
    }
  }, {
    maxWait: 15000,
    timeout: 30000,
  });

  const academyName = await getAcademyName();
  const expiresAt = await paymentMonthExpiry(payment.month);
  const baseVars = {
    academyName,
    studentName: payment.student.name,
    courseTitle: payment.course.title,
    amount: payment.amount,
    month: payment.month,
  };

  if (parsed.data.decision === "APPROVED") {
    await notifyUser(payment.studentId, {
      title: "Payment approved",
      message: `Your ${formatPKR(payment.amount)} payment for ${payment.course.title} (${payment.month}) was approved. Your enrollment is now active.`,
      type: "PAYMENT_APPROVED",
      link: ROUTES.dashboardPayments,
    });
    await notifyUser(payment.studentId, {
      title: "Enrollment activated",
      message: `${payment.course.title} is active until ${formatDate(expiresAt)}.`,
      type: "ENROLLMENT_ACTIVATED",
      link: ROUTES.dashboard,
    });
    try {
      const approved = templates.paymentApproved({
        ...baseVars,
        validUntil: formatDate(expiresAt),
      });
      await sendEmail({
        to: payment.student.email,
        subject: approved.subject,
        html: approved.html,
        type: "PAYMENT_APPROVED",
        userId: payment.studentId,
      });
      const activated = templates.enrollmentActivated({
        academyName,
        studentName: payment.student.name,
        courseTitle: payment.course.title,
        validUntil: formatDate(expiresAt),
      });
      await sendEmail({
        to: payment.student.email,
        subject: activated.subject,
        html: activated.html,
        type: "ENROLLMENT_ACTIVATED",
        userId: payment.studentId,
      });
    } catch {
      // Email must never fail the action.
    }
  } else if (parsed.data.decision === "REJECTED") {
    await notifyUser(payment.studentId, {
      title: "Payment not approved",
      message: `Your ${formatPKR(payment.amount)} payment for ${payment.course.title} (${payment.month}) was not approved.${note ? ` Note: ${note}` : ""}`,
      type: "PAYMENT_REJECTED",
      link: ROUTES.dashboardPayments,
    });
    try {
      const { subject, html } = templates.paymentRejected({
        ...baseVars,
        adminNote: note ?? undefined,
      });
      await sendEmail({
        to: payment.student.email,
        subject,
        html,
        type: "PAYMENT_REJECTED",
        userId: payment.studentId,
      });
    } catch {
      // Email must never fail the action.
    }
  } else {
    await notifyUser(payment.studentId, {
      title: "Payment needs correction",
      message: `Your payment for ${payment.course.title} (${payment.month}) needs a correction before it can be approved.${note ? ` ${note}` : ""}`,
      type: "PAYMENT_CORRECTION_REQUESTED",
      link: ROUTES.dashboardPayments,
    });
    try {
      const { subject, html } = templates.paymentCorrectionRequested({
        ...baseVars,
        adminNote: note ?? undefined,
      });
      await sendEmail({
        to: payment.student.email,
        subject,
        html,
        type: "PAYMENT_CORRECTION_REQUESTED",
        userId: payment.studentId,
      });
    } catch {
      // Email must never fail the action.
    }
  }

  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: `payment.${parsed.data.decision}`,
      entity: "Payment",
      entityId: payment.id,
      metadata: {
        decision: parsed.data.decision,
        adminNote: note,
        enrollmentId: payment.enrollmentId,
        studentId: payment.studentId,
        amount: payment.amount,
        month: payment.month,
      },
    },
  });

  revalidatePath(ROUTES.adminPayments);
  return { ok: true };
}

/** The signed-in student's own payment history, newest first. */
export async function getMyPayments(): Promise<
  Array<{
    id: string;
    amount: number;
    month: string;
    paymentMethod: string;
    transactionId: string;
    paymentDate: Date;
    status: PaymentStatus;
    adminNote: string | null;
    courseTitle: string;
    proofImage: string | null;
    createdAt: Date;
  }>
> {
  const me = await requireStudent();

  const payments = await prisma.payment.findMany({
    where: { studentId: me.id },
    include: { course: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    month: p.month,
    paymentMethod: p.paymentMethod,
    transactionId: p.transactionId,
    paymentDate: p.paymentDate,
    status: p.status,
    adminNote: p.adminNote,
    courseTitle: p.course.title,
    proofImage: p.proofImage,
    createdAt: p.createdAt,
  }));
}

/** Payment account details shown on the fee submission page (from Setting table). */
export async function getPaymentSettings(): Promise<{
  accountName: string;
  accountNumber: string;
  methods: string;
}> {
  const rows = await prisma.setting.findMany({
    where: {
      key: { in: ["payment.accountName", "payment.accountNumber", "payment.methods"] },
    },
    select: { key: true, value: true },
  });
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  return {
    accountName: byKey.get("payment.accountName")?.trim() || "Mukesh Kumar",
    accountNumber: byKey.get("payment.accountNumber")?.trim() || "03363268833",
    methods: byKey.get("payment.methods")?.trim() || "Easypaisa / JazzCash",
  };
}

/** Admin: payments awaiting verification, newest first. */
export async function getPendingPayments(): Promise<
  Array<{
    id: string;
    amount: number;
    month: string;
    paymentMethod: string;
    transactionId: string;
    paymentDate: Date;
    proofImage: string | null;
    status: PaymentStatus;
    studentName: string;
    studentEmail: string;
    studentPhone: string | null;
    courseTitle: string;
    submittedAt: Date;
  }>
> {
  await requireAdmin();

  const payments = await prisma.payment.findMany({
    where: { status: "PENDING" },
    include: {
      course: { select: { title: true } },
      student: {
        select: {
          name: true,
          email: true,
          studentProfile: { select: { phone: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments.map((p) => ({
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
    studentPhone: p.student.studentProfile?.phone ?? null,
    courseTitle: p.course.title,
    submittedAt: p.createdAt,
  }));
}

/** Admin: paginated, searchable list of all payments. */
export async function getAllPayments(opts: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  items: Array<{
    id: string;
    amount: number;
    month: string;
    paymentMethod: string;
    transactionId: string;
    paymentDate: Date;
    status: PaymentStatus;
    studentName: string;
    studentEmail: string;
    courseTitle: string;
    createdAt: Date;
  }>;
  total: number;
  page: number;
  pageSize: number;
}> {
  await requireAdmin();

  const parsed = z
    .object({
      search: z.string().trim().max(100).optional(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "CORRECTION_REQUESTED"]).optional(),
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(PAGINATION.maxPageSize).default(PAGINATION.defaultPageSize),
    })
    .safeParse(opts);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, pageSize: PAGINATION.defaultPageSize };
  }
  const { search, status, page, pageSize } = parsed.data;

  const where: {
    status?: PaymentStatus;
    OR?: Array<{
      transactionId?: { contains: string; mode: "insensitive" };
      student?: { name?: { contains: string; mode: "insensitive" }; email?: { contains: string; mode: "insensitive" } };
    }>;
  } = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { transactionId: { contains: search, mode: "insensitive" } },
      { student: { name: { contains: search, mode: "insensitive" } } },
      { student: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: {
        course: { select: { title: true } },
        student: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      month: p.month,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId,
      paymentDate: p.paymentDate,
      status: p.status,
      studentName: p.student.name,
      studentEmail: p.student.email,
      courseTitle: p.course.title,
      createdAt: p.createdAt,
    })),
    total,
    page,
    pageSize,
  };
}

/**
 * Payment status for one enrollment — used for Meet gating and UI badges.
 * Students may only query their own enrollments; admins may query any.
 */
export async function getEnrollmentPaymentStatus(enrollmentId: string): Promise<{
  latestStatus: PaymentStatus | null;
  currentMonthCovered: boolean;
}> {
  const me = await getSessionUser();
  if (!me) {
    return { latestStatus: null, currentMonthCovered: false };
  }

  const enrollment = await prisma.enrollment.findFirst({
    where:
      me.role === "ADMIN" ? { id: enrollmentId } : { id: enrollmentId, studentId: me.id },
    select: { id: true },
  });
  if (!enrollment) {
    return { latestStatus: null, currentMonthCovered: false };
  }

  const month = currentMonthKey();
  const payments = await prisma.payment.findMany({
    where: { enrollmentId },
    select: { status: true, month: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return {
    latestStatus: payments[0]?.status ?? null,
    currentMonthCovered: payments.some((p) => p.status === "APPROVED" && p.month === month),
  };
}
