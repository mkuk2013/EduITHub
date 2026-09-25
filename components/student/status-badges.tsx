import { Badge } from "@/components/ui/badge";
import { EnrollmentStatus, PaymentStatus } from "@prisma/client";

const ENROLLMENT_BADGES: Record<EnrollmentStatus, "success" | "warning" | "danger" | "info" | "default"> = {
  ACTIVE: "success",
  PENDING_PAYMENT: "warning",
  PENDING_VERIFICATION: "info",
  SUSPENDED: "danger",
  CANCELLED: "default",
  EXPIRED: "default",
};

const ENROLLMENT_LABELS: Record<EnrollmentStatus, string> = {
  ACTIVE: "Active",
  PENDING_PAYMENT: "Payment Pending",
  PENDING_VERIFICATION: "Under Verification",
  SUSPENDED: "Suspended",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const PAYMENT_BADGES: Record<PaymentStatus, "success" | "warning" | "danger" | "info" | "default"> = {
  APPROVED: "success",
  PENDING: "warning",
  CORRECTION_REQUESTED: "info",
  REJECTED: "danger",
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  APPROVED: "Approved",
  PENDING: "Under Review",
  CORRECTION_REQUESTED: "Correction Requested",
  REJECTED: "Rejected",
};

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return <Badge variant={ENROLLMENT_BADGES[status]}>{ENROLLMENT_LABELS[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={PAYMENT_BADGES[status]}>{PAYMENT_LABELS[status]}</Badge>;
}
