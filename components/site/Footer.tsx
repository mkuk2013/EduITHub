import Image from "next/image";
import Link from "next/link";
import { 
  GraduationCap, 
  Mail, 
  MapPin, 
  Phone, 
  Clock, 
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { BRAND, ROUTES } from "@/lib/constants";
import { getAcademyInfo, getPublishedCourses } from "@/lib/site";

const NAV_LINKS = [
  { label: "Home / Intro", href: ROUTES.home },
  { label: "Courses Catalog", href: ROUTES.courses },
  { label: "About Academy", href: ROUTES.about },
  { label: "Frequently Asked Questions", href: ROUTES.faq },
  { label: "Contact & Advisory", href: ROUTES.contact },
];

export async function Footer() {
  const [info, courses] = await Promise.all([getAcademyInfo(), getPublishedCourses()]);
  const year = new Date().getFullYear();

  return (
    <footer className="mx-3 sm:mx-6 lg:mx-8 xl:mx-auto max-w-7xl bg-gradient-to-br from-[#000000] via-[#030923] to-[#041A53] border border-white/10 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] pt-10 sm:pt-16 pb-10 sm:pb-12 mt-16 sm:mt-20 mb-8 sm:mb-12 text-xs font-semibold relative overflow-hidden transition-all duration-300 shadow-2xl">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-12 w-96 h-96 bg-[#0059FF]/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-[#0059FF]/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Top CTA Card inside footer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 relative z-10">
        <div className="surface-card-cta rounded-2xl sm:rounded-[24px] p-5 sm:p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 border-l-4 border-l-[var(--accent)] relative transition-all duration-300 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 rounded-[24px] border border-white/40 pointer-events-none" />
          <div className="text-center md:text-left space-y-2 relative z-[1]">
            <span className="inline-block bg-[var(--accent2-light)] text-[var(--accent2)] text-[10px] tracking-widest uppercase font-extrabold px-3 py-1 rounded-full font-mono border border-[var(--accent2)]/20">
              1st Session 2026 Admissions
            </span>
            <h4 className="text-xl sm:text-2xl font-black font-heading text-slate-900 leading-tight">
              Join Edu IT Hub Academy — Evening Batches
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-xl">
              11+ live online technology courses with qualified mentors, project-based portfolios, and verified academy certification.
            </p>
          </div>
          <Link
            href={ROUTES.register}
            className="relative z-[1] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold px-8 py-4 rounded-xl transition-all font-heading text-xs active:scale-95 whitespace-nowrap shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Register Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4-Column Footer Grid */}
      <div className="px-6 sm:px-10 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 text-left relative z-10">
        
        {/* Column 1: Brand & Official Partner */}
        <div className="space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-white border border-white/20 shadow-md shrink-0 flex items-center justify-center p-0.5">
                <Image
                  src="/logo.png"
                  alt="Edu IT Hub Academy Logo"
                  width={44}
                  height={44}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="inline-flex flex-col">
                <span className="font-extrabold font-heading text-xl tracking-tight leading-none text-white">
                  <span className="text-[var(--accent)]">Edu</span>
                  <span className="text-[var(--accent2)]">IT</span>Hub
                </span>
                <span className="text-[8px] font-mono text-[var(--accent2)] uppercase tracking-wider mt-0.5">
                  ONLINE ACADEMY
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              {info.tagline || "Practical live IT and AI online training academy. Delivering real-time classes for students and freelancers across Pakistan."}
            </p>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] text-slate-300">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Official Educational Partner:</span>
              <strong className="text-white block mt-0.5">Super Sys-Tech Computers Centre Umerkot</strong>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-3 items-center pt-2">
            <a
              href="https://wa.me/923363268833?text=Hi%20Edu%20IT%20Hub%20Academy"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-slate-300 hover:bg-[var(--accent)] hover:text-white transition-all duration-300 border border-white/5"
              title="WhatsApp: 03363268833"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href="tel:03363268833"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-slate-300 hover:bg-[var(--accent)] hover:text-white transition-all duration-300 border border-white/5"
              title="Call / SMS: 03363268833"
            >
              <Phone className="w-4 h-4" />
            </a>
            <a
              href="mailto:info@eduithub.academy"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-slate-300 hover:bg-[var(--accent)] hover:text-white transition-all duration-300 border border-white/5"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Column 2: Platform Navigation */}
        <div className="space-y-4">
          <h4 className="font-bold font-heading text-xs uppercase tracking-wider text-slate-100 border-l-4 border-[var(--accent)] pl-3">
            Platform Desk
          </h4>
          <ul className="space-y-3.5 text-[11px]">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-slate-300 hover:text-[var(--accent)] transition-colors group flex items-center gap-1.5 text-left font-medium"
                >
                  <span className="text-slate-500 font-bold block select-none">›</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Popular Live Courses */}
        <div className="space-y-4">
          <h4 className="font-bold font-heading text-xs uppercase tracking-wider text-slate-100 border-l-4 border-[var(--accent)] pl-3">
            Popular Live Courses
          </h4>
          <ul className="space-y-3.5 text-[11px]">
            {courses.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link
                  href={ROUTES.courseDetail(c.slug)}
                  className="text-slate-300 hover:text-[var(--accent)] transition-colors group flex items-center justify-between text-left font-medium"
                >
                  <span className="flex items-center gap-1.5 truncate pr-2">
                    <span className="text-slate-500 font-bold block select-none">›</span>
                    <span className="truncate">{c.title}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">Live</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Inbound Support & Details */}
        <div className="space-y-4">
          <h4 className="font-bold font-heading text-xs uppercase tracking-wider text-slate-100 border-l-4 border-[var(--accent)] pl-3">
            Inbound Support
          </h4>
          <ul className="space-y-3.5 text-[11px] text-slate-300">
            <li className="flex gap-2.5 items-start">
              <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-200">WhatsApp</span>
                <a href="https://wa.me/923363268833" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-[var(--accent)] transition-colors font-mono font-bold">
                  0336 3268833
                </a>
              </div>
            </li>
            <li className="flex gap-2.5 items-start">
              <Phone className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-200">Call / SMS</span>
                <a href="tel:03363268833" className="text-slate-300 hover:text-[var(--accent)] transition-colors font-mono font-bold">
                  0336 3268833
                </a>
              </div>
            </li>
            <li className="flex gap-2.5 items-start">
              <Mail className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-200">Email Admissions</span>
                <a href="mailto:info@eduithub.academy" className="text-slate-400 hover:text-[var(--accent)] transition-colors font-semibold underline decoration-dotted">
                  info@eduithub.academy
                </a>
              </div>
            </li>
            <li className="flex gap-2.5 items-start">
              <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-200">Campus Location</span>
                <span className="text-slate-400 text-[10px]">Umerkot, Sindh, Pakistan</span>
              </div>
            </li>
            <li className="flex gap-2.5 items-start">
              <Clock className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-200">Assistance Hours</span>
                <span className="text-slate-400 text-[10px]">Mon – Sat: 10 AM to 10 PM PKT</span>
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="px-6 sm:px-10 lg:px-12 border-t border-slate-800/80 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-slate-400 leading-relaxed font-sans transition-colors duration-300">
        <div>
          <span>
            © {year} <strong className="text-white">Edu IT Hub Academy</strong>. All rights reserved.
          </span>
        </div>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link href={ROUTES.faq} className="text-slate-300 hover:text-[var(--accent)] transition-colors">
            Admissions FAQ
          </Link>
          <span>·</span>
          <Link href={ROUTES.contact} className="text-slate-300 hover:text-[var(--accent)] transition-colors">
            Help Desk
          </Link>
          <span>·</span>
          <span className="text-slate-200 bg-[#0B0F19]/85 px-2.5 py-1 rounded-lg border border-slate-800 tracking-tight font-medium">
            Made in Pakistan 🇵🇰
          </span>
        </div>
      </div>
    </footer>
  );
}
