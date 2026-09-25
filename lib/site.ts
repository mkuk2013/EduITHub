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

/** Published courses for catalog / home sections. */
export const getPublishedCourses = cache(async (): Promise<PublicCourseCard[]> => {
  return prisma.course.findMany({
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
