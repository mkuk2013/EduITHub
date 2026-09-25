# TEST-REPORT — Edu IT Hub Academy (final QA verification gate)

**Date:** 2026-09-22
**Agent:** QA/VERIFICATION subagent
**Scope:** full-stack verification of all 6 feature workstreams against a real PostgreSQL database.
**Verdict: PASS — 52/52 smoke checks green, `npm run build` clean, final zip produced.**

---

## 1. Environment

| Item | Value |
|---|---|
| OS / runtime | Linux VM, Node 24, npm 10 |
| Database | PostgreSQL 16 @ `localhost:5432`, DB `eduhub_dev`, role `eduhub` |
| `DATABASE_URL` | `postgresql://eduhub:eduhub_dev_pw@localhost:5432/eduhub_dev` (local QA only) |
| `AUTH_SECRET` | 32 random bytes, base64 (`node:crypto`; `npx auth secret` hung in this sandbox — see §6) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@eduithub.academy` / `Admin@12345` (**test-only**; production must use a strong unique password, changed immediately after first login) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
| `EMAIL_HOST/PORT/USER/PASS` | **intentionally empty** → tests graceful degradation |
| `MAX_UPLOAD_MB` | `5` |
| `.env` | created, gitignored, **excluded from the zip** |

---

## 2. Step 1 — Migrations + seed

Commands:

```bash
sudo -n -u postgres psql -c "ALTER ROLE eduhub CREATEDB;"   # shadow DB for migrate dev
npx prisma migrate dev --name init
npm run db:seed   # tsx prisma/seed.ts
```

Results:

- Migration `prisma/migrations/20260922171810_init/migration.sql` **created and applied** — real migration, not a db-push. Confirmed it contains `"requirements" JSONB` and `"benefits" JSONB` on `courses` (the late addition by the public-site agent).
- `\dt` → **16 relations**: 15 models (`users`, `student_profiles`, `courses`, `instructors`, `course_instructors`, `course_modules`, `course_materials`, `enrollments`, `payments`, `class_schedules`, `notifications`, `announcements`, `audit_logs`, `email_logs`, `settings`) + `_prisma_migrations`. (Task brief said "18 tables"; the actual schema has 15 models — all present, none missing.)
- Seed output: `upserted 12 settings`, `upserted 3 instructors`, `upserted 11 courses and 55 modules`, `linked 11 course-instructor rows`, `admin user ready: admin@eduithub.academy`.
- Verified via psql: **11 PUBLISHED courses, all `monthlyFee=1000`**; 55 modules; `academy.name=Edu IT Hub Academy`; `payment.accountName=Mukesh Kumar`; `payment.accountNumber=03363268833`; admin row `admin@eduithub.academy|ADMIN|APPROVED`.
- Admin password hash verified directly: `bcryptjs.compare("Admin@12345", <hash from DB>)` → `true`.

---

## 3. Step 2 — Build

`npm run build` initially **failed** with one type error (see §5, bug #1). After the fix:

- `npm run build` → **success, zero TypeScript errors, zero lint-blocking errors.** Route table: 38 routes, including `/admin/approvals` (this answers the auth agent's open question: **the page EXISTS**), `/api/meet/[courseId]`, all dashboard/admin pages.
- Final clean-tree build (after QA harness removal, see §4) also green.

---

## 4. Step 3 — Full-journey smoke test (`qa/smoke-test.mjs`)

Run against `QA_HARNESS=1 npx next dev -p 3000`. Uses `fetch` + a per-user cookie jar (Node 24, no extra deps).

**How each layer was exercised (honest accounting):**

- **Public pages** — plain HTTP GET (real rendering + real middleware).
- **Login** — the **real Auth.js v5 credentials HTTP flow**: `GET /api/auth/csrf` → `POST /api/auth/callback/credentials` (urlencoded `csrfToken`+email+password), exactly like the browser sign-in form. Session cookies kept in per-user jars and forwarded on every later request.
- **Registration / approvals / enrollment / payments / schedules / notifications / email-log reads** — the **real exported server-action functions** (`server/actions/*.ts`) invoked over HTTP through **temporary** `app/api/qa/*` harness routes with the real session cookie attached. That means the real `requireAuth`/`requireStudent`/`requireAdmin` gates (which read the request cookies via `auth()`), real zod validation, real DB writes, real file upload, real notifications, and real email-degradation all executed. **The one layer NOT exercised is Next.js's server-action ID dispatch** (framework machinery, not app code). The harness was guarded by `QA_HARNESS=1` (404 otherwise), and the entire `app/api/qa` tree plus a temporary middleware public-path entry were **deleted/reverted before the final build** — verified via grep that zero references remain.
- **`/api/meet/[courseId]`** — plain HTTP GET with/without cookies (real route, real middleware).

Results: **52/52 PASS** (second run; first run 48/52 — the 4 failures were test-script assertion artifacts, not app bugs: see §6).

| # | Check | Result | Evidence |
|---|---|---|---|
| a | `GET /` → 200, brand + tagline | PASS | 200; visible text contains "Edu IT Hub Academy" and "Learn. Build. Grow." |
| b | `GET /courses` lists seeded courses; `/courses/mern-stack-development` → 200, fee "Rs 1,000", no meet URL | PASS | 200; "MERN Stack Development"; fee renders `Rs\u00a01,000`; 0 `meet.google.com` hits |
| c | Register student (real `registerStudent`) | PASS | `{ok:true, redirectTo:"/pending-approval"}`; weak password rejected by zod; duplicate email rejected |
| d | PENDING student login → `/dashboard` redirects to `/pending-approval` | PASS | Auth.js session cookie set; 307 → `/pending-approval`; page 200 |
| e | Admin login → `/admin` 200; `/admin/approvals` exists; approve student via real `approveStudent` | PASS | `{ok:true}` for students A and C |
| f | Re-login (fresh JWT) → `/dashboard` 200; admin sets MERN schedule via real `upsertClassSchedule`; `requestEnrollment` → PENDING_PAYMENT; `/dashboard/payments` shows fee/account info | PASS | enrollmentId returned; duplicate enrollment rejected; payments page contains "1,000", "Mukesh Kumar", "03363268833", "Easypaisa" |
| g | `submitPayment` (multipart + real PNG) → PENDING; enrollment → PENDING_VERIFICATION | PASS | `{ok:true}`; proof saved `public/uploads/payments/2026-09/<uuid>.png` (file exists on disk); duplicate-month rejected; forged enrollmentId → "Enrollment not found" |
| h | Admin `verifyPayment` APPROVED via real action | PASS | payment APPROVED, enrollment ACTIVE; visible in admin pending queue before; re-verify rejected ("already been reviewed") |
| i | `GET /api/meet/<mern>` → 200 `{url}` | PASS | `url=https://meet.google.com/qa-mern-smoke-test` (the admin-set URL) |
| j1 | Anon `GET /api/meet` → 401, no URL in body | PASS | 401; body has no `meet.google.com` |
| j2 | PENDING student → 403 on `/api/meet`; `/dashboard` → `/pending-approval` | PASS | 403; 307 |
| j3 | Approved student not enrolled in Python → 403 | PASS | 403 |
| j4 | IDOR: A's `getMyPayments` contains only A's rows (C has a payment too) | PASS | `tids=["QATID…A"]`, C's TID absent |
| j5 | Student calls admin-only `verifyPayment` / `email-logs` → 403 | PASS | 403/403 (`requireAdmin` redirect caught by harness) |
| j6 | Public HTML leak scan | PASS | 0 `meet.google.com` hits on `/`, `/courses`, both course pages, `/about`, `/faq` |
| j7 | Student `GET /admin` → `/dashboard`; anon → `/login` | PASS | 307 → `/dashboard`; 307 → `/login?next=%2Fadmin` |
| k | Notifications after approval + payment approval | PASS | types present: `ACCOUNT_APPROVED`, `PAYMENT_APPROVED`, `ENROLLMENT_ACTIVATED` |
| l | Email degradation (no SMTP) | PASS | 12 `EmailLog` rows, all `SKIPPED`; 0 `SENT`; every flow above still succeeded |

Also verified in DB: `AuditLog` rows written for `student.approved`, `payment.APPROVED`, `class_schedule.meet_link_added/updated`.

**Open question from the auth agent — answered:** `/admin/approvals` **exists** (200, listed in the build route table).

---

## 5. Bugs found and fixed

1. **Build-breaking dead export** — `app/(site)/courses/[slug]/page.tsx:375` exported `CourseDetailSkeleton`, which is not a valid Next.js page export (`"CourseDetailSkeleton" is not a valid Page export field`). It was dead code (nothing imported it; `loading.tsx` already provides the skeleton). **Fix:** deleted the function and the now-unused `Skeleton` import (file lines ~374–395, 23). `npm run build` green afterwards.
2. **Dead route constant** — `ROUTES.adminSchedules` (`/admin/schedules`) existed in `lib/constants.ts:49` but no such page existed. **Fix:** added trivial redirect page `app/admin/schedules/page.tsx` → `redirect(ROUTES.adminClasses)` (explicitly blessed as optional in the brief). Present in the final build route table.

No application-logic bugs were found in auth, enrollment, payments, or the meet gate — the full journey passed on the real code paths.

---

## 6. Investigation notes (things that looked like bugs but weren't)

- **First smoke run: 48/52.** The 4 failures were test-script artifacts, fixed in the script, then 52/52:
  - Homepage tagline is rendered as `Learn. <span>Build.</span> Grow.` across elements, and the fee as `Rs\u00a01,000` (non-breaking space) — assertions now normalize visible text.
  - The register harness's internal `signIn` sets a session cookie on the harness response, which contaminated the shared "anonymous" jar (anon `/api/meet` returned 403 as an authenticated-but-unenrolled student instead of 401). The script now uses a dedicated never-authenticated jar for anonymous negative tests.
- **`npx auth secret` hung** in this sandbox (killed after ~30s); generated the secret with `node:crypto` instead and noted the fallback in README.
- **One transient dev-server wedge** during the first attempt (next-server at 100% CPU, `/api/health` timing out). It occurred before the middleware's API backstop was opened for the anonymous registration harness; after restart with the temporary `/api/qa` public-path entry, the server stayed responsive through two full suite runs (second full run: 52/52 in ~19s). Root cause not definitively isolated — recorded here, not hidden. The temporary middleware change was reverted and the final production build was made from the clean tree.

---

## 7. Step 5 — Deliverables

- **`TEST-REPORT.md`** (this file) in project root.
- **`qa/smoke-test.mjs`** kept in the project — re-runnable verification script.
- **README.md** updated: added "Verification (QA)" section + `npx auth secret` fallback note. Setup steps otherwise matched reality; no other changes needed.
- **Final zip:** `/home/hatch/workspace/edu-it-hub-academy.zip`
  - Built with: `cd ~/workspace && zip -qr edu-it-hub-academy.zip edu-it-hub-academy -x "edu-it-hub-academy/node_modules/*" "edu-it-hub-academy/.next/*" "edu-it-hub-academy/.env" "edu-it-hub-academy/public/uploads/*"`
  - **Size: 361 KB** (361,286 bytes)
  - Verified exclusions: 0 `node_modules`/`.next` entries, no `.env` (secrets), no `public/uploads/*` (payment proofs). `qa/smoke-test.mjs`, `prisma/migrations`, and `TEST-REPORT.md` included.

---

## 8. HONEST LIMITATIONS (what was NOT verified)

- **Real SMTP delivery untested** — no credentials available. Only the degradation path was verified (12 `EmailLog` rows `SKIPPED`, 0 `SENT`, flows unaffected). Actual email rendering/deliverability is unverified.
- **Server-action dispatch layer untested** — actions were invoked via a temporary HTTP harness calling the identical exported functions (real auth gates, validation, DB). Next.js's action-ID/RSC encoding between browser and server was not exercised over the wire. The real login and meet flows *were* exercised over raw HTTP.
- **No real browser testing** — GSAP hero animations, `prefers-reduced-motion` handling, responsive layout, and the actual form UIs were not opened in a browser; only server-rendered HTML was asserted. Payment screenshot was verified as a saved PNG file on disk, not visually inspected.
- **JWT staleness (by design)** — role/status ride the JWT until the next login: if an admin suspends a student, the student's existing session keeps its old claims until re-login (the smoke test re-logged-in after approval for exactly this reason). Documented behavior, not a bug, but operators should know.
- **Class schedules are admin-configured, not seeded** — a fresh deploy has 11 published courses with **no** meeting URLs until an admin sets them via `/admin/classes`. The QA meet URL was set through the real admin flow during testing only.
- **Production deploy untested** — `prisma migrate deploy`, Netlify/VPS hosting, `UPLOAD_DIR` persistence, and HTTPS behavior were not exercised. The `.env` used here is local-only; `ADMIN_PASSWORD=Admin@12345` is a test credential and must be replaced.
- **WebAuthn/N/A** — not part of this product.
- **Rate limiter is in-memory per instance** — noted in README; fine for single-instance, needs Redis for multi-instance.
- **Login rate limit (5/10 min per email+IP)** was not stress-tested to the block threshold, to avoid locking the QA accounts; the code path (authorize → `RateLimitExceededError`) was reviewed but the 429 was not observed live.
- **Contact form / announcements / broadcast / materials flows** were built by other workstreams and compile, but were not covered by the E2E script (the script focused on the registration→payment→meet critical path plus security gates).
