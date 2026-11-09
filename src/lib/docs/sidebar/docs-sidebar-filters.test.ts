import { describe, expect, it } from "vitest";

import type { DocsNoteSummary } from "../../model";
import { createDocsBookNoteTree } from "./docs-book-note-tree";
import {
  docsTagSummariesForNotes,
  filterDocsSidebarBacklinks,
  filterDocsSidebarNotes,
  filterDocsSidebarOutgoingLinks,
} from "./docs-sidebar-filters";

function note(
  id: string,
  tags: string[],
  extras: Partial<DocsNoteSummary> = {},
): DocsNoteSummary {
  return {
    id,
    title: id,
    docType: "freeform",
    summary: "",
    aliases: [],
    tags,
    sourcePath: `${id}.doc.md`,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    cardCount: extras.dueCardCount ? 1 : 0,
    blockCount: 0,
    ...extras,
  };
}

const notes = [
  note("alpha", ["sample", "sample/docs/alpha", "shared"], { dueCardCount: 1 }),
  note("beta", ["sample", "sample/docs/beta", "other"]),
  note("gamma", ["elsewhere"], { dueCardCount: 2 }),
];
const due = new Set(["alpha", "gamma"]);

describe("docs sidebar filters", () => {
  it("limits tags to tags on notes that already match the tag filter", () => {
    const matched = filterDocsSidebarNotes(notes, { selectedTags: ["sample/docs/alpha"] });
    const tags = docsTagSummariesForNotes(matched).map((tag) => tag.tag);

    expect(matched.map((item) => item.id)).toEqual(["alpha"]);
    expect(tags).toEqual(["sample", "sample/docs", "sample/docs/alpha", "shared"]);
    expect(tags).not.toContain("other");
    expect(tags).not.toContain("elsewhere");
  });

  it("limits every note list to due reviews when Due or Review all is selected", () => {
    expect(
      filterDocsSidebarNotes(notes, { dueOnly: true, dueNoteIds: due }).map((item) => item.id),
    ).toEqual(["alpha", "gamma"]);
    expect(
      filterDocsSidebarNotes(notes, { reviewAll: true, dueNoteIds: due }).map((item) => item.id),
    ).toEqual(["alpha", "gamma"]);
    expect(
      filterDocsSidebarNotes(notes, {
        dueOnly: true,
        reviewAll: true,
        selectedTags: ["sample"],
        dueNoteIds: due,
      }).map((item) => item.id),
    ).toEqual(["alpha"]);
  });

  it("drops book chapters that do not match an active sidebar filter", () => {
    const matched = filterDocsSidebarNotes(notes, { dueOnly: true, dueNoteIds: due });
    const [book] = createDocsBookNoteTree(
      matched,
      [
        {
          id: "sample",
          indexNoteId: "alpha",
          title: "Sample",
          summary: "",
          sourcePath: "alpha.doc.md",
          chapters: [
            {
              index: 0,
              noteId: "beta",
              title: "Beta",
              summary: "",
              sourcePath: "beta.doc.md",
              resolved: true,
              completed: false,
            },
            {
              index: 1,
              noteId: "gamma",
              title: "Gamma",
              summary: "",
              sourcePath: "gamma.doc.md",
              resolved: true,
              completed: false,
            },
          ],
          completedCount: 0,
          resolvedCount: 2,
          progressPercent: 0,
        },
      ],
      "title-asc",
      true,
    );

    expect(book?.kind).toBe("book");
    if (book?.kind !== "book") return;
    expect(book.indexNote?.id).toBe("alpha");
    expect(book.chapters.map((chapter) => chapter.id)).toEqual(["gamma"]);
  });

  it("limits links to notes that remain after the sidebar filter", () => {
    const visible = new Set(["alpha"]);
    expect(
      filterDocsSidebarBacklinks(
        [
          {
            sourceNoteId: "alpha",
            sourceTitle: "Alpha",
            raw: "[[alpha]]",
            excerpt: "",
          },
          {
            sourceNoteId: "beta",
            sourceTitle: "Beta",
            raw: "[[beta]]",
            excerpt: "",
          },
        ],
        visible,
        true,
      ).map((link) => link.sourceNoteId),
    ).toEqual(["alpha"]);
    expect(
      filterDocsSidebarOutgoingLinks(
        [
          { sourceNoteId: "index", raw: "[[alpha]]", target: "alpha", resolvedNoteId: "alpha", index: 0 },
          { sourceNoteId: "index", raw: "[[beta]]", target: "beta", resolvedNoteId: "beta", index: 1 },
          { sourceNoteId: "index", raw: "[[missing]]", target: "missing", index: 2 },
        ],
        visible,
        true,
      ).map((link) => link.resolvedNoteId),
    ).toEqual(["alpha"]);
  });
});
