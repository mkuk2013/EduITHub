import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  Clock3,
  CreditCard,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Megaphone,
  Plus,
  ExternalLink,
  Activity,
  Calendar,
  Sparkles,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { getAdminStats } from "@/server/actions/admin";
import { formatPKR, formatDate, timeAgo } from "@/lib/format";
import { ROUTES } from "@/lib/constants";

export const metadata = { title: "Executive Dashboard · Edu IT Hub Academy Admin" };

/** Modern visual bar chart with hover states, tooltips, and peak highlights */
function ModernBarChart({
  data,
  colorClass,
  isCurrency = false,
}: {
  data: Array<{ label: string; value: number }>;
  colorClass: string;
  isCurrency?: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-48 items-end gap-2 pt-6" role="img" aria-label="Visual bar chart">
      {data.map((d) => {
        const heightPct = Math.max(8, (d.value / max) * 100);
        const isPeak = d.value === max && d.value > 0;
        return (
          <div
            key={d.label}
            className="group relative flex flex-1 flex-col items-center justify-end h-full"
          >
            {/* Hover Tooltip */}
            <div className="pointer-events-none absolute -top-8 z-20 hidden rounded-md bg-slate-900 px-2 py-1 text-[10px] font-mono font-bold text-white shadow-md group-hover:flex whitespace-nowrap">
              {isCurrency ? formatPKR(d.value) : `${d.value} students`}
            </div>

            {/* Bar Value on top */}
            <span className="text-[10px] font-bold font-mono text-slate-500 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {d.value > 0 ? (isCurrency ? `${Math.round(d.value / 1000)}k` : d.value) : ""}
            </span>

            {/* The Bar */}
            <div
              className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-110 ${
                isPeak
                  ? "bg-gradient-to-t from-[var(--accent)] to-blue-400 shadow-sm"
                  : colorClass
              }`}
              style={{ height: `${heightPct}%` }}
            />

            {/* X-Axis Label */}
            <span className="mt-2 truncate text-[10px] font-mono font-medium text-slate-500 text-center w-full">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

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

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 1. Executive Welcome & Quick Action Command Bar */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 p-5 sm:p-8 shadow-xs">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
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

          {/* Top Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0">
            <Link
              href={ROUTES.adminCourses}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--accent-hover)] transition-all font-heading"
            >
              <Plus className="h-4 w-4" />
              <span>Create Course</span>
            </Link>
            <Link
              href={ROUTES.adminAnnouncements}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all font-heading"
            >
              <Megaphone className="h-4 w-4 text-amber-500" />
              <span>Broadcast Notice</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Actionable Pending Queue Banner (Visible when items need admin review) */}
      {hasUrgentActions && (
        <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 sm:p-5 shadow-xs">
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
      )}

      {/* 3. High-Impact Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        
        {/* Card 1: Monthly Verified Revenue */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Month Revenue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-700 tabular-nums">
              {formatPKR(stats.monthlyRevenue)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Month: {stats.currentMonth}</span>
            <span className="text-emerald-700 font-bold font-mono">PKR Verified</span>
          </div>
        </div>

        {/* Card 2: Total Active Students */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Total Students</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--accent)] transition-transform group-hover:scale-110">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tabular-nums">
              {stats.totalStudents}
            </span>
            <span className="text-xs text-slate-400 font-medium">registered</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{stats.approvedStudents} Active Learners</span>
            <Link href={ROUTES.adminStudents} className="text-[var(--accent)] font-bold hover:underline">
              Directory →
            </Link>
          </div>
        </div>

        {/* Card 3: Student Approvals Queue */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Approval Queue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
              <UserPlus className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tabular-nums">
              {stats.pendingStudents}
            </span>
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

        {/* Card 4: Fee Slip Verification */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Fee Slips Queue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tabular-nums">
              {stats.pendingPayments}
            </span>
            <span className="text-xs text-slate-400 font-medium">to verify</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{stats.approvedPayments} Total Verified</span>
            <Link href={ROUTES.adminVerification} className="text-[var(--accent)] font-bold hover:underline">
              Verify →
            </Link>
          </div>
        </div>

      </div>

      {/* 4. Secondary Quick Status Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Published Courses</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-slate-900 mt-1 block">
            {stats.publishedCourses} <span className="text-xs font-normal text-slate-500">/ {stats.totalCourses} total</span>
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Active Enrollments</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-emerald-700 mt-1 block">
            {stats.activeEnrollments} <span className="text-xs font-normal text-slate-500">students in class</span>
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Total Receipts Approved</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-slate-900 mt-1 block">
            {stats.approvedPayments} <span className="text-xs font-normal text-slate-500">receipts</span>
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Cloud Database Status</span>
          <span className="text-sm font-bold font-heading text-emerald-600 mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Neon PG Connected</span>
          </span>
        </div>
      </div>

      {/* 5. Visual Velocity Charts Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Chart 1: Registration Velocity */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
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

          <ModernBarChart data={registrationBars} colorClass="bg-blue-200" isCurrency={false} />
        </div>

        {/* Chart 2: Revenue Trend */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
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

          <ModernBarChart data={revenueBars} colorClass="bg-emerald-200" isCurrency={true} />

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
      </div>

      {/* 6. Live Activity Tables Stream */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        
        {/* Latest Registrations */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
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

        {/* Latest Payments */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
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

      </div>

    </div>
  );
}
