import type { DocsNotePanel } from '../model';

export function preservePreviewModeForDocsLink(event: MouseEvent, activePanel: DocsNotePanel) {
  if (event.defaultPrevented || activePanel !== "display") return;
  if (typeof window === "undefined") return;
  if (!(event.target instanceof Element)) return;

  const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
  if (!anchor) return;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  if (url.searchParams.get("workspace") !== "docs") return;
  if (!url.searchParams.get("note")) return;
  if (
    url.searchParams.has("preview") ||
    url.searchParams.has("edit") ||
    url.searchParams.has("docsPanel")
  ) {
    return;
  }

  url.searchParams.set("preview", "1");
  anchor.href = `${url.pathname}${url.search}${url.hash}`;
}
