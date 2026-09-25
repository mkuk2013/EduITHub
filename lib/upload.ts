/**
 * File upload helper (owned by the payments workstream).
 *
 * Stores uploaded files under UPLOAD_DIR and returns a DB-safe relative path
 * like `payments/2026-09/<uuid>.jpg`. Never trusts the client filename.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { UPLOADS, MAX_UPLOAD_MB } from "./constants";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const ALLOWED_SUBDIRS = new Set<string>([
  UPLOADS.payments,
  UPLOADS.avatars,
  UPLOADS.materials,
]);

/**
 * Validate and store an uploaded file.
 *
 * @param file   The File object from FormData.
 * @param subdir One of the allowed subdirectories (e.g. "payments").
 * @returns      Relative path for the DB, e.g. "payments/2026-09/<uuid>.jpg".
 * @throws       When the subdir, MIME type, or size is invalid.
 */
export async function saveUpload(file: File, subdir: string): Promise<string> {
  if (!ALLOWED_SUBDIRS.has(subdir)) {
    throw new Error(`Invalid upload directory: ${subdir}`);
  }

  const extension = ALLOWED_MIME_TYPES[file.type];
  if (!extension) {
    throw new Error("Only JPG, PNG or WebP images are allowed");
  }

  if (file.size === 0) {
    throw new Error("The uploaded file is empty");
  }

  const maxBytes = MAX_UPLOAD_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File must be smaller than ${MAX_UPLOAD_MB} MB`);
  }

  const now = new Date();
  const datePath = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const targetDir = join(process.cwd(), UPLOADS.dir, subdir, datePath);
  await mkdir(targetDir, { recursive: true });

  const filename = `${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(targetDir, filename), buffer);

  return `${subdir}/${datePath}/${filename}`;
}
