# CONTRACTS.md — Edu IT Hub Academy

**Read this before writing any feature code.** It defines who owns which files,
the shared helper APIs, and the non-negotiable rules. When in doubt, follow
this document over any assumption.

Branding is strictly **Edu IT Hub Academy**. Never reuse Novacademy, Edu IT Hub
(Lovable), or Desi Hut MJM branding, copy, or assets here.

---

## 1. Workstream ownership (do not step on other agents' files)

| Workstream | Owns (only this agent edits) |
|---|---|
| **auth** | `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/(auth)/login/`, `app/(auth)/register/`, `app/pending-approval/`, `middleware.ts`, `server/actions/auth.ts` |
| **public** | `app/page.tsx`, `app/courses/**`, `app/about/`, `app/contact/`, `app/faq/`, `app/sitemap.ts`, `app/robots.ts`, `components/site/**` |
| **student** | `app/dashboard/**`, `components/student/**`, `server/actions/student.ts`, `app/api/meet/[courseId]/route.ts` |
| **admin** | `app/admin/**`, `components/admin/**`, `server/actions/admin.ts` |
| **payments** | `lib/email.ts`, `lib/notify.ts`, `lib/upload.ts`, `server/actions/payments.ts`, `server/actions/notifications.ts`, `components/notifications/**`, `components/payments/**` |
| **foundation** (done) | `prisma/schema.prisma`, `prisma/seed.ts`, `lib/prisma.ts`, `lib/utils.ts`, `lib/format.ts`, `lib/constants.ts`, `lib/rate-limit.ts`, `lib/validators.ts`, `components/ui/**`, `components/providers.tsx`, `app/layout.tsx`, `app/globals.css`, `app/api/health/route.ts`, `.env.example`, `README.md`, this file |

Shared files (`lib/constants.ts` `ROUTES`, `lib/validators.ts`) may be **extended**
by any agent (additive changes only — never rename/remove existing exports).

### Ownership rules

- Only the owning agent creates/edits files under its paths.
- Need something from another workstream? Add the requirement to your final
  report — do not edit their files.
- `prisma/schema.prisma` changes require updating the seed, the generated
  client (`npx prisma generate`), and a note in your report. Prefer additive
  migrations.

---

## 2. Auth helper contracts (`lib/auth.ts` — owned by the auth agent)

The auth agent MUST create `lib/auth.ts` exporting:

```ts
import type { Session } from "next-auth";

// Session shape (via module augmentation of next-auth):
// session.user = { id: string; name: string; email: string;
//                  role: "ADMIN" | "STUDENT"; status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "SUSPENDED" }

export async function auth(): Promise<Session | null>;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "SUSPENDED";
}

/** Current signed-in user or null. Never throws for anonymous visitors. */
export async function getSessionUser(): Promise<SessionUser | null>;

/**
 * Use at the top of every student-only server action / page / route.
 * Throws/redirects unless the user is signed in AND role === "STUDENT"
 * AND status === "APPROVED". Returns the session user.
 */
export async function requireStudent(): Promise<SessionUser>;

/**
 * Use at the top of every admin-only server action / page / route.
 * Throws/redirects unless the user is signed in AND role === "ADMIN"
 * AND status === "APPROVED". Returns the session user.
 */
export async function requireAdmin(): Promise<SessionUser>;
```

Conventions:

- `requireStudent()` / `requireAdmin()` are the **only** accepted authz gates.
  Never check `role`/`status` inline in feature code — call the helper.
- `PENDING_APPROVAL`, `REJECTED`, and `SUSPENDED` users can sign in but are
  blocked from all app functionality (they land on `/pending-approval` or see
  an explanatory notice).
- Auth.js v5 (see §11): session strategy is the auth agent's choice (JWT
  recommended for simplicity; database sessions optional).

---

## 3. Prisma

- Import the client ONLY from `@/lib/prisma`: `import { prisma } from "@/lib/prisma";`
- Never instantiate `new PrismaClient()` in feature code.
- Import enums/types from `@prisma/client` (e.g. `import { PaymentStatus } from "@prisma/client"`).
- All money fields (`Course.monthlyFee`, `Payment.amount`) are **integer PKR**.

---

## 4. Toast notifications (sonner)

`components/providers.tsx` renders `<Toaster>` once in the root layout.
In client components:

```ts
import { toast } from "sonner";
toast.success("Payment submitted for verification");
toast.error("Could not save — please try again");
```

Do not add another toaster. Do not use `alert()`.

