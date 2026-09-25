import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { SearchBar, Pagination } from "@/components/admin/search-pagination";
import { getAuditLogs } from "@/server/actions/admin";
import { formatDateTime, timeAgo } from "@/lib/format";
import { ScrollText } from "lucide-react";

export const metadata = { title: "Audit Logs" };

interface AuditLogsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

function formatAction(action: string): string {
  return action.replace(/\./g, " · ").replace(/_/g, " ");
}

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
  const params = await searchParams;
  const result = await getAuditLogs({ search: params.q, page: params.page });

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Immutable trail of every admin mutation: who did what, to which record, and when."
      />

      <div className="mb-4">
        <SearchBar placeholder="Search action, entity or admin email…" />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-6 w-6" aria-hidden="true" />}
          title="No audit entries yet"
          description="Admin actions are recorded here automatically."
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Action</TH>
                <TH>Entity</TH>
                <TH>Admin</TH>
                <TH>Details</TH>
                <TH>When</TH>
              </TR>
            </THead>
            <TBody>
              {result.items.map((a) => (
                <TR key={a.id}>
                  <TD className="whitespace-nowrap font-medium text-slate-900">{formatAction(a.action)}</TD>
                  <TD className="whitespace-nowrap">
                    {a.entity}
                    <span className="block font-mono text-[11px] text-slate-400">{a.entityId.slice(0, 12)}…</span>
                  </TD>
                  <TD>
                    <p className="text-slate-900">{a.admin.name}</p>
                    <p className="text-xs text-slate-500">{a.admin.email}</p>
                  </TD>
                  <TD className="max-w-64">
                    <details className="text-xs text-slate-500">
                      <summary className="cursor-pointer text-indigo-700 hover:underline">View metadata</summary>
                      <pre className="mt-1 max-h-32 overflow-auto rounded bg-slate-50 p-2 text-[11px]">
                        {JSON.stringify(a.metadata ?? {}, null, 2)}
                      </pre>
                    </details>
                  </TD>
                  <TD className="whitespace-nowrap" title={formatDateTime(a.createdAt)}>
                    {timeAgo(a.createdAt)}
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
