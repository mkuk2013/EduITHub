"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { LogOut, GraduationCap, ExternalLink, Calendar, Users, Video } from "lucide-react";
import { ROUTES } from "@/lib/constants";

interface InstructorHeaderProps {
  instructorName: string;
  instructorEmail: string;
  totalCourses: number;
}

export function InstructorHeader({
  instructorName,
  instructorEmail,
  totalCourses,
}: InstructorHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Portal Badge */}
        <div className="flex items-center gap-3">
          <Link href="/instructor" className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 shrink-0">
              <Image
                src="/logo.png"
                alt="Edu IT Hub Academy"
                fill
                sizes="36px"
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:inline-flex flex-col">
              <span className="font-extrabold font-heading text-base tracking-tight leading-none">
                <span className="text-indigo-600">Edu</span>
                <span className="text-amber-500">IT</span>
                <span className="text-slate-900">Hub</span>
              </span>
              <span className="text-[8px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
                INSTRUCTOR PORTAL
              </span>
            </div>
          </Link>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold font-mono">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Faculty Dashboard</span>
          </span>
        </div>

        {/* Right side Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900">{instructorName}</span>
            <span className="text-[10px] text-slate-500 font-mono">{instructorEmail}</span>
          </div>

          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {instructorName.charAt(0).toUpperCase()}
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: ROUTES.login })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
