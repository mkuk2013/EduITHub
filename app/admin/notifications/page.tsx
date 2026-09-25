import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { SearchBar, Pagination } from "@/components/admin/search-pagination";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { getRecentNotifications, getCourses } from "@/server/actions/admin";
import { timeAgo } from "@/lib/format";
import { Bell } from "lucide-react";

export const metadata = { title: "Notifications" };

interface NotificationsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const params = await searchParams;
  const [result, courses] = await Promise.all([
    getRecentNotifications({ search: params.q, page: params.page }),
    getCourses({ pageSize: 100 }),
  ]);

  return (
    <div>
      <PageHeader title="Notifications" description="Send broadcasts and review recently sent notifications." />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <BroadcastForm courses={courses.items.map((c) => ({ id: c.id, title: c.title }))} />
        </div>
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Recently sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <SearchBar placeholder="Search by title or recipient…" />
              </div>
              {result.items.length === 0 ? (
                <EmptyState
                  icon={<Bell className="h-6 w-6" aria-hidden="true" />}
                  title="No notifications yet"
                  description="Notifications sent to students will appear here."
                />
              ) : (
                <>
                  <ul className="divide-y divide-slate-100">
                    {result.items.map((n) => (
                      <li key={n.id} className="py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900">{n.title}</p>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={n.type} />
                            <span className="text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                          </div>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{n.message}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          To {n.user.name} ({n.user.email}) · {n.readAt ? "Read" : "Unread"}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <Pagination page={result.page} totalPages={result.totalPages} total={result.total} />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
