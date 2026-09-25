import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Trivial redirect: the ROUTES.adminSchedules constant ("/admin/schedules")
 * exists but the canonical page is /admin/classes. Keep the old path working.
 */
export default function AdminSchedulesRedirect() {
  redirect(ROUTES.adminClasses);
}
