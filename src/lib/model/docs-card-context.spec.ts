import { describe, expect, it } from "vitest";

import {
  docsBlockIdFromRef,
  docsBlockReferenceIndex,
  docsBlockRefMarker,
  docsBlockSnippet,
  resolveCardBlockRefs,
} from "./docs-card-context";
import type { DocsNote, DocsRevisionBlock } from "./types";

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

describe("docsBlockReferenceIndex", () => {
  const blocks: DocsRevisionBlock[] = [
    {
      id: "concept-a",
      type: "concept",
      title: "Desirable difficulty",
      summary: "Revision should feel effortful enough to force retrieval.",
      keyPoints: ["Prompt before rereading."],
      details: "The harness links cards to block ids.",
    },
  ];

  it("builds a picker entry whose excerpt is a short snippet of the block", () => {
    const index = docsBlockReferenceIndex(blocks);
    expect(index.references).toHaveLength(1);
    expect(index.references[0]).toMatchObject({
      id: "concept-a",
      ref: "[^concept-a]",
      label: "Desirable difficulty",
      type: "Concept",
    });
    expect(index.references[0]?.excerpt).toContain("force retrieval");
    expect(docsBlockSnippet(blocks[0]!).length).toBeLessThanOrEqual(140);
    expect(docsBlockIdFromRef(docsBlockRefMarker("concept-a"))).toBe("concept-a");
  });
});
