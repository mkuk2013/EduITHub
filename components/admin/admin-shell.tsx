"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
  UserCheck,
  Wallet,
  X,
  ExternalLink,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface NavGroup {
  title: string;
  items: Array<{
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: number;
    exact?: boolean;
  }>;
}

interface AdminShellProps {
  userName: string;
  userEmail: string;
  pendingStudents: number;
  pendingPayments: number;
  children: React.ReactNode;
}

export function AdminShell({ userName, userEmail, pendingStudents, pendingPayments, children }: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      title: "Core Operations",
      items: [
        { href: ROUTES.admin, label: "Overview Dashboard", icon: LayoutDashboard, exact: true },
        { href: ROUTES.adminInstructors, label: "Instructors & Faculty", icon: UserCheck },
        { href: ROUTES.adminStudents, label: "All Students", icon: Users },
        { href: ROUTES.adminApprovals, label: "Student Approvals", icon: CheckCircle2, badge: pendingStudents },
        { href: ROUTES.adminCourses, label: "Courses & Syllabus", icon: GraduationCap },
        { href: ROUTES.adminEnrollments, label: "Course Enrollments", icon: ShieldCheck },
      ],
    },
    {
      title: "Financials & Fees",
      items: [
        { href: ROUTES.adminPayments, label: "Fee Records", icon: Wallet },
        { href: ROUTES.adminVerification, label: "Payment Verification", icon: CreditCard, badge: pendingPayments },
      ],
    },
    {
      title: "Classroom & Comms",
      items: [
        { href: ROUTES.adminClasses, label: "Google Meet Classes", icon: CalendarClock },
        { href: ROUTES.adminAnnouncements, label: "Announcements", icon: Megaphone },
        { href: ROUTES.adminNotifications, label: "Push Notifications", icon: Bell },
      ],
    },
    {
      title: "System & Governance",
      items: [
        { href: ROUTES.adminEmails, label: "Email Audit Logs", icon: Mail },
        { href: ROUTES.adminAuditLogs, label: "Security Audit Trail", icon: ScrollText },
        { href: ROUTES.adminSettings, label: "Platform Settings", icon: Settings },
        { href: ROUTES.adminProfile, label: "My Admin Profile", icon: UserCircle2 },
      ],
    },
  ];

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  const renderNav = (onNavigate?: () => void) => (
    <div className="space-y-6">
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              const hasBadge = item.badge != null && item.badge > 0;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200",
                      active
                        ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/25 font-bold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                          active ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {hasBadge && (
                      <span
                        className={cn(
                          "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold font-mono",
                          active
                            ? "bg-white text-[var(--accent)]"
                            : "bg-red-500 text-white animate-pulse"
                        )}
                      >
                        {item.badge! > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 1. Mobile Top Bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800 bg-[#030923] px-4 text-white lg:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open admin navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="font-extrabold font-heading text-sm text-white">
              EduIT<span className="text-[var(--accent)]">Admin</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(pendingStudents > 0 || pendingPayments > 0) && (
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
          )}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white font-heading">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
      </header>

      {/* 2. Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-[280px] flex-col bg-[#030923] text-white shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="font-extrabold font-heading text-sm text-white">
                  Admin Command
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
              {renderNav(() => setDrawerOpen(false))}
            </div>

            <div className="border-t border-slate-800 p-4 space-y-2 bg-[#020617]">
              <Link
                href={ROUTES.home}
                target="_blank"
                className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>View Public Site</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: ROUTES.login })}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-xs font-bold text-red-400 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Desktop Dark Navy Glassmorphism Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 xl:w-72 lg:flex-col border-r border-slate-800/80 bg-gradient-to-b from-[#030923] via-[#050E2D] to-[#020617] text-white">
        
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800/80 px-6">
          <Link href={ROUTES.admin} className="flex items-center gap-3 group">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-blue-700 text-white shadow-md shadow-[var(--accent)]/20 transition-transform group-hover:scale-105">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold font-heading text-lg tracking-tight leading-none text-white">
                Edu<span className="text-[var(--accent)]">IT</span>Hub
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Admin Command
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Admin User Mini Card */}
        <div className="p-3.5 mx-3 my-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-xs font-heading">
              {userName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-xs font-bold text-white font-heading">
                {userName}
              </h4>
              <p className="truncate text-[10px] text-slate-400 font-mono">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-none">
          {renderNav()}
        </div>

        {/* Footer Quick Links & Sign Out */}
        <div className="border-t border-slate-800/80 p-4 space-y-2 bg-black/20">
          <Link
            href={ROUTES.home}
            target="_blank"
            className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-[var(--accent)] group-hover:scale-110 transition-transform" />
              <span>Open Public Site</span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: ROUTES.login })}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 4. Desktop Main Content Wrapper */}
      <div className="lg:pl-64 xl:pl-72 min-h-screen transition-all duration-300">
        
        {/* Desktop Sticky Header Bar */}
        <header className="hidden lg:flex sticky top-0 z-20 h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-8">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              LMS Management Console
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800 font-heading">
              Edu IT Hub Academy Pakistan
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Pending alerts pill */}
            {(pendingStudents > 0 || pendingPayments > 0) && (
              <div className="flex items-center gap-2">
                {pendingStudents > 0 && (
                  <Link
                    href={ROUTES.adminApprovals}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>{pendingStudents} Pending Approvals</span>
                  </Link>
                )}
                {pendingPayments > 0 && (
                  <Link
                    href={ROUTES.adminVerification}
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span>{pendingPayments} Pending Slips</span>
                  </Link>
                )}
              </div>
            )}

            <div className="h-5 w-px bg-slate-200" />

            <Link
              href={ROUTES.home}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline font-heading"
            >
              <span>Visit Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Main Routed Area */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
