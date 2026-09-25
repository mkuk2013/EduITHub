"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  approveStudent,
  rejectStudent,
  suspendStudent,
  reactivateStudent,
} from "@/server/actions/admin";

interface StudentActionsProps {
  studentId: string;
  studentName: string;
  status: string;
}

type PendingAction = "approve" | "reject" | "suspend" | "reactivate" | null;

const ACTION_COPY: Record<Exclude<PendingAction, null>, { title: string; description: string; confirm: string; needsNote: boolean }> = {
  approve: {
    title: "Approve student",
    description: "The student will be notified by in-app notification and email, and can sign in immediately.",
    confirm: "Approve",
    needsNote: false,
  },
  reject: {
    title: "Reject application",
    description: "The student will be notified. Optionally include a reason — it is shared with the student.",
    confirm: "Reject",
    needsNote: true,
  },
  suspend: {
    title: "Suspend student",
    description: "The student loses access to the dashboard and classes until reactivated.",
    confirm: "Suspend",
    needsNote: true,
  },
  reactivate: {
    title: "Reactivate student",
    description: "The student's account returns to approved status with full access.",
    confirm: "Reactivate",
    needsNote: false,
  },
};

export function StudentActions({ studentId, studentName, status }: StudentActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAction>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!pending) return;
    setBusy(true);
    try {
      const actions = { approve: approveStudent, reject: rejectStudent, suspend: suspendStudent, reactivate: reactivateStudent };
      const result =
        pending === "approve" || pending === "reactivate"
          ? await actions[pending](studentId)
          : await actions[pending](studentId, note.trim() || undefined);
      if (result.ok) {
        toast.success(
          pending === "approve" ? "Student approved" : pending === "reject" ? "Application rejected" : pending === "suspend" ? "Student suspended" : "Student reactivated",
        );
        setPending(null);
        setNote("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Action failed — please try again");
      }
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setBusy(false);
    }
  }

  const copy = pending ? ACTION_COPY[pending] : null;

  return (
    <div className="flex flex-wrap gap-2">
      {status === "PENDING_APPROVAL" ? (
        <>
          <Button size="sm" onClick={() => setPending("approve")}>Approve</Button>
          <Button size="sm" variant="outline" onClick={() => setPending("reject")}>Reject</Button>
        </>
      ) : null}
      {status === "APPROVED" ? (
        <Button size="sm" variant="danger" onClick={() => setPending("suspend")}>Suspend</Button>
      ) : null}
      {(status === "SUSPENDED" || status === "REJECTED") ? (
        <Button size="sm" variant="outline" onClick={() => setPending("reactivate")}>Reactivate</Button>
      ) : null}

      <Dialog
        open={pending !== null}
        onClose={() => setPending(null)}
        title={copy ? `${copy.title}: ${studentName}` : ""}
        description={copy?.description}
      >
        {copy?.needsNote ? (
          <div className="mb-4">
            <Label htmlFor="admin-note">Reason (shared with the student)</Label>
            <Textarea id="admin-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Optional reason…" />
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPending(null)} disabled={busy}>Cancel</Button>
          <Button variant={pending === "approve" || pending === "reactivate" ? "primary" : "danger"} onClick={run} disabled={busy}>
            {busy ? "Working…" : (copy?.confirm ?? "Confirm")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
