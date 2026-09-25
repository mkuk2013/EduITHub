import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { SearchBar, Pagination } from "@/components/admin/search-pagination";
import { getEmailLogs } from "@/server/actions/admin";
import { formatDateTime, timeAgo } from "@/lib/format";
import { Mail } from "lucide-react";

export const metadata = { title: "Email Logs" };

interface EmailsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function EmailsPage({ searchParams }: EmailsPageProps) {
  const params = await searchParams;
  const result = await getEmailLogs({ search: params.q, page: params.page });

  return (
    <div>
      <PageHeader
        title="Email Logs"
        description="Every outbound email attempt: SENT, FAILED or SKIPPED (when email notifications are disabled)."
      />

      <div className="mb-4">
        <SearchBar placeholder="Search email, subject or type…" />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-6 w-6" aria-hidden="true" />}
          title="No email logs yet"
          description="Email attempts are logged here automatically."
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Recipient</TH>
                <TH>Subject</TH>
                <TH>Type</TH>
                <TH>Status</TH>
                <TH>Error</TH>
                <TH>Sent</TH>
              </TR>
            </THead>
            <TBody>
              {result.items.map((e) => (
                <TR key={e.id}>
                  <TD>
                    <p className="font-medium text-slate-900">{e.email}</p>
                    {e.user?.name ? <p className="text-xs text-slate-500">{e.user.name}</p> : null}
                  </TD>
                  <TD className="max-w-56 truncate" title={e.subject}>
                    {e.subject}
                  </TD>
                  <TD className="whitespace-nowrap text-xs">{e.type}</TD>
                  <TD>
                    <StatusBadge status={e.status} />
                  </TD>
                  <TD className="max-w-56 truncate text-xs text-red-600" title={e.error ?? ""}>
                    {e.error ?? "—"}
                  </TD>
                  <TD className="whitespace-nowrap" title={formatDateTime(e.sentAt)}>
                    {timeAgo(e.sentAt)}
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
