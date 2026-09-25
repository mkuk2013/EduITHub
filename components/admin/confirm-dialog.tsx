"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => Promise<{ ok: boolean; error?: string }>;
  onDone?: () => void;
}

/** Confirmation dialog wrapping a destructive/important async action with toast feedback. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
  onConfirm,
  onDone,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      const result = await onConfirm();
      if (result.ok) {
        toast.success("Done");
        setOpen(false);
        onDone?.();
      } else {
        toast.error(result.error ?? "Action failed — please try again");
      }
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-flex">{trigger}</span>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} description={description}>
        <div className="flex items-start gap-3">
          <div
            className={
              tone === "danger"
                ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"
                : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700"
            }
            aria-hidden="true"
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-600">This action will be recorded in the audit log.</p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant={tone} onClick={handleConfirm} disabled={busy}>
            {busy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
