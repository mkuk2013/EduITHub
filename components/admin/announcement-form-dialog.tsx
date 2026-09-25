"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Plus, Pencil } from "lucide-react";
import { createAnnouncement, updateAnnouncement, getAnnouncement } from "@/server/actions/admin";

interface CourseOption {
  id: string;
  title: string;
}

interface AnnouncementFormDialogProps {
  courses: CourseOption[];
  announcementId?: string;
}

export function AnnouncementFormDialog({ courses, announcementId }: AnnouncementFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", courseId: "" });
  const isEdit = Boolean(announcementId);

  async function openDialog() {
    setOpen(true);
    if (announcementId) {
      setLoading(true);
      try {
        const a = await getAnnouncement(announcementId);
        if (a) {
          setForm({ title: a.title, content: a.content, courseId: a.courseId ?? "" });
        } else {
          toast.error("Announcement not found");
          setOpen(false);
        }
      } catch {
        toast.error("Could not load the announcement");
        setOpen(false);
      } finally {
        setLoading(false);
      }
    } else {
      setForm({ title: "", content: "", courseId: "" });
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      courseId: form.courseId || null,
    };
    setBusy(true);
    try {
      const result = isEdit
        ? await updateAnnouncement(announcementId!, payload)
        : await createAnnouncement(payload);
      if (result.ok) {
        toast.success(isEdit ? "Announcement updated" : "Announcement created as draft");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not save the announcement");
      }
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {isEdit ? (
        <Button size="sm" variant="outline" onClick={openDialog}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
        </Button>
      ) : (
        <Button onClick={openDialog}>
          <Plus className="h-4 w-4" aria-hidden="true" /> New announcement
        </Button>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? "Edit announcement" : "New announcement"}
        description={isEdit ? "Update the announcement content." : "Announcements are saved as drafts. Publish them when ready."}
        className="max-w-xl"
      >
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading…</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor={isEdit ? `a-title-${announcementId}` : "a-title"}>Title</Label>
              <Input
                id={isEdit ? `a-title-${announcementId}` : "a-title"}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                minLength={3}
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor={isEdit ? `a-course-${announcementId}` : "a-course"}>Target</Label>
              <Select
                id={isEdit ? `a-course-${announcementId}` : "a-course"}
                value={form.courseId}
                onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
              >
                <option value="">All students</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} only
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor={isEdit ? `a-content-${announcementId}` : "a-content"}>Content</Label>
              <Textarea
                id={isEdit ? `a-content-${announcementId}` : "a-content"}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                required
                minLength={10}
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : isEdit ? "Save changes" : "Create draft"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
