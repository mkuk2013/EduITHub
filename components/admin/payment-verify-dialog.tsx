"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { verifyPaymentAdmin, type PendingPaymentItem } from "@/server/actions/admin";
import { formatPKR, formatDateTime } from "@/lib/format";

interface PaymentVerifyDialogProps {
  payment: PendingPaymentItem;
  triggerLabel: string;
}

type Decision = "APPROVED" | "REJECTED" | "CORRECTION_REQUESTED";

export function PaymentVerifyDialog({ payment, triggerLabel }: PaymentVerifyDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<Decision | null>(null);

  async function decide(decision: Decision) {
    setBusy(decision);
    try {
      const result = await verifyPaymentAdmin(payment.id, decision, note.trim() || undefined);
      if (result.ok) {
        toast.success(
          decision === "APPROVED"
            ? "Payment approved"
            : decision === "REJECTED"
              ? "Payment rejected"
              : "Correction requested",
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Verification failed — please try again");
      }
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setBusy(null);
    }
  }

  const proofUrl = payment.proofImage
    ? payment.proofImage.startsWith("/uploads/")
      ? payment.proofImage
      : `/uploads/${payment.proofImage}`
    : null;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Verify payment"
        description={`${payment.studentName} · ${payment.courseTitle} · ${payment.month}`}
        className="max-w-2xl"
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><dt className="text-xs text-slate-500">Amount</dt><dd className="font-semibold">{formatPKR(payment.amount)}</dd></div>
          <div><dt className="text-xs text-slate-500">Method</dt><dd>{payment.paymentMethod.replace("_", " ")}</dd></div>
          <div><dt className="text-xs text-slate-500">Transaction ID</dt><dd className="font-mono text-xs">{payment.transactionId}</dd></div>
          <div><dt className="text-xs text-slate-500">Payment date</dt><dd>{formatDateTime(payment.paymentDate)}</dd></div>
          <div><dt className="text-xs text-slate-500">Student</dt><dd>{payment.studentName} ({payment.studentEmail})</dd></div>
          <div><dt className="text-xs text-slate-500">Submitted</dt><dd>{formatDateTime(payment.submittedAt)}</dd></div>
        </dl>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Payment proof</p>
          {proofUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proofUrl}
              alt={`Payment proof from ${payment.studentName}`}
              className="max-h-80 w-full rounded-lg border border-slate-200 object-contain bg-slate-50"
            />
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No proof image was uploaded for this payment.
            </p>
          )}
        </div>

        <div className="mt-4">
          <Label htmlFor={`note-${payment.id}`}>Admin note (shared with the student on reject / correction)</Label>
          <Textarea
            id={`note-${payment.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="e.g. Transaction ID does not match our records…"
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy !== null}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => decide("REJECTED")} disabled={busy !== null}>
            {busy === "REJECTED" ? "Working…" : "Reject"}
          </Button>
          <Button variant="secondary" onClick={() => decide("CORRECTION_REQUESTED")} disabled={busy !== null}>
            {busy === "CORRECTION_REQUESTED" ? "Working…" : "Request correction"}
          </Button>
          <Button onClick={() => decide("APPROVED")} disabled={busy !== null}>
            {busy === "APPROVED" ? "Working…" : "Approve"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
