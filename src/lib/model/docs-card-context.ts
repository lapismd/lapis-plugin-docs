import type { DocsNote, DocsRevisionBlock } from "./types";

export type ResolvedCardBlockRef = {
  ref: string;
  block: DocsRevisionBlock;
};

export type MissingCardBlockRef = {
  ref: string;
  reason: "missing";
};

export type CardBlockRefResolution = {
  resolved: ResolvedCardBlockRef[];
  missing: MissingCardBlockRef[];
};

const BLOCK_REF_MARKER = /^\[\^([a-z0-9][a-z0-9-]{0,79})\]$/;

const BLOCK_TYPE_LABELS: Record<DocsRevisionBlock["type"], string> = {
  text: "Text",
  markdown: "Markdown",
  concept: "Concept",
  procedure: "Procedure",
  prompt: "Prompt",
  code: "Code",
  table: "Table",
  callout: "Callout",
  story: "Story",
  resources: "Resources",
};

export function resolveCardBlockRefs(
  note: Pick<DocsNote, "blocks">,
  blockRefs: string[],
): CardBlockRefResolution {
  const byId = new Map(note.blocks.map((block) => [block.id, block]));
  const resolved: ResolvedCardBlockRef[] = [];
  const missing: MissingCardBlockRef[] = [];
  const seen = new Set<string>();

  for (const ref of blockRefs) {
    const trimmed = ref.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    const block = byId.get(trimmed);
    if (block) resolved.push({ ref: trimmed, block });
    else missing.push({ ref: trimmed, reason: "missing" });
  }

  return { resolved, missing };
}

export function cardHasBackMatter(
  card: Pick<import("./types").DocsCard, "blockRefs">,
) {
  return card.blockRefs.some((ref) => ref.trim());
}

function plain(value: string | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function docsBlockPlainText(block: DocsRevisionBlock) {
  switch (block.type) {
    case "text":
    case "markdown":
    case "callout":
      return plain(block.body);
    case "concept":
      return plain([block.summary, ...block.keyPoints, block.details].join(" "));
    case "procedure":
      return plain([...block.steps, block.notes].join(" "));
    case "prompt":
      return plain(block.problem);
    case "code":
      return plain(block.caption || block.code);
    case "table":
      return plain(block.rows[0]?.join(", ") || block.columns.join(", "));
    case "story":
      return plain(block.situation || block.action || block.result);
    case "resources":
      return plain(
        block.items
          .map((item) => item.title || item.notes)
          .filter(Boolean)
          .join(" · "),
      );
  }
}

export function docsBlockSnippet(block: DocsRevisionBlock, limit = 140) {
  const text = docsBlockPlainText(block);
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}

export function docsBlockRefMarker(id: string) {
  return `[^${id}]`;
}

export function docsBlockIdFromRef(ref: string) {
  return BLOCK_REF_MARKER.exec(ref.trim())?.[1] ?? ref.trim();
}

export function docsBlockReferenceIndex(blocks: DocsRevisionBlock[]) {
  return {
    references: blocks.map((block) => ({
      id: block.id,
      ref: docsBlockRefMarker(block.id),
      marker: block.id,
      path: block.id,
      type: BLOCK_TYPE_LABELS[block.type],
      label: block.title?.trim() || BLOCK_TYPE_LABELS[block.type],
      excerpt: docsBlockSnippet(block),
      duplicate: false,
    })),
    duplicates: {},
  };
}
