import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://eduitubacademy.example").replace(
  /\/$/,
  "",
);

const STATIC_ROUTES = ["/", "/courses", "/about", "/contact", "/faq", "/login", "/register"];

/**
 * Sitemap: static public routes + every published course.
 * The DB read is wrapped in try/catch so a build without a migrated
 * database still succeeds (static routes only).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));

  try {
    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    for (const course of courses) {
      entries.push({
        url: `${SITE_URL}/courses/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  } catch (error) {
    console.warn("[sitemap] database unavailable, emitting static routes only", error);
  }

  return entries;
}
