import type { Metadata } from "next";
import { BRAND } from "./constants";

const SITE_NAME = BRAND.name;

/**
 * Shared metadata builder for public pages.
 *
 * Usage:
 *   export const metadata = buildSiteMetadata({
 *     title: "Courses",
 *     description: "...",
 *     path: "/courses",
 *   });
 */
export function buildSiteMetadata({
  title,
  description,
  path = "/",
  type = "website",
}: {
  /** Page title — the root layout's template appends ` | Edu IT Hub Academy`. */
  title?: string;
  description?: string;
  /** Absolute path of the page, used for canonical + OG URLs. */
  path?: string;
  type?: "website" | "article";
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const desc =
    description ??
    "Edu IT Hub Academy — practical, live online IT courses in web development, programming, design, marketing and AI, taught by experienced instructors.";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://eduitubacademy.example").replace(/\/$/, "");
  const url = `${siteUrl}${path}`;

  return {
    title: title ?? { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title: fullTitle,
      description: desc,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
    },
  };
}
