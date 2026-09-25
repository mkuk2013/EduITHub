import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentVerifyDialog } from "@/components/admin/payment-verify-dialog";
import { getPendingPayments } from "@/server/actions/admin";
import { formatPKR, formatDate, timeAgo } from "@/lib/format";
import { BadgeCheck } from "lucide-react";

export const metadata = { title: "Payment Verification" };

export default async function VerificationPage() {
  const payments = await getPendingPayments();

  return (
    <div>
      <PageHeader
        title="Payment Verification"
        description={`${payments.length} payment${payments.length === 1 ? "" : "s"} awaiting verification. Review the proof screenshot, then approve, reject, or request a correction — the student is notified each time.`}
      />

      {payments.length === 0 ? (
        <EmptyState
          icon={<BadgeCheck className="h-6 w-6" aria-hidden="true" />}
          title="Queue is empty"
          description="All submitted payments have been verified."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {payments.map((p) => {
            const proofUrl = p.proofImage
              ? p.proofImage.startsWith("/uploads/")
                ? p.proofImage
                : `/uploads/${p.proofImage}`
              : null;
            return (
              <li key={p.id}>
                <Card className="flex h-full flex-col overflow-hidden">
                  {proofUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proofUrl} alt={`Payment proof from ${p.studentName}`} className="h-44 w-full object-cover bg-slate-100" />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-slate-100 text-xs text-slate-400">
                      No proof image
                    </div>
                  )}
                  <CardContent className="flex flex-1 flex-col gap-2 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{p.studentName}</p>
                        <p className="truncate text-xs text-slate-500">{p.courseTitle} · {p.month}</p>
                      </div>
                      <p className="shrink-0 font-bold text-slate-900">{formatPKR(p.amount)}</p>
                    </div>
                    <dl className="space-y-1 text-xs text-slate-500">
                      <div className="flex justify-between gap-2">
                        <dt>Method</dt>
                        <dd className="text-slate-700">{p.paymentMethod.replace("_", " ")}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>Transaction ID</dt>
                        <dd className="font-mono text-slate-700">{p.transactionId}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>Paid on</dt>
                        <dd className="text-slate-700">{formatDate(p.paymentDate)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>Submitted</dt>
                        <dd className="text-slate-700" title={formatDate(p.submittedAt)}>{timeAgo(p.submittedAt)}</dd>
                      </div>
                    </dl>
                    <div className="mt-auto pt-3">
                      <PaymentVerifyDialog payment={p} triggerLabel="Review & verify" />
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
