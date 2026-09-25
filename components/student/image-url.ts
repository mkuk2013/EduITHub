/**
 * Resolves a stored relative upload path to a public URL.
 * DB stores paths like "profiles/<uuid>.jpg"; files are served from
 * /uploads/<relative-path> (see CONTRACTS §5).
 */
export function profileImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  return `/uploads/${path}`;
}
