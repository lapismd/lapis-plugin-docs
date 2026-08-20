/**
 * Resolve co-located docs media paths from markdown image `src` values.
 * Leaves http(s), data:, and root-absolute paths unchanged.
 * Relative paths resolve against the note file under `data/docs/`.
 * Paths that escape `data/docs/` are left unchanged.
 */

const DOCS_ROOT_PREFIX = "data/docs/";
const MEDIA_API_PREFIX = "/api/docs/media/";
/**
 * Path-shaped sentinel so rehype-sanitize keeps the src (custom protocols
 * like `cvstudio-docs-media:` are stripped and leave relative `../media/...`
 * URLs that 404 as `/media/...` in the browser).
 */
export const DOCS_MEDIA_SENTINEL_PREFIX = "/__cvstudio-docs-media__/";

export type DocsMediaUrlResolver = (
  relativePath: string,
) => string | Promise<string>;

function normalizeSourcePath(sourcePath: string) {
  return sourcePath.trim().replace(/^\/+/, "").replaceAll("\\", "/");
}

function resolvePosix(baseDir: string, relative: string) {
  const parts = baseDir.split("/").filter(Boolean);
  for (const part of relative.replaceAll("\\", "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (parts.length === 0) return null;
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}

/** Encode a path under data/docs/ as a sync preview sentinel. */
export function encodeDocsMediaSentinel(relativePath: string) {
  return `${DOCS_MEDIA_SENTINEL_PREFIX}${relativePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

/** Decode a sentinel back to a data/docs-relative path, or null. */
export function decodeDocsMediaSentinel(src: string) {
  const trimmed = src.trim();
  if (!trimmed.startsWith(DOCS_MEDIA_SENTINEL_PREFIX)) return null;
  const encoded = trimmed.slice(DOCS_MEDIA_SENTINEL_PREFIX.length);
  if (!encoded) return null;
  try {
    return encoded
      .split("/")
      .map((segment) => decodeURIComponent(segment))
      .join("/");
  } catch {
    return null;
  }
}

/** Default server runtime URL for a path under data/docs/. */
export function serverDocsMediaUrl(relativePath: string) {
  return `${MEDIA_API_PREFIX}${relativePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

/**
 * Resolve a markdown image src to a path under `data/docs/` (without the prefix).
 * Returns null for external, absolute, invalid, or escaping paths.
 */
export function resolveDocsMediaRelativePath(
  src: string,
  sourcePath: string,
): string | null {
  const trimmed = src.trim();
  if (!trimmed) return null;
  if (/^(https?:|data:)/i.test(trimmed)) return null;
  if (trimmed.startsWith(DOCS_MEDIA_SENTINEL_PREFIX)) {
    return decodeDocsMediaSentinel(trimmed);
  }
  if (trimmed.startsWith("/")) return null;

  const notePath = normalizeSourcePath(sourcePath);
  if (!notePath.startsWith(DOCS_ROOT_PREFIX)) return null;

  const slash = notePath.lastIndexOf("/");
  if (slash < 0) return null;
  const noteDir = notePath.slice(0, slash);
  const resolved = resolvePosix(noteDir, trimmed);
  if (!resolved || !resolved.startsWith(DOCS_ROOT_PREFIX)) return null;

  return resolved.slice(DOCS_ROOT_PREFIX.length);
}

/**
 * Rewrite a markdown image src for preview.
 * By default emits the server API URL; pass `encodeDocsMediaSentinel` for
 * deferred runtime resolution.
 */
export function rewriteDocsRelativeMediaSrc(
  src: string,
  sourcePath: string,
  resolveUrl: DocsMediaUrlResolver = serverDocsMediaUrl,
): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (/^(https?:|data:)/i.test(trimmed)) return trimmed;
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith(DOCS_MEDIA_SENTINEL_PREFIX)
  ) {
    return trimmed;
  }

  const relativePath = resolveDocsMediaRelativePath(trimmed, sourcePath);
  if (!relativePath) return trimmed;

  const resolved = resolveUrl(relativePath);
  if (typeof resolved !== "string") {
    // Async resolvers must use the sentinel + post-render path.
    return encodeDocsMediaSentinel(relativePath);
  }
  return resolved;
}
