import { requireStudent } from "@/lib/auth";
import { getMyNotifications } from "@/server/actions/notifications";
import { PageHeader } from "@/components/ui/page-header";
import { NotificationsList } from "@/components/student/notifications-list";

export const metadata = { title: "Notifications" };

/** Notification inbox for the signed-in student. */
export default async function NotificationsPage() {
  await requireStudent();
  const { notifications } = await getMyNotifications().catch(() => ({
    notifications: [],
    unreadCount: 0,
  }));

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Updates about your enrollments, payments and classes."
      />
      <NotificationsList
        notifications={notifications.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          link: n.link ?? null,
          readAt: n.readAt,
          createdAt: n.createdAt,
        }))}
      />
    </div>
  );
}
