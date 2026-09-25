"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  Code2, 
  Users, 
  Play, 
  Video,
  Terminal,
  ShieldCheck,
  Star,
  ChevronRight,
  Flame,
  CheckCircle2,
  Mic,
  Monitor,
  Share2,
  GraduationCap
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

export function Hero() {
  const [activeTab, setActiveTab] = useState<"live" | "code">("live");

  return (
    <section
      aria-label="Introduction"
      style={{
        backgroundImage: "radial-gradient(ellipse 900px 700px at 85% 0%, rgba(0,89,255,0.07), transparent)"
      }}
      className="relative overflow-hidden py-8 sm:py-12 lg:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 surface-card">
          
          {/* Left Column: Headlines, Copy, Buttons, Counters */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            
            {/* Edu IT Hub Verified Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-semibold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-[var(--accent2)] animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-[var(--warning)]" />
              <span>✦ Pakistan&apos;s #1 Live IT &amp; AI Academy</span>
            </div>

            {/* H1 Heading (Responsive 60px bold with clean leading) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[60px] font-extrabold font-heading text-[var(--text-primary)] tracking-tight leading-[1.12]">
              Master In-Demand
              <span className="text-[var(--accent)] font-heading font-extrabold block mt-1.5 sm:mt-2">
                IT &amp; AI Skills.
              </span>
            </h1>

            {/* Subtitle Body Text */}
            <p className="text-[var(--text-secondary)] text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed font-sans">
              Edu IT Hub Academy provides live hands-on IT training designed for real jobs &amp; freelancing. 
              Learn Web Development, Artificial Intelligence, Graphic Design, Video Editing &amp; SEO with 
              <strong className="font-bold text-[var(--text-primary)]"> qualified industry mentors &amp; practical projects</strong>.
            </p>

            {/* Action Buttons Grid */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:max-w-md">
              <Link
                href={ROUTES.courses}
                className="w-full sm:w-auto flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold px-6 py-3.5 rounded-xl transition-all text-center text-xs sm:text-sm shadow-md shadow-[var(--accent)]/20 hover:-translate-y-0.5 hover:shadow-lg font-heading flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore 11+ Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={ROUTES.contact}
                className="w-full sm:w-auto bg-transparent text-[var(--text-primary)] hover:text-[var(--accent)] border-2 border-[var(--border-strong)] hover:border-[var(--accent)] font-bold px-6 py-3.5 rounded-xl transition-all text-center text-xs sm:text-sm font-heading flex items-center justify-center cursor-pointer"
              >
                Talk to Advisor
              </Link>
            </div>

            {/* Browse link */}
            <p className="pt-1 text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
              Prefer to browse course details first?{" "}
              <Link
                href={ROUTES.courses}
                className="font-semibold text-[var(--accent)] hover:underline underline-offset-2 inline-flex items-center gap-1"
              >
                <span>Browse Full Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </p>

            {/* Key Metrics Counter Row — Mobile 2x2, Desktop 4 columns */}
            <div className="pt-6 sm:pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 border-t border-[var(--border)] max-w-3xl mt-6">
              <div className="p-3 sm:p-0 rounded-xl bg-[var(--bg-subtle)] sm:bg-transparent text-center md:text-left sm:pr-4 sm:border-r border-[var(--border)]">
                <span className="tabular-nums text-2xl sm:text-3xl font-extrabold font-heading text-[var(--accent)] block">
                  11+
                </span>
                <span className="text-xs sm:text-sm font-sans text-[var(--text-muted)] mt-0.5 sm:mt-1 block">
                  Live IT Courses
                </span>
              </div>
              <div className="p-3 sm:p-0 rounded-xl bg-[var(--bg-subtle)] sm:bg-transparent text-center md:text-left sm:px-4 sm:border-r border-[var(--border)]">
                <span className="tabular-nums text-2xl sm:text-3xl font-extrabold font-heading text-[var(--accent2)] block">
                  100+
                </span>
                <span className="text-xs sm:text-sm font-sans text-[var(--text-muted)] mt-0.5 sm:mt-1 block">
                  Active Students
                </span>
              </div>
              <div className="p-3 sm:p-0 rounded-xl bg-[var(--bg-subtle)] sm:bg-transparent text-center md:text-left sm:px-4 sm:border-r border-[var(--border)]">
                <span className="tabular-nums text-2xl sm:text-3xl font-extrabold font-heading text-[var(--accent)] block">
                  100%
                </span>
                <span className="text-xs sm:text-sm font-sans text-[var(--text-muted)] mt-0.5 sm:mt-1 block">
                  Live &amp; Hands-On
                </span>
              </div>
              <div className="p-3 sm:p-0 rounded-xl bg-[var(--bg-subtle)] sm:bg-transparent text-center md:text-left sm:pl-4">
                <span className="tabular-nums text-2xl sm:text-3xl font-extrabold font-heading text-[var(--warning)] block">
                  4.9★
                </span>
                <span className="text-xs sm:text-sm font-sans text-[var(--text-muted)] mt-0.5 sm:mt-1 block">
                  Student Rating
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Interactive Hero Media Card */}
          <div className="lg:col-span-5 relative flex items-center">
            <div className="relative w-full max-w-lg mx-auto">
              
              {/* Subtle Ambient Glows */}
              <div aria-hidden="true" className="absolute -inset-2 rounded-[2rem] bg-[var(--accent)]/10 blur-2xl pointer-events-none" />
              <div aria-hidden="true" className="absolute top-4 -right-4 w-28 h-28 rounded-full bg-[var(--accent2)]/12 blur-xl pointer-events-none" />

              {/* Floating Pill Badges - Responsive & Safe on Mobile */}
              <div className="hidden sm:inline-flex items-center gap-1.5 absolute -left-3 bottom-[24%] z-20 bg-[var(--accent)] text-white border border-white/20 rounded-xl px-3 py-1.5 shadow-[var(--shadow-md)] text-[10px] font-bold font-heading">
                <Code2 className="w-3 h-3" />
                <span>Web Dev &amp; Full Stack</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 absolute -right-2 top-[34%] z-20 bg-white text-[var(--text-primary)] border border-[var(--border)] rounded-xl px-3 py-1.5 shadow-md text-[10px] font-bold font-heading">
                <Sparkles className="w-3 h-3 text-[var(--accent2)]" />
                <span>Python AI &amp; Chatbots</span>
              </div>

              {/* Main Preview Card */}
              <div className="relative rounded-2xl surface-card shadow-[var(--shadow-lg)] overflow-hidden transition-all duration-300 border border-[var(--card-glass-border)]">
                
                {/* Card Header Bar */}
                <div className="bg-white/95 backdrop-blur-md border-b border-[var(--border)] px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-[var(--text-primary)] font-heading">
                      Live Google Meet Class
                    </span>
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-0.5 rounded-lg border border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => setActiveTab("live")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer font-heading ${
                        activeTab === "live"
                          ? "bg-[var(--accent)] text-white shadow-xs"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Classroom
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("code")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer font-heading ${
                        activeTab === "code"
                          ? "bg-[var(--accent)] text-white shadow-xs"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Code Lab
                    </button>
                  </div>
                </div>

                {/* Media Canvas Area */}
                <div className="relative aspect-[16/11] sm:aspect-[5/4] w-full bg-[#030923] overflow-hidden flex flex-col justify-between">
                  {activeTab === "live" ? (
                    <div className="relative w-full h-full flex flex-col justify-between p-3.5 sm:p-4 text-white">
                      
                      {/* Live Session Top Info Bar */}
                      <div className="flex items-center justify-between text-[10px] text-slate-300 border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-red-600/90 text-white font-mono font-bold text-[9px]">LIVE</span>
                          <span className="font-semibold text-white">Full Stack Web &amp; AI</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>42 Online</span>
                        </div>
                      </div>

                      {/* Live Code / Presentation Screen */}
                      <div className="my-auto py-2">
                        <div className="rounded-xl bg-slate-900/90 border border-slate-700/60 p-3 sm:p-3.5 space-y-1.5 shadow-inner font-mono text-[11px] sm:text-xs">
                          <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800 text-[10px]">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <Terminal className="w-3 h-3 text-[var(--accent)]" />
                              <span>app/course/live-demo.tsx</span>
                            </span>
                            <span className="text-emerald-400 font-bold">1080p HD</span>
                          </div>
                          <p className="text-slate-400 pt-1">// Instructor Live Demonstration</p>
                          <p>
                            <span className="text-pink-400">export default</span> <span className="text-blue-300">function</span> <span className="text-yellow-300">EduITHubLMS</span>() &#123;
                          </p>
                          <p className="pl-3">
                            <span className="text-pink-400">return</span> &lt;<span className="text-emerald-300">SkillUnlocked</span> mode=&quot;<span className="text-cyan-300">LiveInteractive</span>&quot; /&gt;;
                          </p>
                          <p>&#125;</p>
                        </div>
                      </div>

                      {/* Instructor & Student Live Bar */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="rounded-lg bg-slate-800/80 border border-slate-700/50 p-2 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                            SM
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold block truncate text-slate-100">Sir Mukesh</span>
                            <span className="text-[9px] text-emerald-400 flex items-center gap-1 leading-none mt-0.5">
                              <Mic className="w-2.5 h-2.5" /> Mic Active
                            </span>
                          </div>
                        </div>

                        <div className="rounded-lg bg-slate-800/80 border border-slate-700/50 p-2 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                            AR
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold block truncate text-slate-100">Ali Raza</span>
                            <span className="text-[9px] text-amber-300 flex items-center gap-1 leading-none mt-0.5">
                              <Monitor className="w-2.5 h-2.5" /> Student Screen
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="relative w-full h-full bg-[#030923] p-4 text-slate-300 font-mono text-[11px] sm:text-xs overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-400 mb-2 border-b border-slate-800 pb-2">
                          <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span>terminal — student-workspace</span>
                        </div>
                        <p className="text-emerald-400">// Next.js + Python AI Career Stack</p>
                        <p className="mt-1"><span className="text-pink-400">const</span> <span className="text-blue-300">academy</span> = <span className="text-yellow-300">&quot;Edu IT Hub&quot;</span>;</p>
                        <p><span className="text-pink-400">const</span> <span className="text-blue-300">partner</span> = <span className="text-yellow-300">&quot;Super Sys-Tech Umerkot&quot;</span>;</p>
                        <p><span className="text-pink-400">const</span> <span className="text-blue-300">certification</span> = <span className="text-emerald-300">&quot;Super Sys-Tech Verified&quot;</span>;</p>
                        <div className="mt-3 p-2 rounded bg-black/50 border border-slate-800 text-[10px] text-amber-300">
                          ✓ Portfolio project compiled successfully
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
                        <span>Status: Ready for deployment</span>
                        <span className="text-emerald-400">Node v20.x</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Bottom CTA Link */}
                <div className="border-t border-[var(--border)] bg-white px-4 py-3">
                  <Link
                    href={ROUTES.register}
                    className="w-full p-2.5 text-xs font-bold text-center border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-light)] rounded-xl transition-all font-heading flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-[var(--accent)]" />
                    <span>Try Student Portal Demo — Join Batch 2026</span>
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
