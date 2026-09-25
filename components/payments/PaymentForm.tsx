"use client";

/**
 * Payment submission form. Calls the submitPayment server action.
 * Presentational — the parent page passes the student's enrollments.
 */

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, ReceiptText, Upload } from "lucide-react";
import { submitPayment } from "@/server/actions/payments";
import { formatPKR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export interface PaymentFormEnrollment {
  id: string;
  courseTitle: string;
  monthlyFee: number;
  status: string;
}

interface PaymentFormProps {
  enrollments: PaymentFormEnrollment[];
}

const PAYMENT_METHODS = [
  { value: "EASYPaisa", label: "Easypaisa" },
  { value: "JAZZCASH", label: "JazzCash" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "OTHER", label: "Other" },
] as const;

export function PaymentForm({ enrollments }: PaymentFormProps) {
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState(enrollments[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const selected = enrollments.find((e) => e.id === selectedId);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await submitPayment(formData);
      if (result.ok) {
        toast.success("Payment submitted for verification");
        form.reset();
      } else {
        setError(result.error ?? "Could not submit the payment");
        toast.error(result.error ?? "Could not submit the payment");
      }
    });
  }

  if (enrollments.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-600">
          You have no enrollments that can accept a payment right now.
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <ReceiptText className="h-5 w-5 text-indigo-700" />
        <h3 className="text-base font-semibold text-slate-900">Submit a payment</h3>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <Label htmlFor="enrollmentId">Enrollment</Label>
          <Select
            id="enrollmentId"
            name="enrollmentId"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            required
          >
            {enrollments.map((e) => (
              <option key={e.id} value={e.id}>
                {e.courseTitle} — {formatPKR(e.monthlyFee)}/month
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="amount">Amount (PKR)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min={1}
              step={1}
              defaultValue={selected?.monthlyFee}
              key={selected?.id}
              required
            />
          </div>
          <div>
            <Label htmlFor="paymentMethod">Payment method</Label>
            <Select id="paymentMethod" name="paymentMethod" defaultValue="EASYPaisa" required>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="transactionId">Transaction / TID number</Label>
            <Input
              id="transactionId"
              name="transactionId"
              type="text"
              minLength={4}
              maxLength={100}
              placeholder="e.g. 3112345678901"
              required
            />
          </div>
          <div>
            <Label htmlFor="paymentDate">Payment date</Label>
            <Input id="paymentDate" name="paymentDate" type="date" defaultValue={today} required />
          </div>
        </div>

        <div>
          <Label htmlFor="proofImage">Receipt screenshot (optional)</Label>
          <div className="mt-1 flex items-center gap-3">
            <Input
              id="proofImage"
              name="proofImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700"
            />
            <Upload className="h-4 w-4 shrink-0 text-slate-400" />
          </div>
          <p className="mt-1 text-xs text-slate-500">JPG, PNG or WebP, up to 5 MB.</p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit for verification
        </Button>
      </div>
    </form>
  );
}
