"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { setEnrollmentStatus } from "@/server/actions/admin";
import type { EnrollmentStatus } from "@prisma/client";

const STATUSES: EnrollmentStatus[] = ["PENDING_PAYMENT", "PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "CANCELLED", "EXPIRED"];

interface EnrollmentStatusControlProps {
  enrollmentId: string;
  studentName: string;
  status: EnrollmentStatus;
}

export function EnrollmentStatusControl({ enrollmentId, studentName, status }: EnrollmentStatusControlProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onChange(next: EnrollmentStatus) {
    if (next === status) return;
    setBusy(true);
    try {
      const result = await setEnrollmentStatus(enrollmentId, next);
      if (result.ok) {
        toast.success("Enrollment status updated");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not update status");
      }
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Select
      aria-label={`Change enrollment status for ${studentName}`}
      value={status}
      disabled={busy}
      onChange={(e) => onChange(e.target.value as EnrollmentStatus)}
      className="!h-8 !w-auto text-xs"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.split("_").map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join(" ")}
        </option>
      ))}
    </Select>
  );
}
