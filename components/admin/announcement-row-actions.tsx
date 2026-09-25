"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { publishAnnouncement, deleteAnnouncement, setAnnouncementStatus } from "@/server/actions/admin";
import type { AnnouncementStatus } from "@prisma/client";
import { Megaphone, Archive, Trash2 } from "lucide-react";

interface AnnouncementRowActionsProps {
  announcementId: string;
  title: string;
  status: AnnouncementStatus;
}

export function AnnouncementRowActions({ announcementId, title, status }: AnnouncementRowActionsProps) {
  const router = useRouter();

  async function archive() {
    try {
      const result = await setAnnouncementStatus(announcementId, "ARCHIVED");
      if (result.ok) {
        toast.success("Announcement archived");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not archive");
      }
    } catch {
      toast.error("Something went wrong — please try again");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "PUBLISHED" ? (
        <ConfirmDialog
          trigger={
            <Button size="sm">
              <Megaphone className="h-3.5 w-3.5" aria-hidden="true" /> Publish
            </Button>
          }
          title={`Publish "${title}"?`}
          description="This will notify every targeted student (in-app notification and email) immediately."
          confirmLabel="Publish now"
          tone="primary"
          onConfirm={() => publishAnnouncement(announcementId)}
          onDone={() => {
            toast.success("Announcement published — students notified");
            router.refresh();
          }}
        />
      ) : null}
      {status === "PUBLISHED" ? (
        <Button size="sm" variant="outline" onClick={archive}>
          <Archive className="h-3.5 w-3.5" aria-hidden="true" /> Archive
        </Button>
      ) : null}
      <ConfirmDialog
        trigger={
          <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        }
        title={`Delete "${title}"?`}
        description="This permanently deletes the announcement. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => deleteAnnouncement(announcementId)}
        onDone={() => router.refresh()}
      />
    </div>
  );
}
