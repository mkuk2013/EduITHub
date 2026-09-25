import { requireAdmin } from "@/lib/auth";
import { getPendingCounts } from "@/server/actions/admin";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin",
};

/**
 * Admin area guard: only signed-in APPROVED admins may enter.
 * `requireAdmin()` throws/redirects otherwise — never check role inline.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const counts = await getPendingCounts();

  return (
    <AdminShell
      userName={admin.name}
      userEmail={admin.email}
      pendingStudents={counts.pendingStudents}
      pendingPayments={counts.pendingPayments}
    >
      {children}
    </AdminShell>
  );
}
