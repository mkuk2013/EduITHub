import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { ProfileForms } from "@/components/admin/profile-forms";
import { getAdminProfile } from "@/server/actions/admin";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Admin Profile" };

export default async function AdminProfilePage() {
  const admin = await getAdminProfile();
  if (!admin) notFound();

  return (
    <div>
      <PageHeader title="Admin Profile" description="Manage your own account details and password." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{admin.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{admin.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</dt>
              <dd className="mt-1"><StatusBadge status={admin.role} /></dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
              <dd className="mt-1"><StatusBadge status={admin.status} /></dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Member since</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDateTime(admin.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <ProfileForms initialName={admin.name} />
    </div>
  );
}
