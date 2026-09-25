"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Month (YYYY-MM) filter synced to the `month` query param. */
export function MonthFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("month") ?? "";

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("month", next);
    else params.delete("month");
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      Month
      <input
        type="month"
        value={current}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by billing month"
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:border-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1"
      />
    </label>
  );
}
