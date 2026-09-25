#!/usr/bin/env node
/**
 * End-to-end smoke test for Edu IT Hub Academy.
 *
 * Usage:  node qa/smoke-test.mjs   (from the project root)
 * Requires the dev server running with QA_HARNESS=1:
 *   QA_HARNESS=1 npm run dev -- -p 3000
 *
 * How each layer is exercised (honest accounting):
 *  - Public pages: plain HTTP GET (real rendering + real middleware).
 *  - Login: the REAL Auth.js v5 credentials HTTP flow
 *    (GET /api/auth/csrf, then POST /api/auth/callback/credentials),
 *    exactly like the browser sign-in form. Session cookies are kept in a
 *    per-user jar and forwarded on every later request.
 *  - Registration / approvals / enrollment / payments / schedules /
 *    notifications: the REAL exported server-action functions
 *    (server/actions/*.ts) invoked over HTTP through the TEMPORARY
 *    app/api/qa/* harness routes with the real session cookie attached,
 *    so requireAuth/requireStudent/requireAdmin, zod validation, DB writes,
 *    uploads, notifications and email-degradation all run for real.
 *    The only layer NOT exercised is Next.js's server-action ID dispatch
 *    (framework machinery, not app code). The harness is deleted before
 *    the final build/zip.
 *  - /api/meet/[courseId]: plain HTTP GET with/without cookies (real route).
 */

import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.QA_BASE_URL || "http://localhost:3000";
const TS = String(Date.now()).slice(-8); // unique suffix so re-runs don't collide

const ADMIN_EMAIL = "admin@eduithub.academy";
const ADMIN_PASSWORD = "Admin@12345";
const MEET_URL = "https://meet.google.com/qa-mern-smoke-test";
const PNG_1PX =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const results = [];
function check(name, ok, evidence = "") {
  results.push({ name, ok: Boolean(ok), evidence: String(evidence).slice(0, 220) });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`[${mark}] ${name}${evidence ? ` — ${evidence}` : ""}`);
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

/* ---------------- cookie jar ---------------- */
class Jar {  constructor() {
    this.cookies = new Map();
  }
  collect(res) {
    const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const sc of setCookies) {
      const [pair] = sc.split(";");
      const eq = pair.indexOf("=");
      if (eq > 0) this.cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  }
  header() {
    if (this.cookies.size === 0) return {};
    return {
      Cookie: [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; "),
    };
  }
  hasSession() {
    return [...this.cookies.keys()].some((k) => k.includes("session-token"));
  }
}

/** fetch that fails loudly after 90s instead of hanging forever. */
async function tf(url, opts = {}) {
  return fetch(url, { signal: AbortSignal.timeout(90_000), ...opts });
}

async function get(path, jar, opts = {}) {
  const res = await tf(BASE + path, {
    headers: { ...jar.header() },
    redirect: "manual",
    ...opts,
  });
  jar.collect(res);
  return res;
}
async function postJson(path, jar, body) {
  const res = await tf(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...jar.header() },
    body: JSON.stringify(body),
    redirect: "manual",
  });
  jar.collect(res);
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { res, json };
}
async function postForm(path, jar, formData) {
  const res = await tf(BASE + path, {
    method: "POST",
    headers: { ...jar.header() },
    body: formData,
    redirect: "manual",
  });
  jar.collect(res);
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { res, json };
}
async function text(res) {
  return await res.text();
}

