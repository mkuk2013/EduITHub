"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  placeholder?: string;
  param?: string;
  defaultValue?: string;
}

/** Debounced search input that syncs the `q` (or given) query param and resets to page 1. */
export function SearchBar({ placeholder = "Search…", param = "q", defaultValue = "" }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(searchParams.get(param) ?? defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, param]);

  useEffect(() => {
    const current = searchParams.get(param) ?? "";
    if (value === current) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set(param, value.trim());
      else params.delete(param);
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(timer);
  }, [value, param, pathname, router, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
      />
    </div>
  );
}

interface FilterSelectProps {
  param: string;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  allLabel?: string;
}

/** Query-param driven filter dropdown (resets to page 1 on change). */
export function FilterSelect({ param, options, placeholder, allLabel = "All" }: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(param) ?? "";

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(param, next);
    else params.delete(param);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      aria-label={placeholder}
      className="flex h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:border-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1"
    >
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
}

/** Query-param pagination links. */
export function Pagination({ page, totalPages, total }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function href(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    return `${pathname}?${params.toString()}`;
  }

  const pages: number[] = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) pages.push(p);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-xs text-slate-500">
        Page {page} of {totalPages} · {total} result{total === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { window.location.href = href(page - 1); }}>
          Previous
        </Button>
        {pages[0] > 1 ? <span className="px-1 text-xs text-slate-400">…</span> : null}
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? "primary" : "ghost"}
            size="sm"
            aria-current={p === page ? "page" : undefined}
            onClick={() => {
              if (p !== page) window.location.href = href(p);
            }}
          >
            {p}
          </Button>
        ))}
        {pages[pages.length - 1] < totalPages ? <span className="px-1 text-xs text-slate-400">…</span> : null}
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { window.location.href = href(page + 1); }}>
          Next
        </Button>
      </div>
    </nav>
  );
}
