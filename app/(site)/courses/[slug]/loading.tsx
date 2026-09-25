import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while a course detail page streams in. */
export default function Loading() {
  return (
    <div className="bg-white" aria-hidden="true">
      <div className="border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-28" />
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-12 w-56" />
            </div>
            <Skeleton className="aspect-video w-full" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
