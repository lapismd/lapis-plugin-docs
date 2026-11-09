<script lang="ts">
  import BrainIcon from "@lucide/svelte/icons/brain";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import HashIcon from "@lucide/svelte/icons/hash";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import UploadIcon from "@lucide/svelte/icons/upload";
  import XIcon from "@lucide/svelte/icons/x";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import * as DropdownMenu from "@lapismd/design-core/shadcn/dropdown-menu";
  import * as ScrollArea from "@lapismd/design-core/shadcn/scroll-area";
  import { TagList, type TagListItem } from "@lapismd/design-core/shadcn/tag-list";
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
    type DocsTagsViewMode,
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
  let tagsViewMode = $state<DocsTagsViewMode>(stored.tagsViewMode);
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
  const sortOptions: Array<{ value: DocsNoteSortMode; label: string }> = [
    { value: "updated-desc", label: "Updated" },
    { value: "title-asc", label: "Title" },
    { value: "created-desc", label: "Created" },
  ];
  const sortLabel = $derived(
    sortOptions.find((option) => option.value === sortMode)?.label ?? "Title",
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
      tagsViewMode,
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

  const selectedTagItems = $derived<TagListItem[]>(
    selectedTags.map((tag) => ({
      id: tag,
      label: tag,
      icon: HashIcon,
      tone: "accent",
      tooltip: `Remove #${tag}`,
      onClick: () => {
        selectedTags = selectedTags.filter((item) => item !== tag);
      },
    })),
  );

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

  <div class="docs-sidebar__views" role="group" aria-label="Docs sidebar">
    {#each tabs as tab (tab.id)}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="docs-sidebar__view"
        aria-pressed={view === tab.id}
        title={tab.label}
        onclick={() => (view = tab.id)}
      >
        <span class="docs-sidebar__view-label">{tab.label}</span>
      </Button>
    {/each}
  </div>

  <div class="docs-sidebar__toolbar">
    <input class="docs-sidebar__search" placeholder="Filter notes" bind:value={query} />
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="outline"
            size="sm"
            class="docs-sidebar__sort"
            aria-label="Sort notes"
          >
            {sortLabel}
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.RadioGroup bind:value={sortMode}>
          {#each sortOptions as option (option.value)}
            <DropdownMenu.RadioItem value={option.value}>{option.label}</DropdownMenu.RadioItem>
          {/each}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
  <div class="docs-sidebar__filters">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      class="docs-sidebar__filter"
      aria-pressed={dueOnly}
      title="Due"
      onclick={() => (dueOnly = !dueOnly)}
    >
      <ClockIcon aria-hidden="true" />
      <span class="docs-sidebar__view-label">Due</span>
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      class="docs-sidebar__filter"
      aria-current={reviewScope === "workspace" ? "page" : undefined}
      title="Review all"
      onclick={() => onStartWorkspaceReview()}
    >
      <BrainIcon aria-hidden="true" />
      <span class="docs-sidebar__view-label">Review all</span>
    </Button>
  </div>

  {#if error}
    <p class="docs-sidebar__status docs-sidebar__status--error">{error}</p>
  {:else if loading}
    <p class="docs-sidebar__status">Loading docs</p>
  {/if}

  <ScrollArea.Root class="docs-sidebar__scroll">
    <div class="docs-sidebar__scroll-content">
    {#if selectedTags.length}
      <div class="docs-sidebar__selected-tags">
        <TagList
          class="docs-sidebar__tag-list"
          label="Selected tag filters"
          size="sm"
          tags={selectedTagItems}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          class="docs-sidebar__clear-tags"
          aria-label="Clear tag filters"
          title="Clear tag filters"
          onclick={() => (selectedTags = [])}
        >
          <XIcon aria-hidden="true" />
        </Button>
      </div>
    {/if}
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
        bind:viewMode={tagsViewMode}
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
  </ScrollArea.Root>
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
