import type { DocsBookChapter, DocsBookNavigation, DocsNoteSummary } from '../../model';

import {
  DEFAULT_DOCS_NOTE_SORT,
  compareDocsNotes,
  type DocsNoteSortMode
} from './docs-note-sort';

export type DocsBookNoteTreeStandalone = {
  kind: 'standalone';
  note: DocsNoteSummary;
};

export type DocsBookNoteTreeBook = {
  kind: 'book';
  book: DocsBookNavigation;
  /** Present when the index note is in the filtered set; otherwise null. */
  indexNote: DocsNoteSummary | null;
  chapters: DocsNoteSummary[];
};

export type DocsBookNoteTreeEntry = DocsBookNoteTreeStandalone | DocsBookNoteTreeBook;

function compareText(left: string, right: string) {
  return left.localeCompare(right, undefined, { sensitivity: 'base' });
}

function entrySortNote(entry: DocsBookNoteTreeEntry): DocsNoteSummary | null {
  if (entry.kind === 'standalone') return entry.note;
  return entry.indexNote;
}

function entrySortTitle(entry: DocsBookNoteTreeEntry) {
  if (entry.kind === 'standalone') return entry.note.title;
  return entry.indexNote?.title ?? entry.book.title;
}

function entrySortId(entry: DocsBookNoteTreeEntry) {
  if (entry.kind === 'standalone') return entry.note.id;
  return entry.book.indexNoteId;
}

function compareEntries(
  left: DocsBookNoteTreeEntry,
  right: DocsBookNoteTreeEntry,
  mode: DocsNoteSortMode
) {
  const leftNote = entrySortNote(left);
  const rightNote = entrySortNote(right);
  if (leftNote && rightNote) return compareDocsNotes(leftNote, rightNote, mode);
  return compareText(entrySortTitle(left), entrySortTitle(right)) || compareText(entrySortId(left), entrySortId(right));
}

function summaryFromBookChapter(chapter: DocsBookChapter): DocsNoteSummary {
  return {
    id: chapter.noteId,
    title: chapter.title || chapter.noteId,
    docType: 'freeform',
    summary: chapter.summary ?? '',
    aliases: [],
    tags: [],
    sourcePath: chapter.sourcePath || `docs/${chapter.noteId}.doc.md`,
    createdAt: chapter.completedAt ?? '',
    updatedAt: chapter.completedAt ?? '',
    cardCount: 0,
    blockCount: 0,
    ...(chapter.completedAt ? { completedAt: chapter.completedAt } : {})
  };
}

/**
 * Nest filtered notes under books using workspace.books TOC membership.
 * Chapter notes listed in any book are omitted from the top level.
 *
 * When a book is visible (index or any chapter matches the filter), the full
 * book.chapters TOC is listed — including unresolved entries — so sibling
 * chapters are not dropped by partial filters.
 */
export function createDocsBookNoteTree(
  filteredNotes: DocsNoteSummary[],
  books: DocsBookNavigation[],
  sortMode: DocsNoteSortMode = DEFAULT_DOCS_NOTE_SORT
): DocsBookNoteTreeEntry[] {
  const filteredById = new Map(filteredNotes.map((note) => [note.id, note]));
  const chapterNoteIds = new Set<string>();
  const indexNoteIds = new Set<string>();

  for (const book of books) {
    indexNoteIds.add(book.indexNoteId);
    for (const chapter of book.chapters) {
      chapterNoteIds.add(chapter.noteId);
    }
  }

  const entries: DocsBookNoteTreeEntry[] = [];

  for (const book of books) {
    const indexNote = filteredById.get(book.indexNoteId) ?? null;
    const matchedChapter = book.chapters.some((chapter) => filteredById.has(chapter.noteId));
    if (!indexNote && !matchedChapter) continue;

    const chapters = book.chapters.map(
      (chapter) => filteredById.get(chapter.noteId) ?? summaryFromBookChapter(chapter)
    );

    entries.push({
      kind: 'book',
      book,
      indexNote,
      chapters
    });
  }

  for (const note of filteredNotes) {
    if (indexNoteIds.has(note.id) || chapterNoteIds.has(note.id)) continue;
    entries.push({ kind: 'standalone', note });
  }

  return entries.sort((left, right) => compareEntries(left, right, sortMode));
}
