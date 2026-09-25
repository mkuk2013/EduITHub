import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ROUTES } from "@/lib/constants";

/**
 * Route protection for Edu IT Hub Academy (Edge-optimized).
 *
 * Uses `getToken` directly from `next-auth/jwt` to inspect server-signed JWTs
 * without bundling `@prisma/client`, `bcryptjs`, or heavy server engines into
 * the Edge Middleware function. This keeps the Edge bundle under 100 KB
 * (well below Vercel's 1 MB limit).
 */

type UserRole = "ADMIN" | "STUDENT" | "INSTRUCTOR";
type UserStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "SUSPENDED";

interface MiddlewareUser {
  id: string;
  role: UserRole;
  status: UserStatus;
}

const EXACT_PUBLIC_PATHS = new Set([
  ROUTES.home,
  ROUTES.about,
  ROUTES.contact,
  ROUTES.faq,
  ROUTES.login,
  ROUTES.register,
  "/sitemap.xml",
  "/robots.txt",
]);

const PREFIX_PUBLIC_PATHS = [ROUTES.courses, "/api/auth", "/api/health"];

function isPublicPath(pathname: string): boolean {
  if (EXACT_PUBLIC_PATHS.has(pathname)) return true;
  return PREFIX_PUBLIC_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function statusPath(status: UserStatus): string {
  return status === "PENDING_APPROVAL" ? ROUTES.pendingApproval : ROUTES.blocked;
}

function loginRedirect(req: NextRequest, pathname: string): NextResponse {
  const url = new URL(ROUTES.login, req.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

function startsWithPath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  // Retrieve token using both secure (HTTPS/Vercel) and non-secure cookie prefixes
  const token =
    (await getToken({ req, secret, secureCookie: true })) ||
    (await getToken({ req, secret, secureCookie: false }));

  const user: MiddlewareUser | null =
    token?.id && token?.role && token?.status
      ? {
          id: token.id as string,
          role: token.role as UserRole,
          status: token.status as UserStatus,
        }
      : null;

  // --- Public pages -------------------------------------------------------
  if (isPublicPath(pathname)) {
    // Signed-in users have no business on the auth pages.
    if ((pathname === ROUTES.login || pathname === ROUTES.register) && user) {
      if (user.status === "APPROVED") {
        const dest =
          user.role === "ADMIN"
            ? ROUTES.admin
            : user.role === "INSTRUCTOR"
            ? ROUTES.instructor
            : ROUTES.dashboard;
        return NextResponse.redirect(new URL(dest, req.url));
      }
      return NextResponse.redirect(new URL(statusPath(user.status), req.url));
    }
    return NextResponse.next();
  }

  // --- Status pages: any signed-in user may view them ----------------------
  if (pathname === ROUTES.pendingApproval || pathname === ROUTES.blocked) {
    if (!user) return loginRedirect(req, pathname);
    return NextResponse.next();
  }

  // --- Instructor area -----------------------------------------------------
  if (startsWithPath(pathname, ROUTES.instructor)) {
    if (!user) return loginRedirect(req, pathname);
    if (user.role === "STUDENT") {
      return NextResponse.redirect(new URL(ROUTES.dashboard, req.url));
    }
    if ((user.role !== "INSTRUCTOR" && user.role !== "ADMIN") || user.status !== "APPROVED") {
      return NextResponse.redirect(new URL(statusPath(user.status), req.url));
    }
    return NextResponse.next();
  }

  // --- Student area --------------------------------------------------------
  if (startsWithPath(pathname, ROUTES.dashboard)) {
    if (!user) return loginRedirect(req, pathname);
    if (user.role === "ADMIN") {
      return NextResponse.redirect(new URL(ROUTES.admin, req.url));
    }
    if (user.role === "INSTRUCTOR") {
      return NextResponse.redirect(new URL(ROUTES.instructor, req.url));
    }
    if (user.role !== "STUDENT" || user.status !== "APPROVED") {
      return NextResponse.redirect(new URL(statusPath(user.status), req.url));
    }
    return NextResponse.next();
  }

  // --- Admin area ----------------------------------------------------------
  if (startsWithPath(pathname, ROUTES.admin)) {
    if (!user) return loginRedirect(req, pathname);
    if (user.role !== "ADMIN" || user.status !== "APPROVED") {
      if (user.role === "INSTRUCTOR" && user.status === "APPROVED") {
        return NextResponse.redirect(new URL(ROUTES.instructor, req.url));
      }
      if (user.role === "STUDENT" && user.status === "APPROVED") {
        return NextResponse.redirect(new URL(ROUTES.dashboard, req.url));
      }
      return NextResponse.redirect(new URL(statusPath(user.status), req.url));
    }
    return NextResponse.next();
  }

  // --- API backstop (feature routes enforce their own authz gates) ---------
  if (pathname.startsWith("/api/")) {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except Next.js internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