---

## 5. Uploads

- Base dir: `UPLOAD_DIR` env (default `./public/uploads`), git-ignored.
- Subdirectories: `payments/` (payment proofs), `avatars/` (profile images),
  `materials/` (course material files). See `UPLOADS` in `lib/constants.ts`.
- The payments agent owns `lib/upload.ts`, which MUST:
  - generate safe filenames (e.g. `crypto.randomUUID()` + validated extension),
  - validate MIME type and size (`MAX_UPLOAD_MB`) server-side,
  - store and return a **relative path** like `payments/2026-09/<uuid>.jpg`
    (DB stores the relative path; never an absolute filesystem path),
  - never trust the client-provided filename or path.
- Public URL shape: `/uploads/<relative-path>` (served from `public/`).

---

## 6. Setting keys

Managed in `Setting` (key → value, both strings) and editable at
`/admin/settings`. Seeded by `prisma/seed.ts`. Full list in
`SETTING_KEYS` (`lib/constants.ts`):

```
academy.name, academy.tagline, academy.collaboration,
contact.email, contact.phone, contact.whatsapp,
payment.accountName, payment.accountNumber, payment.methods,
currency, timezone, email.notificationsEnabled
```

- Read settings via Prisma (`prisma.setting.findMany()` / `findUnique()`),
  cache briefly if needed — never hardcode academy name, contact info, or
  payment account details in components.
- `email.notificationsEnabled === "false"` disables outbound email
  (mailer must log `SKIPPED` to `EmailLog`, not throw).

---

## 7. Route map

Public:

- `/` — landing page
- `/courses` — course catalog (only `PUBLISHED` courses)
- `/courses/[slug]` — course detail (no meeting URL, no internal data)
- `/about`, `/contact`, `/faq`
- `/sitemap.ts`, `/robots.ts` (SEO)

Auth (public but unauthenticated):

- `/login`, `/register`, `/pending-approval`
- `/api/auth/[...nextauth]` — Auth.js handlers

Student (requires `requireStudent()`):

- `/dashboard` — overview (enrollments, fee status, announcements)
- `/dashboard/courses/[slug]` — course workspace (materials, schedule)
- `/dashboard/payments` — fee history + submit payment
- `/dashboard/announcements`
- `/dashboard/notifications`
- `/dashboard/profile`
- `GET /api/meet/[courseId]` — returns the meeting URL **only** for an
  `ACTIVE` enrollment in that course (JSON `{ meetingUrl, days, startTime, endTime }`)

Admin (requires `requireAdmin()`):

- `/admin` — overview stats
- `/admin/students`, `/admin/courses`, `/admin/enrollments`, `/admin/payments`,
  `/admin/schedules`, `/admin/announcements`, `/admin/notifications`,
  `/admin/settings`, `/admin/audit-logs`

System:

- `GET /api/health` — `{ ok: true, time }`, no DB dependency.

Canonical paths live in `ROUTES` (`lib/constants.ts`) — use them instead of
string literals.

---

## 8. Meeting URL rule (security-critical)

**NEVER select `ClassSchedule.meetingUrl` in any query serving a public or
unauthorized context.** This includes:

- course catalog / course detail pages,
- any API route that does not first pass `requireStudent()` + verify an
  `ACTIVE` enrollment for that course,
- admin list endpoints serialized to non-admin callers,
- logs, emails, and client-side props.

The only sanctioned exposure is `GET /api/meet/[courseId]` after the checks
above. When selecting schedules elsewhere, explicitly omit the field
(e.g. `select: { meetingUrl: false, ... }` or pick needed fields).

---

## 9. Validation

- Every server action and API route validates input with zod **before** any
  DB access, using schemas from `@/lib/validators.ts`
  (`registerSchema`, `loginSchema`, `paymentSubmissionSchema`, `courseSchema`,
  `announcementSchema`) or stricter local extensions.
- Reusable patterns: `pakistaniPhoneRegex` (`^03\d{9}$`),
  `strongPasswordRegex`, `monthKeyRegex` (`YYYY-MM`).
- Client-side validation is UX only — the server schema is the source of truth.
- Return field-level errors to forms; toast the outcome.

---

## 10. Money, dates, notifications

- **Money:** integer PKR everywhere (`formatPKR()` in `lib/format.ts`).
  Never use floats for amounts.
- **Dates:** store UTC in the DB; display in `Asia/Karachi` via
  `formatDate()` / `formatDateTime()` / `timeAgo()` in `lib/format.ts`.
  Billing months are `YYYY-MM` strings (`currentMonthKey()`).
