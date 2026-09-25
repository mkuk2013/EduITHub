import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { getClassScheduleList } from "@/server/actions/admin";
import { formatDate } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { CalendarClock, Video, VideoOff } from "lucide-react";

export const metadata = { title: "Class Schedules" };

const DAY_LABELS: Record<string, string> = {
  Mon: "Mon",
  Tue: "Tue",
  Wed: "Wed",
  Thu: "Thu",
  Fri: "Fri",
  Sat: "Sat",
  Sun: "Sun",
};

export default async function ClassesPage() {
  const courses = await getClassScheduleList();

  return (
    <div>
      <PageHeader
        title="Class Schedules"
        description="Each course has its own Google Meet link and timetable. Changing one course never affects another."
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="h-6 w-6" aria-hidden="true" />}
          title="No courses yet"
          description="Create a course first, then configure its class schedule."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Course</TH>
              <TH>Status</TH>
              <TH>Days</TH>
              <TH>Time</TH>
              <TH>Instructor</TH>
              <TH>Meet link</TH>
              <TH>Updated</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {courses.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium text-slate-900">{c.title}</TD>
                <TD>
                  <StatusBadge status={c.status} />
                </TD>
                <TD className="whitespace-nowrap">
                  {c.schedule ? c.schedule.days.map((d) => DAY_LABELS[d] ?? d).join(", ") : "—"}
                </TD>
                <TD className="whitespace-nowrap">
                  {c.schedule ? `${c.schedule.startTime} – ${c.schedule.endTime}` : "—"}
                </TD>
                <TD>{c.schedule?.instructor?.name ?? "—"}</TD>
                <TD>
                  {c.hasMeetingUrl ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <Video className="h-3.5 w-3.5" aria-hidden="true" /> Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <VideoOff className="h-3.5 w-3.5" aria-hidden="true" /> Not set
                    </span>
                  )}
                </TD>
                <TD className="whitespace-nowrap">{c.schedule ? formatDate(c.schedule.updatedAt) : "—"}</TD>
                <TD>
                  <Link href={`${ROUTES.adminClasses}/${c.id}`}>
                    <Button size="sm" variant="outline">
                      {c.schedule ? "Edit" : "Configure"}
                    </Button>
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
