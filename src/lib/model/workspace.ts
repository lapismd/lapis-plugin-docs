import { buildDocsBooks } from "./book";
import { buildDocsReviewQueue } from "./fsrs";
import { buildDocsGraph } from "./graph";
import type {
  DocsNote,
  DocsNoteSummary,
  DocsReviewQueueSummaryItem,
  DocsWorkspace,
  DocsWorkspaceIndex,
} from "./types";

export function docsNoteToSummary(
  note: DocsNote,
  dueCardCount = 0,
): DocsNoteSummary {
  return {
    id: note.id,
    title: note.title,
    docType: note.docType,
    summary: note.summary,
    aliases: note.aliases,
    tags: note.tags,
    sourcePath: note.sourcePath,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    ...(note.completedAt ? { completedAt: note.completedAt } : {}),
    cardCount: note.cards.length,
    blockCount: note.blocks.length,
    ...(dueCardCount > 0 ? { dueCardCount } : {}),
    ...(note.book ? { book: note.book } : {}),
    ...(note.bookId ? { bookId: note.bookId } : {}),
  };
}

export function buildDocsWorkspace(notes: DocsNote[], now = new Date()): DocsWorkspace {
  const sortedNotes = [...notes].sort((left, right) =>
    left.title.localeCompare(right.title),
  );
  const graph = buildDocsGraph(sortedNotes);
  const { books, bookChaptersByNoteId } = buildDocsBooks(sortedNotes);
  return {
    notes: sortedNotes,
    graph,
    reviewQueue: buildDocsReviewQueue(sortedNotes, now),
    tags: graph.tags,
    books,
    bookChaptersByNoteId,
  };
}

export function buildDocsWorkspaceIndex(
  notes: DocsNote[],
  now = new Date(),
): DocsWorkspaceIndex {
  const workspace = buildDocsWorkspace(notes, now);
  const dueByNote = new Map<string, number>();
  for (const item of workspace.reviewQueue) {
    dueByNote.set(item.noteId, (dueByNote.get(item.noteId) ?? 0) + 1);
  }
  return {
    notes: workspace.notes.map((note) =>
      docsNoteToSummary(note, dueByNote.get(note.id) ?? 0),
    ),
    graph: workspace.graph,
    // Keep due cards in the index — the queue is small vs full note bodies.
    reviewQueue: workspace.reviewQueue,
    tags: workspace.tags,
    books: workspace.books,
    bookChaptersByNoteId: workspace.bookChaptersByNoteId,
  };
}

/** Expand summaries to stub notes for APIs that still expect DocsNote[]. */
export function docsSummariesToStubNotes(summaries: DocsNoteSummary[]): DocsNote[] {
  return summaries.map((summary) => ({
    id: summary.id,
    title: summary.title,
    docType: summary.docType,
    summary: summary.summary,
    learningGoal: "",
    aliases: summary.aliases,
    tags: summary.tags,
    ...(summary.book ? { book: summary.book } : {}),
    ...(summary.bookId ? { bookId: summary.bookId } : {}),
    blocks: [],
    cards: Array.from({ length: summary.cardCount }, (_, index) => ({
      id: `stub-card-${index + 1}`,
      type: "basic" as const,
      status: "active" as const,
      prompt: "",
      answer: "",
      tags: [],
      sourceRefs: [],
      blockRefs: [],
      reviews: [],
    })),
    body: "",
    ...(summary.completedAt ? { completedAt: summary.completedAt } : {}),
    createdAt: summary.createdAt,
    updatedAt: summary.updatedAt,
    sourcePath: summary.sourcePath,
  }));
}
