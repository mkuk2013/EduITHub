import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  action?: { label: string; href: string };
}

/** Consistent section header used across public pages. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
  action,
}: SectionHeadingProps) {
  const alignCls = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <Reveal className={`max-w-2xl ${alignCls}`}>
      <p
        className={`text-xs font-bold uppercase tracking-[0.2em] ${
          dark ? "text-amber-400" : "text-indigo-700"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-3 text-base leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm ${
            dark
              ? "text-amber-400 hover:text-amber-300 focus-visible:ring-amber-400"
              : "text-indigo-700 hover:text-indigo-800 focus-visible:ring-indigo-600"
          }`}
        >
          {action.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </Reveal>
  );
}

export function SectionShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
