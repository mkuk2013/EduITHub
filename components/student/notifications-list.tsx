"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCheck, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { markNotificationRead, markAllNotificationsRead } from "@/server/actions/notifications";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  readAt: Date | string | null;
  createdAt: Date | string;
}

const TYPE_VARIANTS: Record<string, "primary" | "success" | "warning" | "danger" | "info" | "default"> = {
  PAYMENT_APPROVED: "success",
  ENROLLMENT_ACTIVATED: "success",
  ACCOUNT_APPROVED: "success",
  PAYMENT_SUBMITTED: "info",
  PAYMENT_REJECTED: "danger",
  ACCOUNT_REJECTED: "danger",
  PAYMENT_CORRECTION_REQUESTED: "warning",
  FEE_REMINDER: "warning",
  CLASS_REMINDER: "primary",
  ANNOUNCEMENT: "primary",
};

/**
 * Notification inbox with per-item and mark-all-read actions.
 */
export function NotificationsList({ notifications }: { notifications: NotificationItem[] }) {
  const router = useRouter();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  async function handleMarkRead(id: string) {
    if (pendingIds.has(id)) return;
    setPendingIds((prev) => new Set(prev).add(id));
    try {
      const result = await markNotificationRead(id);
      if (result.ok) {
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not mark the notification as read.");
      }
    } catch {
      toast.error("Could not mark the notification as read.");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleMarkAllRead() {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      const result = await markAllNotificationsRead();
      if (result.ok) {
        toast.success(
          result.count > 0 ? "All notifications marked as read." : "No unread notifications.",
        );
        router.refresh();
      } else {
        toast.error("Could not update notifications.");
      }
    } catch {
      toast.error("Could not update notifications.");
    } finally {
      setMarkingAll(false);
    }
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<BellRing className="h-6 w-6" aria-hidden="true" />}
        title="No notifications yet"
        description="Important updates about your enrollments, payments and classes will appear here."
      />
    );
  }

  return (
    <div>
      {unreadCount > 0 ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markingAll}>
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            {markingAll ? "Updating..." : "Mark all as read"}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {notifications.map((n) => {
          const unread = !n.readAt;
          const variant = TYPE_VARIANTS[n.type] ?? "default";
          return (
            <Card
              key={n.id}
              className={cn(
                unread && "border-indigo-200 bg-indigo-50/50",
              )}
            >
              <CardContent className="flex items-start gap-4 py-4">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                    unread ? "bg-indigo-600" : "bg-slate-200",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={cn("text-sm", unread ? "font-semibold text-slate-900" : "font-medium text-slate-700")}>
                      {n.title}
                    </h3>
                    <Badge variant={variant}>{n.type.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                    {n.link ? (
                      <Link
                        href={n.link}
                        className="text-xs font-medium text-indigo-700 hover:text-indigo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                      >
                        View details
                      </Link>
                    ) : null}
                    {unread ? (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        disabled={pendingIds.has(n.id)}
                        className="text-xs font-medium text-indigo-700 hover:text-indigo-800 hover:underline disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                      >
                        {pendingIds.has(n.id) ? "Updating..." : "Mark as read"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
