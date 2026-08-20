import {
  duplicateReferenceCount,
  normalizeReferenceList,
  resolveReferenceTarget,
  type ReferenceIndex,
  type ReferenceTarget,
} from "./reference-utils";

import type { DocsNote, DocsRevisionBlock } from "./types";

export type ResolvedCardBlockRef = {
  ref: string;
  block: DocsRevisionBlock;
};

export type MissingCardBlockRef = {
  ref: string;
  reason: "missing";
};

export type ResolvedCardSourceRef = {
  ref: string;
  reference: ReferenceTarget;
};

export type UnresolvedCardSourceRef = {
  ref: string;
  reason: "unresolved" | "duplicate";
  duplicateCount: number;
};

export type CardBlockRefResolution = {
  resolved: ResolvedCardBlockRef[];
  missing: MissingCardBlockRef[];
};

export type CardSourceRefResolution = {
  resolved: ResolvedCardSourceRef[];
  unresolved: UnresolvedCardSourceRef[];
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

export function resolveCardSourceRefs(
  refs: string[],
  referenceIndex: ReferenceIndex,
): CardSourceRefResolution {
  const resolved: ResolvedCardSourceRef[] = [];
  const unresolved: UnresolvedCardSourceRef[] = [];
  const seen = new Set<string>();

  for (const ref of normalizeReferenceList(refs)) {
    if (seen.has(ref)) continue;
    seen.add(ref);

    const duplicates = duplicateReferenceCount(referenceIndex, ref);
    if (duplicates > 0) {
      unresolved.push({ ref, reason: "duplicate", duplicateCount: duplicates });
      continue;
    }

    const reference = resolveReferenceTarget(referenceIndex, ref);
    if (reference) resolved.push({ ref, reference });
    else unresolved.push({ ref, reason: "unresolved", duplicateCount: 0 });
  }

  return { resolved, unresolved };
}

export function cardHasBackMatter(
  card: Pick<import("./types").DocsCard, "blockRefs" | "sourceRefs">,
) {
  return card.blockRefs.some((ref) => ref.trim()) || card.sourceRefs.some((ref) => ref.trim());
}
