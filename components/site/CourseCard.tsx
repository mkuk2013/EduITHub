import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Clock, 
  MonitorSmartphone, 
  Star, 
  Award
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { formatPKR } from "@/lib/format";
import type { PublicCourseCard } from "@/lib/site";
import { CourseOriginalBanner, getCourseOriginalBrand } from "./CourseOriginalBanner";

export function CourseCard({ course }: { course: PublicCourseCard }) {
  const href = ROUTES.courseDetail(course.slug);
  const brand = getCourseOriginalBrand(course.slug, course.title);

  return (
    <article 
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl surface-card surface-card-interactive border border-[var(--border)] shadow-xs transition-all duration-300"
    >
      {/* Top Banner / Official Technology Logo Showcase */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail.startsWith("/") ? course.thumbnail : `/uploads/${course.thumbnail}`}
            alt={`${course.title} course thumbnail`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-108"
          />
        ) : (
          <CourseOriginalBanner slug={course.slug} title={course.title} />
        )}

        {/* Live Status Badge */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/85 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md border border-white/10 z-20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <MonitorSmartphone className="h-3 w-3 text-slate-400" aria-hidden="true" />
          <span>{course.mode}</span>
        </span>

        {/* Category Pill with Official Brand Tag */}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-slate-900 shadow-sm backdrop-blur-md font-mono z-20">
          {brand.tag}
        </span>
      </div>

      {/* Course Details */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-bold font-mono text-[10px] ${brand.pillClass}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.primaryIconUrl} alt="" className="h-4 w-4 object-contain shrink-0" />
            <span>{brand.category}</span>
          </span>
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-mono font-bold">4.9</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-base font-bold font-heading leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
          <Link href={href} className="focus-visible:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {course.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          {course.shortDescription}
        </p>

        {/* Core Tools Chips */}
        <div className="mt-3 flex flex-wrap gap-1">
          {brand.tools.map((tool, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200/90 px-2 py-0.5 text-[10px] font-mono text-slate-700 font-semibold"
            >
              {tool.icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tool.icon} alt="" className="h-2.5 w-2.5 object-contain shrink-0" />
              )}
              <span>{tool.name}</span>
            </span>
          ))}
        </div>

        {/* Meta details */}
        <div className="mt-4 flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-[var(--accent2)]" aria-hidden="true" />
            <span>Certificate</span>
          </div>
        </div>

        {/* Price & Action Button Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
              Monthly Fee
            </span>
            <span className="text-base sm:text-lg font-extrabold font-heading text-[var(--accent)]">
              {formatPKR(course.monthlyFee)}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] border border-[var(--border)] transition-all duration-200 group-hover:bg-[var(--accent)] group-hover:text-white group-hover:border-[var(--accent)] font-heading">
            <span>Details</span>
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  );
}
