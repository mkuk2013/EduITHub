import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { BRAND, type SettingKey } from "@/lib/constants";

/**
 * Public-site data helpers. All reads only; never selects ClassSchedule.meetingUrl.
 */

/** Fetch the seeded settings as a lookup map (key -> value). */
export const getSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.setting.findMany({
    select: { key: true, value: true },
  });
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
});

export function setting(
  settings: Record<string, string>,
  key: SettingKey | "site.testimonials",
  fallback: string,
): string {
  const value = settings[key]?.trim();
  return value && value.length > 0 ? value : fallback;
}

export const getAcademyInfo = cache(async () => {
  const settings = await getSettings();
  return {
    name: setting(settings, "academy.name", BRAND.name),
    tagline: setting(settings, "academy.tagline", BRAND.tagline),
    collaboration: setting(settings, "academy.collaboration", BRAND.collaboration),
    email: setting(settings, "contact.email", "info@eduithub.academy"),
    phone: setting(settings, "contact.phone", "03363268833"),
    whatsapp: setting(settings, "contact.whatsapp", "03363268833"),
  };
});

export interface PublicCourseCard {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: string | null;
  monthlyFee: number;
  duration: string;
  mode: string;
}

const STATIC_COURSES: PublicCourseCard[] = [
  {
    id: "course-1",
    title: "Introduction to Operating System",
    slug: "introduction-to-operating-system",
    shortDescription: "Start your IT journey by understanding how computers actually work. Learn operating system concepts, file management, and computer maintenance.",
    thumbnail: null,
    monthlyFee: 1000,
    duration: "2 Months",
    mode: "Live Online",
  },
  {
    id: "course-2",
    title: "Full-Stack Development",
    slug: "full-stack-development",
    shortDescription: "Become a complete web developer. Master HTML, CSS, JavaScript, React, Next.js, Node.js, and PostgreSQL with real deployable projects.",
    thumbnail: null,
    monthlyFee: 1000,
    duration: "6 Months",
    mode: "Live Online",
  },
  {
    id: "course-3",
    title: "Office Automation & Productivity",
    slug: "office-automation-and-productivity",
    shortDescription: "Master MS Word, Excel, PowerPoint, Google Docs, and spreadsheet automation for everyday administrative and workplace excellence.",
    thumbnail: null,
    monthlyFee: 1000,
    duration: "3 Months",
    mode: "Live Online",
  },
  {
    id: "course-4",
    title: "Graphic Design & Branding",
    slug: "graphic-design-and-branding",
    shortDescription: "Create industry-standard visual identities, marketing collateral, social graphics, and UI layouts with Photoshop, Illustrator, and Figma.",
    thumbnail: null,
    monthlyFee: 1000,
    duration: "4 Months",
    mode: "Live Online",
  },
  {
    id: "course-5",
    title: "Video Editing & Post-Production",
    slug: "video-editing-and-post-production",
    shortDescription: "Turn raw footage into engaging videos with Premiere Pro and After Effects. Master pacing, motion graphics, audio mastering, and color grading.",
    thumbnail: null,
    monthlyFee: 1000,
    duration: "3 Months",
    mode: "Live Online",
  },
  {
    id: "course-6",
    title: "Digital Marketing & Social Media",
    slug: "digital-marketing-and-social-media",
    shortDescription: "Master paid advertising on Meta Ads, Google Ads, content marketing, and audience growth with analytics-driven campaign management.",
    thumbnail: null,
    monthlyFee: 1000,
    duration: "3 Months",
    mode: "Live Online",
  },
  {
    id: "course-7",
    title: "SEO & Content Strategy",
    slug: "seo-and-content-strategy",
    shortDescription: "Rank websites on Google first page. Master on-page, technical, off-page SEO, keyword research, and high-impact content strategies.",
    thumbnail: null,
    monthlyFee: 1000,
    duration: "2 Months",
    mode: "Live Online",
  },
  {
    id: "course-8",
    title: "Applied Artificial Intelligence",
    slug: "applied-artificial-intelligence",
    shortDescription: "Harness AI productivity, prompt engineering, LLM integrations, and modern AI tools to automate workflows and build intelligent solutions.",
    thumbnail: null,
    monthlyFee: 1000,
    duration: "3 Months",
    mode: "Live Online",
  },
  {
    id: "course-9",
    title: "Python for Beginners",
    slug: "python-for-beginners",
    shortDescription: "Learn Python from the ground up: syntax, data structures, algorithms, automation scripts, and practical problem-solving.",
    thumbnail: null,
    monthlyFee: 1000,
    duration: "2 Months",
    mode: "Live Online",
  },
  {
    id: "course-10",
    title: "WordPress & Freelancing",
    slug: "wordpress-and-freelancing",
    shortDescription: "Build dynamic websites, WooCommerce stores, and blogs with WordPress and Elementor, plus client hunting on Upwork and Fiverr.",
    thumbnail: null,
    monthlyFee: 1000,
    duration: "2 Months",
    mode: "Live Online",
  },
  {
    id: "course-11",
    title: "Cybersecurity Fundamentals",
    slug: "cybersecurity-and-ethical-hacking-fundamentals",
    shortDescription: "Learn network security, threat defense, ethical hacking concepts, and digital safety to protect modern online systems.",
    thumbnail: null,
    monthlyFee: 1000,
    duration: "3 Months",
    mode: "Live Online",
  },
];

/** Published courses for catalog / home sections with instant fallback. */
export const getPublishedCourses = cache(async (): Promise<PublicCourseCard[]> => {
  try {
    const fetchPromise = prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        thumbnail: true,
        monthlyFee: true,
        duration: true,
        mode: true,
      },
      orderBy: [{ createdAt: "desc" }, { title: "asc" }],
    });

    // 2-second timeout: never let Neon DB cold start block the user
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
    const result = await Promise.race([fetchPromise, timeoutPromise]);

    if (result && result.length > 0) {
      return result;
    }
    return STATIC_COURSES;
  } catch (error) {
    console.warn("[courses] database unavailable, serving static courses instantly", error);
    return STATIC_COURSES;
  }
});

/** Site-wide statistics — every number comes from the database. */
export const getSiteStats = cache(async () => {
  const [publishedCourses, approvedStudents, instructors, enrollments] = await Promise.all([
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { role: "STUDENT", status: "APPROVED" } }),
    prisma.instructor.count(),
    prisma.enrollment.count(),
  ]);
  return { publishedCourses, approvedStudents, instructors, enrollments };
});

export interface Testimonial {
  name: string;
  role: string;
  text: string;
}

/** Testimonials from the `site.testimonials` setting (JSON array). */
export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const row = await prisma.setting.findUnique({
    where: { key: "site.testimonials" },
    select: { value: true },
  });
  if (!row?.value) return [];
  try {
    const parsed: unknown = JSON.parse(row.value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is Testimonial =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { name?: unknown }).name === "string" &&
          typeof (item as { text?: unknown }).text === "string",
      )
      .map((item) => ({
        name: item.name,
        role: typeof item.role === "string" ? item.role : "Student",
        text: item.text,
      }));
  } catch {
    return [];
  }
});
