import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildSiteMetadata } from "@/lib/seo";
import { CourseCard } from "@/components/site/CourseCard";
import { CourseSearch } from "@/components/site/CourseSearch";
import { Reveal } from "@/components/site/Reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchX } from "lucide-react";

export const metadata: Metadata = buildSiteMetadata({
  title: "Courses",
  description:
    "Browse live online IT courses at Edu IT Hub Academy — web development, programming, design, marketing and more, with affordable monthly fees.",
  path: "/courses",
});

// Cache on Vercel Edge CDN for ultra-fast response
export const revalidate = 120;

interface CoursesPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function CourseGrid({ query }: { query: string }) {
  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { shortDescription: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      thumbnail: true,
      monthlyFee: true,
      duration: true,
      mode: true,
    },
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
  });

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
        title="No courses are currently available."
        description={
          query
            ? `No courses matched "${query}". Try a different search term.`
            : "New courses are being prepared. Please check back soon."
        }
      />
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-slate-500" role="status" aria-live="polite">
        Showing {courses.length} {courses.length === 1 ? "course" : "courses"}
        {query ? (
          <>
            {" "}
            for <span className="font-semibold text-slate-700">&ldquo;{query}&rdquo;</span>
          </>
        ) : null}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, i) => (
          <Reveal key={course.id} delay={(i % 3) * 0.06} className="h-full">
            <CourseCard course={course} />
          </Reveal>
        ))}
      </div>
    </>
  );
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
            Course catalog
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Explore our courses
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Live online IT courses with affordable monthly fees. Search by name or topic.
          </p>
        </div>

        <div className="mt-8">
          <Suspense>
            <CourseSearch />
          </Suspense>
        </div>

        <div className="mt-10">
          <Suspense fallback={<CourseGridSkeleton />}>
            <CourseGrid query={query} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function CourseGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="aspect-video animate-pulse bg-slate-200" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
