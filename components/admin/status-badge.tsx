import { Badge } from "@/components/ui/badge";
import type {
  AnnouncementStatus,
  CourseStatus,
  EnrollmentStatus,
  NotificationType,
  PaymentMethod,
  PaymentStatus,
  UserStatus,
} from "@prisma/client";

function variantFor(value: string): "default" | "primary" | "success" | "warning" | "danger" | "info" {
  switch (value) {
    case "APPROVED":
    case "ACTIVE":
    case "PUBLISHED":
    case "SENT":
      return "success";
    case "PENDING":
    case "PENDING_APPROVAL":
    case "PENDING_PAYMENT":
    case "PENDING_VERIFICATION":
    case "CORRECTION_REQUESTED":
    case "DRAFT":
      return "warning";
    case "REJECTED":
    case "SUSPENDED":
    case "CANCELLED":
    case "FAILED":
      return "danger";
    case "EXPIRED":
    case "ARCHIVED":
    case "SKIPPED":
      return "default";
    default:
      return "info";
  }
}

function labelFor(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

interface StatusBadgeProps {
  status:
    | UserStatus
    | CourseStatus
    | EnrollmentStatus
    | PaymentStatus
    | PaymentMethod
    | AnnouncementStatus
    | NotificationType
    | string;
  className?: string;
}

/** Colored badge for any enum-ish status value. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={variantFor(status)} className={className}>
      {labelFor(status)}
    </Badge>
  );
}
