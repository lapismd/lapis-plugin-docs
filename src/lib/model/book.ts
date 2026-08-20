import type {
  DocsBookChapter,
  DocsBookChapterNavigation,
  DocsBookNavigation,
  DocsNote,
} from "./types";

function compareSourcePath(left: DocsNote, right: DocsNote) {
  const sourceCompare = left.sourcePath.localeCompare(right.sourcePath);
  if (sourceCompare !== 0) return sourceCompare;
  return left.id.localeCompare(right.id);
}

function chapterFromRef(
  noteId: string,
  index: number,
  notesById: Map<string, DocsNote>,
): DocsBookChapter {
  const note = notesById.get(noteId);
  if (!note) {
    return {
      index,
      noteId,
      title: noteId,
      summary: "",
      sourcePath: "",
      resolved: false,
      completed: false,
    };
  }
  const completedAt = note.completedAt?.trim() || undefined;
  return {
    index,
    noteId,
    title: note.title,
    summary: note.summary,
    sourcePath: note.sourcePath,
    resolved: true,
    completed: Boolean(completedAt),
    ...(completedAt ? { completedAt } : {}),
  };
}

function bookProgress(chapters: DocsBookChapter[]) {
  const resolvedChapters = chapters.filter((chapter) => chapter.resolved);
  const completedCount = resolvedChapters.filter((chapter) => chapter.completed).length;
  const resolvedCount = resolvedChapters.length;
  const progressPercent =
    resolvedCount === 0 ? 0 : Math.round((completedCount / resolvedCount) * 100);
  return { completedCount, resolvedCount, progressPercent };
}

function navigationForChapter(
  book: DocsBookNavigation,
  resolvedChapters: DocsBookChapter[],
  resolvedIndex: number,
): DocsBookChapterNavigation {
  return {
    bookId: book.id,
    bookIndexNoteId: book.indexNoteId,
    bookTitle: book.title,
    progressPercent: book.progressPercent,
    completedCount: book.completedCount,
    resolvedCount: book.resolvedCount,
    chapter: resolvedChapters[resolvedIndex]!,
    previousChapter: resolvedChapters[resolvedIndex - 1],
    nextChapter: resolvedChapters[resolvedIndex + 1],
  };
}

export function buildDocsBooks(notes: DocsNote[]) {
  const notesById = new Map(notes.map((note) => [note.id, note]));
  const indexNotes = notes
    .filter((note) => note.book?.chapters.length)
    .sort(compareSourcePath);
  const books: DocsBookNavigation[] = indexNotes.map((note) => {
    const chapters =
      note.book?.chapters.map((chapter, index) =>
        chapterFromRef(chapter.noteId, index, notesById),
      ) ?? [];
    return {
      id: note.id,
      indexNoteId: note.id,
      title: note.title,
      summary: note.summary,
      sourcePath: note.sourcePath,
      chapters,
      ...bookProgress(chapters),
    };
  });

  const booksById = new Map(books.map((book) => [book.id, book]));
  const bookChaptersByNoteId: Record<string, DocsBookChapterNavigation> = {};

  // Explicit bookId wins when the note appears in that book's TOC.
  for (const note of notes) {
    const bookId = note.bookId?.trim();
    if (!bookId) continue;
    const book = booksById.get(bookId);
    if (!book) continue;
    const resolvedChapters = book.chapters.filter((chapter) => chapter.resolved);
    const resolvedIndex = resolvedChapters.findIndex((chapter) => chapter.noteId === note.id);
    if (resolvedIndex < 0) continue;
    bookChaptersByNoteId[note.id] = navigationForChapter(book, resolvedChapters, resolvedIndex);
  }

  // Legacy / remaining: first TOC membership in book sourcePath order.
  for (const book of books) {
    const resolvedChapters = book.chapters.filter((chapter) => chapter.resolved);
    for (let resolvedIndex = 0; resolvedIndex < resolvedChapters.length; resolvedIndex += 1) {
      const chapter = resolvedChapters[resolvedIndex]!;
      if (bookChaptersByNoteId[chapter.noteId]) continue;
      bookChaptersByNoteId[chapter.noteId] = navigationForChapter(
        book,
        resolvedChapters,
        resolvedIndex,
      );
    }
  }

  return { books, bookChaptersByNoteId };
}

export function resolveDocsBookNavigation(
  books: DocsBookNavigation[],
  chapterNavigation: DocsBookChapterNavigation | null | undefined,
) {
  if (!chapterNavigation) return null;
  return books.find((book) => book.id === chapterNavigation.bookId) ?? null;
}
