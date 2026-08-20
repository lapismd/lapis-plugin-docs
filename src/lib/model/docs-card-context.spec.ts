import { describe, expect, it } from "vitest";

import {
  resolveCardBlockRefs,
  resolveCardSourceRefs,
} from "./docs-card-context";
import type { DocsNote, DocsRevisionBlock } from "./types";
import type { ReferenceIndex } from "./reference-utils";

function noteWithBlocks(blocks: DocsRevisionBlock[]): Pick<DocsNote, "blocks"> {
  return { blocks };
}

describe("resolveCardBlockRefs", () => {
  it("preserves block ref order and splits resolved from missing ids", () => {
    const blocks: DocsRevisionBlock[] = [
      { id: "concept-a", type: "text", title: "A", body: "Alpha" },
      { id: "concept-b", type: "text", title: "B", body: "Beta" },
    ];

    const result = resolveCardBlockRefs(noteWithBlocks(blocks), [
      "concept-b",
      "missing-block",
      "concept-a",
      "concept-b",
    ]);

    expect(result.resolved.map((item) => item.ref)).toEqual([
      "concept-b",
      "concept-a",
    ]);
    expect(result.resolved[0]?.block.id).toBe("concept-b");
    expect(result.missing).toEqual([{ ref: "missing-block", reason: "missing" }]);
  });
});

describe("resolveCardSourceRefs", () => {
  const index: ReferenceIndex = {
    references: [
      {
        id: "highlight",
        ref: "[^highlight]",
        marker: "[^highlight]",
        path: "/cv/sections/0/entries/0/highlights/0",
        type: "Highlight",
        label: "Reduced deployment risk",
        excerpt: "Reduced deployment risk",
        duplicate: false,
      },
    ],
    duplicates: {},
  };

  it("resolves canonical marker refs and reports unresolved or duplicate entries", () => {
    const resolved = resolveCardSourceRefs(["[^highlight]", "[^missing]"], index);
    expect(resolved.resolved).toHaveLength(1);
    expect(resolved.resolved[0]?.ref).toBe("[^highlight]");
    expect(resolved.unresolved).toEqual([
      { ref: "[^missing]", reason: "unresolved", duplicateCount: 0 },
    ]);
  });

  it("reports duplicate marker refs separately", () => {
    const duplicateIndex: ReferenceIndex = {
      references: [
        {
          id: "dup",
          ref: "[^dup]",
          marker: "[^dup]",
          path: "/cv/a",
          type: "Entry",
          label: "First",
          excerpt: "First",
          duplicate: true,
        },
        {
          id: "dup",
          ref: "[^dup]",
          marker: "[^dup]",
          path: "/cv/b",
          type: "Entry",
          label: "Second",
          excerpt: "Second",
          duplicate: true,
        },
      ],
    duplicates: {
        "[^dup]": [
          {
            id: "dup",
            ref: "[^dup]",
            marker: "[^dup]",
            path: "/cv/a",
            type: "Entry",
            label: "First",
            excerpt: "First",
            duplicate: true,
          },
          {
            id: "dup",
            ref: "[^dup]",
            marker: "[^dup]",
            path: "/cv/b",
            type: "Entry",
            label: "Second",
            excerpt: "Second",
            duplicate: true,
          },
        ],
      },
    };

    const result = resolveCardSourceRefs(["[^dup]"], duplicateIndex);
    expect(result.resolved).toHaveLength(0);
    expect(result.unresolved[0]).toMatchObject({
      ref: "[^dup]",
      reason: "duplicate",
      duplicateCount: 2,
    });
  });
});
