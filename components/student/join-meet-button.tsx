"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JoinMeetButtonProps {
  courseId: string;
  courseTitle: string;
}

/**
 * Fetches the meeting URL from the secured /api/meet/[courseId] endpoint
 * (ACTIVE enrollment + approved current-month payment required) and opens
 * it in a new tab. The URL is never rendered into the page.
 */
export function JoinMeetButton({ courseId, courseTitle }: JoinMeetButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleJoin() {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch(`/api/meet/${encodeURIComponent(courseId)}`, {
        credentials: "same-origin",
      });

      if (response.ok) {
        const data = (await response.json()) as { url?: string };
        if (data.url) {
          window.open(data.url, "_blank", "noopener,noreferrer");
          return;
        }
        toast.error("The class link is not available right now.");
        return;
      }

      if (response.status === 401) {
        toast.error("Your session expired — please log in again.");
      } else if (response.status === 403) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        toast.error(data?.error ?? "You do not have access to this class yet.");
      } else if (response.status === 404) {
        toast.error("No class schedule has been set for this course yet.");
      } else if (response.status === 429) {
        toast.error("Too many requests — please wait a moment and try again.");
      } else {
        toast.error("Could not open the class link — please try again.");
      }
    } catch {
      toast.error("Could not open the class link — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleJoin}
      disabled={pending}
      aria-label={`Join the live Google Meet class for ${courseTitle}`}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Video className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? "Opening..." : "Join Google Meet"}
    </Button>
  );
}
