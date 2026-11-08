<script lang="ts">
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import UploadIcon from "@lucide/svelte/icons/upload";
  import {
    docsNoteCardCount,
    docsNoteMatchesTagFolder,
    type DocsNotePanel,
    type DocsNoteSummary,
    type DocsReviewScope,
    type DocsWorkspaceIndex,
  } from "../../model";
  import { isDocsSidebarPanelActive } from "../docs-folder-directory";
  import DocsFoldersSidebar from "./DocsFoldersSidebar.svelte";
  import DocsLinksSidebar from "./DocsLinksSidebar.svelte";
  import DocsTagsSidebar from "./DocsTagsSidebar.svelte";
  import {
    createDocsBookNoteTree,
    type DocsBookNoteTreeEntry,
  } from "./docs-book-note-tree";
  import {
    DEFAULT_DOCS_NOTE_SORT,
    type DocsNoteSortMode,
  } from "./docs-note-sort";
  import {
    readDocsSidebarUiState,
    writeDocsSidebarUiState,
    type DocsSidebarView,
  } from "./docs-sidebar-ui-storage";
  import "./DocsSidebar.css";

  let {
    workspace = null,
    loading = false,
    error = null,
    activeNoteId = null,
    activePanel = "display",
    reviewScope = "note",
    onSelectNote = () => {},
    onSelectPanel = () => {},
    onCreateNote = () => {},
    onStartWorkspaceReview = () => {},
    onImportAnkiPackage = undefined,
  }: {
    workspace?: DocsWorkspaceIndex | null;
    loading?: boolean;
    error?: string | null;
    activeNoteId?: string | null;
    activePanel?: DocsNotePanel;
    reviewScope?: DocsReviewScope;
    onSelectNote?: (noteId: string) => void;
    onSelectPanel?: (noteId: string, panel: DocsNotePanel, reviewScope?: DocsReviewScope) => void;
    onCreateNote?: () => void;
    onStartWorkspaceReview?: () => void;
    onImportAnkiPackage?: (file: File) => void;
  } = $props();

  const stored = readDocsSidebarUiState();
  let view = $state<DocsSidebarView>(stored.sidebarView);
  let sortMode = $state<DocsNoteSortMode>(stored.noteSortMode ?? DEFAULT_DOCS_NOTE_SORT);
  let query = $state("");
  let dueOnly = $state(false);
  let selectedTags = $state<string[]>([]);
  let bookOpenNodes = $state<Record<string, boolean>>(stored.bookOpenNodes);
  let sourceFolderOpenNodes = $state<Record<string, boolean>>(stored.sourceFolderOpenNodes);
  let tagsOpenNodes = $state<Record<string, boolean>>(stored.tagsOpenNodes);
  let expandedNotes = $state<Record<string, boolean>>({});

  const notes = $derived(workspace?.notes ?? []);
  const dueNoteIds = $derived(
    new Set((workspace?.reviewQueue ?? []).map((item) => item.noteId)),
  );
  const filteredNotes = $derived(
    notes.filter((note) => {
      if (dueOnly && !dueNoteIds.has(note.id)) return false;
      if (selectedTags.length && !selectedTags.every((tag) => docsNoteMatchesTagFolder(note, tag))) {
        return false;
      }
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return [note.title, note.id, note.summary, ...note.tags, ...note.aliases]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    }),
  );
  const tree = $derived(createDocsBookNoteTree(filteredNotes, workspace?.books ?? [], sortMode));
  const activeBacklinks = $derived(
    activeNoteId ? workspace?.graph.backlinks[activeNoteId] ?? [] : [],
  );
  const activeOutgoing = $derived(
    workspace?.graph.links.filter((link) => link.sourceNoteId === activeNoteId) ?? [],
  );
  const tabs: Array<{ id: DocsSidebarView; label: string }> = [
    { id: "docs", label: "Docs" },
    { id: "folders", label: "Folders" },
    { id: "links", label: "Links" },
    { id: "tags", label: "Tags" },
  ];

  $effect(() => {
    writeDocsSidebarUiState({
      ...stored,
      sidebarView: view,
      noteSortMode: sortMode,
      bookOpenNodes,
      sourceFolderOpenNodes,
      tagsOpenNodes,
    });
  });

  function bookOpen(bookId: string) {
    return bookOpenNodes[bookId] !== false;
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

  function chooseFile(event: Event) {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;
    const file = input.files?.[0];
    input.value = "";
    if (file) onImportAnkiPackage?.(file);
  }
</script>

<aside class="docs-sidebar" data-ui-component="docs-sidebar" data-docs-sidebar-view={view}>
  <header class="docs-sidebar__header">
    <h2 class="docs-sidebar__title">Docs</h2>
    <div class="docs-sidebar__actions">
      <button type="button" class="docs-sidebar__icon-button" aria-label="Create note" onclick={() => onCreateNote()}>
        <PlusIcon aria-hidden="true" />
      </button>
      {#if onImportAnkiPackage}
        <label class="docs-sidebar__icon-button" aria-label="Import Anki package">
          <UploadIcon aria-hidden="true" />
          <input
            class="docs-sidebar__file"
            type="file"
            accept=".apkg,application/octet-stream"
            aria-label="Anki package file"
            onchange={chooseFile}
          />
        </label>
      {/if}
    </div>
  </header>

  <div class="docs-sidebar__tabs" role="tablist" aria-label="Docs sidebar">
    {#each tabs as tab (tab.id)}
      <button
        type="button"
        class="docs-sidebar__tab"
        role="tab"
        aria-selected={view === tab.id}
        onclick={() => (view = tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <div class="docs-sidebar__toolbar">
    <input class="docs-sidebar__search" placeholder="Filter notes" bind:value={query} />
    <select class="docs-sidebar__select" aria-label="Sort notes" bind:value={sortMode}>
      <option value="updated-desc">Updated</option>
      <option value="title-asc">Title</option>
      <option value="created-desc">Created</option>
    </select>
  </div>
  <div class="docs-sidebar__filters">
    <button
      type="button"
      class="docs-sidebar__text-button"
      aria-pressed={dueOnly}
      onclick={() => (dueOnly = !dueOnly)}
    >
      Due
    </button>
    <button type="button" class="docs-sidebar__text-button" onclick={() => onStartWorkspaceReview()}>
      Review all
    </button>
    {#if reviewScope === "workspace"}
      <span class="docs-sidebar__kind">Workspace</span>
    {/if}
  </div>

  {#if error}
    <p class="docs-sidebar__status docs-sidebar__status--error">{error}</p>
  {:else if loading}
    <p class="docs-sidebar__status">Loading docs</p>
  {/if}

  <div class="docs-sidebar__scroll">
    {#if view === "docs"}
      {#each tree as entry (entry.kind === "book" ? entry.book.indexNoteId : entry.note.id)}
        {#if entry.kind === "book"}
          {@render book(entry)}
        {:else}
          {@render noteRow(entry.note, 0)}
        {/if}
      {:else}
        <p class="docs-sidebar__empty">No docs match this filter.</p>
      {/each}
    {:else if view === "folders"}
      <DocsFoldersSidebar
        notes={filteredNotes}
        {sortMode}
        {query}
        {activeNoteId}
        {activePanel}
        bind:openNodes={sourceFolderOpenNodes}
        {onSelectNote}
        onSelectPanel={(noteId, panel) => onSelectPanel(noteId, panel)}
      />
    {:else if view === "links"}
      <DocsLinksSidebar
        {notes}
        backlinks={activeBacklinks}
        outgoingLinks={activeOutgoing}
        ambiguousLinks={workspace?.graph.ambiguousLinks ?? []}
        {onSelectNote}
      />
    {:else}
      <DocsTagsSidebar
        tags={workspace?.tags ?? []}
        {selectedTags}
        bind:openNodes={tagsOpenNodes}
        onSelectTag={(tag) => {
          selectedTags = selectedTags.includes(tag)
            ? selectedTags.filter((item) => item !== tag)
            : [...selectedTags, tag];
          view = "docs";
        }}
      />
    {/if}
  </div>
</aside>

{#snippet book(entry: DocsBookNoteTreeEntry & { kind: "book" })}
  <div class="docs-sidebar__group">
    <button
      type="button"
      class="docs-sidebar__row"
      onclick={() => {
        bookOpenNodes = { ...bookOpenNodes, [entry.book.indexNoteId]: !bookOpen(entry.book.indexNoteId) };
        if (entry.indexNote) onSelectNote(entry.indexNote.id);
      }}
    >
      <span class="docs-sidebar__chevron" data-open={bookOpen(entry.book.indexNoteId) ? "true" : "false"}>
        <ChevronRightIcon aria-hidden="true" />
      </span>
      <span class="docs-sidebar__label">{entry.book.title}</span>
      <span class="docs-sidebar__count">{entry.chapters.length}</span>
    </button>
    {#if bookOpen(entry.book.indexNoteId)}
      {#if entry.indexNote}
        {@render noteRow(entry.indexNote, 1)}
      {/if}
      {#each entry.chapters as chapter (chapter.id)}
        {@render noteRow(chapter, 1)}
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
          onclick={() => onSelectPanel(note.id, panel.id, panel.id === "review" ? "note" : undefined)}
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
