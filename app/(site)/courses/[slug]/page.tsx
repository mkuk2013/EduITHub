import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Clock,
  GraduationCap,
  ListChecks,
  MonitorSmartphone,
  UserRound,
  Wallet,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { formatPKR } from "@/lib/format";
import { buildSiteMetadata } from "@/lib/seo";
import { CourseOriginalBanner, getCourseOriginalBrand } from "@/components/site/CourseOriginalBanner";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** Narrow a Json column to a string array for requirements/benefits. */
function toStringList(value: Prisma.JsonValue | null | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

async function getCourse(slug: string) {
  return prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      description: true,
      thumbnail: true,
      monthlyFee: true,
      duration: true,
      mode: true,
      requirements: true,
      benefits: true,
      instructors: {
        select: {
          instructor: {
            select: { id: true, name: true, bio: true, experience: true },
          },
        },
      },
      modules: {
        select: { id: true, title: true, description: true, order: true },
        orderBy: { order: "asc" },
      },
      // meetingUrl is deliberately NOT selected — never exposed publicly.
      schedule: {
        select: { days: true, startTime: true, endTime: true, timezone: true, instructions: true },
      },
    },
  });
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, shortDescription: true },
  });
  if (!course) {
    return buildSiteMetadata({ title: "Course not found", path: "/courses" });
  }
  return buildSiteMetadata({
    title: course.title,
    description: course.shortDescription,
    path: `/courses/${slug}`,
  });
}

function thumbnailSrc(thumbnail: string | null): string | null {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) return thumbnail;
  return thumbnail.startsWith("/") ? thumbnail : `/uploads/${thumbnail}`;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  const requirements = toStringList(course.requirements);
  const benefits = toStringList(course.benefits);
  const instructors = course.instructors.map((link) => link.instructor);
  const thumb = thumbnailSrc(course.thumbnail);
  const brand = getCourseOriginalBrand(course.slug, course.title);

  // Session-aware enroll routing lands with the auth workstream
  // (lib/auth.ts does not exist yet); for now the CTA goes to /register.
  const enrollHref = ROUTES.register;

  return (
    <div className="bg-white">
      {/* Breadcrumb + header */}
      <div className="border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href={ROUTES.courses}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All courses
          </Link>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold font-mono ${brand.pillClass}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brand.primaryIconUrl} alt="" className="h-4 w-4 object-contain shrink-0" />
                  <span>{brand.category}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  <MonitorSmartphone className="h-3 w-3" aria-hidden="true" />
                  {course.mode}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {course.duration}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                {course.shortDescription}
              </p>

              {/* Technologies covered */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 font-mono">Technologies:</span>
                {brand.tools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs font-mono font-semibold text-slate-700 shadow-xs"
                  >
                    {tool.icon && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tool.icon} alt="" className="h-3.5 w-3.5 object-contain shrink-0" />
                    )}
                    <span>{tool.name}</span>
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <p className="text-sm text-slate-500">
                  <span className="block text-[11px] font-medium uppercase tracking-wide">
                    Monthly fee
                  </span>
                  <span className="text-2xl font-extrabold text-indigo-700">
                    {formatPKR(course.monthlyFee)}
                  </span>
                </p>
                <Link
                  href={enrollHref}
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                >
                  Enroll Now
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-md">
              {thumb ? (
                <Image
                  src={thumb}
                  alt={`${course.title} course thumbnail`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <CourseOriginalBanner slug={course.slug} title={course.title} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-12">
            {/* About the course */}
            <section aria-labelledby="course-about">
              <h2 id="course-about" className="text-xl font-extrabold tracking-tight text-slate-950">
                About this course
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-700">
                {course.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>

            {/* Syllabus */}
            <section aria-labelledby="course-syllabus">
              <h2 id="course-syllabus" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-950">
                <BookOpen className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                Syllabus
              </h2>
              {course.modules.length > 0 ? (
                <ol className="mt-4 space-y-3">
                  {course.modules.map((module) => (
                    <li
                      key={module.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-extrabold text-indigo-700"
                        >
                          {module.order}
                        </span>
                        <div>
                          <h3 className="font-bold text-slate-950">{module.title}</h3>
                          {module.description && (
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                              {module.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  The detailed module breakdown for this course will be published soon.
                </p>
              )}
            </section>

            {/* Requirements & benefits */}
            {(requirements.length > 0 || benefits.length > 0) && (
              <section aria-labelledby="course-reqs" className="grid gap-6 sm:grid-cols-2">
                {requirements.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <h2 id="course-reqs" className="flex items-center gap-2 text-base font-bold text-slate-950">
                      <ListChecks className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                      Requirements
                    </h2>
                    <ul className="mt-3 space-y-2">
                      {requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {benefits.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
                      <BadgeCheck className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                      What you will gain
                    </h2>
                    <ul className="mt-3 space-y-2">
                      {benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Instructors */}
            {instructors.length > 0 && (
              <section aria-labelledby="course-instructors">
                <h2 id="course-instructors" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-950">
                  <UserRound className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                  Instructors
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {instructors.map((instructor) => (
                    <article key={instructor.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="font-bold text-slate-950">{instructor.name}</h3>
                      {instructor.experience && (
                        <p className="mt-0.5 text-xs font-medium text-indigo-700">{instructor.experience}</p>
                      )}
                      {instructor.bio && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{instructor.bio}</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar: facts + schedule */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Course facts">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">Course facts</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <Wallet className="h-4 w-4" aria-hidden="true" /> Monthly fee
                  </dt>
                  <dd className="font-bold text-slate-950">{formatPKR(course.monthlyFee)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <Clock className="h-4 w-4" aria-hidden="true" /> Duration
                  </dt>
                  <dd className="font-semibold text-slate-950">{course.duration}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <MonitorSmartphone className="h-4 w-4" aria-hidden="true" /> Mode
                  </dt>
                  <dd className="font-semibold text-slate-950">{course.mode}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <BookOpen className="h-4 w-4" aria-hidden="true" /> Modules
                  </dt>
                  <dd className="font-semibold text-slate-950">{course.modules.length}</dd>
                </div>
              </dl>
              <Link
                href={enrollHref}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-700 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
              >
                Enroll Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="mt-3 text-center text-xs text-slate-500">
                Registration is free — pay only the monthly fee.
              </p>
            </div>

            {course.schedule && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-6">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
                  <CalendarDays className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                  Class schedule
                </h2>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Days</dt>
                    <dd className="mt-0.5 font-semibold text-slate-900">
                      {course.schedule.days.length > 0 ? course.schedule.days.join(", ") : "To be announced"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Time</dt>
                    <dd className="mt-0.5 font-semibold text-slate-900">
                      {course.schedule.startTime} – {course.schedule.endTime}
                      <span className="ml-1 font-normal text-slate-500">({course.schedule.timezone})</span>
                    </dd>
                  </div>
                  {course.schedule.instructions && (
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Note</dt>
                      <dd className="mt-0.5 text-slate-700">{course.schedule.instructions}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  The live class joining link appears in your dashboard once your enrollment is active.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
