<script lang="ts">
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import {
    docsNoteCardCount,
    type DocsNotePanel,
    type DocsNoteSummary,
  } from "../../model";
  import { isDocsSidebarPanelActive } from "../docs-folder-directory";
  import {
    DOCS_SOURCE_ROOT_ID,
    createDocsSourceFolderTree,
    filterDocsSourceFolderTree,
    type DocsSourceFolderTreeNode,
  } from "./docs-source-folder-tree";
  import { DEFAULT_DOCS_NOTE_SORT, type DocsNoteSortMode } from "./docs-note-sort";

  let {
    notes = [],
    sortMode = DEFAULT_DOCS_NOTE_SORT,
    query = "",
    activeNoteId = null,
    activePanel = "display",
    openNodes = $bindable<Record<string, boolean>>({}),
    onSelectNote = () => {},
    onSelectPanel = () => {},
  }: {
    notes?: DocsNoteSummary[];
    sortMode?: DocsNoteSortMode;
    query?: string;
    activeNoteId?: string | null;
    activePanel?: DocsNotePanel;
    openNodes?: Record<string, boolean>;
    onSelectNote?: (noteId: string) => void;
    onSelectPanel?: (noteId: string, panel: DocsNotePanel) => void;
  } = $props();

  const tree = $derived.by(() => {
    const built = createDocsSourceFolderTree(notes, sortMode);
    return filterDocsSourceFolderTree(built, query, sortMode) ?? built;
  });
  let expandedNotes = $state<Record<string, boolean>>({});

  function folderOpen(id: string) {
    if (id === DOCS_SOURCE_ROOT_ID) return openNodes[id] !== false;
    return openNodes[id] === true;
  }

  function toggleFolder(id: string) {
    openNodes = { ...openNodes, [id]: !folderOpen(id) };
  }

  function noteOpen(noteId: string) {
    return activeNoteId === noteId ? expandedNotes[noteId] !== false : expandedNotes[noteId] === true;
  }

  function panels(note: DocsNoteSummary) {
    return [
      { id: "note" as const, label: "Note" },
      { id: "cards" as const, label: "Cards", count: docsNoteCardCount(note) },
      { id: "review" as const, label: "Review", count: note.dueCardCount ?? 0 },
    ];
  }
</script>

{#snippet folder(node: DocsSourceFolderTreeNode, depth: number)}
  <div class="docs-sidebar__group">
    <button
      type="button"
      class="docs-sidebar__row"
      style={`padding-inline-start: ${0.2 + depth * 0.85}rem`}
      onclick={() => toggleFolder(node.id)}
    >
      <span class="docs-sidebar__chevron" data-open={folderOpen(node.id) ? "true" : "false"}>
        <ChevronRightIcon aria-hidden="true" />
      </span>
      <span class="docs-sidebar__label">{node.label}</span>
      <span class="docs-sidebar__count">{node.count}</span>
    </button>
    {#if folderOpen(node.id)}
      {#each node.children as child (child.id)}
        {@render folder(child, depth + 1)}
      {/each}
      {#each node.notes as note (note.id)}
        {@render noteRow(note, depth + 1)}
      {/each}
    {/if}
  </div>
{/snippet}

{#snippet noteRow(note: DocsNoteSummary, depth: number)}
  <div class="docs-sidebar__group">
    <button
      type="button"
      class="docs-sidebar__row"
      style={`padding-inline-start: ${0.2 + depth * 0.85}rem`}
      aria-current={activeNoteId === note.id ? "true" : undefined}
      onclick={() => {
        expandedNotes = { ...expandedNotes, [note.id]: true };
        onSelectNote(note.id);
      }}
    >
      <span
        class="docs-sidebar__chevron"
        data-open={noteOpen(note.id) ? "true" : "false"}
        role="presentation"
        onclick={(event) => {
          event.stopPropagation();
          expandedNotes = { ...expandedNotes, [note.id]: !noteOpen(note.id) };
        }}
      >
        <ChevronRightIcon aria-hidden="true" />
      </span>
      <span class="docs-sidebar__label">{note.title}</span>
    </button>
    {#if noteOpen(note.id)}
      {#each panels(note) as panel (panel.id)}
        <button
          type="button"
          class="docs-sidebar__panel"
          style={`padding-inline-start: ${1.3 + depth * 0.85}rem`}
          aria-current={activeNoteId === note.id && isDocsSidebarPanelActive(activePanel, panel.id) ? "true" : undefined}
          onclick={() => onSelectPanel(note.id, panel.id)}
        >
          <span class="docs-sidebar__label">{panel.label}</span>
          {#if panel.count}
            <span class="docs-sidebar__count">{panel.count}</span>
          {/if}
        </button>
      {/each}
    {/if}
  </div>
{/snippet}

{@render folder(tree, 0)}
