import { describe, expect, it } from "vitest";
import { buildDocsBooks } from "./book";
import { buildDocsReviewQueue } from "./fsrs";
import { docsNoteToMarkdown, parseDocsNoteMarkdownFile } from "./markdown";
import { sampleDocsNotes } from "./sample";

describe("docs sample fixtures", () => {
  it("round-trips sample notes through markdown helpers", () => {
    for (const note of sampleDocsNotes()) {
      const raw = docsNoteToMarkdown(note);
      const parsed = parseDocsNoteMarkdownFile({
        path: note.sourcePath,
        content: raw,
      });
      expect(parsed.id).toBe(note.id);
      expect(parsed.docType).toBe(note.docType);
      expect(parsed.sourcePath).toBe(note.sourcePath);
    }
  });

  it("builds books and a review queue from fixtures", () => {
    const notes = sampleDocsNotes();
    const books = buildDocsBooks(notes);
    expect(books.books).toHaveLength(1);
    const queue = buildDocsReviewQueue(
      notes,
      new Date("2026-07-02T12:00:00.000Z"),
    );
    expect(queue.every((item) => item.card.type !== "coding")).toBe(true);
  });
});
