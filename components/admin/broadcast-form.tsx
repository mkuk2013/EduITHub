"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { sendBroadcast } from "@/server/actions/admin";
import { NotificationType } from "@prisma/client";

const TYPES: NotificationType[] = [
  "GENERAL",
  "ANNOUNCEMENT",
  "FEE_REMINDER",
  "CLASS_REMINDER",
  "COURSE_UPDATE",
];

interface BroadcastFormProps {
  courses: Array<{ id: string; title: string }>;
}

export function BroadcastForm({ courses }: BroadcastFormProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const result = await sendBroadcast({
        title: String(formData.get("title") ?? ""),
        message: String(formData.get("message") ?? ""),
        type: (formData.get("type") as NotificationType) || "GENERAL",
        link: String(formData.get("link") ?? ""),
        courseId: (formData.get("courseId") as string) || null,
        sendEmail: formData.get("sendEmail") === "on",
      });
      if (result.ok) {
        toast.success(`Notification sent to ${result.recipientCount} student${result.recipientCount === 1 ? "" : "s"}`);
        event.currentTarget.reset();
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not send the notification");
      }
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send notification</CardTitle>
        <CardDescription>
          Broadcast to all approved students or to students with an active enrollment in one course.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="n-title">Title</Label>
              <Input id="n-title" name="title" required minLength={3} maxLength={200} placeholder="e.g. Fee reminder for October" />
            </div>
            <div>
              <Label htmlFor="n-type">Type</Label>
              <Select id="n-type" name="type" defaultValue="GENERAL">
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.split("_").map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join(" ")}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="n-message">Message</Label>
            <Textarea id="n-message" name="message" required minLength={10} maxLength={2000} rows={4} placeholder="Write the notification message…" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="n-target">Target</Label>
              <Select id="n-target" name="courseId" defaultValue="">
                <option value="">All approved students</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (active enrollments)
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="n-link">Link (optional)</Label>
              <Input id="n-link" name="link" maxLength={500} placeholder="/dashboard/payments" />
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="sendEmail" className="h-4 w-4 rounded border-slate-300 text-indigo-700 focus:ring-indigo-600" />
            Also send as email to every recipient
          </label>
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send notification"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
