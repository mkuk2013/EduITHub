"use server";

/**
 * Authentication server actions (auth workstream):
 * student registration, credential login, logout.
 *
 * All inputs are validated with zod schemas from `@/lib/validators` before
 * any database access. Passwords are handled with bcryptjs only — never
 * stored or compared in plain text.
 */

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { NotificationType, Prisma } from "@prisma/client";
import type { ZodError } from "zod";
import { signIn, signOut, RateLimitExceededError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validators";
import { saveUpload } from "@/lib/upload";
import { ROUTES } from "@/lib/constants";

export interface AuthActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  /** Where the client should navigate after a successful action. */
  redirectTo?: string;
}

function formString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function toFieldErrors(error: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const fieldErrors = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages && messages.length > 0) out[key] = messages;
  }
  return out;
}

/**
 * Best-effort welcome email. `lib/email.ts` is owned by the payments
 * workstream and may not exist yet, so the specifier is built at runtime:
 * webpack then emits a lazy context for `@/lib/*` instead of hard-resolving
 * the module, and a missing module simply rejects the import — registration
 * never fails because of email.
 */
async function sendWelcomeEmailBestEffort(to: string, name: string): Promise<void> {
  try {
    const specifier = ["@", "lib", "email"].join("/");
    const mod = (await import(specifier)) as unknown;
    if (!mod || typeof mod !== "object") return;
    const exports = mod as Record<string, unknown>;

    const sendWelcome = exports["sendWelcomeEmail"];
    if (typeof sendWelcome === "function") {
      await (sendWelcome as (to: string, name: string) => Promise<unknown>)(to, name);
      return;
    }
    const sendEmail = exports["sendEmail"];
    if (typeof sendEmail === "function") {
      await (
        sendEmail as (opts: { to: string; subject: string; text: string }) => Promise<unknown>
      )({
        to,
        subject: "Welcome to Edu IT Hub Academy",
        text: `Hi ${name},\n\nYour registration has been received and is waiting for admin approval. We will notify you once your account is approved.\n\n— Edu IT Hub Academy`,
      });
    }
  } catch {
    // lib/email.ts is not available yet — skip silently.
  }
}

/**
 * Register a new student account.
 * Creates User{role: STUDENT, status: PENDING_APPROVAL} + StudentProfile in
 * one transaction, notifies every admin, then signs the student in so they
 * land on /pending-approval.
 */
export async function registerStudent(formData: FormData): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse({
    name: formString(formData.get("name")),
    email: formString(formData.get("email")),
    password: formString(formData.get("password")),
    confirmPassword: formString(formData.get("confirmPassword")),
    phone: formString(formData.get("phone")),
    city: formString(formData.get("city")),
    address: formString(formData.get("address")),
    extraInfo: formString(formData.get("extraInfo")),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }
  const { name, email, password, phone } = parsed.data;
  const city = parsed.data.city || undefined;
  const address = parsed.data.address || undefined;
  const extraInfo = parsed.data.extraInfo || undefined;

  // Optional profile picture — validated & stored by the shared upload helper
  // (payments workstream owns lib/upload.ts; "avatars" is its profile-image subdir).
  let profileImage: string | null = null;
  const picture = formData.get("profilePicture");
  if (picture instanceof File && picture.size > 0) {
    try {
      profileImage = await saveUpload(picture, "avatars");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not upload the profile picture.";
      return { ok: false, fieldErrors: { profilePicture: [message] } };
    }
  }

  // Email AND phone must be unique.
  const [emailTaken, phoneTaken] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.studentProfile.findUnique({ where: { phone }, select: { id: true } }),
  ]);
  const conflicts: Record<string, string[]> = {};
  if (emailTaken) {
    conflicts.email = ["An account with this email already exists. Please log in instead."];
  }
  if (phoneTaken) {
    conflicts.phone = ["This phone number is already registered."];
  }
  if (Object.keys(conflicts).length > 0) {
    return { ok: false, fieldErrors: conflicts };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: "STUDENT",
            status: "PENDING_APPROVAL",
            studentProfile: {
              create: {
                phone,
                city: city ?? null,
                address: address ?? null,
                extraInfo: extraInfo ?? null,
                profileImage,
              },
            },
          },
          select: { id: true },
        });

        if (admins.length > 0) {
          await tx.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.id,
              title: "New student registration",
              message: `${name} (${email}) has registered and is waiting for approval.`,
              type: NotificationType.REGISTRATION_RECEIVED,
              link: "/admin/approvals",
            })),
          });
        }
      },
      {
        maxWait: 15000,
        timeout: 30000,
      },
    );
  } catch (err) {
    // Narrow race: two concurrent registrations with the same email/phone.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = ((err.meta?.target as string[] | undefined) ?? []).join(",");
      if (target.includes("email")) {
        return {
          ok: false,
          fieldErrors: { email: ["An account with this email already exists."] },
        };
      }
      if (target.includes("phone")) {
        return {
          ok: false,
          fieldErrors: { phone: ["This phone number is already registered."] },
        };
      }
      return { ok: false, error: "An account with these details already exists." };
    }
    throw err;
  }

  // Best-effort welcome email — never fails registration.
  await sendWelcomeEmailBestEffort(email, name);

  // Sign the new student in so they land on /pending-approval immediately.
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { ok: true, redirectTo: ROUTES.pendingApproval };
  } catch {
    return { ok: true, redirectTo: ROUTES.login };
  }
}

/**
 * Log a user in with email + password.
 * Returns a structured result; the client navigates to `redirectTo` on success.
 */
export async function loginUser(formData: FormData): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse({
    email: formString(formData.get("email")),
    password: formString(formData.get("password")),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }
  const { email, password } = parsed.data;

  try {
    // redirect:false → returns the target URL instead of throwing a redirect;
    // the session cookie is still set on the response.
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return {
        ok: false,
        error: "Too many login attempts. Please wait a few minutes and try again.",
      };
    }
    if (error instanceof AuthError) {
      // CredentialsSignin (unknown email or wrong password). Kept generic
      // on purpose to avoid leaking which emails are registered.
      return { ok: false, error: "Invalid email or password." };
    }
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true, status: true },
  });

  let redirectTo: string = ROUTES.login;
  if (user?.role === "ADMIN") {
    redirectTo = ROUTES.admin;
  } else if (user?.status === "APPROVED") {
    redirectTo = ROUTES.dashboard;
  } else if (user?.status === "PENDING_APPROVAL") {
    redirectTo = ROUTES.pendingApproval;
  } else {
    redirectTo = ROUTES.blocked;
  }
  return { ok: true, redirectTo };
}

/** Log the current user out and send them to the login page. */
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: ROUTES.login });
}
