import NextAuth, { AuthError } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";
import { ROUTES } from "@/lib/constants";
import type { UserRole, UserStatus } from "@prisma/client";

/**
 * Auth.js v5 (next-auth 5.0.0-beta.32) setup for Edu IT Hub Academy.
 *
 * - Credentials provider only (email + password, bcrypt-hashed in Postgres).
 * - JWT session strategy; the JWT carries id/role/status so every server
 *   context can authorize without a DB round-trip.
 * - Login itself always succeeds for existing users regardless of status;
 *   `requireStudent()` / `requireAdmin()` / middleware enforce routing for
 *   PENDING_APPROVAL / REJECTED / SUSPENDED accounts.
 *
 * Edge-safety: this module is imported by `middleware.ts` (edge runtime), so
 * Node-only dependencies (Prisma, bcryptjs, next/navigation) are loaded via
 * dynamic `import()` exactly where they are needed and never at module top
 * level.
 */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
  interface User {
    role: UserRole;
    status: UserStatus;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
  }
}

/**
 * Thrown from `authorize()` when the login rate limit is exceeded.
 * Extends AuthError so it propagates through Auth.js's `raw` server-action
 * flow and can be caught (and distinguished from bad credentials) in
 * `loginUser`.
 */
export class RateLimitExceededError extends AuthError {
  constructor() {
    super("Too many login attempts. Please try again later.");
  }
}

/** 5 login attempts per 10 minutes, keyed by email + client IP. */
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

/** Precomputed bcrypt hash (of "dummy-password-never-used") used for a dummy
 *  compare on unknown emails, so response timing does not reveal whether an
 *  email is registered. */
const DUMMY_HASH =
  "$2b$12$ey7IX52wyYMcmrflurDDZeU2givebsaxDMmCOMdf9sJ6xYXdn1MgO";

function clientIp(request: Request | undefined): string {
  const forwarded = request?.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request?.headers.get("x-real-ip")?.trim() || "unknown";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Trust X-Forwarded-* headers (the app may run behind a proxy).
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: ROUTES.login,
    error: ROUTES.login,
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        // 1. Validate shape with the shared zod schema.
        const parsed = loginSchema.safeParse(credentials ?? {});
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // 2. Rate-limit: 5 attempts / 10 min per email + IP.
        const rl = checkRateLimit(
          `login:${email}:${clientIp(request)}`,
          LOGIN_LIMIT,
          LOGIN_WINDOW_MS,
        );
        if (!rl.allowed) throw new RateLimitExceededError();

        // 3. Fetch the user (dynamic import keeps middleware's edge bundle lean).
        const { prisma } = await import("@/lib/prisma");
        const { default: bcrypt } = await import("bcryptjs");
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true,
            status: true,
          },
        });

        // 4. Compare the password hash. A dummy compare for unknown emails
        //    keeps timing uniform (does not leak account existence).
        const matches = user
          ? await bcrypt.compare(password, user.passwordHash)
          : await bcrypt.compare(password, DUMMY_HASH).then(() => false);
        if (!user || !matches) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, persist the identity claims in the JWT.
      if (user?.id) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the server-issued claims on session.user. Never trust
      // client-supplied role/status — these come from the signed JWT.
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
        session.user.role = token.role;
        session.user.status = token.status;
      }
      return session;
    },
  },
});

/** Current signed-in user, or null for anonymous visitors. Never throws. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const u = session?.user;
  if (!u?.id || !u.role || !u.status) return null;
  return {
    id: u.id,
    name: u.name ?? "",
    email: u.email ?? "",
    role: u.role,
    status: u.status,
  };
}

/** `redirect()` loaded lazily so this module stays edge-safe for middleware. */
async function redirectTo(path: string): Promise<never> {
  const { redirect } = await import("next/navigation");
  return redirect(path);
}

function statusPath(status: UserStatus): string {
  return status === "PENDING_APPROVAL" ? ROUTES.pendingApproval : ROUTES.blocked;
}

/**
 * Use at the top of any authenticated server action / page / route handler.
 * Redirects to /login when unauthenticated. Returns the session user.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) return redirectTo(ROUTES.login);
  return user;
}

/**
 * Use at the top of every student-only server action / page / route.
 * Redirects unless the user is signed in AND role === "STUDENT"
 * AND status === "APPROVED". Returns the session user.
 */
export async function requireStudent(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) return redirectTo(ROUTES.login);
  if (user.role === "ADMIN") return redirectTo(ROUTES.admin);
  if (user.role !== "STUDENT" || user.status !== "APPROVED") {
    return redirectTo(statusPath(user.status));
  }
  return user;
}

/**
 * Use at the top of every admin-only server action / page / route.
 * Redirects unless the user is signed in AND role === "ADMIN"
 * AND status === "APPROVED". Returns the session user.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) return redirectTo(ROUTES.login);
  if (user.role !== "ADMIN" || user.status !== "APPROVED") {
    if (user.role === "STUDENT" && user.status === "APPROVED") {
      return redirectTo(ROUTES.dashboard);
    }
    return redirectTo(statusPath(user.status));
  }
  return user;
}
