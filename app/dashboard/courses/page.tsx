import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseStatus } from "@prisma/client";
import { formatPKR } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { EnrollButton } from "@/components/student/enroll-button";
import { BookOpen, Clock, Globe } from "lucide-react";
import { CourseOriginalBanner } from "@/components/site/CourseOriginalBanner";

export const metadata = { title: "Available Courses" };

/** Published courses the signed-in student has not enrolled in yet. */
export default async function AvailableCoursesPage() {
  const user = await requireStudent();

  const enrolled = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    select: { courseId: true },
  });
  const enrolledIds = enrolled.map((e) => e.courseId);

  const courses = await prisma.course.findMany({
    where: {
      status: CourseStatus.PUBLISHED,
      id: { notIn: enrolledIds },
    },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      thumbnail: true,
      monthlyFee: true,
      duration: true,
      mode: true,
      instructors: {
        select: { instructor: { select: { name: true } } },
      },
      _count: { select: { modules: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Available Courses"
        description="Browse published courses and enroll to start learning. Your enrollment activates once the first fee payment is verified."
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" aria-hidden="true" />}
          title="No new courses available"
          description="You are already enrolled in every published course. Check My Courses to continue learning."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden">
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                ) : (
                  <CourseOriginalBanner slug={course.slug} title={course.title} />
                )}
              </div>
              <CardContent className="flex flex-1 flex-col gap-3 py-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{course.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{course.shortDescription}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {course.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" aria-hidden="true" /> {course.mode}
                  </span>
                  <Badge variant="info">{course._count.modules} modules</Badge>
                </div>
                {course.instructors.length > 0 ? (
                  <p className="text-xs text-slate-500">
                    Instructor{course.instructors.length === 1 ? "" : "s"}:{" "}
                    {course.instructors.map((i) => i.instructor.name).join(", ")}
                  </p>
                ) : null}
                <p className="mt-auto pt-1 text-lg font-bold text-indigo-700">
                  {formatPKR(course.monthlyFee)}
                  <span className="text-xs font-normal text-slate-500"> /month</span>
                </p>
              </CardContent>
              <CardFooter>
                <EnrollButton courseId={course.id} courseTitle={course.title} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
