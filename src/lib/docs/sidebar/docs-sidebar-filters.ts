import {
  docsNoteMatchesTagFolder,
  docsNoteTagValues,
  normalizeDocsTag,
  type DocsBacklink,
  type DocsNoteSummary,
  type DocsTagSummary,
  type DocsWikiLink,
} from "../../model";

export type DocsSidebarNoteFilters = {
  query?: string;
  dueOnly?: boolean;
  reviewAll?: boolean;
  selectedTags?: readonly string[];
  dueNoteIds?: ReadonlySet<string>;
};

/** A note has a review when it is in the due review queue. */
export function docsNoteHasReview(
  note: Pick<DocsNoteSummary, "id" | "dueCardCount">,
  dueNoteIds: ReadonlySet<string>,
) {
  return dueNoteIds.has(note.id) || (note.dueCardCount ?? 0) > 0;
}

export function docsSidebarFiltersActive(filters: DocsSidebarNoteFilters) {
  return Boolean(
    filters.query?.trim() ||
      filters.dueOnly ||
      filters.reviewAll ||
      filters.selectedTags?.length,
  );
}

export function filterDocsSidebarNotes(
  notes: readonly DocsNoteSummary[],
  filters: DocsSidebarNoteFilters,
) {
  const dueNoteIds = filters.dueNoteIds ?? new Set<string>();
  const selectedTags = filters.selectedTags ?? [];
  const needle = filters.query?.trim().toLowerCase() ?? "";
  return notes.filter((note) => {
    if (filters.dueOnly && !docsNoteHasReview(note, dueNoteIds)) return false;
    if (filters.reviewAll && !docsNoteHasReview(note, dueNoteIds)) return false;
    if (
      selectedTags.length &&
      !selectedTags.every((tag) => docsNoteMatchesTagFolder(note, tag))
    ) {
      return false;
    }
    if (!needle) return true;
    return [note.title, note.id, note.summary, ...note.tags, ...note.aliases]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
}

/** Tags that appear on the supplied notes, including hierarchy prefixes. */
export function docsTagSummariesForNotes(
  notes: readonly DocsNoteSummary[],
): DocsTagSummary[] {
  const byTag = new Map<string, Set<string>>();
  for (const note of notes) {
    for (const tag of docsNoteTagValues(note)) {
      for (const prefix of tagPrefixes(tag)) {
        const ids = byTag.get(prefix) ?? new Set<string>();
        ids.add(note.id);
        byTag.set(prefix, ids);
      }
    }
  }
  return [...byTag.entries()]
    .map(([tag, ids]) => ({
      tag,
      noteCount: ids.size,
      cardCount: 0,
    }))
    .sort((left, right) => left.tag.localeCompare(right.tag));
}

export function filterDocsSidebarBacklinks(
  links: readonly DocsBacklink[],
  visibleNoteIds: ReadonlySet<string>,
  filtering: boolean,
) {
  if (!filtering) return [...links];
  return links.filter((link) => visibleNoteIds.has(link.sourceNoteId));
}

export function filterDocsSidebarOutgoingLinks(
  links: readonly DocsWikiLink[],
  visibleNoteIds: ReadonlySet<string>,
  filtering: boolean,
) {
  if (!filtering) return [...links];
  return links.filter(
    (link) =>
      Boolean(link.resolvedNoteId) && visibleNoteIds.has(link.resolvedNoteId ?? ""),
  );
}

export function filterDocsSidebarAmbiguousLinks(
  links: readonly DocsWikiLink[],
  visibleNoteIds: ReadonlySet<string>,
  filtering: boolean,
) {
  if (!filtering) return [...links];
  return links.filter((link) => visibleNoteIds.has(link.sourceNoteId));
}

function tagPrefixes(tag: string) {
  const parts = normalizeDocsTag(tag)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.map((_, index) => parts.slice(0, index + 1).join("/"));
}
