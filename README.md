# Edu IT Hub Academy

A production-ready online Learning Management System (LMS) for **Edu IT Hub Academy** —
live online IT courses (web development, programming, design, marketing, AI) with
student registration & approval, monthly fee payments via Easypaisa/JazzCash with
admin verification, class schedules with private meeting links, course materials,
announcements, and notifications.

**Stack:** Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS ·
Prisma ORM + PostgreSQL · Auth.js v5 (next-auth, credentials provider) · zod ·
bcryptjs · nodemailer · lucide-react · gsap · sonner.

> **Branding note:** this codebase is exclusively **Edu IT Hub Academy**.
> It is a separate product from Novacademy, Edu IT Hub (Lovable site), and
> Desi Hut MJM — do not mix branding, copy, or assets between them.

## Local setup

### 1. Prerequisites

- Node.js 20+ and npm
- PostgreSQL 14+ running locally (or a hosted database)

### 2. Install

```bash
npm install
```

### 3. Environment

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `AUTH_SECRET` | Session encryption secret — generate with `npx auth secret` (fallback: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrap admin created by the seed script |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | SMTP for transactional email |
| `NEXT_PUBLIC_APP_URL` | Public base URL (used in email links) |
| `UPLOAD_DIR` | Upload storage dir (default `./public/uploads`) |
| `MAX_UPLOAD_MB` | Max upload size in MB (default `5`) |

### 4. Database

```bash
npm run db:migrate   # prisma migrate dev — creates tables
npm run db:seed      # idempotent seed: settings, 11 courses, instructors, admin
```

The seed is idempotent — safe to re-run. It upserts:

- `Setting` rows (academy name/tagline/collaboration, contact info, payment
  account `Mukesh Kumar` / `03363268833`, currency `PKR`, timezone `Asia/Karachi`)
- 11 `PUBLISHED` courses (monthly fee Rs 1,000) with 4–6 modules each
- 3 instructor profiles with course links
- The admin user **only** from `ADMIN_EMAIL`/`ADMIN_PASSWORD`
  (bcrypt, 12 rounds). If those are unset, the admin step is skipped with a warning.

### 5. Run

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve production build
npm run lint    # next lint
```

Health check (no DB required): `GET /api/health` → `{ ok: true, time }`.

## Verification (QA)

The full user journey is covered by an automated smoke test,
`qa/smoke-test.mjs` (Node 24, no extra dependencies). It drives the real app
over HTTP with a per-user cookie jar:

- public pages → registration (real `registerStudent` server action) →
  Auth.js login (`POST /api/auth/callback/credentials`) →
  pending-approval redirect → admin approval → enrollment → payment submit
  (multipart PNG proof) → admin verification → `/api/meet/[courseId]`,
  plus negative tests (401/403 gates, IDOR on payments, privilege
  escalation, public HTML leak scan for `meet.google.com`).

Server actions are invoked through **temporary** `app/api/qa/*` harness
routes (enabled only with `QA_HARNESS=1`), which call the identical exported
action functions with the real session cookie — same auth gates, validation,
DB writes, uploads, and email degradation. The only layer not exercised is
Next.js's action-ID dispatch (framework machinery). The harness is deleted
before the final build; see `TEST-REPORT.md` for the last full run.

```bash
QA_HARNESS=1 npm run dev -- -p 3000   # in one terminal (with harness present)
node qa/smoke-test.mjs                 # in another; exit 0 = all green
```

## Production deploy notes

- **Environment:** set every variable from `.env.example` in the hosting
  provider. Generate `AUTH_SECRET` with `npx auth secret` — never reuse the
  dev value.
- **Database:** run `prisma migrate deploy` (not `migrate dev`) against the
  production `DATABASE_URL`, then seed once: `npm run db:seed` with the real
  `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- **Uploads:** files land in `UPLOAD_DIR` (default `./public/uploads/`), which
  is git-ignored. On ephemeral hosts (serverless), point `UPLOAD_DIR` at a
  persistent volume or replace `lib/upload.ts` with object storage (S3/R2) —
  otherwise payment proofs and avatars disappear on redeploy.
- **SMTP:** transactional email (approvals, payment decisions, reminders) needs
  valid SMTP credentials; without them the mailer logs `SKIPPED` to `EmailLog`
  instead of crashing.
- **Cron/queues (later agents):** fee reminders and class reminders are designed
  to run on a schedule — wire them to the host's cron/scheduler when built.

## Admin bootstrap

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.
2. `npm run db:seed` — creates the admin (`role: ADMIN`, `status: APPROVED`).
3. Sign in at `/login`, open `/admin`.
4. **Change the seeded password immediately** after first login.
5. Review `/admin/settings` — especially `contact.email`, payment account
   details, and the `email.notificationsEnabled` toggle.

## Security notes

- **Meeting URLs are never public.** `ClassSchedule.meetingUrl` must only be
  selected in queries scoped to an authenticated, approved student with an
  `ACTIVE` enrollment in that course (see `app/api/meet/[courseId]/route.ts`
  contract). Never include it in public course payloads.
- **Server-side authorization:** every server action / API route re-checks the
  session (`requireStudent()` / `requireAdmin()` in `lib/auth.ts`) — never
  trust client-sent role or status.
- **Validation:** all server actions validate with zod schemas from
  `lib/validators.ts` before any DB write.
- **Passwords:** bcryptjs, 12 rounds. Registration creates `PENDING_APPROVAL`
  users; only an admin can approve.
- **Uploads:** stored under `public/uploads/<type>/` with generated safe
  filenames; validate MIME type and size server-side; never trust the
  client-provided filename or path.
- **Money:** all amounts are integer PKR — no floats, no decimals.
- **Rate limiting:** `lib/rate-limit.ts` provides an in-memory token bucket for
  login/register/payment endpoints. It is per-instance; use a shared store
  (Redis) if deploying multiple instances.
- **Audit:** admin mutations write to `AuditLog`; email attempts to `EmailLog`.

## Project structure

```
app/                  # App Router: layout, (auth), courses, dashboard, admin, api
components/ui/        # Shared primitives (button, input, card, dialog, table…)
components/site/      # Public site components      (public agent)
components/student/   # Dashboard components        (student agent)
components/admin/     # Admin components              (admin agent)
components/payments/  # Payment + notification UI     (payments agent)
lib/                  # prisma, auth*, utils, format, constants, validators,
                      # rate-limit, email*, notify*, upload*  (* = later agents)
server/actions/       # Server actions per workstream (auth/student/admin/payments)
prisma/               # schema.prisma, seed.ts
```

See **CONTRACTS.md** for workstream ownership, helper contracts, the route map,
and the rules every feature agent must follow.
