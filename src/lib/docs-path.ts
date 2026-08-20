export const DOCS_DOCUMENT_VIEW_TYPE = "docs-document";

export const DOCS_FILENAME_PATTERNS = ["*.doc.md"] as const;

export const DOCS_EXTENSIONS = ["doc.md"] as const;

export const DOCS_FILE_GLOB = "**/*.doc.md";

export function isDocsDocumentPath(path: string): boolean {
  return /\.doc\.md$/i.test(path.replaceAll("\\", "/"));
}

export function docsDocumentExtension(path: string): string {
  return isDocsDocumentPath(path) ? "doc.md" : "";
}
