import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { buildSiteMetadata } from "@/lib/seo";
import { getAcademyInfo } from "@/lib/site";
import { FaqAccordion, type FaqItem } from "@/components/site/FaqAccordion";
import { Reveal } from "@/components/site/Reveal";

export const metadata = buildSiteMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about Edu IT Hub Academy — registration, fees, live online classes, schedules and more.",
  path: "/faq",
});

export const revalidate = 300;

const FAQS: FaqItem[] = [
  {
    q: "What is Edu IT Hub Academy?",
    a: "Edu IT Hub Academy is an online IT academy offering practical, live-taught courses in web development, programming, design, digital marketing and modern AI tools. We work in collaboration with Super Sys-Tech Computers Centre Umerkot.",
  },
  {
    q: "Are the classes live or recorded?",
    a: "Classes are taught live online by qualified, experienced instructors, so you can ask questions and get feedback in real time.",
  },
  {
    q: "How do I register?",
    a: "Click Register and create your free student account with your name, email and phone number. Our team reviews new accounts and approves them, after which you can choose a course and submit your first month's fee.",
  },
  {
    q: "How much are the fees and how do I pay?",
    a: "Fees are charged monthly per course and are shown on each course page. You can pay via Easypaisa, JazzCash or bank transfer, then submit your payment proof from the student dashboard. An administrator verifies the payment before your enrollment is activated.",
  },
  {
    q: "How do I join a live class?",
    a: "Once your enrollment is active, the class joining link appears inside your dashboard course workspace along with the class schedule.",
  },
  {
    q: "What are the class timings?",
    a: "Each course has its own schedule of class days and times, shown on the course page. Timings are in Pakistan time (Asia/Karachi) and are usually arranged in the evenings to fit around school or work.",
  },
  {
    q: "What do I need to attend classes?",
    a: "A computer or laptop and a stable internet connection are all you need. Your instructor will guide you through installing any required software in the first sessions.",
  },
  {
    q: "Who teaches the courses?",
    a: "Courses are taught by qualified, professional and experienced instructors — in collaboration with the instructors of Super Sys-Tech Computers Centre Umerkot.",
  },
  {
    q: "What happens if I miss a live class?",
    a: "Contact your instructor or the academy team as soon as possible and they will help you catch up on what you missed.",
  },
  {
    q: "How can I contact the academy?",
    a: "Use the contact form on the Contact page, or reach us through the email and phone number listed there. We reply to every genuine message.",
  },
];

export default async function FaqPage() {
  const info = await getAcademyInfo();
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">FAQ</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Everything you need to know about learning with {info.name}.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <FaqAccordion items={FAQS} />
        </Reveal>

        <Reveal className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 text-center sm:p-8">
          <h2 className="text-lg font-bold text-slate-950">Still have a question?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Send us a message and our team will get back to you.
          </p>
          <Link
            href={ROUTES.contact}
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-indigo-700 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            Contact us
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
