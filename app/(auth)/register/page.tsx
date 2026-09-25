"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

/** Student registration page. Signed-in users are bounced away by middleware. */
export default function RegisterPage() {
  return (
    <AuthShell
      wide
      title="Create your student account"
      description="Fill in your details below. An admin will review and approve your registration."
    >
      <RegisterForm />
    </AuthShell>
  );
}
