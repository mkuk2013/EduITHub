/**
 * Outbound email via nodemailer (SMTP).
 *
 * Never throws to callers: if SMTP is not configured (or email notifications
 * are disabled in settings) it writes an EmailLog row with status "SKIPPED"
 * and returns { ok: false, error }. On success it logs "SENT", on exception
 * "FAILED" with the error message. SMTP credentials are server-only and are
 * never exposed to the client.
 */

import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  /** EmailLog type label, e.g. "PAYMENT_APPROVED". */
  type: string;
  userId?: string;
}

export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

/** True when the SMTP env vars needed to send are all present. */
export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS,
  );
}

async function logEmail(
  opts: SendEmailOptions,
  status: "SENT" | "FAILED" | "SKIPPED",
  error?: string,
): Promise<void> {
  try {
    await prisma.emailLog.create({
      data: {
        userId: opts.userId ?? null,
        email: opts.to,
        type: opts.type,
        subject: opts.subject,
        status,
        error: error ?? null,
      },
    });
  } catch {
    // Logging must never break the caller.
  }
}

async function isEmailEnabledInSettings(): Promise<boolean> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "email.notificationsEnabled" },
      select: { value: true },
    });
    return setting?.value !== "false";
  } catch {
    // If the settings table is unreachable, default to enabled so a
    // configured SMTP still sends; failures will be logged as FAILED.
    return true;
  }
}

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    await logEmail(opts, "SKIPPED", "SMTP not configured");
    return { ok: false, error: "SMTP not configured" };
  }

  if (!(await isEmailEnabledInSettings())) {
    await logEmail(opts, "SKIPPED", "Email notifications disabled in settings");
    return { ok: false, error: "Email notifications disabled" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? `Edu IT Hub Academy <${process.env.EMAIL_USER}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    await logEmail(opts, "SENT");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    await logEmail(opts, "FAILED", message);
    return { ok: false, error: message };
  }
}
