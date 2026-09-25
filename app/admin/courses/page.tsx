import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { SearchBar, FilterSelect, Pagination } from "@/components/admin/search-pagination";
import { CourseRowActions } from "@/components/admin/course-row-actions";
import { getCourses } from "@/server/actions/admin";
import { formatPKR, formatDate } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { GraduationCap, Plus, Video } from "lucide-react";

export const metadata = { title: "Courses" };

interface CoursesPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const result = await getCourses({ search: params.q, status: params.status, page: params.page });

  return (
    <div>
      <PageHeader
        title="Courses"
        description={`${result.total} course${result.total === 1 ? "" : "s"} in the catalog.`}
        actions={
          <Link href={`${ROUTES.adminCourses}/new`}>
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" /> New course
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar placeholder="Search title or slug…" />
        <FilterSelect
          param="status"
          placeholder="Filter by status"
          options={[
            { value: "PUBLISHED", label: "Published" },
            { value: "DRAFT", label: "Draft" },
            { value: "ARCHIVED", label: "Archived" },
          ]}
        />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-6 w-6" aria-hidden="true" />}
          title="No courses found"
          description="Create your first course to get started."
          action={
            <Link href={`${ROUTES.adminCourses}/new`}>
              <Button>
                <Plus className="h-4 w-4" aria-hidden="true" /> New course
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Course</TH>
                <TH>Fee / month</TH>
                <TH>Status</TH>
                <TH>Meet link</TH>
                <TH>Enrollments</TH>
                <TH>Updated</TH>
                <TH>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {result.items.map((c) => (
                <TR key={c.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      {c.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.thumbnail} alt="" className="h-10 w-14 rounded object-cover" />
                      ) : (
                        <span className="flex h-10 w-14 items-center justify-center rounded bg-slate-100 text-slate-400" aria-hidden="true">
                          <GraduationCap className="h-5 w-5" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{c.title}</p>
                        <p className="truncate text-xs text-slate-500">/{c.slug} · {c.duration} · {c.mode}</p>
                      </div>
                    </div>
                  </TD>
                  <TD className="whitespace-nowrap">{formatPKR(c.monthlyFee)}</TD>
                  <TD>
                    <StatusBadge status={c.status} />
                  </TD>
                  <TD>
                    {c.hasMeetingUrl ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <Video className="h-3.5 w-3.5" aria-hidden="true" /> Set
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Not set</span>
                    )}
                  </TD>
                  <TD>{c._count.enrollments}</TD>
                  <TD className="whitespace-nowrap">{formatDate(c.updatedAt)}</TD>
                  <TD>
                    <CourseRowActions courseId={c.id} courseTitle={c.title} status={c.status} enrollmentCount={c._count.enrollments} />
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
