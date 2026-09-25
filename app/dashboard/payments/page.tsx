import { requireStudent } from "@/lib/auth";
import { getMyEnrollments, getStudentProfile } from "@/server/actions/student";
import { getMyPayments, getPaymentSettings } from "@/server/actions/payments";
import { EnrollmentStatus, PaymentStatus } from "@prisma/client";
import { formatPKR, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PaymentStatusBadge } from "@/components/student/status-badges";
import { SubmitPaymentForm } from "@/components/student/submit-payment-form";
import { CopyButton } from "@/components/student/copy-button";
import { Landmark, Wallet, Info, History } from "lucide-react";

export const metadata = { title: "Payments" };

interface PaymentsPageProps {
  searchParams: Promise<{ enroll?: string }>;
}

/** Method labels for the enum values returned by getMyPayments. */
function methodLabel(method: string): string {
  switch (method) {
    case "EASYPaisa":
      return "Easypaisa";
    case "JAZZCASH":
      return "JazzCash";
    case "BANK_TRANSFER":
      return "Bank Transfer";
    default:
      return method.replace(/_/g, " ");
  }
}

/**
 * Fee payments: account instructions, submit-payment form, and full
 * payment history for the signed-in student.
 */
export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  await requireStudent();
  const { enroll } = await searchParams;

  const [payments, settings, enrollments, profile] = await Promise.all([
    getMyPayments().catch(() => []),
    getPaymentSettings().catch(() => ({ accountName: "", accountNumber: "", methods: "" })),
    getMyEnrollments(),
    getStudentProfile().catch(() => null),
  ]);

  const pendingEnrollments = enrollments.filter((e) => e.status === EnrollmentStatus.PENDING_PAYMENT);
  const pendingReview = payments.filter((p) => p.status === PaymentStatus.PENDING);
  const preselected = pendingEnrollments.find((e) => e.id === enroll) ?? pendingEnrollments[0] ?? null;

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
  );

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Submit your monthly fee and track every payment you have made."
      />

      {/* Pending review notice */}
      {pendingReview.length > 0 ? (
        <Card className="mb-6 border-amber-200 bg-amber-50" role="status">
          <CardContent className="flex items-start gap-3 py-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-sm text-amber-900">
              Your payment is currently being reviewed. It usually takes up to 24 hours —
              your enrollment will activate automatically once it is approved.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Payment instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-indigo-700" aria-hidden="true" />
            How to Pay
          </CardTitle>
          <CardDescription>
            Transfer the monthly fee to the academy account below, then submit your payment details for verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Account name</dt>
              <dd className="mt-1 flex items-center justify-between gap-2 text-sm font-semibold text-slate-900">
                <span>{settings.accountName || "—"}</span>
                {settings.accountName ? <CopyButton text={settings.accountName} label="Account name" /> : null}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Account number</dt>
              <dd className="mt-1 flex items-center justify-between gap-2 text-sm font-semibold text-slate-900">
                <span className="font-mono">{settings.accountNumber || "—"}</span>
                {settings.accountNumber ? <CopyButton text={settings.accountNumber} label="Account number" /> : null}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Accepted methods</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">{settings.methods || "—"}</dd>
            </div>
          </dl>
          {preselected ? (
            <p className="mt-4 flex items-start gap-2 text-sm text-slate-600">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />
              <span>
                Amount due for <strong>{preselected.course.title}</strong>:{" "}
                <strong className="text-indigo-700">{formatPKR(preselected.course.monthlyFee)}</strong> per month.
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Submit form */}
      {pendingEnrollments.length > 0 && profile ? (
        <div className="mb-6">
          <SubmitPaymentForm
            enrollments={pendingEnrollments}
            preselectedEnrollmentId={preselected?.id}
            studentName={profile.name}
            studentPhone={profile.phone}
          />
        </div>
      ) : null}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-700" aria-hidden="true" />
            Payment History
          </CardTitle>
          <CardDescription>Every fee payment submitted from this account.</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <EmptyState
              title="No payments yet"
              description="Your submitted payments will appear here with their verification status."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Month</TH>
                  <TH>Course</TH>
                  <TH>Amount</TH>
                  <TH>Method</TH>
                  <TH>Transaction ID</TH>
                  <TH>Date</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {sortedPayments.map((payment) => (
                  <TR key={payment.id}>
                    <TD className="font-medium text-slate-900">{payment.month}</TD>
                    <TD>{payment.courseTitle}</TD>
                    <TD className="font-semibold text-slate-900">{formatPKR(payment.amount)}</TD>
                    <TD>{methodLabel(String(payment.paymentMethod))}</TD>
                    <TD className="font-mono text-xs">{payment.transactionId}</TD>
                    <TD>{formatDate(payment.paymentDate)}</TD>
                    <TD>
                      <PaymentStatusBadge status={payment.status as PaymentStatus} />
                      {payment.status === PaymentStatus.CORRECTION_REQUESTED ? (
                        <span className="mt-1 block text-xs text-slate-500">
                          Please resubmit with the requested correction.
                        </span>
                      ) : null}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Fallback note for unknown payment statuses */}
      {sortedPayments.some((p) => !Object.values(PaymentStatus).includes(p.status as PaymentStatus)) ? (
        <p className="mt-3 text-xs text-slate-500">
          <Badge variant="default">Note</Badge> Some older records may show a legacy status label.
        </p>
      ) : null}
    </div>
  );
}
