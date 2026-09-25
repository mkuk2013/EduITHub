import Link from "next/link";
import { SearchX } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { buildSiteMetadata } from "@/lib/seo";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = buildSiteMetadata({
  title: "Course not found",
  description: "The course you are looking for does not exist or is no longer published.",
  path: "/courses",
});

/** Shown when a course slug doesn't match any published course. */
export default function NotFound() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
          title="Course not found"
          description="This course does not exist or is no longer published. Browse the catalog to find another course."
          action={
            <Link
              href={ROUTES.courses}
              className="inline-flex h-10 items-center rounded-lg bg-indigo-700 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              Browse courses
            </Link>
          }
        />
      </div>
    </div>
  );
}
