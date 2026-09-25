import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { buildSiteMetadata } from "@/lib/seo";
import { getAcademyInfo } from "@/lib/site";
import { ContactForm } from "@/components/site/ContactForm";
import { Reveal } from "@/components/site/Reveal";

export const metadata = buildSiteMetadata({
  title: "Contact Us",
  description:
    "Contact Edu IT Hub Academy — send us a message about courses, fees, admissions or anything else. We reply to every genuine message.",
  path: "/contact",
});

export const revalidate = 300;

export default async function ContactPage() {
  const info = await getAcademyInfo();
  const whatsappLink = info.whatsapp
    ? `https://wa.me/${info.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Contact</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Get in touch
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Questions about courses, fees or admissions? Send us a message — our team replies to
            every genuine inquiry.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-slate-950">Send us a message</h2>
              <p className="mt-1 text-sm text-slate-500">
                Fill in the form below and we will get back to you soon.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <aside className="space-y-4" aria-label="Contact information">
              <div className="rounded-2xl bg-slate-950 p-6 text-slate-300 sm:p-7">
                <h2 className="text-lg font-bold text-white">Contact information</h2>
                <ul className="mt-5 space-y-4 text-sm">
                  {info.email && (
                    <li className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
                      <span>
                        <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                          Email
                        </span>
                        <a
                          href={`mailto:${info.email}`}
                          className="break-all font-medium text-white transition-colors hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
                        >
                          {info.email}
                        </a>
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
                    <span>
                      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                        Phone / Call &amp; SMS
                      </span>
                      <a
                        href="tel:03363268833"
                        className="font-medium text-white transition-colors hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm font-mono"
                      >
                        0336 3268833
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                    <span>
                      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                        WhatsApp
                      </span>
                      <a
                        href={whatsappLink || "https://wa.me/923363268833"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-white transition-colors hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm font-mono"
                      >
                        0336 3268833
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
                    <span>
                      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                        Location
                      </span>
                      <span className="font-medium text-white">Umerkot, Sindh, Pakistan</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
                    <span>
                      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                        Classes
                      </span>
                      <span className="font-medium text-white">Online — Pakistan time (Asia/Karachi)</span>
                    </span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6">
                <h2 className="text-sm font-bold text-slate-950">Prefer to talk first?</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  Call or message us on WhatsApp during working hours and we will help you choose
                  the right course.
                </p>
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
