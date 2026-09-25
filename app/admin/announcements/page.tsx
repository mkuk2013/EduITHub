import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { SearchBar, FilterSelect, Pagination } from "@/components/admin/search-pagination";
import { AnnouncementFormDialog } from "@/components/admin/announcement-form-dialog";
import { AnnouncementRowActions } from "@/components/admin/announcement-row-actions";
import { getAnnouncements, getCourses } from "@/server/actions/admin";
import { formatDate, timeAgo } from "@/lib/format";
import { Megaphone } from "lucide-react";

export const metadata = { title: "Announcements" };

interface AnnouncementsPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AnnouncementsPage({ searchParams }: AnnouncementsPageProps) {
  const params = await searchParams;
  const [result, courses] = await Promise.all([
    getAnnouncements({ search: params.q, status: params.status, page: params.page }),
    getCourses({ pageSize: 100 }),
  ]);

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Draft, publish and archive announcements for all students or a single course."
        actions={<AnnouncementFormDialog courses={courses.items.map((c) => ({ id: c.id, title: c.title }))} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar placeholder="Search announcements…" />
        <FilterSelect
          param="status"
          placeholder="Filter by status"
          options={[
            { value: "DRAFT", label: "Draft" },
            { value: "PUBLISHED", label: "Published" },
            { value: "ARCHIVED", label: "Archived" },
          ]}
        />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-6 w-6" aria-hidden="true" />}
          title="No announcements found"
          description="Create your first announcement to keep students informed."
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Title</TH>
                <TH>Target</TH>
                <TH>Status</TH>
                <TH>Published</TH>
                <TH>Created</TH>
                <TH>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {result.items.map((a) => (
                <TR key={a.id}>
                  <TD>
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500">by {a.createdBy.name}</p>
                  </TD>
                  <TD>{a.course ? a.course.title : "All students"}</TD>
                  <TD>
                    <StatusBadge status={a.status} />
                  </TD>
                  <TD className="whitespace-nowrap">{a.publishedAt ? formatDate(a.publishedAt) : "—"}</TD>
                  <TD className="whitespace-nowrap" title={formatDate(a.createdAt)}>
                    {timeAgo(a.createdAt)}
                  </TD>
                  <TD>
                    <div className="flex flex-wrap items-center gap-2">
                      <AnnouncementFormDialog
                        courses={courses.items.map((c) => ({ id: c.id, title: c.title }))}
                        announcementId={a.id}
                      />
                      <AnnouncementRowActions announcementId={a.id} title={a.title} status={a.status} />
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          <Pagination page={result.page} totalPages={result.totalPages} total={result.total} />
        </>
      )}
    </div>
  );
}
