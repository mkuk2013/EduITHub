import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { SearchBar, FilterSelect, Pagination } from "@/components/admin/search-pagination";
import { getStudents } from "@/server/actions/admin";
import { formatDate } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { Users } from "lucide-react";

export const metadata = { title: "Students" };

interface StudentsPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const params = await searchParams;
  const result = await getStudents({ search: params.q, status: params.status, page: params.page });

  return (
    <div>
      <PageHeader title="Students" description={`${result.total} registered student${result.total === 1 ? "" : "s"}.`} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar placeholder="Search name, email or phone…" />
        <FilterSelect
          param="status"
          placeholder="Filter by status"
          options={[
            { value: "PENDING_APPROVAL", label: "Pending approval" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
            { value: "SUSPENDED", label: "Suspended" },
          ]}
        />
      </div>

      {result.items.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" aria-hidden="true" />} title="No students found" description="Try a different search or filter." />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Student</TH>
                <TH>Phone</TH>
                <TH>City</TH>
                <TH>Status</TH>
                <TH>Enrollments</TH>
                <TH>Registered</TH>
              </TR>
            </THead>
            <TBody>
              {result.items.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      {s.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.profileImage} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700" aria-hidden="true">
                          {s.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <Link href={`${ROUTES.adminStudents}/${s.id}`} className="font-medium text-indigo-700 hover:underline">
                          {s.name}
                        </Link>
                        <p className="truncate text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD className="whitespace-nowrap">{s.phone ?? "—"}</TD>
                  <TD>{s.city ?? "—"}</TD>
                  <TD>
                    <StatusBadge status={s.status} />
                  </TD>
                  <TD>{s.enrollmentsCount}</TD>
                  <TD className="whitespace-nowrap">{formatDate(s.createdAt)}</TD>
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
