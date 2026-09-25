"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  className?: string;
}

/** Signs the student out and returns them to the login page. */
export function LogoutButton({ variant = "ghost", className }: LogoutButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await signOut({ callbackUrl: ROUTES.login });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleLogout}
      disabled={pending}
      className={cn("gap-2", className)}
      aria-label="Log out of your account"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {pending ? "Logging out..." : "Logout"}
    </Button>
  );
}
