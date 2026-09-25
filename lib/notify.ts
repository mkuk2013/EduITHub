/**
 * In-app notification helpers. Creates Notification rows via Prisma.
 * Every meaningful state change should call one of these AND (where
 * applicable) send email through lib/email.ts.
 */

import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface NotifyInput {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

/** Create a single notification for a user. */
export async function notifyUser(userId: string, input: NotifyInput): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      title: input.title,
      message: input.message,
      type: input.type,
      link: input.link ?? null,
    },
  });
}

/** Create the same notification for every approved admin. */
export async function notifyAdmins(input: NotifyInput): Promise<void> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", status: "APPROVED" },
    select: { id: true },
  });
  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      title: input.title,
      message: input.message,
      type: input.type,
      link: input.link ?? null,
    })),
  });
}
