import Link from "next/link";
import {
  BookOpen,
  CreditCard,
  TrendingUp,
  UserPlus,
  Users,
  ArrowRight,
  AlertCircle,
  Megaphone,
  Plus
} from "lucide-react";
import { getAdminStats } from "@/server/actions/admin";
import { formatPKR, timeAgo } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { Reveal, CountUp, ProgressRing, AnimatedBars } from "@/components/dashboard/motion";

export const metadata = { title: "Executive Dashboard · Edu IT Hub Academy Admin" };

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const registrationBars = stats.registrationsLast14Days.map((r) => ({
    label: r.date.slice(5),
    value: r.count,
  }));
  const revenueBars = stats.revenueLast6Months.map((r) => ({
    label: r.month.slice(5),
    value: r.total,
  }));

  const hasUrgentActions = stats.pendingStudents > 0 || stats.pendingPayments > 0;
  const approvedPct = stats.totalStudents > 0
    ? (stats.approvedStudents / stats.totalStudents) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">

      {/* 1. Executive hero — wide bento tile */}
      <Reveal className="lg:col-span-8" delay={0}>
        <div className="bento-tile relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 p-5 sm:p-8 shadow-xs">
          <div aria-hidden="true" className="bento-glow pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />
          <div aria-hidden="true" className="bento-glow pointer-events-none absolute -bottom-12 left-1/4 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" style={{ animationDelay: "-4.5s" }} />

          <div className="relative flex h-full flex-col justify-center gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Command Console
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-xs font-semibold text-slate-500 font-sans">
                  Academic Session 2026
                </span>
              </div>

              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
                Executive Overview Dashboard
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xl">
                Real-time monitoring of student registrations, fee verification queue, live course enrollments, and revenue metrics.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href={ROUTES.adminCourses}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--accent-hover)] transition-all font-heading"
              >
                <Plus className="h-4 w-4" />
                <span>Create Course</span>
              </Link>
              <Link
                href={ROUTES.adminAnnouncements}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all font-heading"
              >
                <Megaphone className="h-4 w-4 text-amber-500" />
                <span>Broadcast Notice</span>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 2. Approval ring — tall bento tile */}
      <Reveal className="lg:col-span-4" delay={80}>
        <div className="bento-tile flex h-full flex-col justify-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
          <ProgressRing
            percent={approvedPct}
            title="Students Approved"
            subtitle={`${stats.approvedStudents} of ${stats.totalStudents} registered students are approved and learning.`}
          />
          {stats.pendingStudents > 0 ? (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              {stats.pendingStudents} awaiting your approval
            </span>
          ) : (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              Approval queue is clear
            </span>
          )}
        </div>
      </Reveal>

      {/* 3. Urgent actions banner */}
      {hasUrgentActions && (
        <Reveal className="lg:col-span-12" delay={120}>
          <div className="rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold font-heading text-amber-950">
                    Tasks Requiring Your Immediate Review
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {stats.pendingStudents > 0 && `${stats.pendingStudents} student account approvals pending.`}{" "}
                    {stats.pendingPayments > 0 && `${stats.pendingPayments} fee transaction slips awaiting verification.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {stats.pendingStudents > 0 && (
                  <Link
                    href={ROUTES.adminApprovals}
                    className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 text-xs transition-colors font-heading"
                  >
                    Review Students ({stats.pendingStudents})
                  </Link>
                )}
                {stats.pendingPayments > 0 && (
                  <Link
                    href={ROUTES.adminVerification}
                    className="rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 text-xs transition-colors font-heading"
                  >
                    Verify Slips ({stats.pendingPayments})
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* 4. KPI bento tiles with animated counters */}
      <Reveal className="lg:col-span-3" delay={140}>
        <div className="bento-tile group relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 text-white shadow-md">
          <div aria-hidden="true" className="bento-glow pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono text-emerald-100">Month Revenue</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white transition-transform group-hover:scale-110">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <CountUp value={stats.monthlyRevenue} format="pkr" className="text-2xl sm:text-3xl font-extrabold font-heading tabular-nums" />
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-emerald-100">
              <span>Month: {stats.currentMonth}</span>
              <span className="font-bold font-mono">PKR Verified</span>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="lg:col-span-3" delay={190}>
        <div className="bento-tile group relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Total Students</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--accent)] transition-transform group-hover:scale-110">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <CountUp value={stats.totalStudents} className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tabular-nums" />
            <span className="text-xs text-slate-400 font-medium">registered</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{stats.approvedStudents} Active Learners</span>
            <Link href={ROUTES.adminStudents} className="text-[var(--accent)] font-bold hover:underline">
              Directory →
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal className="lg:col-span-3" delay={240}>
        <div className="bento-tile group relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Approval Queue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
              <UserPlus className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <CountUp value={stats.pendingStudents} className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tabular-nums" />
            <span className="text-xs text-slate-400 font-medium">pending</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            {stats.pendingStudents > 0 ? (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Action Required
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold">Queue Clear</span>
            )}
            <Link href={ROUTES.adminApprovals} className="text-[var(--accent)] font-bold hover:underline">
              Process →
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal className="lg:col-span-3" delay={290}>
        <div className="bento-tile group relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Fee Slips Queue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <CountUp value={stats.pendingPayments} className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tabular-nums" />
            <span className="text-xs text-slate-400 font-medium">to verify</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{stats.approvedPayments} Total Verified</span>
            <Link href={ROUTES.adminVerification} className="text-[var(--accent)] font-bold hover:underline">
              Verify →
            </Link>
          </div>
        </div>
      </Reveal>

      {/* 5. Mini stat tiles */}
      <Reveal className="col-span-1 lg:col-span-3" delay={320}>
        <div className="bento-tile h-full rounded-2xl border border-slate-200/80 bg-white p-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-[var(--accent)]" /> Published Courses
          </span>
          <span className="text-lg sm:text-xl font-bold font-heading text-slate-900 mt-1.5 block">
            <CountUp value={stats.publishedCourses} /> <span className="text-xs font-normal text-slate-500">/ {stats.totalCourses} total</span>
          </span>
        </div>
      </Reveal>

      <Reveal className="col-span-1 lg:col-span-3" delay={350}>
        <div className="bento-tile h-full rounded-2xl border border-slate-200/80 bg-white p-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Active Enrollments</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-emerald-700 mt-1.5 block">
            <CountUp value={stats.activeEnrollments} /> <span className="text-xs font-normal text-slate-500">students in class</span>
          </span>
        </div>
      </Reveal>

      <Reveal className="col-span-1 lg:col-span-3" delay={380}>
        <div className="bento-tile h-full rounded-2xl border border-slate-200/80 bg-white p-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Total Receipts Approved</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-slate-900 mt-1.5 block">
            <CountUp value={stats.approvedPayments} /> <span className="text-xs font-normal text-slate-500">receipts</span>
          </span>
        </div>
      </Reveal>

      <Reveal className="col-span-1 lg:col-span-3" delay={410}>
        <div className="bento-tile h-full rounded-2xl border border-slate-200/80 bg-white p-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Cloud Database Status</span>
          <span className="text-sm font-bold font-heading text-emerald-600 mt-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Neon PG Connected</span>
          </span>
        </div>
      </Reveal>

      {/* 6. Animated charts */}
      <Reveal className="lg:col-span-6" delay={440}>
        <div className="bento-tile h-full rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--accent)]" />
                <span>Student Registrations (Last 14 Days)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Daily signup volume velocity.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-50 text-[var(--accent)] px-2.5 py-1 rounded-md">
              14 Days
            </span>
          </div>
          <AnimatedBars data={registrationBars} colorClass="bg-blue-200" isCurrency={false} />
        </div>
      </Reveal>

      <Reveal className="lg:col-span-6" delay={480}>
        <div className="bento-tile h-full rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>Verified Tuition Revenue (Last 6 Months)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Approved fee collections in PKR.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">
              6 Months
            </span>
          </div>
          <AnimatedBars data={revenueBars} colorClass="bg-emerald-200" isCurrency={true} />
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Peak Month:{" "}
              <strong className="text-slate-900">
                {stats.revenueLast6Months.length > 0
                  ? `${stats.revenueLast6Months.reduce((a, b) => (b.total > a.total ? b : a)).month} (${formatPKR(Math.max(...stats.revenueLast6Months.map((r) => r.total)))})`
                  : "—"}
              </strong>
            </span>
            <Link href={ROUTES.adminPayments} className="text-[var(--accent)] font-bold hover:underline">
              Fee Records →
            </Link>
          </div>
        </div>
      </Reveal>

      {/* 7. Live activity streams */}
      <Reveal className="lg:col-span-6" delay={520}>
        <div className="bento-tile h-full rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-[var(--accent)]" />
              <span>Latest Student Registrations</span>
            </h3>
            <Link
              href={ROUTES.adminStudents}
              className="text-xs font-bold text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-heading"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {stats.recentStudents.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No students registered yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.recentStudents.map((s) => (
                <li key={s.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-xs font-heading">
                      {s.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`${ROUTES.adminStudents}/${s.id}`}
                        className="truncate text-xs font-bold text-slate-900 hover:text-[var(--accent)] block"
                      >
                        {s.name}
                      </Link>
                      <p className="truncate text-[11px] text-slate-400 font-mono">{s.email}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-400 font-mono">
                    {timeAgo(s.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>

      <Reveal className="lg:col-span-6" delay={560}>
        <div className="bento-tile h-full rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>Recent Tuition Transactions</span>
            </h3>
            <Link
              href={ROUTES.adminPayments}
              className="text-xs font-bold text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-heading"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {stats.recentPayments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No transactions recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.recentPayments.map((p) => (
                <li key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs">
                      ₨
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {p.studentName}
                      </p>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 block">
                        {formatPKR(p.amount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold font-mono ${
                        p.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : p.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {p.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {timeAgo(p.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>

    </div>
  );
}
