import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { currentMonthKey } from "@/lib/format";
import { EnrollmentStatus, PaymentStatus } from "@prisma/client";

/**
 * GET /api/meet/[courseId]
 *
 * Returns the Google Meet URL for a course — ONLY when:
 *  1. the caller is signed in (401 otherwise),
 *  2. the caller is an APPROVED STUDENT (403 otherwise),
 *  3. the caller has an ACTIVE enrollment in this course (403 otherwise),
 *  4. an APPROVED payment for this enrollment covers the current billing
 *     month, and enrollment.expiresAt (if set) has not passed (403 otherwise),
 *  5. the course has a class schedule with a meeting URL (404 otherwise).
 *
 * The URL is returned ONLY on success. Error responses never include it.
 * Rate-limited per IP (pre-auth) and per user (post-auth).
 */

const paramsSchema = z.object({
  courseId: z.string().min(1).max(64),
});

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return ip;
}

function tooManyRequests(resetMs: number) {
  return Response.json(
    { error: "Too many requests. Please wait a moment and try again." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(resetMs / 1000)) },
    },
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  // Pre-auth rate limit: cheap abuse protection before touching the session.
  const ipLimit = checkRateLimit(`meet:ip:${clientIp(request)}`, 30, 60_000);
  if (!ipLimit.allowed) {
    return tooManyRequests(ipLimit.resetMs);
  }

  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  // Post-auth rate limit per user.
  const userLimit = checkRateLimit(`meet:user:${session.user.id}`, 10, 60_000);
  if (!userLimit.allowed) {
    return tooManyRequests(userLimit.resetMs);
  }

  const { courseId } = paramsSchema.parse(await params);

  // If ADMIN, allow directly
  if (session.user.role === "ADMIN") {
    // Admin has access
  } else if (session.user.role === "INSTRUCTOR" && session.user.status === "APPROVED") {
    // Instructor teaching this course has access
    const isAssigned = await prisma.courseInstructor.findFirst({
      where: {
        courseId,
        instructor: {
          OR: [{ userId: session.user.id }, { email: session.user.email }],
        },
      },
    });
    if (!isAssigned) {
      return Response.json({ error: "Access denied." }, { status: 403 });
    }
  } else if (session.user.role === "STUDENT" && session.user.status === "APPROVED") {
    // The student must hold an ACTIVE enrollment for this exact course.
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: session.user.id,
        courseId,
        status: EnrollmentStatus.ACTIVE,
      },
      select: { id: true, expiresAt: true },
    });
    if (!enrollment) {
      return Response.json({ error: "Access denied." }, { status: 403 });
    }

    // Enrollment validity window.
    if (enrollment.expiresAt && enrollment.expiresAt.getTime() < Date.now()) {
      return Response.json({ error: "Access denied." }, { status: 403 });
    }

    // An APPROVED payment must cover the current billing month.
    const monthKey = currentMonthKey();
    const validPayment = await prisma.payment.findFirst({
      where: {
        studentId: session.user.id,
        courseId,
        status: PaymentStatus.APPROVED,
        month: monthKey,
        OR: [{ enrollmentId: enrollment.id }, { enrollmentId: null }],
      },
      select: { id: true },
    });
    if (!validPayment) {
      return Response.json(
        { error: "A verified payment for the current month is required to join this class." },
        { status: 403 },
      );
    }
  } else {
    return Response.json({ error: "Access denied." }, { status: 403 });
  }

  // Load the schedule — meetingUrl is only ever selected in this guarded route.
  const schedule = await prisma.classSchedule.findUnique({
    where: { courseId },
    select: {
      meetingUrl: true,
      days: true,
      startTime: true,
      endTime: true,
    },
  });
  if (!schedule?.meetingUrl) {
    return Response.json({ error: "No class link has been set for this course yet." }, { status: 404 });
  }

  return Response.json({
    url: schedule.meetingUrl,
    days: schedule.days,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
  });
}
