import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ClassScheduleForm } from "@/components/admin/class-schedule-form";
import { getClassSchedule, getInstructors } from "@/server/actions/admin";
import { ROUTES } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Edit class schedule" };

interface ClassSchedulePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function ClassSchedulePage({ params }: ClassSchedulePageProps) {
  const { courseId } = await params;
  const [course, instructors] = await Promise.all([getClassSchedule(courseId), getInstructors()]);
  if (!course) notFound();

  const initial = course.schedule
    ? {
        meetingUrl: course.schedule.meetingUrl ?? "",
        days: course.schedule.days,
        startTime: course.schedule.startTime,
        endTime: course.schedule.endTime,
        timezone: course.schedule.timezone,
        instructorId: course.schedule.instructorId,
        instructions: course.schedule.instructions ?? "",
      }
    : null;

  return (
    <div>
      <Link href={ROUTES.adminClasses} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to classes
      </Link>
      <PageHeader title={`Class schedule`} description={`Configure live-class timing and the Google Meet link for “${course.title}”.`} />
      <ClassScheduleForm courseId={course.id} courseTitle={course.title} instructors={instructors} initial={initial} />
    </div>
  );
}