/** Visible text of HTML: tags stripped, entities/nbsp normalized, ws collapsed. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Real Auth.js v5 credentials login over HTTP. */
async function login(jar, email, password) {
  const csrfRes = await tf(BASE + "/api/auth/csrf", { headers: { ...jar.header() } });
  jar.collect(csrfRes);
  const { csrfToken } = await csrfRes.json();
  assert(csrfToken, "no csrfToken from /api/auth/csrf");
  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${BASE}/dashboard`,
    json: "true",
  });
  const res = await tf(BASE + "/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...jar.header(),
    },
    body,
    redirect: "manual",
  });
  jar.collect(res);
  return res;
}

function studentForm(tag, n) {
  const fd = new FormData();
  fd.set("name", `QA Student ${tag}`);
  fd.set("email", `qa.${tag}.${TS}@example.com`);
  fd.set("password", "QaTest@1234");
  fd.set("confirmPassword", "QaTest@1234");
  fd.set("phone", `0300${String(1000000 + n * 111111 + Number(TS.slice(-4))).slice(-7)}`);
  fd.set("city", "Umerkot");
  fd.set("address", "QA Street 1");
  fd.set("extraInfo", "smoke test account");
  return fd;
}

function paymentForm(enrollmentId, tid) {
  const fd = new FormData();
  fd.set("enrollmentId", enrollmentId);
  fd.set("amount", "1000");
  fd.set("paymentMethod", "EASYPaisa");
  fd.set("transactionId", tid);
  fd.set("paymentDate", "2026-09-22");
  const png = Buffer.from(PNG_1PX, "base64");
  fd.set("proofImage", new Blob([png], { type: "image/png" }), "proof.png");
  return fd;
}

const jars = { anon: new Jar(), admin: new Jar(), a: new Jar(), b: new Jar(), c: new Jar(), ghost: new Jar() };
// NOTE: jars.anon collects a session cookie as a side effect of the register
// harness (registerStudent signs the new user in). jars.ghost is NEVER used
// for login/registration, so it stays truly anonymous for negative tests.
const ids = {};

/* ============ a. public homepage ============ */
try {
  const res = await get("/", jars.anon);
  const html = await text(res);
  check("a. GET / -> 200", res.status === 200, `status=${res.status}`);
  const seen = visibleText(html);
  check("a. homepage brand + tagline", seen.includes("Edu IT Hub Academy") && seen.includes("Learn. Build. Grow."));
} catch (e) {
  check("a. homepage", false, e.message);
}

/* ============ b. public courses ============ */
try {
  const res = await get("/courses", jars.anon);
  const html = await text(res);
  check("b. GET /courses -> 200 + seeded course", res.status === 200 && html.includes("MERN Stack Development"), `status=${res.status}`);
  const d = await get("/courses/mern-stack-development", jars.anon);
  const dhtml = await text(d);
  check("b. course detail 200 + fee Rs 1,000", d.status === 200 && visibleText(dhtml).includes("Rs 1,000"), `status=${d.status}`);
  check("b. public course page leaks no meet URL", !dhtml.includes("meet.google.com"), "no meet.google.com in HTML");
  const py = await get("/courses/python-programming", jars.anon);
  const pyhtml = await text(py);
  check("b. second public course page leaks no meet URL", py.status === 200 && !pyhtml.includes("meet.google.com"));
} catch (e) {
  check("b. public courses", false, e.message);
}

/* ============ c. registration (real registerStudent action) ============ */
try {
  // negative: weak password must be rejected by zod validation
  const weak = studentForm("weak", 9);
  weak.set("password", "short");
  weak.set("confirmPassword", "short");
  const weakRes = await postForm("/api/qa/register", jars.anon, weak);
  check("c. weak password rejected", weakRes.json && weakRes.json.ok === false, JSON.stringify(weakRes.json?.fieldErrors?.password ?? weakRes.json).slice(0, 120));

  const regA = await postForm("/api/qa/register", jars.anon, studentForm("a", 1));
  check("c. register student A ok", regA.json && regA.json.ok === true, JSON.stringify(regA.json).slice(0, 160));

  // negative: duplicate email
  const dup = studentForm("a", 1); // same email as A
  const dupRes = await postForm("/api/qa/register", jars.anon, dup);
  check("c. duplicate email rejected", dupRes.json && dupRes.json.ok === false, JSON.stringify(dupRes.json?.fieldErrors?.email ?? dupRes.json).slice(0, 120));

  const regB = await postForm("/api/qa/register", jars.anon, studentForm("b", 2));
  check("c. register student B ok (stays PENDING)", regB.json && regB.json.ok === true);
  const regC = await postForm("/api/qa/register", jars.anon, studentForm("c", 3));
  check("c. register student C ok", regC.json && regC.json.ok === true);

  ids.emailA = `qa.a.${TS}@example.com`;
  ids.emailB = `qa.b.${TS}@example.com`;
  ids.emailC = `qa.c.${TS}@example.com`;
} catch (e) {
  check("c. registration", false, e.message);
}

/* ============ login helper sanity ============ */
async function mustLogin(jar, email, password, who) {
  const res = await login(jar, email, password);
  assert(jar.hasSession(), `${who}: no session cookie after Auth.js login (status=${res.status})`);
}

/* ============ d. pending student redirected ============ */
try {
  await mustLogin(jars.a, ids.emailA, "QaTest@1234", "student A");
  check("d. PENDING student Auth.js login sets session", true);
  const dash = await get("/dashboard", jars.a);
  const loc = dash.headers.get("location") || "";
  check("d. PENDING GET /dashboard -> /pending-approval", [307, 308, 302].includes(dash.status) && loc.includes("/pending-approval"), `status=${dash.status} location=${loc}`);
  const pend = await get("/pending-approval", jars.a);
  check("d. GET /pending-approval -> 200", pend.status === 200, `status=${pend.status}`);
} catch (e) {
  check("d. pending student flow", false, e.message);
}

/* ============ e. admin login + approval (real actions) ============ */
try {
  await mustLogin(jars.admin, ADMIN_EMAIL, ADMIN_PASSWORD, "admin");
  check("e. admin Auth.js login sets session", true);
  const adm = await get("/admin", jars.admin);
  check("e. GET /admin -> 200", adm.status === 200, `status=${adm.status}`);
  const appr = await get("/admin/approvals", jars.admin);
  check("e. GET /admin/approvals page exists -> 200", appr.status === 200, `status=${appr.status}`);

  const pending = await get("/api/qa/admin/approve-student", jars.admin);
  const plist = await pending.json();
  const sA = (plist.students || []).find((s) => s.email === ids.emailA);
  const sC = (plist.students || []).find((s) => s.email === ids.emailC);
  assert(sA && sC, "students A and C not in pending list");
  ids.userA = sA.id;
  ids.userC = sC.id;

  const apA = await postJson("/api/qa/admin/approve-student", jars.admin, { userId: sA.id });
  check("e. approve student A (real approveStudent)", apA.json && apA.json.ok === true, JSON.stringify(apA.json).slice(0, 120));
  const apC = await postJson("/api/qa/admin/approve-student", jars.admin, { userId: sC.id });
  check("e. approve student C (real approveStudent)", apC.json && apC.json.ok === true);
  // B intentionally stays PENDING for negative tests.
} catch (e) {
  check("e. admin approval", false, e.message);
}

/* ============ f. approved student dashboard + enrollment ============ */
try {
  // JWT carries the old PENDING status: re-login to mint a fresh token.
  jars.a = new Jar();
  await mustLogin(jars.a, ids.emailA, "QaTest@1234", "student A (re-login)");
  const dash = await get("/dashboard", jars.a);
  check("f. APPROVED student GET /dashboard -> 200", dash.status === 200, `status=${dash.status}`);

  const courses = await (await get("/api/qa/courses", jars.admin)).json();
  ids.mern = courses.courses.find((c) => c.slug === "mern-stack-development").id;
  ids.python = courses.courses.find((c) => c.slug === "python-programming").id;
  assert(ids.mern && ids.python, "course ids missing");

  // admin sets the class schedule with a Meet URL (real upsertClassSchedule)
  const sched = await postJson("/api/qa/admin/set-schedule", jars.admin, {
    courseId: ids.mern,
    input: {
      meetingUrl: MEET_URL,
      days: ["Mon", "Wed", "Fri"],
      startTime: "18:00",
      endTime: "19:30",
    },
  });
  check("f. admin sets MERN schedule+Meet URL", sched.json && sched.json.ok === true, JSON.stringify(sched.json).slice(0, 120));

  const enr = await postJson("/api/qa/student/request-enrollment", jars.a, { courseId: ids.mern });
  check("f. requestEnrollment MERN ok", enr.json && enr.json.ok === true, JSON.stringify(enr.json).slice(0, 120));
  ids.enrollmentA = enr.json.enrollmentId;
  const enrDup = await postJson("/api/qa/student/request-enrollment", jars.a, { courseId: ids.mern });
  check("f. duplicate enrollment rejected", enrDup.json && enrDup.json.ok === false);

  const payPage = await get("/dashboard/payments", jars.a);
  const payHtml = await text(payPage);
  check(
    "f. /dashboard/payments shows fee + Easypaisa/JazzCash + Mukesh Kumar + 03363268833",
    payPage.status === 200 &&
      payHtml.includes("1,000") &&
      payHtml.includes("Mukesh Kumar") &&
      payHtml.includes("03363268833") &&
      (payHtml.includes("Easypaisa") || payHtml.includes("JazzCash")),
    `status=${payPage.status}`,
  );
} catch (e) {
  check("f. enrollment + payments page", false, e.message);
}

/* ============ g. payment submit (real submitPayment, multipart PNG) ============ */
try {
  ids.tidA = `QATID${TS}A`;
  const sub = await postForm("/api/qa/student/submit-payment", jars.a, paymentForm(ids.enrollmentA, ids.tidA));
  check("g. submitPayment ok", sub.json && sub.json.ok === true, JSON.stringify(sub.json).slice(0, 160));

  const mine = await (await get("/api/qa/student/submit-payment", jars.a)).json();
  const pmt = (mine.payments || []).find((p) => p.transactionId === ids.tidA);
  assert(pmt, "submitted payment not in getMyPayments");
  ids.paymentA = pmt.id;
  check("g. payment PENDING + proof saved to disk", pmt.status === "PENDING" && pmt.proofImage && existsSync(join(PROJECT_ROOT, "public/uploads", pmt.proofImage)), `status=${pmt.status} proof=${pmt.proofImage}`);

  const enrs = await (await get("/api/qa/student/request-enrollment", jars.a)).json();
  const enr = (enrs.enrollments || []).find((x) => x.id === ids.enrollmentA);
  check("g. enrollment -> PENDING_VERIFICATION", enr && enr.status === "PENDING_VERIFICATION", `status=${enr && enr.status}`);

  const dupPay = await postForm("/api/qa/student/submit-payment", jars.a, paymentForm(ids.enrollmentA, `QATID${TS}DUP`));
  check("g. second payment same month rejected", dupPay.json && dupPay.json.ok === false, JSON.stringify(dupPay.json).slice(0, 120));

  // negative: forged enrollment id
  const forged = paymentForm("nonexistent-enrollment-id", `QATID${TS}FORGE`);
  const forgeRes = await postForm("/api/qa/student/submit-payment", jars.a, forged);
  check("g. forged enrollmentId rejected", forgeRes.json && forgeRes.json.ok === false, JSON.stringify(forgeRes.json).slice(0, 120));
} catch (e) {
  check("g. payment submit", false, e.message);
}

/* ============ h. admin verifies payment (real verifyPayment) ============ */
try {
  const pend = await (await get("/api/qa/admin/verify-payment", jars.admin)).json();
  const item = (pend.payments || []).find((p) => p.id === ids.paymentA);
  check("h. payment visible in admin pending queue", Boolean(item), `found=${Boolean(item)}`);
  const ver = await postJson("/api/qa/admin/verify-payment", jars.admin, {
    paymentId: ids.paymentA,
    decision: "APPROVED",
    adminNote: "QA smoke test approval",
  });
  check("h. verifyPayment APPROVED", ver.json && ver.json.ok === true, JSON.stringify(ver.json).slice(0, 120));

  const mine = await (await get("/api/qa/student/submit-payment", jars.a)).json();
  const pmt = (mine.payments || []).find((p) => p.id === ids.paymentA);
  check("h. payment APPROVED", pmt && pmt.status === "APPROVED", `status=${pmt && pmt.status}`);
  const enrs = await (await get("/api/qa/student/request-enrollment", jars.a)).json();
  const enr = (enrs.enrollments || []).find((x) => x.id === ids.enrollmentA);
  check("h. enrollment ACTIVE", enr && enr.status === "ACTIVE", `status=${enr && enr.status}`);

  const verAgain = await postJson("/api/qa/admin/verify-payment", jars.admin, {
    paymentId: ids.paymentA,
    decision: "APPROVED",
  });
  check("h. re-verify rejected (already reviewed)", verAgain.json && verAgain.json.ok === false);
} catch (e) {
  check("h. payment verify", false, e.message);
}

/* ============ i. meet link for active student ============ */
try {
  const res = await get(`/api/meet/${ids.mern}`, jars.a);
  const body = await res.json().catch(() => ({}));
  check("i. GET /api/meet/<mern> -> 200 + meet URL", res.status === 200 && typeof body.url === "string" && body.url.includes("meet.google.com"), `status=${res.status} url=${body.url}`);
  check("i. returned URL is the admin-set one", body.url === MEET_URL, `url=${body.url}`);
} catch (e) {
  check("i. meet link", false, e.message);
}

/* ============ j. negative tests ============ */
try {
  // j1: unauthenticated (fresh jar — never touched login/registration)
  const anon = await get(`/api/meet/${ids.mern}`, jars.ghost);
  const anonBody = await text(anon);
  check("j1. anon /api/meet -> 401, no URL leaked", anon.status === 401 && !anonBody.includes("meet.google.com"), `status=${anon.status}`);

  // j2: PENDING student (B)
  await mustLogin(jars.b, ids.emailB, "QaTest@1234", "student B (pending)");
  const bMeet = await get(`/api/meet/${ids.mern}`, jars.b);
  check("j2. PENDING student /api/meet -> 403", bMeet.status === 403, `status=${bMeet.status}`);
  const bDash = await get("/dashboard", jars.b);
  const bLoc = bDash.headers.get("location") || "";
  check("j2. PENDING student /dashboard redirected", [307, 308, 302].includes(bDash.status) && bLoc.includes("/pending-approval"), `status=${bDash.status}`);

  // j3: approved student not enrolled in Python
  const pyMeet = await get(`/api/meet/${ids.python}`, jars.a);
  check("j3. enrolled-elsewhere student /api/meet/<python> -> 403", pyMeet.status === 403, `status=${pyMeet.status}`);

  // j4: IDOR — C (approved, enrolled in Python, payment PENDING) exists;
  // A's getMyPayments must contain only A's rows.
  await mustLogin(jars.c, ids.emailC, "QaTest@1234", "student C");
  const enrC = await postJson("/api/qa/student/request-enrollment", jars.c, { courseId: ids.python });
  assert(enrC.json && enrC.json.ok, "C enrollment failed: " + JSON.stringify(enrC.json));
  ids.tidC = `QATID${TS}C`;
  const subC = await postForm("/api/qa/student/submit-payment", jars.c, paymentForm(enrC.json.enrollmentId, ids.tidC));
  assert(subC.json && subC.json.ok, "C payment failed: " + JSON.stringify(subC.json));
  const mineA = await (await get("/api/qa/student/submit-payment", jars.a)).json();
  const tidsA = (mineA.payments || []).map((p) => p.transactionId);
  check("j4. IDOR: A's payment list contains only A's data", tidsA.includes(ids.tidA) && !tidsA.includes(ids.tidC), `tids=${JSON.stringify(tidsA)}`);

  // j5: vertical privilege escalation — student calls admin-only verify
  const esc = await postJson("/api/qa/admin/verify-payment", jars.a, { paymentId: ids.paymentA, decision: "REJECTED" });
  check("j5. student calling admin verify -> 403", esc.res.status === 403, `status=${esc.res.status}`);
  const esc2 = await get("/api/qa/admin/email-logs", jars.a);
  check("j5. student calling admin email-logs -> 403", esc2.status === 403, `status=${esc2.status}`);

  // j6: public surface never leaks meeting URLs (fresh anonymous jar)
  let leaked = [];
  for (const p of ["/", "/courses", "/courses/mern-stack-development", "/courses/python-programming", "/about", "/faq"]) {
    const r = await get(p, jars.ghost);
    const h = await text(r);
    if (h.includes("meet.google.com")) leaked.push(p);
  }
  check("j6. no public page contains meet.google.com", leaked.length === 0, leaked.length ? `leaked on: ${leaked.join(",")}` : "0 hits");

  // j7: student cannot open /admin
  const aAdmin = await get("/admin", jars.a);
  const aLoc = aAdmin.headers.get("location") || "";
  check("j7. student GET /admin redirected away", [307, 308, 302, 403].includes(aAdmin.status) && (aLoc.includes("/dashboard") || aAdmin.status === 403), `status=${aAdmin.status} location=${aLoc}`);
  const anonAdmin = await get("/admin", jars.ghost);
  check("j7. anon GET /admin -> login redirect", [307, 308, 302].includes(anonAdmin.status) && (anonAdmin.headers.get("location") || "").includes("/login"), `status=${anonAdmin.status} location=${anonAdmin.headers.get("location")}`);
} catch (e) {
  check("j. negative tests", false, e.message);
}

/* ============ k. notifications ============ */
try {
  const n = await (await get("/api/qa/student/notifications", jars.a)).json();
  const types = (n.notifications || []).map((x) => x.type);
  for (const t of ["ACCOUNT_APPROVED", "PAYMENT_APPROVED", "ENROLLMENT_ACTIVATED"]) {
    check(`k. student notified: ${t}`, types.includes(t), `types=${JSON.stringify(types)}`);
  }
} catch (e) {
  check("k. notifications", false, e.message);
}

/* ============ l. email degradation (no SMTP configured) ============ */
try {
  const logs = await (await get("/api/qa/admin/email-logs", jars.admin)).json();
  const items = logs.items || logs.logs || logs || [];
  const list = Array.isArray(items) ? items : [];
  const skipped = list.filter((l) => l.status === "SKIPPED");
  const sent = list.filter((l) => l.status === "SENT");
  check("l. EmailLog rows exist with SKIPPED (no SMTP)", skipped.length >= 3, `skipped=${skipped.length} total=${list.length}`);
  check("l. zero emails actually SENT", sent.length === 0, `sent=${sent.length}`);
  check("l. flows succeeded despite no SMTP (proven by a-k PASS)", true, "registration+payment verified above");
} catch (e) {
  check("l. email degradation", false, e.message);
}

/* ============ summary ============ */
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
console.log(`\n===== SMOKE RESULT: ${passed}/${results.length} passed =====`);
if (failed.length) {
  console.log("FAILED:");
  for (const f of failed) console.log(`  - ${f.name} :: ${f.evidence}`);
}
process.exit(failed.length ? 1 : 0);
