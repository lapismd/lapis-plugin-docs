<script lang="ts">
  import "./DocsFolderPanel.css";

  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import FolderIcon from "@lucide/svelte/icons/folder";
  import XIcon from "@lucide/svelte/icons/x";
  import DocsFolderDirectoryList from "./DocsFolderDirectoryList.svelte";
  import { getActiveFolderNote, getFolderNotes } from "./docs-folder-directory";
  import type { DocsNotePanel, DocsWorkspace, DocsWorkspaceIndex } from '../model';

  let {
    workspace = null,
    activeTag = null,
    activeNoteId = null,
    activePanel = "note",
    collapsed = false,
    onSelectNote = () => {},
    onSelectPanel = () => {},
    onSelectTag = () => {},
    onClose = () => {},
    onCollapsedChange = () => {},
  }: {
    workspace?: DocsWorkspace | DocsWorkspaceIndex | null;
    activeTag?: string | null;
    activeNoteId?: string | null;
    activePanel?: DocsNotePanel;
    collapsed?: boolean;
    onSelectNote?: (noteId: string) => void;
    onSelectPanel?: (panel: DocsNotePanel) => void;
    onSelectTag?: (tag: string) => void;
    onClose?: () => void;
    onCollapsedChange?: (collapsed: boolean) => void;
  } = $props();

  const folderNotes = $derived(getFolderNotes(workspace, activeTag));
  const activeFolderNote = $derived(getActiveFolderNote(folderNotes, activeNoteId));
  const collapsedLabel = $derived(activeFolderNote?.title ?? `#${activeTag}`);
  const collapsedTitle = $derived(
    activeFolderNote
      ? `${activeFolderNote.title} in #${activeTag}`
      : `#${activeTag}`,
  );
</script>

{#if activeTag}
  <aside class:docs-folder-panel--collapsed={collapsed} class="docs-folder-panel">
    {#if collapsed}
      <button
        type="button"
        class="docs-folder-panel__collapsed-trigger"
        aria-label={`Expand #${activeTag} folder, selected ${collapsedLabel}`}
        title={collapsedTitle}
        onclick={() => onCollapsedChange(false)}
      >
        {#if activeFolderNote}
          <FileTextIcon />
        {:else}
          <FolderIcon />
        {/if}
        <span>{collapsedLabel}</span>
      </button>
    {:else}
      <header class="docs-folder-panel__header">
        <div class="docs-folder-panel__title">
          <FolderIcon />
          <div>
            <p>#{activeTag}</p>
            <span>{folderNotes.length} {folderNotes.length === 1 ? "note" : "notes"}</span>
          </div>
        </div>
        <div class="docs-folder-panel__actions">
          <button
            type="button"
            aria-label={`Collapse #${activeTag} folder`}
            title="Collapse folder panel"
            onclick={() => onCollapsedChange(true)}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            aria-label={`Close #${activeTag} folder`}
            title="Close folder panel"
            onclick={onClose}
          >
            <XIcon />
          </button>
        </div>
      </header>
      <DocsFolderDirectoryList
        {workspace}
        {activeTag}
        {activeNoteId}
        {activePanel}
        {onSelectNote}
        {onSelectPanel}
        {onSelectTag}
      />
    {/if}
  </aside>
{/if}
