import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { SearchBar, FilterSelect, Pagination } from "@/components/admin/search-pagination";
import { EnrollmentStatusControl } from "@/components/admin/enrollment-status-control";
import { getEnrollments, getCourses } from "@/server/actions/admin";
import { formatDate } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { ClipboardList } from "lucide-react";

export const metadata = { title: "Enrollments" };

interface EnrollmentsPageProps {
  searchParams: Promise<{ q?: string; status?: string; courseId?: string; page?: string }>;
}

export default async function EnrollmentsPage({ searchParams }: EnrollmentsPageProps) {
  const params = await searchParams;
  const [result, courses] = await Promise.all([
    getEnrollments({ search: params.q, status: params.status, courseId: params.courseId, page: params.page }),
    getCourses({ pageSize: 100 }),
  ]);

  return (
    <div>
      <PageHeader title="Enrollments" description={`${result.total} enrollment${result.total === 1 ? "" : "s"}.`} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar placeholder="Search student or course…" />
        <FilterSelect
          param="status"
          placeholder="Filter by status"
          options={[
            { value: "ACTIVE", label: "Active" },
            { value: "PENDING_PAYMENT", label: "Pending payment" },
            { value: "PENDING_VERIFICATION", label: "Pending verification" },
            { value: "SUSPENDED", label: "Suspended" },
            { value: "CANCELLED", label: "Cancelled" },
            { value: "EXPIRED", label: "Expired" },
          ]}
        />
        <FilterSelect
          param="courseId"
          placeholder="Filter by course"
          allLabel="All courses"
          options={courses.items.map((c) => ({ value: c.id, label: c.title }))}
        />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" aria-hidden="true" />}
          title="No enrollments found"
          description="Try a different search or filter."
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Student</TH>
                <TH>Course</TH>
                <TH>Status</TH>
                <TH>Enrolled</TH>
                <TH>Expires</TH>
                <TH>Change status</TH>
              </TR>
            </THead>
            <TBody>
              {result.items.map((e) => (
                <TR key={e.id}>
                  <TD>
                    <Link href={`${ROUTES.adminStudents}/${e.student.id}`} className="font-medium text-indigo-700 hover:underline">
                      {e.student.name}
                    </Link>
                    <p className="text-xs text-slate-500">{e.student.email}</p>
                  </TD>
                  <TD>{e.course.title}</TD>
                  <TD>
                    <StatusBadge status={e.status} />
                  </TD>
                  <TD className="whitespace-nowrap">{formatDate(e.enrolledAt)}</TD>
                  <TD className="whitespace-nowrap">{e.expiresAt ? formatDate(e.expiresAt) : "—"}</TD>
                  <TD>
                    <EnrollmentStatusControl enrollmentId={e.id} studentName={e.student.name} status={e.status} />
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
