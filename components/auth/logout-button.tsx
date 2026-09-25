"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Client-side log-out button (used on /pending-approval and /blocked). */
export function LogoutButton({
  variant = "outline",
  className,
}: {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  className?: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await signOut({ callbackUrl: ROUTES.login });
    } catch {
      toast.error("Could not log out — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={cn(className)}
      disabled={pending}
      onClick={handleLogout}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {pending ? "Logging out…" : "Log out"}
    </Button>
  );
}
