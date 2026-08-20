<script lang="ts">
  import "./DocsFolderPanel.css";

  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import * as ScrollArea from "@lapismd/design-core/shadcn/scroll-area";

  import {
    getActiveFolderNote,
    getActiveFolderTagKey,
    getFolderNotePanels,
    getFolderNotes,
    getMatchingFolderTags,
    isDocsSidebarPanelActive,
    resolveDocsSidebarPanelSelection,
  } from "./docs-folder-directory";
  import type { DocsNote, DocsNotePanel, DocsNoteSummary, DocsWorkspace, DocsWorkspaceIndex } from '../model';

  let {
    workspace = null,
    activeTag = null,
    activeNoteId = null,
    activePanel = "note",
    onSelectNote = () => {},
    onSelectPanel = () => {},
    onSelectTag = () => {},
  }: {
    workspace?: DocsWorkspace | DocsWorkspaceIndex | null;
    activeTag?: string | null;
    activeNoteId?: string | null;
    activePanel?: DocsNotePanel;
    onSelectNote?: (noteId: string) => void;
    onSelectPanel?: (panel: DocsNotePanel) => void;
    onSelectTag?: (tag: string) => void;
  } = $props();

  let expandedNoteIds = $state<Record<string, boolean>>({});

  const folderNotes = $derived(getFolderNotes(workspace, activeTag));
  const activeFolderNote = $derived(getActiveFolderNote(folderNotes, activeNoteId));
  const matchingTags = $derived(getMatchingFolderTags(activeTag, activeFolderNote));
  const activeTagKey = $derived(getActiveFolderTagKey(activeTag));
  const TREE_ROW_BASE_INDENT_REM = 0.25;
  const TREE_ROW_DEPTH_INDENT_REM = 0.875;
  const TREE_GUIDE_BASE_LEFT_REM = 0.75;
  const TREE_PANEL_LABEL_OFFSET_REM = 1.75;
  const TREE_PANEL_PARENT_GUIDE_OFFSET_REM = 0;

  function notePanels(note: DocsNote | DocsNoteSummary) {
    return getFolderNotePanels(workspace, note);
  }

  function isNoteExpanded(noteId: string) {
    return activeNoteId === noteId
      ? (expandedNoteIds[noteId] ?? true)
      : (expandedNoteIds[noteId] ?? false);
  }

  function setNoteExpanded(noteId: string, open: boolean) {
    expandedNoteIds = open
      ? {
          [noteId]: true,
          ...(activeNoteId && activeNoteId !== noteId
            ? { [activeNoteId]: false }
            : {}),
        }
      : { [noteId]: false };
  }

  function treeRowStyle(depth: number) {
    const safeDepth = Math.max(depth, 0);
    return `padding-left: ${TREE_ROW_BASE_INDENT_REM + safeDepth * TREE_ROW_DEPTH_INDENT_REM}rem`;
  }

  function treePanelRowStyle(depth: number) {
    const safeDepth = Math.max(depth, 0);
    return `padding-left: ${
      TREE_ROW_BASE_INDENT_REM +
      safeDepth * TREE_ROW_DEPTH_INDENT_REM +
      TREE_PANEL_LABEL_OFFSET_REM
    }rem`;
  }

  function treeGuideStyle(depth: number, offsetRem = 0) {
    return `left: ${TREE_GUIDE_BASE_LEFT_REM + depth * TREE_ROW_DEPTH_INDENT_REM + offsetRem}rem`;
  }

  function treeGuideDepths(depth: number) {
    return Array.from({ length: Math.max(depth, 0) }, (_, index) => index);
  }

  function toggleNoteRow(noteId: string) {
    if (activeNoteId === noteId) {
      setNoteExpanded(noteId, !isNoteExpanded(noteId));
      return;
    }
    selectNote(noteId);
  }

  function toggleNoteExpanded(noteId: string) {
    setNoteExpanded(noteId, !isNoteExpanded(noteId));
  }

  function selectNote(noteId: string) {
    setNoteExpanded(noteId, true);
    onSelectNote(noteId);
  }

  function selectNotePanel(noteId: string, panel: DocsNotePanel) {
    setNoteExpanded(noteId, true);
    if (activeNoteId !== noteId) onSelectNote(noteId);
    onSelectPanel(resolveDocsSidebarPanelSelection(panel));
  }

  function isNotePanelActive(panel: DocsNotePanel) {
    return isDocsSidebarPanelActive(activePanel, panel);
  }
</script>

{#snippet TreeGuides({ depth, finalGuideOffsetRem = 0 }: { depth: number; finalGuideOffsetRem?: number })}
  {#each treeGuideDepths(depth) as guideDepth (guideDepth)}
    <span
      aria-hidden="true"
      class="docs-folder-panel__indent-guide"
      style={treeGuideStyle(
        guideDepth,
        guideDepth === depth - 1 ? finalGuideOffsetRem : 0,
      )}
      data-folder-panel-indent-guide={guideDepth}
    ></span>
  {/each}
{/snippet}

{#if activeTag}
  <div class="docs-folder-panel__body">
    <ScrollArea.Root class="docs-folder-panel__list">
      <div class="docs-folder-panel__list-content">
        {#each folderNotes as note (note.id)}
        {@const expanded = isNoteExpanded(note.id)}
        {@const active = note.id === activeNoteId}
        <div class="docs-folder-panel__note-group">
          <button
            type="button"
            class="docs-folder-panel__note-row"
            style={treeRowStyle(0)}
            aria-expanded={expanded}
            data-folder-panel-note-row={note.id}
            onclick={() => toggleNoteRow(note.id)}
          >
            <ChevronRightIcon
              class={expanded
                ? "docs-folder-panel__tree-chevron expanded"
                : "docs-folder-panel__tree-chevron"}
              data-icon="inline-start"
            />
            <span>{note.title}</span>
          </button>
          {#if expanded}
            <div class="docs-folder-panel__children" data-folder-panel-note-panels={note.id}>
              {#each notePanels(note) as panel (panel.id)}
                <button
                  type="button"
                  class:active={active && isNotePanelActive(panel.id)}
                  class="docs-folder-panel__child"
                  style={treePanelRowStyle(0)}
                  aria-label={typeof panel.count === "number"
                    ? `${note.title} ${panel.label} ${panel.count}`
                    : `${note.title} ${panel.label}`}
                  aria-current={active && isNotePanelActive(panel.id) ? "true" : undefined}
                  onclick={() => selectNotePanel(note.id, panel.id)}
                >
                  {@render TreeGuides({
                    depth: 1,
                    finalGuideOffsetRem: TREE_PANEL_PARENT_GUIDE_OFFSET_REM,
                  })}
                  <span>{panel.label}</span>
                  {#if typeof panel.count === "number"}
                    <span class="docs-folder-panel__child-count">{panel.count}</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <p class="docs-folder-panel__empty">No notes use this folder yet.</p>
        {/each}
      </div>
    </ScrollArea.Root>
    {#if matchingTags.length}
      <div class="docs-folder-panel__tags" aria-label="Matching tags">
        {#each matchingTags as tag (tag)}
          <button
            type="button"
            class="docs-folder-panel__tag-chip"
            class:active={activeTagKey === tag.toLowerCase()}
            aria-pressed={activeTagKey === tag.toLowerCase()}
            title={`#${tag}`}
            onclick={() => onSelectTag(tag)}
          >
            #{tag}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
