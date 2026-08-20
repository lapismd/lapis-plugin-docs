import type { DocsNote, DocsNoteSummary } from "./types";

/** Note-like rows used by sidebar lists (full notes or index summaries). */
export type DocsNoteListItem = DocsNote | DocsNoteSummary;

export function isDocsNoteSummary(note: DocsNoteListItem): note is DocsNoteSummary {
  return "cardCount" in note && !("blocks" in note);
}

export function docsNoteCardCount(note: DocsNoteListItem) {
  if ("cardCount" in note && typeof note.cardCount === "number") return note.cardCount;
  if ("cards" in note && Array.isArray(note.cards)) return note.cards.length;
  return 0;
}

export function docsNoteBlockCount(note: DocsNoteListItem) {
  if ("blockCount" in note && typeof note.blockCount === "number") return note.blockCount;
  if ("blocks" in note && Array.isArray(note.blocks)) return note.blocks.length;
  return 0;
}

export function docsNoteBodyLength(note: DocsNoteListItem) {
  if ("body" in note && typeof note.body === "string") return note.body.length;
  return 0;
}

export function docsNoteListKey(note: DocsNoteListItem) {
  return `${note.id}:${note.updatedAt}:${note.completedAt ?? ""}:${docsNoteBlockCount(note)}:${docsNoteCardCount(note)}:${docsNoteBodyLength(note)}`;
}
