"use client";

/**
 * Bento dashboard motion kit — scroll-reveal wrappers, animated
 * counters, a progress ring and grow-in bar charts. Pure CSS/JS
 * animation (no extra deps); everything animates once when the tile
 * scrolls into view and respects prefers-reduced-motion via the
 * global rules in globals.css.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatPKR } from "@/lib/format";

function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/** Fade-and-rise reveal for a bento tile, with an optional stagger delay (ms). */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const pkrCounter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});
const intCounter = new Intl.NumberFormat("en-PK");

/** Number that counts up from 0 when it scrolls into view. */
export function CountUp({
  value,
  format = "int",
  className = "",
  duration = 1300,
}: {
  value: number;
  format?: "int" | "pkr";
  className?: string;
  duration?: number;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);
  return (
    <span ref={ref} className={className}>
      {format === "pkr" ? pkrCounter.format(display) : intCounter.format(display)}
    </span>
  );
}

/** Animated SVG progress ring (0–100) with a centred label. */
export function ProgressRing({
  percent,
  title,
  subtitle,
  size = 132,
}: {
  percent: number;
  title: string;
  subtitle: string;
  size?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = inView ? c - (pct / 100) * c : c;
  return (
    <div ref={ref} className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            className="stroke-slate-100"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke="url(#bentoRingGradient)"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s" }}
          />
          <defs>
            <linearGradient id="bentoRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0059ff" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold font-heading text-slate-900 tabular-nums">
            <CountUp value={pct} duration={1400} />%
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold font-heading text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

/** Bar chart whose bars grow in with a stagger when scrolled into view. */
export function AnimatedBars({
  data,
  colorClass,
  isCurrency = false,
}: {
  data: Array<{ label: string; value: number }>;
  colorClass: string;
  isCurrency?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div ref={ref} className="flex h-48 items-end gap-2 pt-6" role="img" aria-label="Visual bar chart">
      {data.map((d, i) => {
        const heightPct = Math.max(8, (d.value / max) * 100);
        const isPeak = d.value === max && d.value > 0;
        return (
          <div key={d.label} className="group relative flex h-full flex-1 flex-col items-center justify-end">
            <div className="pointer-events-none absolute -top-8 z-20 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-mono font-bold text-white shadow-md group-hover:flex">
              {isCurrency ? formatPKR(d.value) : `${d.value} students`}
            </div>
            <span
              className="mb-1 text-[10px] font-bold font-mono text-slate-500 transition-opacity duration-700"
              style={{ opacity: inView ? 0.85 : 0, transitionDelay: `${300 + i * 60}ms` }}
            >
              {d.value > 0 ? (isCurrency ? `${Math.round(d.value / 1000)}k` : d.value) : ""}
            </span>
            <div
              className={`bar-anim w-full rounded-t-lg group-hover:brightness-110 ${
                isPeak ? "bg-gradient-to-t from-[var(--accent)] to-blue-400 shadow-sm" : colorClass
              }`}
              style={{ height: inView ? `${heightPct}%` : "0%", transitionDelay: `${i * 60}ms` }}
            />
            <span className="mt-2 w-full truncate text-center text-[10px] font-mono font-medium text-slate-500">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
