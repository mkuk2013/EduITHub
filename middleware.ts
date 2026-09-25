import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

/**
 * Route protection for Edu IT Hub Academy (auth workstream).
 *
 * - Public: /, /courses*, /about, /contact, /faq, /login, /register,
 *   /api/health, /api/auth/*, sitemap/robots, static assets.
 * - /pending-approval and /blocked require a session (any status).
 * - /dashboard/* requires STUDENT + APPROVED (admins → /admin,
 *   other statuses → their status page).
 * - /admin/* requires ADMIN + APPROVED.
 * - Other /api/* routes require a session (401 JSON); feature routes
 *   additionally enforce requireStudent()/requireAdmin() themselves.
 *
 * Role/status always come from the server-issued JWT session — never from
 * client input.
 */

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

function statusPath(status: SessionUser["status"]): string {
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

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // --- Public pages -------------------------------------------------------
  if (isPublicPath(pathname)) {
    // Signed-in users have no business on the auth pages.
    if ((pathname === ROUTES.login || pathname === ROUTES.register) && user) {
      if (user.status === "APPROVED") {
        const dest = user.role === "ADMIN" ? ROUTES.admin : ROUTES.dashboard;
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

  // --- Student area --------------------------------------------------------
  if (startsWithPath(pathname, ROUTES.dashboard)) {
    if (!user) return loginRedirect(req, pathname);
    if (user.role === "ADMIN") {
      return NextResponse.redirect(new URL(ROUTES.admin, req.url));
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
});

export const config = {
  matcher: [
    // Run on everything except Next.js internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
