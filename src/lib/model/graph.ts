import {
  type DocsBacklink,
  type DocsGraph,
  type DocsNote,
  type DocsTagSummary,
  type DocsWikiLink,
} from "./types";
import { renderDocsNoteMarkdown } from "./markdown";

const WIKILINK_PATTERN = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;
const TAG_PATTERN = /(^|[\s([{])#([A-Za-z0-9][A-Za-z0-9_-]*(?:\/[A-Za-z0-9][A-Za-z0-9_-]*)*)\b/g;

function normalizeLookup(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function compactText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function wikiLinkTargetNote(value: string) {
  return compactText(value).split("#", 1)[0].trim();
}

function excerptAround(value: string, index: number) {
  const compact = compactText(value);
  if (!compact) return "";
  const start = Math.max(0, index - 70);
  const excerpt = compact.slice(start, start + 180).trim();
  return `${start > 0 ? "..." : ""}${excerpt}`;
}

export function extractDocsWikiLinks(note: DocsNote): DocsWikiLink[] {
  const content = renderDocsNoteMarkdown(note);
  return [...content.matchAll(WIKILINK_PATTERN)].map((match) => ({
    sourceNoteId: note.id,
    raw: match[0],
    target: compactText(match[1] ?? ""),
    ...(match[2] ? { label: compactText(match[2]) } : {}),
    index: match.index ?? 0,
  }));
}

export function extractDocsTags(value: string) {
  return Array.from(
    new Set(
      [...value.matchAll(TAG_PATTERN)]
        .map((match) => match[2].trim())
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right));
}

export function normalizeDocsTag(tag: string) {
  return tag
    .trim()
    .replace(/^#+/, "")
    .replace(/^\/+|\/+$/g, "");
}

export function docsTagMatchesFolder(tag: string, folder: string) {
  const normalizedTag = normalizeDocsTag(tag).toLowerCase();
  const normalizedFolder = normalizeDocsTag(folder).toLowerCase();
  if (!normalizedTag || !normalizedFolder) return false;
  return (
    normalizedTag === normalizedFolder ||
    normalizedTag.startsWith(`${normalizedFolder}/`)
  );
}

type DocsNoteTagSource = Pick<DocsNote, "tags" | "aliases"> &
  Partial<Pick<DocsNote, "cards" | "blocks" | "body" | "title" | "docType" | "summary" | "learningGoal">>;

/** Note, card, and inline body tags used for folder membership and filtering. */
export function docsNoteTagValues(note: DocsNoteTagSource) {
  const cardTags =
    Array.isArray(note.cards) ? note.cards.flatMap((card) => card.tags) : [];
  const inlineTags =
    Array.isArray(note.blocks) && typeof note.body === "string"
      ? extractDocsTags(renderDocsNoteMarkdown(note as DocsNote))
      : [];
  return [...note.tags, ...cardTags, ...inlineTags];
}

export function docsNoteMatchesTagFolder(note: DocsNoteTagSource, folder: string) {
  return docsNoteTagValues(note).some((tag) => docsTagMatchesFolder(tag, folder));
}

function tagHierarchy(tag: string) {
  const parts = normalizeDocsTag(tag)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.map((_, index) => parts.slice(0, index + 1).join("/"));
}

function addLookup(lookup: Map<string, string[]>, key: string, noteId: string) {
  const normalized = normalizeLookup(key);
  if (!normalized) return;
  lookup.set(normalized, [...(lookup.get(normalized) ?? []), noteId]);
}

function noteLookup(notes: Array<Pick<DocsNote, "id" | "title" | "aliases">>) {
  const lookup = new Map<string, string[]>();
  for (const note of notes) {
    addLookup(lookup, note.title, note.id);
    for (const alias of note.aliases) addLookup(lookup, alias, note.id);
  }
  return lookup;
}

export function resolveDocsNoteId(
  notes: Array<Pick<DocsNote, "id" | "title" | "aliases">>,
  target: string | null | undefined,
) {
  const targetNote = wikiLinkTargetNote(target ?? "");
  if (!targetNote) return null;
  if (notes.some((note) => note.id === targetNote)) return targetNote;

  const lookup = noteLookup(notes);
  const matches = Array.from(
    new Set(lookup.get(normalizeLookup(targetNote)) ?? []),
  );
  return matches.length === 1 ? matches[0] : null;
}

function resolveLink(
  link: DocsWikiLink,
  notesById: Map<string, DocsNote>,
  lookup: Map<string, string[]>,
): DocsWikiLink {
  const targetNote = wikiLinkTargetNote(link.target);
  if (notesById.has(targetNote)) return { ...link, resolvedNoteId: targetNote };
  const matches = Array.from(
    new Set(lookup.get(normalizeLookup(targetNote)) ?? []),
  );
  if (matches.length === 1) return { ...link, resolvedNoteId: matches[0] };
  if (matches.length > 1) return { ...link, ambiguousNoteIds: matches };
  return link;
}

function buildTagSummaries(notes: DocsNote[]): DocsTagSummary[] {
  const byTag = new Map<string, { notes: Set<string>; cards: Set<string> }>();
  const ensure = (tag: string) => {
    const normalized = tag.trim();
    if (!normalized) return null;
    const existing = byTag.get(normalized) ?? {
      notes: new Set<string>(),
      cards: new Set<string>(),
    };
    byTag.set(normalized, existing);
    return existing;
  };
  for (const note of notes) {
    for (const tag of docsNoteTagValues(note)) {
      for (const tagPrefix of tagHierarchy(tag)) {
        ensure(tagPrefix)?.notes.add(note.id);
      }
    }
    for (const card of note.cards) {
      for (const tag of card.tags) {
        for (const tagPrefix of tagHierarchy(tag)) {
          ensure(tagPrefix)?.cards.add(`${note.id}/${card.id}`);
        }
      }
    }
  }
  return [...byTag.entries()]
    .map(([tag, value]) => ({
      tag,
      noteCount: value.notes.size,
      cardCount: value.cards.size,
    }))
    .sort((left, right) => left.tag.localeCompare(right.tag));
}

export function buildDocsGraph(notes: DocsNote[]): DocsGraph {
  const notesById = new Map(notes.map((note) => [note.id, note] as const));
  const lookup = noteLookup(notes);
  const links = notes
    .flatMap(extractDocsWikiLinks)
    .map((link) => resolveLink(link, notesById, lookup));
  const backlinks: Record<string, DocsBacklink[]> = Object.fromEntries(
    notes.map((note) => [note.id, []]),
  );
  for (const link of links) {
    if (!link.resolvedNoteId) continue;
    const source = notesById.get(link.sourceNoteId);
    if (!source) continue;
    backlinks[link.resolvedNoteId] ??= [];
    backlinks[link.resolvedNoteId].push({
      sourceNoteId: source.id,
      sourceTitle: source.title,
      raw: link.raw,
      label: link.label,
      excerpt: excerptAround(renderDocsNoteMarkdown(source), link.index),
    });
  }
  return {
    links,
    backlinks,
    unresolvedLinks: links.filter(
      (link) => !link.resolvedNoteId && !link.ambiguousNoteIds?.length,
    ),
    ambiguousLinks: links.filter((link) =>
      Boolean(link.ambiguousNoteIds?.length),
    ),
    tags: buildTagSummaries(notes),
  };
}
