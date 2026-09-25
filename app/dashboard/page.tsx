import Link from "next/link";
import {
  GraduationCap,
  BadgeCheck,
  CreditCard,
  Bell,
  CalendarDays,
  ArrowRight,
  BookOpen,
  Wallet,
  Video,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Layers,
  ChevronRight
} from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardStats, getMyEnrollments } from "@/server/actions/student";
import { getMyNotifications } from "@/server/actions/notifications";
import { ROUTES } from "@/lib/constants";
import { formatPKR, timeAgo } from "@/lib/format";
import { profileImageUrl } from "@/components/student/image-url";

export const metadata = { title: "Student Dashboard · Edu IT Hub Academy" };

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function sortDays(days: string[]): string[] {
  return [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
}

export default async function DashboardPage() {
  const user = await requireStudent();

  const [stats, enrollments, notifResult, profile] = await Promise.all([
    getDashboardStats(),
    getMyEnrollments(),
    getMyNotifications().catch(() => ({ notifications: [], unreadCount: 0 })),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        status: true,
        email: true,
        createdAt: true,
        studentProfile: { select: { profileImage: true, phone: true } },
      },
    }),
  ]);

  const activeEnrollments = enrollments.filter((e) => e.status === "ACTIVE");
  const pendingEnrollments = enrollments.filter((e) => e.status === "PENDING_PAYMENT" || e.status === "PENDING_VERIFICATION");
  const recentNotifications = notifResult.notifications.slice(0, 4);
  const image = profileImageUrl(profile?.studentProfile?.profileImage);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 1. High-End Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 p-5 sm:p-8 shadow-xs">
        {/* Subtle Ambient Glow */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 left-1/3 h-48 w-48 rounded-full bg-[var(--accent2)]/10 blur-2xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Student Avatar */}
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-extrabold text-xl text-[var(--accent)] font-heading">
                  {user.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            {/* Greetings & Status */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 font-mono">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Enrolled Student</span>
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-[11px] font-semibold text-slate-500 font-sans">
                  Batch 2026 · Umerkot
                </span>
              </div>

              <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
                Welcome back, {user.name.split(" ")[0]}! 👋
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xl">
                Ready for your live classes? Track your schedules, monthly fee status, and course materials.
              </p>
            </div>
          </div>

          {/* Quick Action Button Hub */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0">
            <Link
              href="/dashboard/courses"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--accent-hover)] transition-all font-heading"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Explore Courses</span>
            </Link>
            <Link
              href={ROUTES.dashboardPayments}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all font-heading"
            >
              <Wallet className="h-3.5 w-3.5 text-[var(--accent2)]" />
              <span>Submit Fee</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Enrolled Courses */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Enrolled Courses</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--accent)] transition-transform group-hover:scale-110">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tabular-nums">
              {stats.totalEnrollments}
            </span>
            <span className="text-xs text-slate-400 font-medium">courses</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{stats.activeEnrollments} Active in classroom</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Active Google Meet Sessions */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Live Classes</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
              <Video className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-700 tabular-nums">
              {stats.activeEnrollments}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Link Ready
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Direct Google Meet</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Fee Status */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Monthly Fee</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tabular-nums">
              {stats.pendingPayments > 0 ? `${stats.pendingPayments} Pending` : "Rs 1,000"}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            {stats.pendingPayments > 0 ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Awaiting Slip Verification
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Account in Good Standing
              </span>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: Notifications Alert */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Academy Updates</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
              <Bell className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tabular-nums">
              {stats.unreadNotifications}
            </span>
            <span className="text-xs text-slate-400 font-medium">unread</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Syllabus &amp; Announcements</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard 2-Column Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Column: Active Classes & My Courses (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Class Live Schedule Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[var(--accent)]" />
                  <span>My Class Schedule</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Weekly live Google Meet sessions for your active courses.
                </p>
              </div>
              <Link
                href="/dashboard/my-courses"
                className="text-xs font-bold text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-heading"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {activeEnrollments.length === 0 ? (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[var(--accent)] mb-3">
                  <Video className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold font-heading text-slate-900">No active classes yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Enroll in a course and submit your first month fee (Rs 1,000) to activate live Google Meet links.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Link
                    href="/dashboard/courses"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white shadow-xs"
                  >
                    <span>Browse Courses</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {activeEnrollments.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-white hover:border-slate-200 hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-sm font-bold text-slate-900 truncate font-heading">
                          {e.course.title}
                        </h4>
                      </div>
                      {e.course.schedule ? (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {sortDays(e.course.schedule.days).join(", ")} · {e.course.schedule.startTime} – {e.course.schedule.endTime} ({e.course.schedule.timezone})
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">Class schedule announced in syllabus.</p>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/courses/${e.course.slug}`}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition-all font-heading"
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>Open Classroom</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Learning Shortcuts Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/courses"
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-[var(--accent)] hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--accent)] mb-3 transition-transform group-hover:scale-110">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold font-heading text-slate-900 group-hover:text-[var(--accent)]">
                Browse 11+ Courses
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore Full Stack Web, Python AI, Graphic Design, Video Editing and SEO.
              </p>
            </Link>

            <Link
              href={ROUTES.dashboardPayments}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-emerald-500 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3 transition-transform group-hover:scale-110">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold font-heading text-slate-900 group-hover:text-emerald-700">
                Submit Monthly Fee
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload Easypaisa, JazzCash or Bank slip for instant verification.
              </p>
            </Link>
          </div>

        </div>

        {/* Right Column: Notifications & Academy Helpline (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Notifications Feed */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <Bell className="h-4 w-4 text-[var(--accent)]" />
                <span>Recent Updates</span>
              </h3>
              <Link
                href={ROUTES.dashboardNotifications}
                className="text-xs font-bold text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-heading"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentNotifications.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No new notifications at this time.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentNotifications.map((n) => (
                  <li key={n.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{n.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Official Partner & Academic Support Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 to-[#030923] p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
            <div className="space-y-3 relative z-10">
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Official Educational Partner
              </span>
              <h4 className="text-base font-extrabold font-heading text-white">
                Super Sys-Tech Computers Centre Umerkot
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Need help with enrollment, fees, or class schedules? Talk directly with our academic advisor on WhatsApp or Phone:
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href="https://wa.me/923363268833"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-slate-900 font-bold px-3.5 py-2.5 text-xs transition-all font-heading shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp 0336 3268833</span>
                </a>
                <a
                  href="tel:03363268833"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2.5 text-xs transition-all font-heading"
                >
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
