import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { StudentActions } from "@/components/admin/student-actions";
import { getPendingStudents } from "@/server/actions/admin";
import { formatDate, timeAgo } from "@/lib/format";
import { UserCheck } from "lucide-react";

export const metadata = { title: "Student Approvals" };

export default async function ApprovalsPage() {
  const students = await getPendingStudents();

  return (
    <div>
      <PageHeader
        title="Student Approvals"
        description={`${students.length} application${students.length === 1 ? "" : "s"} awaiting review. Approving notifies the student by notification and email.`}
      />

      {students.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="h-6 w-6" aria-hidden="true" />}
          title="All caught up"
          description="There are no pending student applications right now."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {students.map((s) => (
            <li key={s.id}>
              <Card className="flex h-full flex-col">
                <CardContent className="flex flex-1 flex-col gap-3 pt-5">
                  <div className="flex items-center gap-3">
                    {s.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.profileImage} alt={`${s.name}'s profile photo`} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-700" aria-hidden="true">
                        {s.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{s.name}</p>
                      <p className="truncate text-xs text-slate-500">{s.email}</p>
                    </div>
                  </div>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Phone</dt>
                      <dd className="font-medium text-slate-900">{s.phone ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">City</dt>
                      <dd className="font-medium text-slate-900">{s.city ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Registered</dt>
                      <dd className="font-medium text-slate-900" title={formatDate(s.createdAt)}>
                        {timeAgo(s.createdAt)}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-auto pt-2">
                    <StudentActions studentId={s.id} studentName={s.name} status={s.status} />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
