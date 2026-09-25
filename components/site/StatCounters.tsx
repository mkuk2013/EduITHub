"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, GraduationCap, Users, Award, Sparkles } from "lucide-react";

export interface StatItem {
  label: string;
  value: number;
  suffix?: string;
}

const STAT_ICONS = [
  { icon: BookOpen, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  { icon: GraduationCap, color: "text-indigo-400", bg: "bg-indigo-400/10 border-indigo-400/20" },
  { icon: Users, color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
  { icon: Award, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
];

export function StatCounters({ stats }: { stats: StatItem[] }) {
  const [values, setValues] = useState<number[]>(stats.map(() => 0));
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = stats.map((s) => s.value);

    const animate = () => {
      if (reduceMotion) {
        setValues(targets);
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValues(targets.map((t) => Math.round(t * eased)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stats]);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4" role="list">
      {stats.map((stat, i) => {
        const iconData = STAT_ICONS[i % STAT_ICONS.length];
        const Icon = iconData.icon;
        return (
          <div
            key={stat.label}
            role="listitem"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-slate-900/80"
          >
            {/* Ambient glow in corner */}
            <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-all" />

            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border ${iconData.bg} ${iconData.color} shadow-inner transition-transform duration-300 group-hover:scale-110`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>

            <p
              className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl"
              aria-label={`${stat.value}${stat.suffix ?? ""} ${stat.label}`}
            >
              <span className="bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent">
                {values[i]?.toLocaleString("en-PK")}
                {stat.suffix ?? ""}
              </span>
            </p>
            <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-300 tracking-wide">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
