"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { EmptyState } from "@/components/ui/empty-state";

/** Error boundary for the course catalog. */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" aria-hidden="true" />}
          title="Could not load courses"
          description="Something went wrong while loading the course catalog. Please try again."
          action={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-10 items-center rounded-lg bg-indigo-700 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
              >
                Try again
              </button>
              <Link
                href={ROUTES.home}
                className="inline-flex h-10 items-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
              >
                Back to home
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}
