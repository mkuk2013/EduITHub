import Link from "next/link";
import {
  ArrowRight,
  Code2,
  GraduationCap,
  LayoutGrid,
  Quote,
  UserPlus,
  Video,
  Wallet,
  Award,
  Clock,
  Zap,
  HelpCircle,
  Star,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Handshake,
  Check
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { buildSiteMetadata } from "@/lib/seo";
import { getPublishedCourses, getTestimonials } from "@/lib/site";
import { Hero } from "@/components/site/Hero";
import { CourseInteractiveCatalog } from "@/components/site/CourseInteractiveCatalog";

export const metadata = buildSiteMetadata({
  title: "Learn Practical IT Skills Online",
  description:
    "Edu IT Hub Academy — learn practical and modern IT skills through live online courses delivered by qualified and experienced instructors.",
  path: "/",
});

// Cache on Vercel's global edge network for instant loading, revalidating in background every 2 minutes
export const revalidate = 120;

const BENTO_FEATURES = [
  {
    icon: Video,
    color: "text-[var(--accent)] bg-[var(--accent-light)]",
    badge: "100% Live",
    title: "Live Interactive Video Classes",
    text: "Join daily live classes on Google Meet where you can screen-share, ask questions, and code together in real-time with instructors.",
  },
  {
    icon: Wallet,
    color: "text-[var(--accent2)] bg-[var(--accent2-light)]",
    badge: "Flexible",
    title: "Month-to-Month Tuition",
    text: "No hefty upfront admissions or lock-ins. Enjoy transparent monthly installments with seamless digital verification.",
  },
  {
    icon: Code2,
    color: "text-[var(--accent)] bg-[var(--accent-light)]",
    badge: "Real Work",
    title: "Portfolio & Project-Based Curriculum",
    text: "Build real-world client websites, AI chatbots, branding kits, and marketing campaigns to showcase to employers.",
  },
  {
    icon: Award,
    color: "text-[var(--warning)] bg-[var(--warning-light)]",
    badge: "Certified",
    title: "Verified Academy Certification",
    text: "Receive an official Certificate of Completion backed by Edu IT Hub Academy and Super Sys-Tech Computers Centre Umerkot.",
  },
];

const STREAMLINED_STEPS = [
  {
    step: "01",
    icon: LayoutGrid,
    title: "Select Your Course",
    text: "Explore our catalog of 11+ high-demand IT courses including Web Development, AI, Graphic Design, Video Editing and SEO.",
  },
  {
    step: "02",
    icon: UserPlus,
    title: "Quick Registration",
    text: "Create your student account in under 60 seconds with your basic contact information.",
  },
  {
    step: "03",
    icon: CreditCard,
    title: "Enrollment & Verification",
    text: "Complete your course enrollment via Easypaisa, JazzCash, or Bank and submit proof for instant access.",
  },
  {
    step: "04",
    icon: Video,
    title: "Join Live Classes",
    text: "Once verified, your dashboard unlocks with daily live meeting links, recordings, and syllabus materials.",
  },
];

const FAQ_PREVIEW = [
  {
    q: "Are the classes live or recorded?",
    a: "All classes are taught live online by qualified instructors, allowing you to ask questions in real-time, get code reviews, and solve doubts.",
  },
  {
    q: "How do I pay my monthly fee?",
    a: "You can easily pay via Easypaisa, JazzCash, or direct bank transfer, and upload your payment proof screenshot in your student portal for quick admin verification.",
  },
  {
    q: "How do I join a live class?",
    a: "Once your enrollment is approved, the private Google Meet / class link appears directly in your student course dashboard before class begins.",
  },
  {
    q: "What equipment do I need to attend?",
    a: "All you need is a basic computer/laptop and a stable internet connection. Instructors guide you through installing all free software tools during class.",
  },
  {
    q: "Will I get a verified certificate?",
    a: "Yes! Upon successfully completing the course project and attendance criteria, you receive an official verified Certificate of Completion from Edu IT Hub Academy and Super Sys-Tech Computers Centre.",
  },
  {
    q: "Can I switch courses or enroll in multiple courses?",
    a: "Yes, you can enroll in multiple IT courses simultaneously or request a course transfer from your student dashboard at any time.",
  }
];

export default async function HomePage() {
  const [courses, testimonials] = await Promise.all([
    getPublishedCourses(),
    getTestimonials(),
  ]);

  return (
    <div className="space-y-14 sm:space-y-20 pb-16">
      
      {/* 1. Hero Section */}
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">

        {/* 2. Callout Banner ("Ready to start learning?") */}
        <section aria-label="Admissions Banner" className="rounded-2xl sm:rounded-3xl overflow-hidden border border-[var(--border)] bg-gradient-to-br from-[var(--bg-subtle)] via-[var(--bg-card)] to-[var(--accent-light)]/25 p-5 sm:p-8 lg:p-10 shadow-xs">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="space-y-2.5 sm:space-y-3 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent2-light)] border border-[var(--accent2)]/30 text-[var(--accent2)] text-[10px] font-bold uppercase tracking-wider font-mono">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Admissions Open 2026 • Live Evening Batches</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-[var(--text-primary)] tracking-tight">
                Ready to start your practical IT journey?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
                Explore our 11+ live evening IT courses and join <strong className="text-[var(--text-primary)]">1st Session 2026</strong> with qualified Pakistani instructors.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
              <Link
                href={ROUTES.courses}
                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold px-7 py-3.5 rounded-xl transition-all text-xs sm:text-sm shadow-sm hover:-translate-y-0.5 font-heading text-center"
              >
                Explore Courses
              </Link>
              <Link
                href={ROUTES.register}
                className="bg-white border-2 border-[var(--border-strong)] hover:border-[var(--accent)] text-[var(--text-primary)] hover:text-[var(--accent)] font-bold px-7 py-3.5 rounded-xl transition-all text-xs sm:text-sm font-heading text-center"
              >
                Register Now
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Stepwise Onboarding Journey (4-Card Process) */}
        <section aria-labelledby="steps-heading">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider font-heading">
              Simple 4-Step Process
            </span>
            <h2 id="steps-heading" className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-primary)] mt-1.5">
              Stepwise Onboarding Journey
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">
              Connecting motivated students with qualified live IT mentors seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {STREAMLINED_STEPS.map(({ step, title, text, icon: StepIcon }) => (
              <div
                key={step}
                className="surface-card surface-card-interactive p-5 sm:p-6 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center font-bold">
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className="text-3xl sm:text-4xl font-extrabold font-heading text-[var(--accent-text)] opacity-40 leading-none tabular-nums">
                      {step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-heading mb-2">
                    {title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {text}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Step {step} Verified</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Section: Why Students Choose Edu IT Hub */}
        <section aria-labelledby="why-heading">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider font-heading">
              Built for career outcomes
            </span>
            <h2 id="why-heading" className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-primary)] mt-1.5">
              Why students learn with us
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">
              A focused live tech academy — interactive teaching, verified instructors, and an affordable monthly model.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {BENTO_FEATURES.map(({ icon: Icon, color, title, text, badge }) => (
              <div key={title} className="surface-card surface-card-interactive p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color} shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[var(--accent2)] font-mono mb-1">
                    {badge}
                  </span>
                  <h3 className="text-base font-bold font-heading text-[var(--text-primary)] mb-2">
                    {title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {text}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
                  <span>Edu IT Hub Standard</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Official Educational Partner Collaboration Highlight */}
        <section aria-label="Partner Collaboration" className="rounded-2xl sm:rounded-3xl surface-section p-5 sm:p-8 lg:p-9 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] shrink-0 shadow-xs">
                <Handshake className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent2)] font-mono block">
                  Official Educational Partner
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-heading text-[var(--text-primary)] mt-0.5">
                  Super Sys-Tech Computers Centre Umerkot
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed">
                  Bringing years of trusted computer training online. All diplomas, certificates, and credentials are fully verified.
                </p>
              </div>
            </div>
            <Link
              href={ROUTES.about}
              className="w-full md:w-auto bg-white border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] text-xs font-bold px-5 py-3 rounded-xl transition-all font-heading shrink-0 shadow-xs flex items-center justify-center gap-2"
            >
              <span>Read Collaboration Story</span>
              <ChevronRight className="w-4 h-4 text-[var(--accent)]" />
            </Link>
          </div>
        </section>

        {/* 6. Course Catalog Section (Edu IT Hub Curriculum Directory) */}
        <section aria-labelledby="courses-heading">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <span className="text-xs font-semibold text-[var(--accent2)] uppercase tracking-wider font-heading">
                Live Course Catalog
              </span>
              <h2 id="courses-heading" className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-primary)] mt-1.5">
                Explore Our Popular Live Courses
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Select a category to explore live evening batches, practical curriculums, and batch schedules.
              </p>
            </div>
            <Link
              href={ROUTES.courses}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] cursor-pointer self-start sm:self-auto font-heading"
            >
              <span>Browse Full Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <CourseInteractiveCatalog courses={courses} showSearch={true} />
        </section>

        {/* 7. Section: Learning Rhythm ("A clear learning rhythm") */}
        <section aria-labelledby="rhythm-heading">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider font-heading">
              Your week on Edu IT Hub
            </span>
            <h2 id="rhythm-heading" className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-primary)] mt-1.5">
              A clear learning rhythm
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">
              Show up, learn live on Google Meet, code hands-on, and submit projects — all in one student dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
            <div className="surface-card rounded-2xl p-5 sm:p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center mb-4 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)] mb-2">
                Join on Schedule
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Open your student portal, click Join Live Class, and enter Google Meet without WhatsApp link hunts.
              </p>
            </div>

            <div className="surface-card rounded-2xl p-5 sm:p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center mb-4 shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)] mb-2">
                Code &amp; Learn with Focus
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Qualified instructors code with you live, review your screen, and answer questions in real time.
              </p>
            </div>

            <div className="surface-card rounded-2xl p-5 sm:p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center mb-4 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)] mb-2">
                Build Projects &amp; Certify
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Submit assignments, build your client portfolio, and earn an official verified certificate.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Section: Student Voices ("What learners notice first") */}
        <section aria-labelledby="voices-heading">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <span className="text-xs font-semibold text-[var(--accent2)] uppercase tracking-wider font-heading">
                Student voices
              </span>
              <h2 id="voices-heading" className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-primary)] mt-1.5">
                What learners notice first
              </h2>
            </div>
            <Link
              href={ROUTES.about}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] cursor-pointer self-start sm:self-auto font-heading"
            >
              <span>Read all stories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.length > 0 ? (
              testimonials.slice(0, 3).map((t, idx) => (
                <blockquote key={idx} className="surface-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1 text-amber-500">
                        {[...Array(5)].map((_, s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <Quote className="w-5 h-5 text-[var(--accent)]/40" />
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed italic">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>
                  <footer className="mt-5 pt-4 border-t border-[var(--border)]">
                    <p className="text-sm font-bold font-heading text-[var(--text-primary)]">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {t.role}
                    </p>
                  </footer>
                </blockquote>
              ))
            ) : (
              [
                {
                  name: "Ali Raza",
                  role: "Web Dev Student · Umerkot",
                  text: "Sir Mukesh explains every concept with live practical examples. I built my first portfolio website in React within 3 weeks!",
                },
                {
                  name: "Kainat Shaikh",
                  role: "Graphic Design Student",
                  text: "The live classes are wonderful. We get instant feedback on our design assignments and great 1-on-1 mentor guidance.",
                },
                {
                  name: "Sunil Kumar",
                  role: "SEO & Content Marketing",
                  text: "Learned on-page SEO and keyword research with real websites. Now managing client blogs on Fiverr.",
                },
              ].map((sample, idx) => (
                <blockquote key={idx} className="surface-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1 text-amber-500">
                        {[...Array(5)].map((_, s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <Quote className="w-5 h-5 text-[var(--accent)]/40" />
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed italic">
                      &ldquo;{sample.text}&rdquo;
                    </p>
                  </div>
                  <footer className="mt-5 pt-4 border-t border-[var(--border)]">
                    <p className="text-sm font-bold font-heading text-[var(--text-primary)]">
                      {sample.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {sample.role}
                    </p>
                  </footer>
                </blockquote>
              ))
            )}
          </div>
        </section>

        {/* 9. Section: High-Conversion CTA ("Ready for your next session?") */}
        <section
          aria-labelledby="home-cta-heading"
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 text-center relative overflow-hidden border border-[var(--accent)]/20 shadow-md"
          style={{
            background: "linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 48%, var(--accent2-light) 100%)"
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 20%, rgba(0,89,255,0.12), transparent 45%), radial-gradient(circle at 80% 70%, rgba(5,150,105,0.12), transparent 40%)"
            }}
            aria-hidden="true"
          />
          <div className="relative max-w-2xl mx-auto space-y-4 sm:space-y-5">
            <h2 id="home-cta-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-[var(--text-primary)] tracking-tight">
              Ready for your first live class?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Explore 11+ courses, talk to an instructor, or register for the upcoming batch with flexible evening schedules.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href={ROUTES.register}
                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold px-7 py-3.5 rounded-xl transition-all text-xs sm:text-sm shadow-md shadow-[var(--accent)]/20 font-heading text-center"
              >
                Register Student Account
              </Link>
              <Link
                href={ROUTES.courses}
                className="bg-transparent text-[var(--accent)] border-2 border-[var(--accent)] hover:bg-[var(--accent-light)] font-bold px-7 py-3.5 rounded-xl transition-all text-xs sm:text-sm font-heading text-center"
              >
                Browse Course Catalog
              </Link>
              <Link
                href={ROUTES.contact}
                className="bg-white text-[var(--text-primary)] border border-[var(--border-strong)] hover:border-[var(--accent)]/40 font-bold px-7 py-3.5 rounded-xl transition-all text-xs sm:text-sm font-heading text-center shadow-xs"
              >
                Contact Academy
              </Link>
            </div>
          </div>
        </section>

        {/* 10. Curated Knowledge Base & FAQ (2-Column Grid) */}
        <section aria-labelledby="faq-heading" className="surface-section p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider font-heading">
              Got Questions?
            </span>
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-primary)] mt-1.5">
              Curated Knowledge Base &amp; FAQ
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Everything you need to know about our live classes, fees, and verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {FAQ_PREVIEW.map(({ q, a }, idx) => (
              <div key={idx} className="surface-card p-4 sm:p-5 rounded-xl sm:rounded-2xl">
                <h3 className="font-bold text-[var(--text-primary)] font-heading mb-2 flex items-start gap-2 text-sm sm:text-base">
                  <HelpCircle className="w-4 h-4 text-[var(--accent2)] shrink-0 mt-0.5" />
                  <span>{q}</span>
                </h3>
                <p className="text-[var(--text-muted)] text-xs pl-6 leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href={ROUTES.faq}
              className="text-xs sm:text-sm font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] cursor-pointer inline-flex items-center gap-1 font-heading"
            >
              <span>View all FAQs &amp; Help Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
