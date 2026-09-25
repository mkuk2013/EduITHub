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
import { upsertClassSchedule } from "@/server/actions/admin";
import { ROUTES } from "@/lib/constants";

const DAYS = [
  { value: "Mon", label: "Monday" },
  { value: "Tue", label: "Tuesday" },
  { value: "Wed", label: "Wednesday" },
  { value: "Thu", label: "Thursday" },
  { value: "Fri", label: "Friday" },
  { value: "Sat", label: "Saturday" },
  { value: "Sun", label: "Sunday" },
];

interface InstructorOption {
  id: string;
  name: string;
}

interface ScheduleFormInitial {
  meetingUrl: string;
  days: string[];
  startTime: string;
  endTime: string;
  timezone: string;
  instructorId: string | null;
  instructions: string;
}

interface ClassScheduleFormProps {
  courseId: string;
  courseTitle: string;
  instructors: InstructorOption[];
  initial: ScheduleFormInitial | null;
}

export function ClassScheduleForm({ courseId, courseTitle, instructors, initial }: ClassScheduleFormProps) {
  const router = useRouter();
  const [days, setDays] = useState<string[]>(initial?.days ?? ["Mon", "Wed", "Fri"]);
  const [busy, setBusy] = useState(false);

  function toggleDay(value: string) {
    setDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (days.length === 0) {
      toast.error("Select at least one class day");
      return;
    }
    const form = event.currentTarget;
    const formData = new FormData(form);
    const startTime = String(formData.get("startTime") ?? "");
    const endTime = String(formData.get("endTime") ?? "");
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    setBusy(true);
    try {
      const result = await upsertClassSchedule(courseId, {
        meetingUrl: String(formData.get("meetingUrl") ?? ""),
        days,
        startTime,
        endTime,
        timezone: String(formData.get("timezone") ?? "Asia/Karachi"),
        instructorId: (formData.get("instructorId") as string) || null,
        instructions: String(formData.get("instructions") ?? ""),
      });
      if (result.ok) {
        toast.success(`Class schedule saved for ${courseTitle}`);
        router.push(ROUTES.adminClasses);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not save the schedule");
      }
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Class schedule — {courseTitle}</CardTitle>
          <CardDescription>
            This schedule belongs only to this course. The meeting link is shown only to students with an active enrollment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label htmlFor="meetingUrl">Google Meet URL</Label>
            <Input
              id="meetingUrl"
              name="meetingUrl"
              type="url"
              defaultValue={initial?.meetingUrl ?? ""}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-slate-500">
              Leave empty to remove the link. Changing it here never affects other courses.
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-900">Class days</legend>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <label
                  key={d.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    days.includes(d.value)
                      ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                      : "border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={days.includes(d.value)}
                    onChange={() => toggleDay(d.value)}
                    className="sr-only"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="startTime">Start time</Label>
              <Input id="startTime" name="startTime" type="time" defaultValue={initial?.startTime ?? "18:00"} required />
            </div>
            <div>
              <Label htmlFor="endTime">End time</Label>
              <Input id="endTime" name="endTime" type="time" defaultValue={initial?.endTime ?? "19:30"} required />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" name="timezone" defaultValue={initial?.timezone ?? "Asia/Karachi"} required maxLength={60} />
            </div>
          </div>

          <div>
            <Label htmlFor="instructorId">Instructor</Label>
            <Select id="instructorId" name="instructorId" defaultValue={initial?.instructorId ?? ""}>
              <option value="">No instructor assigned</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="instructions">Instructions for students</Label>
            <Textarea
              id="instructions"
              name="instructions"
              defaultValue={initial?.instructions ?? ""}
              rows={4}
              maxLength={5000}
              placeholder="e.g. Join 5 minutes early with your camera on. Keep your mic muted unless speaking."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push(ROUTES.adminClasses)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save schedule"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
