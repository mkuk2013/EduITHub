"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { contactSchema, type ContactInput } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";

export interface ContactFormState {
  ok: boolean;
  errors?: Partial<Record<keyof ContactInput, string>>;
  message?: string;
}

/**
 * Public contact form handler. Validates with zod, rate-limits by IP, then
 * creates a GENERAL Notification row for every admin user (linking to
 * /admin/notifications). Email delivery stays with the payments workstream
 * (lib/email.ts) and is intentionally not sent here.
 */
export async function submitContactMessage(input: ContactInput): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Partial<Record<keyof ContactInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof ContactInput | undefined;
      if (field && !errors[field]) errors[field] = issue.message;
    }
    return { ok: false, errors };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`contact:${ip}`, 5, 60_000);
  if (!allowed) {
    return {
      ok: false,
      message: "Too many messages sent. Please wait a minute and try again.",
    };
  }

  const { name, email, message } = parsed.data;

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", status: "APPROVED" },
    select: { id: true },
  });

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title: `New contact message from ${name}`,
        message: `From: ${name} <${email}>\n\n${message}`,
        type: "GENERAL" as const,
        link: "/admin/notifications",
      })),
    });
  }

  return { ok: true };
}
