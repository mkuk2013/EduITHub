"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

/** Sign-in page. Signed-in users are bounced away by middleware. */
export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue learning with Edu IT Hub Academy."
    >
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
