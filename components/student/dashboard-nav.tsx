"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  CreditCard,
  Bell,
  User,
  Settings,
  Menu,
  X,
  Sparkles,
  MessageCircle,
  Phone,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Calendar,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND, ROUTES } from "@/lib/constants";
import { LogoutButton } from "./logout-button";

interface NavGroup {
  title: string;
  items: Array<{
    label: string;
    href: string;
    icon: any;
    badgeKey?: "notifications";
  }>;
}

interface DashboardNavProps {
  userName: string;
  profileImageUrl: string | null;
  unreadCount: number;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Learning Center",
    items: [
      { label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard },
      { label: "My Enrolled Courses", href: "/dashboard/my-courses", icon: GraduationCap },
      { label: "Course Catalog", href: "/dashboard/courses", icon: BookOpen },
    ],
  },
  {
    title: "Finance & Records",
    items: [
      { label: "Monthly Fees & Slips", href: ROUTES.dashboardPayments, icon: CreditCard },
      { label: "Notifications", href: ROUTES.dashboardNotifications, icon: Bell, badgeKey: "notifications" },
    ],
  },
  {
    title: "Account & Preferences",
    items: [
      { label: "Student Profile", href: ROUTES.dashboardProfile, icon: User },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function DashboardNav({ userName, profileImageUrl, unreadCount }: DashboardNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const renderNavLinks = (onNavigate?: () => void) => (
    <div className="space-y-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="space-y-1.5">
          <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            {group.title}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === ROUTES.dashboard
                  ? pathname === ROUTES.dashboard
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const hasBadge = item.badgeKey === "notifications" && unreadCount > 0;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200",
                      isActive
                        ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20 font-bold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {hasBadge && (
                      <span
                        className={cn(
                          "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold font-mono",
                          isActive
                            ? "bg-white text-[var(--accent)]"
                            : "bg-red-500 text-white animate-pulse"
                        )}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
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
    <>
      {/* 1. Mobile Top App Bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open sidebar menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href={ROUTES.dashboard} className="flex items-center gap-2">
            <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs shrink-0 flex items-center justify-center p-0.5">
              <Image
                src="/logo.png"
                alt="Edu IT Hub Academy"
                width={36}
                height={36}
                className="object-contain w-full h-full"
              />
            </div>
            <span className="font-extrabold font-heading text-base tracking-tight text-slate-900">
              Edu<span className="text-[var(--accent)]">IT</span>Hub
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Quick Bell */}
          <Link
            href={ROUTES.dashboardNotifications}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* User Avatar */}
          <Link
            href={ROUTES.dashboardProfile}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ring-2 ring-transparent hover:ring-[var(--accent)] transition-all"
          >
            {profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileImageUrl} alt={userName} className="h-full w-full object-cover" />
            ) : (
              <span className="font-bold text-xs text-[var(--accent)] font-heading">
                {initials(userName)}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* 2. Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-[280px] flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <span className="font-extrabold font-heading text-sm text-slate-900">
                  Student Portal
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderNavLinks(() => setDrawerOpen(false))}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-slate-100 p-4 space-y-2 bg-slate-50">
              <a
                href="https://wa.me/923363268833"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Help Desk WhatsApp</span>
                </span>
                <span className="text-[10px] font-mono font-bold">0336 3268833</span>
              </a>
              <LogoutButton />
            </div>
          </div>
        </div>
      )}

      {/* 3. Desktop Fixed Sleek Glass Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 xl:w-72 lg:flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-xl">
        
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link href={ROUTES.dashboard} className="flex items-center gap-3 group">
            <div className="relative h-11 w-11 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md shadow-slate-200/50 transition-transform group-hover:scale-105 shrink-0 flex items-center justify-center p-0.5">
              <Image
                src="/logo.png"
                alt="Edu IT Hub Academy"
                width={44}
                height={44}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold font-heading text-lg tracking-tight leading-none text-slate-900">
                Edu<span className="text-[var(--accent)]">IT</span>Hub
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--accent2)] mt-1">
                Student LMS Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Student Mini Profile Card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/60 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xs">
              {profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImageUrl} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <span className="font-extrabold text-sm text-[var(--accent)] font-heading">
                  {initials(userName)}
                </span>
              )}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-xs font-bold text-slate-900 font-heading">
                {userName}
              </h4>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span className="text-[10px] font-medium text-emerald-700">Enrolled Student</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Groups List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          {renderNavLinks()}
        </div>

        {/* Bottom Support & Logout Section */}
        <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/70">
          <a
            href="https://wa.me/923363268833"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl bg-white border border-emerald-200/80 p-2.5 text-xs text-slate-700 hover:border-emerald-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <span className="block text-[11px] font-bold text-slate-900 group-hover:text-emerald-700">WhatsApp Help</span>
                <span className="block text-[10px] font-mono text-slate-500">0336 3268833</span>
              </div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600" />
          </a>

          <div className="pt-1">
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
