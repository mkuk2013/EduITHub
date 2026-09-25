"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestEnrollment } from "@/server/actions/student";

/**
 * Enrolls the signed-in student in a course, then hands them to the
 * payments page with the new enrollment preselected.
 */
export function EnrollButton({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleEnroll() {
    if (pending) return;
    setPending(true);
    try {
      const result = await requestEnrollment(courseId);
      if (result.ok && result.enrollmentId) {
        toast.success(`Enrolled in ${courseTitle} — please submit your fee to activate.`);
        router.push(`/dashboard/payments?enroll=${result.enrollmentId}`);
      } else {
        toast.error(result.error ?? "Could not enroll — please try again.");
      }
    } catch {
      toast.error("Could not enroll — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" onClick={handleEnroll} disabled={pending} className="w-full sm:w-auto">
      <Plus className="h-4 w-4" aria-hidden="true" />
      {pending ? "Enrolling..." : "Enroll Now"}
    </Button>
  );
}
