import {
  docsNoteMatchesTagFolder,
  docsNoteTagValues,
  docsTagMatchesFolder,
  normalizeDocsTag,
} from '../model/graph';
import { docsNoteCardCount, type DocsNoteListItem } from '../model/docs-note-list';
import type {
  DocsNotePanel,
  DocsWorkspace,
  DocsWorkspaceIndex,
} from '../model';

export type FolderNotePanel = {
  id: DocsNotePanel;
  label: string;
  count?: number;
};

export function getFolderNotes(
  workspace: DocsWorkspace | DocsWorkspaceIndex | null | undefined,
  activeTag: string | null | undefined,
) {
  if (!workspace || !activeTag) return [];
  return workspace.notes
    .filter((note) => docsNoteMatchesTagFolder(note, activeTag))
    .sort((left, right) => left.title.localeCompare(right.title));
}

export function getActiveFolderNote(
  folderNotes: DocsNoteListItem[],
  activeNoteId: string | null | undefined,
) {
  return folderNotes.find((note) => note.id === activeNoteId) ?? null;
}

export function getMatchingFolderTags(
  activeTag: string | null | undefined,
  activeFolderNote: DocsNoteListItem | null | undefined,
) {
  if (!activeTag || !activeFolderNote) return [];
  const tags = new Set<string>();
  for (const tag of docsNoteTagValues(activeFolderNote)) {
    if (docsTagMatchesFolder(tag, activeTag)) {
      tags.add(normalizeDocsTag(tag));
    }
  }
  return [...tags].sort((left, right) => left.localeCompare(right));
}

export function getActiveFolderTagKey(activeTag: string | null | undefined) {
  return normalizeDocsTag(activeTag ?? "").toLowerCase();
}

function noteDueCount(
  workspace: DocsWorkspace | DocsWorkspaceIndex | null | undefined,
  noteId: string,
) {
  return (
    workspace?.reviewQueue.filter((item) => item.noteId === noteId).length ?? 0
  );
}

export function getFolderNotePanels(
  workspace: DocsWorkspace | DocsWorkspaceIndex | null | undefined,
  note: DocsNoteListItem,
): FolderNotePanel[] {
  return [
    { id: "note", label: "Note" },
    { id: "cards", label: "Cards", count: docsNoteCardCount(note) },
    { id: "review", label: "Review", count: noteDueCount(workspace, note.id) },
  ];
}

/** Sidebar "Note" opens the display/preview surface, not the editor. */
export function resolveDocsSidebarPanelSelection(
  panel: DocsNotePanel,
): DocsNotePanel {
  return panel === "note" ? "display" : panel;
}

/** Keep the Note row highlighted while preview (display) or edit (note) is active. */
export function isDocsSidebarPanelActive(
  activePanel: DocsNotePanel,
  panel: DocsNotePanel,
): boolean {
  if (panel === "note") {
    return activePanel === "note" || activePanel === "display";
  }
  return activePanel === panel;
}
