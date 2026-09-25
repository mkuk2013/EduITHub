import Link from "next/link";
import {
  ArrowRight,
  Code2,
  GraduationCap,
  Handshake,
  MonitorSmartphone,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { buildSiteMetadata } from "@/lib/seo";
import { getAcademyInfo } from "@/lib/site";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading, SectionShell } from "@/components/site/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = buildSiteMetadata({
  title: "About Us",
  description:
    "About Edu IT Hub Academy — an online IT academy offering practical, live-taught courses in collaboration with Super Sys-Tech Computers Centre Umerkot.",
  path: "/about",
});

const VALUES = [
  {
    icon: Code2,
    title: "Practical first",
    text: "Every concept is taught through hands-on practice and real projects, so skills stick.",
  },
  {
    icon: Users,
    title: "Student success",
    text: "Small, focused classes where instructors know you by name and track your progress.",
  },
  {
    icon: Wallet,
    title: "Affordable access",
    text: "Monthly fees kept within reach, because talent is everywhere — opportunity should be too.",
  },
  {
    icon: Target,
    title: "Career focus",
    text: "Skills chosen for their real-world demand, from freelancing to full-time IT careers.",
  },
];

export default async function AboutPage() {
  const info = await getAcademyInfo();

  return (
    <div className="bg-white">
      {/* Page hero */}
      <div className="bg-brand-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">About us</p>
            <h1 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              {info.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
              {info.tagline}
            </p>
          </Reveal>
        </div>
      </div>

      {/* Story */}
      <SectionShell>
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
              Who we are
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-slate-600">
              <p>
                {info.name} is an online IT academy built on a simple belief: practical skills
                change lives. We offer live online courses in web development, programming,
                design, digital marketing and modern AI tools — taught by qualified and
                experienced instructors who care about your progress.
              </p>
              <p>
                Instead of recorded videos you watch alone, you learn in live classes where you
                can ask questions, get feedback on your work, and build real projects for your
                portfolio. Our monthly fee model keeps quality education affordable, and our
                evening schedules are designed to fit around school, college or work.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 sm:p-8">
              <Handshake className="h-8 w-8 text-indigo-700" aria-hidden="true" />
              <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-950">
                Our collaboration
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{info.collaboration}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Together with <strong>Super Sys-Tech Computers Centre Umerkot</strong>, we bring
                together talented IT students and highly qualified, professional and experienced
                instructors — combining strong teaching with a practical, career-focused
                curriculum.
              </p>
            </div>
          </Reveal>
        </div>
      </SectionShell>

      {/* Mission + stats strip */}
      <section aria-label="Our mission" className="bg-slate-950 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                Our mission
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Practical IT skills for everyone
              </h2>
              <p className="mt-4 leading-relaxed text-slate-300">
                We exist to make job-ready IT education accessible — live teaching, honest
                pricing, and a clear path from your first lesson to real, paid work in
                technology.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: MonitorSmartphone, label: "100% online" },
                  { icon: GraduationCap, label: "Expert instructors" },
                  { icon: Code2, label: "Project-based" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-center"
                  >
                    <Icon className="h-6 w-6 text-amber-400" aria-hidden="true" />
                    <span className="text-xs font-semibold text-slate-200">{label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <SectionShell className="bg-slate-50">
        <SectionHeading
          eyebrow="What we stand for"
          title="Our values"
          description="The principles behind every course we teach."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={(i % 4) * 0.08}>
              <Card className="h-full">
                <CardContent className="flex flex-col gap-3 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/20 text-amber-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-bold text-slate-950">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{text}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link
            href={ROUTES.courses}
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-indigo-700 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            Browse courses
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Reveal>
      </SectionShell>
    </div>
  );
}
