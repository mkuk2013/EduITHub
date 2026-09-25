"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { submitPayment } from "@/server/actions/payments";
import { currentMonthKey } from "@/lib/format";
import type { MyEnrollment } from "@/server/actions/student";

const PAYMENT_METHODS = ["EASYPaisa", "JAZZCASH", "BANK_TRANSFER", "OTHER"] as const;

interface SubmitPaymentFormProps {
  /** Enrollments awaiting fee submission (PENDING_PAYMENT). */
  enrollments: MyEnrollment[];
  /** Enrollment id to preselect (from ?enroll= after a fresh enrollment). */
  preselectedEnrollmentId?: string;
  studentName: string;
  studentPhone: string;
}

/**
 * Fee submission form. Builds a FormData payload matching the payments
 * agent's submitPayment(formData) contract and its paymentSubmissionSchema:
 * courseId, enrollmentId, amount, month, paymentMethod, transactionId,
 * paymentDate, proofImage (optional File).
 */
export function SubmitPaymentForm({
  enrollments,
  preselectedEnrollmentId,
  studentName,
  studentPhone,
}: SubmitPaymentFormProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(
    preselectedEnrollmentId && enrollments.some((e) => e.id === preselectedEnrollmentId)
      ? preselectedEnrollmentId
      : (enrollments[0]?.id ?? ""),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const selected = useMemo(
    () => enrollments.find((e) => e.id === selectedId) ?? null,
    [enrollments, selectedId],
  );

  const monthKey = currentMonthKey();
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setErrors({});

    const form = event.currentTarget;
    const data = new FormData(form);
    const enrollmentId = selectedId;

    if (!enrollmentId || !selected) {
      setErrors({ enrollment: "Please choose the course you are paying for." });
      return;
    }

    const payload = new FormData();
    payload.set("courseId", selected.course.id);
    payload.set("enrollmentId", enrollmentId);
    payload.set("amount", String(data.get("amount") ?? selected.course.monthlyFee));
    payload.set("month", monthKey);
    payload.set("paymentMethod", String(data.get("paymentMethod") ?? ""));
    payload.set("transactionId", String(data.get("transactionId") ?? ""));
    payload.set("paymentDate", String(data.get("paymentDate") ?? today));
    const proof = data.get("proofImage");
    if (proof instanceof File && proof.size > 0) {
      payload.set("proofImage", proof);
    }

    setPending(true);
    try {
      const result = await submitPayment(payload);
      if (result.ok) {
        toast.success("Payment submitted for verification.");
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not submit the payment — please try again.");
      }
    } catch {
      toast.error("Could not submit the payment — please try again.");
    } finally {
      setPending(false);
    }
  }

  if (enrollments.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a Payment</CardTitle>
        <CardDescription>
          Pay the monthly fee to the academy account shown above, then submit the
          details here for verification. Billing month: <strong>{monthKey}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="pay-name">Student name</Label>
            <Input id="pay-name" name="studentName" defaultValue={studentName} disabled aria-describedby="pay-name-note" />
            <p id="pay-name-note" className="mt-1 text-xs text-slate-500">
              This is your registered account name.
            </p>
          </div>
          <div>
            <Label htmlFor="pay-phone">Phone</Label>
            <Input id="pay-phone" name="studentPhone" defaultValue={studentPhone} disabled />
          </div>

          <div>
            <Label htmlFor="pay-enrollment">Course</Label>
            <Select
              id="pay-enrollment"
              name="enrollmentId"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              error={errors.enrollment}
              aria-required="true"
            >
              {enrollments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.course.title} — {new Intl.NumberFormat("en-PK", {
                    style: "currency",
                    currency: "PKR",
                    maximumFractionDigits: 0,
                  }).format(e.course.monthlyFee)}/month
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="pay-method">Payment method</Label>
            <Select id="pay-method" name="paymentMethod" defaultValue="EASYPaisa" required>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m === "EASYPaisa" ? "Easypaisa" : m === "JAZZCASH" ? "JazzCash" : m === "BANK_TRANSFER" ? "Bank Transfer" : "Other"}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="pay-amount">Amount (PKR)</Label>
            <Input
              id="pay-amount"
              name="amount"
              type="number"
              min={1}
              step={1}
              key={selected?.id ?? "amount"}
              defaultValue={selected?.course.monthlyFee ?? ""}
              required
            />
          </div>
          <div>
            <Label htmlFor="pay-txn">Transaction ID / TID</Label>
            <Input
              id="pay-txn"
              name="transactionId"
              placeholder="e.g. 34567890123"
              minLength={4}
              maxLength={100}
              required
            />
          </div>

          <div>
            <Label htmlFor="pay-date">Payment date</Label>
            <Input id="pay-date" name="paymentDate" type="date" defaultValue={today} max={today} required />
          </div>
          <div>
            <Label htmlFor="pay-proof">Payment screenshot (optional)</Label>
            <Input id="pay-proof" name="proofImage" type="file" accept="image/*,.pdf" />
            <p className="mt-1 text-xs text-slate-500">
              A screenshot of the transfer receipt speeds up verification.
            </p>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              <Upload className="h-4 w-4" aria-hidden="true" />
              {pending ? "Submitting..." : "Submit Payment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
