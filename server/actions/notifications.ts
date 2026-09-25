"use server";

/**
 * Notification server actions for the signed-in user.
 *
 * Ownership of each notification is verified before any read/update — a
 * user can only ever touch their own notifications.
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import type { NotificationType } from "@prisma/client";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
}

async function requireSessionUserId(): Promise<string> {
  const me = await getSessionUser();
  if (!me) {
    throw new Error("You must be signed in");
  }
  return me.id;
}

/** The signed-in user's notifications, newest first, plus unread count. */
export async function getMyNotifications(limit = 50): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> {
  const userId = await requireSessionUserId();

  const safeLimit = z.coerce.number().int().min(1).max(100).safeParse(limit);
  const take = safeLimit.success ? safeLimit.data : 50;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      link: n.link,
      readAt: n.readAt,
      createdAt: n.createdAt,
    })),
    unreadCount,
  };
}

/** Mark one notification as read — only if it belongs to the signed-in user. */
export async function markNotificationRead(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireSessionUserId();

  if (typeof id !== "string" || id.length === 0) {
    return { ok: false, error: "Invalid notification" };
  }

  const notification = await prisma.notification.findFirst({
    where: { id, userId },
    select: { id: true, readAt: true },
  });
  if (!notification) {
    return { ok: false, error: "Notification not found" };
  }

  if (!notification.readAt) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { readAt: new Date() },
    });
  }
  return { ok: true };
}

/** Mark all of the signed-in user's unread notifications as read. */
export async function markAllNotificationsRead(): Promise<{ ok: boolean; count: number }> {
  const userId = await requireSessionUserId();

  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { ok: true, count: result.count };
}

/** Number of unread notifications for the signed-in user. */
export async function getUnreadCount(): Promise<number> {
  const me = await getSessionUser();
  if (!me) return 0;
  return prisma.notification.count({ where: { userId: me.id, readAt: null } });
}
