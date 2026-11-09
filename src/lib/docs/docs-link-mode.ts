import type { DocsNotePanel } from '../model';

const DOCS_PROTOCOL_LINK =
  /^(?:cvstudio|lapis):\/\/docs\/([^/?#]+)(?:[/?#].*)?$/i;

export type DocsContentLinkTarget = {
  noteId: string;
  /** The id is present in the loaded Docs catalog, so the link can open it. */
  open: boolean;
};

/** Note id carried by a Docs content link, including card resource and wiki targets. */
export function docsContentLinkTarget(
  href: string,
  noteIds: ReadonlySet<string>,
): DocsContentLinkTarget | null {
  const raw = href.trim();
  if (!raw || raw.startsWith("#")) return null;

  const protocol = raw.match(DOCS_PROTOCOL_LINK);
  if (protocol) {
    const noteId = decodeNoteId(protocol[1] ?? "");
    return noteId ? { noteId, open: noteIds.has(noteId) } : null;
  }

  const queryNote = docsNoteIdFromWorkspaceHref(raw);
  if (queryNote) return { noteId: queryNote, open: noteIds.has(queryNote) };

  const bare = decodeNoteId(raw.split("#")[0] ?? "");
  if (!bare || bare.includes("/") || bare.includes(":")) return null;
  if (!noteIds.has(bare)) return null;
  return { noteId: bare, open: true };
}

/**
 * Opens a Docs note from a rendered content link.
 * Protocol links are cancelled even when the note is not in the catalog.
 */
export function openDocsContentLink(
  event: MouseEvent,
  notes: readonly { id: string }[],
  openNote: (noteId: string) => void,
): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (!(event.target instanceof Element)) return false;

  const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
  const href = anchor?.getAttribute("href");
  if (!href) return false;

  const target = docsContentLinkTarget(
    href,
    new Set(notes.map((note) => note.id)),
  );
  if (!target) return false;

  event.preventDefault();
  if (target.open) openNote(target.noteId);
  return true;
}

function decodeNoteId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

function docsNoteIdFromWorkspaceHref(href: string) {
  if (!href.includes("note=") || /^[a-z][a-z0-9+.-]*:/i.test(href)) return null;
  try {
    const url = new URL(href, "http://docs.local");
    const note = url.searchParams.get("note")?.trim();
    if (url.searchParams.get("workspace") !== "docs" || !note) return null;
    return decodeNoteId(note);
  } catch {
    return null;
  }
}

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
