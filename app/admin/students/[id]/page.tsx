import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { StudentActions } from "@/components/admin/student-actions";
import { getStudentDetail } from "@/server/actions/admin";
import { formatDate, formatDateTime, formatPKR, timeAgo } from "@/lib/format";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Student profile" };

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-32 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;
  const student = await getStudentDetail(id);
  if (!student) notFound();

  const profile = student.studentProfile;

  return (
    <div>
      <Link href="/admin/students" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to students
      </Link>
      <PageHeader
        title={student.name}
        description={student.email}
        actions={<StudentActions studentId={student.id} studentName={student.name} status={student.status} />}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-4">
              {profile?.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profileImage} alt={`${student.name}'s profile photo`} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700" aria-hidden="true">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="font-semibold text-slate-900">{student.name}</p>
                <StatusBadge status={student.status} />
              </div>
            </div>
            <dl className="divide-y divide-slate-100">
              <InfoRow label="Email" value={student.email} />
              <InfoRow label="Phone" value={profile?.phone ?? "—"} />
              <InfoRow label="City" value={profile?.city ?? "—"} />
              <InfoRow label="Address" value={profile?.address ?? "—"} />
              <InfoRow label="Registered" value={formatDateTime(student.createdAt)} />
              <InfoRow label="Last updated" value={timeAgo(student.updatedAt)} />
            </dl>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Enrollments ({student.enrollments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {student.enrollments.length === 0 ? (
              <p className="text-sm text-slate-500">No enrollments yet.</p>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Course</TH>
                    <TH>Fee</TH>
                    <TH>Status</TH>
                    <TH>Enrolled</TH>
                    <TH>Expires</TH>
                  </TR>
                </THead>
                <TBody>
                  {student.enrollments.map((e) => (
                    <TR key={e.id}>
                      <TD className="font-medium text-slate-900">{e.course.title}</TD>
                      <TD className="whitespace-nowrap">{formatPKR(e.course.monthlyFee)}</TD>
                      <TD>
                        <StatusBadge status={e.status} />
                      </TD>
                      <TD className="whitespace-nowrap">{formatDate(e.enrolledAt)}</TD>
                      <TD className="whitespace-nowrap">{e.expiresAt ? formatDate(e.expiresAt) : "—"}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {student.payments.length === 0 ? (
              <p className="text-sm text-slate-500">No payments submitted yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {student.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {p.course.title} · {formatPKR(p.amount)} · {p.month}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {p.paymentMethod.replace("_", " ")} · TID {p.transactionId} · {formatDate(p.paymentDate)}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {student.notifications.length === 0 ? (
              <p className="text-sm text-slate-500">No notifications sent yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {student.notifications.map((n) => (
                  <li key={n.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">{n.title}</p>
                      <span className={`shrink-0 text-xs ${n.readAt ? "text-slate-400" : "font-semibold text-indigo-700"}`}>
                        {n.readAt ? "Read" : "Unread"}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
