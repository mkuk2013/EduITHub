"use client";

import { useState, useMemo } from "react";
import { CourseCard } from "@/components/site/CourseCard";
import type { PublicCourseCard } from "@/lib/site";
import { Search, LayoutGrid, X } from "lucide-react";
import {
  ReactLogo,
  PythonLogo,
  PhotoshopLogo,
  SEOLogo,
} from "./TechnologyLogos";

interface CourseInteractiveCatalogProps {
  courses: PublicCourseCard[];
  showSearch?: boolean;
}

const CATEGORIES = [
  { id: "all", label: "All Courses", renderIcon: () => <LayoutGrid className="h-3.5 w-3.5" /> },
  { id: "web", label: "Web & Dev", renderIcon: () => <ReactLogo className="h-3.5 w-3.5 shrink-0" /> },
  { id: "ai", label: "AI & Python", renderIcon: () => <PythonLogo className="h-3.5 w-3.5 shrink-0" /> },
  { id: "design", label: "Design & Media", renderIcon: () => <PhotoshopLogo className="h-3.5 w-3.5 shrink-0" /> },
  { id: "marketing", label: "SEO & Marketing", renderIcon: () => <SEOLogo className="h-3.5 w-3.5 shrink-0" /> },
];

export function CourseInteractiveCatalog({ courses, showSearch = true }: CourseInteractiveCatalogProps) {
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const text = `${course.title} ${course.shortDescription} ${course.slug}`.toLowerCase();
      
      // Search match
      const matchesSearch = searchQuery.trim() === "" || text.includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      // Category match
      if (selectedCat === "all") return true;
      if (selectedCat === "web") {
        return text.includes("web") || text.includes("wordpress") || text.includes("code") || text.includes("dev") || text.includes("front") || text.includes("full");
      }
      if (selectedCat === "ai") {
        return text.includes("ai") || text.includes("artificial") || text.includes("python") || text.includes("machine") || text.includes("data");
      }
      if (selectedCat === "design") {
        return text.includes("design") || text.includes("graphic") || text.includes("video") || text.includes("editing") || text.includes("ui");
      }
      if (selectedCat === "marketing") {
        return text.includes("marketing") || text.includes("seo") || text.includes("digital");
      }
      return true;
    });
  }, [courses, selectedCat, searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Category Pills Bar - Scrollable on mobile, wrapping on tablet/desktop */}
        <div 
          className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap" 
          role="tablist" 
          aria-label="Course categories"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCat(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer font-heading whitespace-nowrap shrink-0 ${
                  isSelected
                    ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20 scale-[1.02]"
                    : "surface-card text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]"
                }`}
              >
                <span className={isSelected ? "text-white" : "text-[var(--text-muted)]"}>
                  {cat.renderIcon()}
                </span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        {showSearch && (
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-placeholder)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses (e.g. Python, Web)..."
              className="h-10 sm:h-10.5 w-full rounded-xl border border-[var(--border)] bg-white pl-9.5 pr-8 text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div key={course.id} className="h-full">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl surface-card p-8 sm:p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] mb-3">
            <Sparkles className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold font-heading text-[var(--text-primary)]">No courses match your filter</h4>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            Try choosing another category or clearing your search query.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCat("all");
              setSearchQuery("");
            }}
            className="mt-4 inline-flex items-center rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--accent-hover)] font-heading cursor-pointer"
          >
            Show All Courses
          </button>
        </div>
      )}
    </div>
  );
}
