import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Users,
  FileText,
  Video,
  Link as LinkIcon,
  FileCheck,
  StickyNote,
  ChevronDown,
} from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { getMyEnrollments, type MyEnrollment } from "@/server/actions/student";
import { ROUTES } from "@/lib/constants";
import { formatPKR, formatDate, currentMonthKey } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  EnrollmentStatusBadge,
  PaymentStatusBadge,
} from "@/components/student/status-badges";
import { JoinMeetButton } from "@/components/student/join-meet-button";
import { CourseOriginalBanner } from "@/components/site/CourseOriginalBanner";

export const metadata = { title: "My Courses" };

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function sortDays(days: string[]): string[] {
  return [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
}

const MATERIAL_ICONS = {
  PDF: FileText,
  VIDEO: Video,
  DOCUMENT: FileText,
  LINK: LinkIcon,
  ASSIGNMENT: FileCheck,
  NOTE: StickyNote,
} as const;

/** Resolves a stored material URL to a public link. */
function materialHref(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  return `/uploads/${url}`;
}

function EnrollmentCard({ enrollment }: { enrollment: MyEnrollment }) {
  const { course } = enrollment;
  const isActive = enrollment.status === "ACTIVE";
  const monthKey = currentMonthKey();

  return (
    <Card className="overflow-hidden">
      {/* Course header */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-slate-950 sm:w-44">
          {course.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
          ) : (
            <CourseOriginalBanner slug={course.slug} title={course.title} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">{course.title}</h2>
            <EnrollmentStatusBadge status={enrollment.status} />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{course.shortDescription}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-slate-500">Monthly fee</dt>
              <dd className="font-semibold text-slate-900">{formatPKR(course.monthlyFee)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Duration</dt>
              <dd className="font-medium text-slate-900">{course.duration}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Enrolled</dt>
              <dd className="font-medium text-slate-900">{formatDate(enrollment.enrolledAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">
                {monthKey} fee status
              </dt>
              <dd className="mt-0.5">
                {enrollment.currentMonthPayment ? (
                  <PaymentStatusBadge status={enrollment.currentMonthPayment.status} />
                ) : (
                  <Badge variant="default">Not submitted</Badge>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <CardContent className="border-t border-slate-100 pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Class schedule */}
          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CalendarDays className="h-4 w-4 text-indigo-700" aria-hidden="true" />
              Class Schedule
            </h3>
            {course.schedule ? (
              <div className="mt-2 text-sm text-slate-600">
                <p className="font-medium text-slate-900">
                  {sortDays(course.schedule.days).join(", ")}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {course.schedule.startTime} – {course.schedule.endTime} ({course.schedule.timezone})
                </p>
                {course.schedule.instructions ? (
                  <p className="mt-2 text-xs text-slate-500">{course.schedule.instructions}</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">The schedule will be announced soon.</p>
            )}
          </div>

          {/* Instructors */}
          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Users className="h-4 w-4 text-indigo-700" aria-hidden="true" />
              Instructors
            </h3>
            {course.instructors.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-1">
                {course.instructors.map((instructor) => (
                  <li key={instructor.id} className="text-sm text-slate-600">
                    {instructor.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">To be announced.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {isActive ? (
            <JoinMeetButton courseId={course.id} courseTitle={course.title} />
          ) : enrollment.status === "PENDING_PAYMENT" ? (
            <Link href={`${ROUTES.dashboardPayments}?enroll=${enrollment.id}`}>
              <Button type="button">Submit Fee Payment</Button>
            </Link>
          ) : enrollment.status === "PENDING_VERIFICATION" ? (
            <p className="text-sm text-slate-500">
              Your payment is currently being reviewed. You will get class access once it is approved.
            </p>
          ) : null}
        </div>

        {/* Syllabus */}
        {course.modules.length > 0 ? (
          <details className="group mt-4 rounded-lg border border-slate-200">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 [&::-webkit-details-marker]:hidden">
              <span>Syllabus ({course.modules.length} modules)</span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <ol className="border-t border-slate-100 px-4 py-3">
              {course.modules.map((module, index) => (
                <li key={module.id} className="py-2 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-slate-100">
                  <p className="text-sm font-medium text-slate-900">
                    <span className="mr-2 text-xs font-semibold text-indigo-700">{String(index + 1).padStart(2, "0")}</span>
                    {module.title}
                  </p>
                  {module.description ? (
                    <p className="mt-0.5 pl-8 text-xs text-slate-500">{module.description}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </details>
        ) : null}

        {/* Course materials — ACTIVE enrollments only */}
        {isActive ? (
          <details className="group mt-3 rounded-lg border border-slate-200" open>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 [&::-webkit-details-marker]:hidden">
              <span>Course Materials</span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-slate-100 px-4 py-3">
              {course.modules.every((m) => m.materials.length === 0) ? (
                <p className="text-sm text-slate-500">Materials will be uploaded by your instructor.</p>
              ) : (
                course.modules.map((module) =>
                  module.materials.length > 0 ? (
                    <div key={module.id} className="py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {module.title}
                      </p>
                      <ul className="mt-1 flex flex-col gap-1">
                        {module.materials.map((material) => {
                          const Icon = MATERIAL_ICONS[material.type as keyof typeof MATERIAL_ICONS] ?? FileText;
                          return (
                            <li key={material.id}>
                              <a
                                href={materialHref(material.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                              >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                                {material.title}
                                <Badge variant="default" className="ml-1">
                                  {material.type}
                                </Badge>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null,
                )
              )}
            </div>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** Every course this student has an enrollment in. */
export default async function MyCoursesPage() {
  await requireStudent();
  const enrollments = await getMyEnrollments();

  return (
    <div>
      <PageHeader
        title="My Courses"
        description="Your enrollments, class schedules, syllabus and learning materials."
      />

      {enrollments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" aria-hidden="true" />}
          title="No enrollments yet"
          description="Browse the available courses and enroll to start learning."
          action={
            <Link href="/dashboard/courses">
              <Button type="button">Browse Courses</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {enrollments.map((enrollment) => (
            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
}
