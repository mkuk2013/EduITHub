import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { SearchBar, FilterSelect, Pagination } from "@/components/admin/search-pagination";
import { MonthFilter } from "@/components/admin/month-filter";
import { getPayments } from "@/server/actions/admin";
import { formatPKR, formatDate } from "@/lib/format";
import { Receipt } from "lucide-react";

export const metadata = { title: "Payments" };

interface PaymentsPageProps {
  searchParams: Promise<{ q?: string; status?: string; method?: string; month?: string; page?: string }>;
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const params = await searchParams;
  const result = await getPayments({
    search: params.q,
    status: params.status,
    method: params.method,
    month: params.month,
    page: params.page,
  });

  return (
    <div>
      <PageHeader title="Payments" description={`${result.total} payment${result.total === 1 ? "" : "s"} on record.`} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar placeholder="Search student, course or transaction ID…" />
        <FilterSelect
          param="status"
          placeholder="Filter by status"
          options={[
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
            { value: "CORRECTION_REQUESTED", label: "Correction requested" },
          ]}
        />
        <FilterSelect
          param="method"
          placeholder="Filter by method"
          allLabel="All methods"
          options={[
            { value: "EASYPaisa", label: "Easypaisa" },
            { value: "JAZZCASH", label: "JazzCash" },
            { value: "BANK_TRANSFER", label: "Bank transfer" },
            { value: "OTHER", label: "Other" },
          ]}
        />
        <MonthFilter />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" aria-hidden="true" />}
          title="No payments found"
          description="Try a different search or filter."
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Student</TH>
                <TH>Course · Month</TH>
                <TH>Amount</TH>
                <TH>Method</TH>
                <TH>Transaction ID</TH>
                <TH>Status</TH>
                <TH>Submitted</TH>
                <TH>Verified by</TH>
              </TR>
            </THead>
            <TBody>
              {(result.items as Array<{
                id: string;
                amount: number;
                month: string;
                paymentMethod: string;
                transactionId: string;
                status: string;
                adminNote: string | null;
                createdAt: Date;
                student: { name: string; email: string };
                course: { title: string };
                verifiedBy?: { name: string } | null;
              }>).map((p) => (
                <TR key={String(p.id)}>
                  <TD>
                    <p className="font-medium text-slate-900">{p.student.name}</p>
                    <p className="text-xs text-slate-500">{p.student.email}</p>
                  </TD>
                  <TD>
                    <p className="text-slate-900">{p.course.title}</p>
                    <p className="text-xs text-slate-500">{p.month}</p>
                  </TD>
                  <TD className="whitespace-nowrap font-medium">{formatPKR(p.amount)}</TD>
                  <TD className="whitespace-nowrap">{String(p.paymentMethod).replace("_", " ")}</TD>
                  <TD className="font-mono text-xs">{p.transactionId}</TD>
                  <TD>
                    <StatusBadge status={String(p.status)} />
                    {p.adminNote ? <p className="mt-1 max-w-40 truncate text-xs text-slate-400" title={p.adminNote}>{p.adminNote}</p> : null}
                  </TD>
                  <TD className="whitespace-nowrap">{formatDate(p.createdAt)}</TD>
                  <TD>{p.verifiedBy?.name ?? "—"}</TD>
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