- **Notifications:** every meaningful state change creates a `Notification`
  row (see `NotificationType`) AND sends email when
  `email.notificationsEnabled` is not `"false"`. Log every attempt in
  `EmailLog` (`SENT` / `FAILED` / `SKIPPED`).
- **Audit:** every admin mutation writes an `AuditLog` row
  (`action`, `entity`, `entityId`, `metadata`).

---

## 11. Installed dependencies & Auth.js v5 API surface (verified)

| Package | Version installed |
|---|---|
| `next` | 15.5.x (App Router) |
| `react` / `react-dom` | 19.x |
| `next-auth` | **5.0.0-beta.32** (Auth.js v5, `beta` dist-tag) |
| `@prisma/client` / `prisma` | 6.19.x |
| `zod` | 4.x |
| `bcryptjs` | 3.x (hash with 12 rounds) |
| `nodemailer` | 8.x (downgraded from 10.x — v5 beta's `peerOptional` requires `^7 \|\| ^8`) |
| `lucide-react` | 1.x |
| `gsap` | 3.x |
| `sonner` | 2.x |
| `clsx` / `tailwind-merge` | `cn()` in `lib/utils.ts` |
| `tailwindcss` | 3.4.x (config-file setup: `tailwind.config.ts` + `postcss.config.mjs`) |
| `tsx` | 4.x (seed runner) |
| `typescript` | 5.9.x (strict) |
| `eslint` / `eslint-config-next` | 9.x / 15.x (`npm run lint` → `next lint`) |

> **Deviation note:** the task suggested `next-auth@latest`, but the `latest`
> dist-tag resolves to **4.24.15** (v4 API). The v5 line lives on the `beta`
> dist-tag, so `next-auth@5.0.0-beta.32` was installed to get the Auth.js v5
> App Router API the project requires.

### Auth.js v5 App Router API (auth agent: implement exactly this)

```ts
// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      // authorize: verify email+password against Prisma, check status
    }),
  ],
  // ...session strategy, callbacks (add id/role/status to session.user)
});
```

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- `auth()` — call in Server Components, Server Actions, and Route Handlers;
  returns `Promise<Session | null>`. Also usable as middleware wrapper
  (`export const { auth: middleware } = NextAuth(...)` pattern).
- `signIn` / `signOut` — server-side functions for use in Server Actions.
- Client components: `import { signIn, signOut, useSession, SessionProvider } from "next-auth/react"`.
- Session typing: augment the `next-auth` module so `session.user` carries
  `{ id, role, status }` (callbacks: `jwt` → `session`).
- Env: `AUTH_SECRET` (generate with `npx auth secret`). v5 also honors
  `AUTH_URL`/`AUTH_TRUST_HOST` behind proxies — set `AUTH_TRUST_HOST=true`
  if the app runs behind one.
- Credentials provider: the auth agent implements `authorize()` with
  `loginSchema` validation + `bcrypt.compare()` + status checks.

---

## 12. UI & code conventions

- TypeScript `strict`, no `any` leaks (use `unknown` + narrowing).
- Styling: Tailwind utilities + `cn()`. Brand: primary **indigo-700**
  (`#4338ca`), dark sections **slate-950**, accent **amber-400**. Light clean
  theme overall; dark slate-950 reserved for hero/footer bands.
- Build UI from `components/ui/*` primitives. `"use client"` only where
  interactivity requires it.
- GSAP: CSS-only visuals preferred; use GSAP sparingly for meaningful motion,
  and always respect `prefers-reduced-motion` (see `app/globals.css`).
- All user-facing copy in English.
- No placeholder or fake logic — every button must work or be absent.
- `middleware.ts` (auth agent): protect `/dashboard/**` and `/admin/**`;
  redirect signed-in `APPROVED` users away from `/login` and `/register`.

---

## 13. Seed & bootstrap contract

- `npm run db:seed` is idempotent (upserts + scoped delete/recreate).
- Seed owns: `Setting` rows (§6), 11 `PUBLISHED` courses @ Rs 1,000 with
  4–6 modules each, 3 instructors + course links, and the admin user from
  `ADMIN_EMAIL`/`ADMIN_PASSWORD` (bcrypt 12 rounds; skipped with a warning if
  unset).
- QA runs migrations (`npm run db:migrate`) — feature agents must not assume
  a migrated DB exists; keep `/api/health` DB-free.
