"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { setCourseStatus, deleteCourse } from "@/server/actions/admin";
import { ROUTES } from "@/lib/constants";
import type { CourseStatus } from "@prisma/client";

interface CourseRowActionsProps {
  courseId: string;
  courseTitle: string;
  status: CourseStatus;
  enrollmentCount: number;
}

export function CourseRowActions({ courseId, courseTitle, status, enrollmentCount }: CourseRowActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function changeStatus(next: CourseStatus) {
    setBusy(true);
    try {
      const result = await setCourseStatus(courseId, next);
      if (result.ok) {
        toast.success(`Course ${next === "PUBLISHED" ? "published" : next === "ARCHIVED" ? "archived" : "moved to draft"}`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not update status");
      }
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`${ROUTES.adminCourses}/${courseId}`}>
        <Button size="sm" variant="outline">Edit</Button>
      </Link>
      <Select
        aria-label={`Change status of ${courseTitle}`}
        value={status}
        disabled={busy}
        onChange={(e) => changeStatus(e.target.value as CourseStatus)}
        className="!h-8 !w-auto text-xs"
      >
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
        <option value="ARCHIVED">Archived</option>
      </Select>
      <ConfirmDialog
        trigger={
          <Button size="sm" variant="danger">Delete</Button>
        }
        title={`Delete "${courseTitle}"?`}
        description={
          enrollmentCount > 0
            ? `This course has ${enrollmentCount} enrollment${enrollmentCount === 1 ? "" : "s"}. It will be archived instead of deleted to preserve history.`
            : "This will permanently delete the course, its modules and its class schedule. This cannot be undone."
        }
        confirmLabel={enrollmentCount > 0 ? "Archive course" : "Delete course"}
        onConfirm={() => deleteCourse(courseId).then((r) => {
          if (r.ok && enrollmentCount > 0) toast.success("Course archived (it has enrollments)");
          return r;
        })}
        onDone={() => router.refresh()}
      />
    </div>
  );
}
