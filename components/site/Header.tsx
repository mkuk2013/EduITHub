"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  GraduationCap, 
  LogIn, 
  Menu, 
  UserPlus, 
  X, 
  BookOpen, 
  Info, 
  HelpCircle, 
  PhoneCall, 
  ArrowRight
} from "lucide-react";
import { BRAND, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: ROUTES.home, icon: GraduationCap },
  { label: "Courses", href: ROUTES.courses, icon: BookOpen },
  { label: "About Us", href: ROUTES.about, icon: Info },
  { label: "FAQs", href: ROUTES.faq, icon: HelpCircle },
  { label: "Contact", href: ROUTES.contact, icon: PhoneCall },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {/* Top Announcement Bar — Minimal, Clean, Dark Navy */}
      <aside aria-label="Announcement" className="relative z-50 bg-[#030923] text-white text-xs border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent2-light)] px-2.5 py-0.5 font-bold font-mono text-[10px] text-[var(--accent2)] uppercase tracking-wider shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent2)] animate-pulse" />
              Batch 2026
            </span>
            <span className="text-slate-300 font-sans text-xs truncate">
              Live Interactive Online Classes • 1st Session 2026 Admissions Open
            </span>
          </div>
          <Link
            href={ROUTES.register}
            className="group inline-flex items-center gap-1 font-bold text-[var(--accent-light)] hover:text-white transition-colors text-xs font-heading shrink-0"
          >
            <span>Reserve Seat</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </aside>

      {/* Main Sticky Glass Navigation */}
      <header className={cn("site-navbar transition-all duration-300", scrolled && "shadow-sm")}>
        <nav
          aria-label="Main navigation"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4"
        >
          {/* Logo & Brand Identity */}
          <Link
            href={ROUTES.home}
            className="group flex items-center gap-2.5 sm:gap-3 rounded-lg focus-visible:outline-none shrink-0"
            aria-label={`${BRAND.name} — home`}
          >
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Edu IT Hub Academy Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div className="inline-flex flex-col">
              <span className="font-extrabold font-heading text-lg sm:text-xl tracking-tight leading-none block">
                <span className="text-[var(--accent)] font-heading">Edu</span>
                <span className="text-[var(--accent2)] font-heading">IT</span>
                <span className="text-slate-900 font-heading">Hub</span>
              </span>
              <span className="mt-0.5 text-[8px] sm:text-[9px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--accent2)] leading-none">
                ONLINE ACADEMY
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === ROUTES.home ? pathname === ROUTES.home : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg transition-all font-medium text-xs",
                      active
                        ? "text-[var(--accent)] font-bold bg-[var(--accent-light)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-subtle)]"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Action Section */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Admissions Status Badge (Desktop) */}
            <Link
              href={ROUTES.register}
              className="hidden lg:inline-flex items-center gap-2 rounded-full bg-emerald-50/90 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200/80 shadow-xs hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200 group/admissions"
              title="New Batch Admissions Active — Click to Register"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold font-mono tracking-tight text-emerald-900">
                Admissions Active
              </span>
              <span className="rounded-md bg-emerald-600/10 px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase text-emerald-700 tracking-wider">
                Batch 2026
              </span>
            </Link>

            {/* Login button (Desktop/Tablet) */}
            <Link
              href={ROUTES.login}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Login</span>
            </Link>

            {/* Join Academy Action Button */}
            <Link
              href={ROUTES.register}
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl transition-all shadow-sm hover:-translate-y-0.5 font-heading cursor-pointer whitespace-nowrap"
            >
              Join Academy
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] md:hidden cursor-pointer"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Slide-Down Menu Overlay */}
        {menuOpen && (
          <div className="border-b border-[var(--border)] bg-white/98 backdrop-blur-2xl px-5 pt-3 pb-6 md:hidden shadow-xl rounded-b-3xl animate-in slide-in-from-top-2 duration-200">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === ROUTES.home ? pathname === ROUTES.home : pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                        active
                          ? "bg-[var(--accent-light)] text-[var(--accent)] font-bold"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-[var(--accent)]" : "text-slate-400")} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4">
              <Link
                href={ROUTES.login}
                onClick={() => setMenuOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              >
                <LogIn className="h-4 w-4" />
                <span>Student Login</span>
              </Link>
              <Link
                href={ROUTES.register}
                onClick={() => setMenuOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-xs font-bold text-white shadow-sm font-heading"
              >
                <UserPlus className="h-4 w-4" />
                <span>Join Academy</span>
              </Link>
            </div>

            {/* Quick Contact Bar in Mobile Menu */}
            <div className="mt-3 flex items-center gap-2">
              <a
                href="https://wa.me/923363268833"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors hover:bg-emerald-100"
              >
                <span>WhatsApp: 0336 3268833</span>
              </a>
              <a
                href="tel:03363268833"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] font-bold text-xs border border-[var(--accent)]/20 transition-colors hover:bg-[var(--accent)]/15"
              >
                <span>Call / SMS</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
