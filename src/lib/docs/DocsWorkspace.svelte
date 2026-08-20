<script lang="ts">
	import './DocsWorkspace.css';
	import './DocsCardsReview.css';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import { normalizeDateOnly as normalizeTaskDateOnly } from "@lapismd/design-core/forms";
	import DocsCardsPanel from './DocsCardsPanel.svelte';
	import DocsDisplayPanel from './DocsDisplayPanel.svelte';
	import DocsEditorPanel from './DocsEditorPanel.svelte';
	import DocsFolderPanel from './DocsFolderPanel.svelte';
	import DocsReviewPanel from './DocsReviewPanel.svelte';
	import DocsWorkspaceToolbar from './DocsWorkspaceToolbar.svelte';

	import { YamlEditor, type ReferenceIndex, type YamlReviewDiff } from '@lapismd/design-core/forms';
	import * as ScrollArea from "@lapismd/design-core/shadcn/scroll-area";

	import { fsrsCardFromState, fsrsStateFromCard } from '../model/fsrs';
	import { docsBookWorkspaceView } from './docs-book-view-model';
	import { preservePreviewModeForDocsLink } from './docs-link-mode';
	import { setDocsMediaResolver } from '../model/docs-media-context';
	import { serverDocsMediaUrl } from '../model/docs-relative-media';

	import {
		docsNoteToMarkdown,
		parseDocsNoteMarkdownFile,
		renderDocsNoteMarkdown,
		slugifyDocsId
	} from '../model/markdown';
	import {
		cloneDocsNote,
		createDocsBlockFromType,
		createEmptyDocsBlock,
		type DisplayMode
	} from './docs-workspace-helpers';
	import { docsNoteListKey, isDocsNoteSummary } from '../model/docs-note-list';
	import type {
		CreateDocsNoteInput,
		DocsCard,
		DocsNote,
		DocsNotePanel,
		DocsRevisionBlock,
		DocsReviewRating,
		DocsReviewScope,
		DocsWorkspace,
		DocsWorkspaceIndex
	} from '../model';

  type Props = {
    workspace: DocsWorkspace | DocsWorkspaceIndex | null;
    /** Full note for the active id; index rows are summaries only. */
    activeNote?: DocsNote | null;
    activeNoteId?: string | null;
    activePanel?: DocsNotePanel;
    activeCodingCardId?: string | null;
    reviewScope?: DocsReviewScope;
    previewMode?: boolean;
    sidebarOpen?: boolean;
    activeFolderTag?: string | null;
    folderDisplayMode?: "panel" | "inline";
    folderPanelCollapsed?: boolean;
    loading?: boolean;
    saving?: boolean;
    error?: string | null;
    onToggleSidebar?: () => void | Promise<void>;
    onActiveNoteChange?: (noteId: string | null) => void;
    onActivePanelChange?: (panel: DocsNotePanel) => void;
    onActiveCodingCardChange?: (cardId: string | null) => void;
    onReviewScopeChange?: (scope: DocsReviewScope) => void;
    onPreviewModeChange?: (enabled: boolean) => void;
    onActiveFolderTagChange?: (tag: string | null) => void;
    onFolderPanelCollapsedChange?: (collapsed: boolean) => void;
    onCreateNote?: (input?: CreateDocsNoteInput) => void | Promise<void>;
    onSaveNote?: (note: DocsNote) => void | Promise<void>;
    onDeleteNote?: (noteId: string) => void | Promise<void>;
    onReviewCard?: (noteId: string, cardId: string, rating: DocsReviewRating) => void | Promise<void>;
    onSchedulePractice?: (noteId: string, cardId?: string) => void | Promise<void>;
    onImportAnkiPackage?: () => void | Promise<void>;
    onUploadAttachment?: (noteId: string, file: File) => Promise<string | null>;
    /** Runtime media URL resolver for co-located docs images. */
    resolveMediaUrl?: (relativePath: string) => string | Promise<string>;
    sourceReferenceIndex?: ReferenceIndex;
    loadingState?: Snippet;
    emptyState?: Snippet<[() => void]>;
    codingPractice?: Snippet<[DocsNote, DocsCard | null, (card: DocsCard) => void]>;
    reviewContent?: Snippet;
    reviewDiffs?: YamlReviewDiff[];
    onUndoReview?: (id: string) => void;
    onKeepReview?: (id: string) => void;
  };

  const emptySourceReferenceIndex: ReferenceIndex = {
    references: [],
    duplicates: {},
  };
  let {
    workspace,
    activeNote = null,
    activeNoteId = null,
    activePanel = "note",
    activeCodingCardId = null,
    reviewScope = "note",
    previewMode = false,
    sidebarOpen = false,
    activeFolderTag = null,
    folderDisplayMode = "panel",
    folderPanelCollapsed = false,
    loading = false,
    saving = false,
    error = null,
    onToggleSidebar = () => {},
    onActiveNoteChange = () => {},
    onActivePanelChange = () => {},
    onActiveCodingCardChange = () => {},
    onReviewScopeChange = () => {},
    onPreviewModeChange = () => {},
    onActiveFolderTagChange = () => {},
    onFolderPanelCollapsedChange = () => {},
    onCreateNote = () => {},
    onSaveNote = () => {},
    onDeleteNote = () => {},
    onReviewCard = () => {},
    onSchedulePractice = () => {},
    onImportAnkiPackage,
    onUploadAttachment,
    resolveMediaUrl = serverDocsMediaUrl,
    sourceReferenceIndex = emptySourceReferenceIndex,
    loadingState,
    emptyState,
    codingPractice,
    reviewContent,
    reviewDiffs = [],
    onUndoReview,
    onKeepReview,
  }: Props = $props();

  setDocsMediaResolver((relativePath) => resolveMediaUrl(relativePath));
  let draftNote = $state<DocsNote | null>(null);
  let draftKey = $state("");
  let filenameDraft = $state("");
  let blockOpenById = $state<Record<string, boolean>>({});
  let cardOpenById = $state<Record<string, boolean>>({});
  let cardReferenceAddOpenById = $state<Record<string, boolean>>({});
  let propertiesOpen = $state(false);
  let displayMode = $state<DisplayMode>("document");
  let reviewAnswerOpenById = $state<Record<string, boolean>>({});
  let yamlMode = $state(false);
  let yamlDraft = $state("");
  let yamlError = $state("");
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let trackedNoteId = $state<string | null>(null);
  let deletingNoteId = $state<string | null>(null);

  const DOCS_AUTOSAVE_MS = 1200;

  const notes = $derived(workspace?.notes ?? []);
  const selectedNote = $derived.by(() => {
    if (activeNote && (!activeNoteId || activeNote.id === activeNoteId)) {
      return activeNote;
    }
    const candidate =
      notes.find((note) => note.id === activeNoteId) ?? notes[0] ?? null;
    if (!candidate || isDocsNoteSummary(candidate)) return null;
    return candidate;
  });
  // Initial workspace load, or lazy full-note fetch while the index is already present.
  const showLoadingState = $derived(
    loading &&
      (!workspace ||
        (activePanel !== "review" && Boolean(activeNoteId) && !selectedNote)),
  );
  const selectedNoteKey = $derived(selectedNote ? docsNoteListKey(selectedNote) : "");
  const noteReviewQueue = $derived(
    workspace?.reviewQueue.filter((item) => item.noteId === draftNote?.id) ??
      [],
  );
  const activeReviewQueue = $derived(
    reviewScope === "workspace"
      ? (workspace?.reviewQueue ?? [])
      : noteReviewQueue,
  );
  const activeCodingCard = $derived(
    draftNote?.cards.find(
      (card) => card.type === "coding" && card.id === activeCodingCardId,
    ) ?? draftNote?.cards.find((card) => card.type === "coding"),
  );
  function getNoteBlocks(noteId: string): DocsRevisionBlock[] {
    if (draftNote?.id === noteId) return draftNote.blocks;
    if (activeNote?.id === noteId) return activeNote.blocks;
    return [];
  }
  const tagSuggestions = $derived(workspace?.tags.map((tag) => tag.tag) ?? []);
  const aliasSuggestions = $derived(
    Array.from(
      new Set(
        (workspace?.notes ?? [])
          .flatMap((note) => note.aliases)
          .filter(Boolean),
      ),
    ),
  );
  const bookWorkspaceView = $derived(
    docsBookWorkspaceView(
      workspace,
      notes,
      activeNoteId ?? draftNote?.id ?? null,
      draftNote,
    ),
  );
  const draftSerialized = $derived(draftNote ? JSON.stringify(draftNote) : "");
  const selectedSerialized = $derived(
    selectedNote ? JSON.stringify(selectedNote) : "",
  );
  const draftDirty = $derived(
    Boolean(draftNote && draftSerialized !== selectedSerialized),
  );
  const blockSuggestions = $derived(
    draftNote?.blocks.map((block) => block.id) ?? [],
  );
  const renderedDocumentMarkdown = $derived(
    draftNote ? renderDocsNoteMarkdown(draftNote) : "",
  );
  const renderedSlidesMarkdown = $derived(
    draftNote ? renderDocsNoteMarkdown(draftNote, { mode: "slides" }) : "",
  );
  const renderedDisplayMarkdown = $derived(
    displayMode === "slides"
      ? renderedSlidesMarkdown
      : renderedDocumentMarkdown,
  );
  const hasCollapsedEditSections = $derived(
    Boolean(
      draftNote &&
        (!propertiesOpen ||
          draftNote.blocks.some((block) => blockOpenById[block.id] === false)),
    ),
  );
  const hasEditCollapseTarget = $derived(Boolean(draftNote));

  $effect(() => {
    const noteId = activeNoteId ?? selectedNote?.id ?? null;
    if (trackedNoteId !== null && trackedNoteId !== noteId) {
      void flushPendingSave();
    }
    trackedNoteId = noteId;
  });

  $effect(() => {
    if (!selectedNote) {
      draftNote = null;
      draftKey = "";
      filenameDraft = "";
      yamlMode = false;
      yamlDraft = "";
      yamlError = "";
      blockOpenById = {};
      return;
    }
    if (selectedNote.id === deletingNoteId) return;
    if (draftKey === selectedNoteKey) return;
    draftNote = cloneDocsNote(selectedNote);
    draftKey = selectedNoteKey;
    filenameDraft = selectedNote.id;
    blockOpenById = Object.fromEntries(
      selectedNote.blocks.map((block, index) => [block.id, index === 0]),
    );
    cardOpenById = Object.fromEntries(
      selectedNote.cards.map((card, index) => [card.id, index === 0]),
    );
    propertiesOpen = false;
    if (yamlMode) {
      yamlDraft = docsNoteToMarkdown(selectedNote);
      yamlError = "";
    }
  });

  $effect(() => {
    if (!draftNote || yamlMode || !draftDirty) return;
    scheduleDraftSave();
  });

  $effect(() => {
    activePanel;
    reviewScope;
    reviewAnswerOpenById = {};
  });

  $effect(() => {
    if (activePanel !== "practice") return;
    const selectedCardId = activeCodingCard?.id ?? null;
    if (selectedCardId !== activeCodingCardId) onActiveCodingCardChange(selectedCardId);
  });

  onDestroy(() => {
    void flushPendingSave();
  });

  function scheduleDraftSave(delay = DOCS_AUTOSAVE_MS) {
    if (yamlError) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      void saveDraft();
    }, delay);
  }

  async function flushPendingSave() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    if (!draftNote || !draftDirty) return;
    await saveDraft();
  }

  function cancelPendingSave() {
    if (!saveTimer) return;
    clearTimeout(saveTimer);
    saveTimer = null;
  }

  function setYamlMode(enabled: boolean) {
    if (enabled) {
      if (!draftNote) return;
      yamlDraft = docsNoteToMarkdown(draftNote);
      yamlError = "";
      yamlMode = true;
      return;
    }
    yamlMode = false;
  }

  function updateYamlDraft(value: string) {
    yamlDraft = value;
    if (!draftNote) return;
    try {
      const parsed = parseDocsNoteMarkdownFile({
        path: draftNote.sourcePath,
        content: value,
      });
      yamlError = "";
      draftNote = {
        ...parsed,
        id: draftNote.id,
        sourcePath: draftNote.sourcePath,
      };
      draftKey = `${draftNote.id}:${draftNote.updatedAt}:${draftNote.completedAt ?? ""}:${draftNote.blocks.length}:${draftNote.cards.length}:${draftNote.body.length}`;
      scheduleDraftSave();
    } catch (error) {
      yamlError = error instanceof Error ? error.message : String(error);
    }
  }

  function updateDraft(updater: (note: DocsNote) => DocsNote) {
    if (!draftNote) return;
    draftNote = updater(cloneDocsNote(draftNote));
  }

  function setDraftField<K extends keyof DocsNote>(key: K, value: DocsNote[K]) {
    updateDraft((note) => ({ ...note, [key]: value }));
  }

  function uniqueDraftBlockId(base: string, fallback = "block") {
    const existingIds = new Set(
      draftNote?.blocks.map((block) => block.id) ?? [],
    );
    const slug = slugifyDocsId(base, fallback);
    const prefix = slug.startsWith("block-") ? slug : `block-${slug}`;
    let id = prefix;
    let suffix = 2;
    while (existingIds.has(id)) id = `${prefix}-${suffix++}`;
    return id;
  }

  function blockFromType(
    type: DocsRevisionBlock["type"],
    previous?: DocsRevisionBlock,
    title = "",
  ) {
    const block = createDocsBlockFromType(
      type,
      previous?.id ?? uniqueDraftBlockId(title || type),
      previous,
    );
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return block;
    return { ...block, title: trimmedTitle } as DocsRevisionBlock;
  }

  function updateBlock(
    blockId: string,
    updater: (block: DocsRevisionBlock) => DocsRevisionBlock,
  ) {
    updateDraft((note) => ({
      ...note,
      blocks: note.blocks.map((block) =>
        block.id === blockId ? updater(block) : block,
      ),
    }));
  }

  function patchBlock(blockId: string, patch: Record<string, unknown>) {
    updateBlock(
      blockId,
      (block) => ({ ...block, ...patch }) as DocsRevisionBlock,
    );
  }

  function updateBlockTitle(blockId: string, title: string) {
    updateBlock(blockId, (block) => {
      const next = { ...block };
      const trimmed = title.trim();
      if (trimmed) next.title = title;
      else delete next.title;
      return next;
    });
  }

  function updateBlockId(blockId: string, rawValue: string) {
    const nextId = slugifyDocsId(rawValue, blockId);
    if (!nextId || nextId === blockId) return;
    if (draftNote?.blocks.some((block) => block.id === nextId)) return;
    updateDraft((note) => ({
      ...note,
      blocks: note.blocks.map((block) =>
        block.id === blockId ? { ...block, id: nextId } : block,
      ),
      cards: note.cards.map((card) => ({
        ...card,
        blockRefs: card.blockRefs.map((ref) =>
          ref === blockId ? nextId : ref,
        ),
      })),
    }));
    blockOpenById = {
      ...Object.fromEntries(
        Object.entries(blockOpenById).filter(([id]) => id !== blockId),
      ),
      [nextId]: blockOpenById[blockId] !== false,
    };
  }

  function addBlock(type: DocsRevisionBlock["type"] = "concept", title = "") {
    if (!draftNote) return;
    const block = blockFromType(type, undefined, title);
    updateDraft((note) => ({
      ...note,
      blocks: [...note.blocks, block],
    }));
    blockOpenById = { ...blockOpenById, [block.id]: true };
    void flushPendingSave();
  }

  function removeBlock(blockId: string) {
    updateDraft((note) => ({
      ...note,
      blocks: note.blocks.filter((block) => block.id !== blockId),
      cards: note.cards.map((card) => ({
        ...card,
        blockRefs: card.blockRefs.filter((ref) => ref !== blockId),
      })),
    }));
    void flushPendingSave();
  }

  function moveBlock(blockId: string, direction: -1 | 1) {
    updateDraft((note) => {
      const index = note.blocks.findIndex((block) => block.id === blockId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= note.blocks.length)
        return note;
      const blocks = [...note.blocks];
      const [block] = blocks.splice(index, 1);
      blocks.splice(nextIndex, 0, block);
      return { ...note, blocks };
    });
    void flushPendingSave();
  }

  function toggleAllEditSections() {
    if (!draftNote) return;
    const open = hasCollapsedEditSections;
    propertiesOpen = open;
    blockOpenById = Object.fromEntries(
      draftNote.blocks.map((block) => [block.id, open]),
    );
  }

  async function copyRenderedMarkdown() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(renderedDisplayMarkdown);
  }

  function updateCard(cardId: string, updater: (card: DocsCard) => DocsCard) {
    updateDraft((note) => ({
      ...note,
      cards: note.cards.map((card) =>
        card.id === cardId ? updater(card) : card,
      ),
    }));
  }

  function replaceCodingCard(nextCard: DocsCard) {
    updateCard(nextCard.id, () => nextCard);
  }

  function addCard() {
    if (!draftNote) return;
    const base = "New card";
    const existingIds = new Set(draftNote.cards.map((card) => card.id));
    let id = `card-${slugifyDocsId(base, "card")}`;
    let suffix = 2;
    while (existingIds.has(id))
      id = `card-${slugifyDocsId(base, "card")}-${suffix++}`;
    updateDraft((note) => ({
      ...note,
      cards: [
        ...note.cards,
        {
          id,
          type: "basic",
          status: "active",
          prompt: "",
          answer: "",
          tags: [],
          sourceRefs: [],
          blockRefs: [],
          reviews: [],
        },
      ],
    }));
    cardOpenById = { ...cardOpenById, [id]: true };
    void flushPendingSave();
  }

  function removeCard(cardId: string) {
    updateDraft((note) => ({
      ...note,
      cards: note.cards.filter((card) => card.id !== cardId),
    }));
    void flushPendingSave();
  }

  function moveCard(cardId: string, direction: -1 | 1) {
    updateDraft((note) => {
      const index = note.cards.findIndex((card) => card.id === cardId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= note.cards.length)
        return note;
      const cards = [...note.cards];
      const [card] = cards.splice(index, 1);
      cards.splice(nextIndex, 0, card);
      return { ...note, cards };
    });
    void flushPendingSave();
  }

  async function saveDraft() {
    if (!draftNote || yamlError) return;
    if (draftNote.id === deletingNoteId) return;
    await onSaveNote({
      ...draftNote,
      updatedAt: new Date().toISOString(),
    });
  }

  async function toggleChapterComplete(completed: boolean) {
    if (!draftNote || yamlError) return;
    if (draftNote.id === deletingNoteId) return;
    const nextNote: DocsNote = {
      ...draftNote,
      updatedAt: new Date().toISOString(),
    };
    if (completed) {
      nextNote.completedAt = new Date().toISOString();
    } else {
      delete nextNote.completedAt;
    }
    draftNote = nextNote;
    draftKey = `${nextNote.id}:${nextNote.updatedAt}:${nextNote.completedAt ?? ""}:${nextNote.blocks.length}:${nextNote.cards.length}:${nextNote.body.length}`;
    cancelPendingSave();
    await onSaveNote(nextNote);
  }

  async function deleteDraftNote() {
    if (!draftNote) return;
    const noteId = draftNote.id;
    cancelPendingSave();
    deletingNoteId = noteId;
    draftNote = null;
    draftKey = "";
    filenameDraft = "";
    yamlMode = false;
    yamlDraft = "";
    yamlError = "";
    try {
      await onDeleteNote(noteId);
    } finally {
      deletingNoteId = null;
    }
  }

  async function commitFilename() {
    if (!draftNote || !selectedNote) return;
    const nextId = slugifyDocsId(filenameDraft, draftNote.id);
    filenameDraft = nextId;
    if (nextId === selectedNote.id) return;
    if (
      (workspace?.notes ?? []).some(
        (note) => note.id === nextId && note.id !== selectedNote.id,
      )
    ) {
      filenameDraft = selectedNote.id;
      return;
    }
    const renamed = {
      ...draftNote,
      id: nextId,
      sourcePath: `docs/${nextId}.doc.md`,
      updatedAt: new Date().toISOString(),
    };
    draftNote = renamed;
    draftKey = `${nextId}:${renamed.updatedAt}:${renamed.completedAt ?? ""}:${renamed.blocks.length}:${renamed.cards.length}:${renamed.body.length}`;
    try {
      await onSaveNote(renamed);
    } catch {
      filenameDraft = selectedNote.id;
      draftNote = cloneDocsNote(selectedNote);
      draftKey = selectedNoteKey;
    }
  }

  function createNote() {
    void onCreateNote({
      title: "Untitled note",
      body: "",
    });
  }

  function cardDueAt(card: DocsCard) {
    return card.fsrs?.due ? normalizeTaskDateOnly(card.fsrs.due) : undefined;
  }

  function dueDateToIso(dateOnly: string) {
    const [year, month, day] = dateOnly.split("-").map((part) => Number(part));
    return new Date(year, month - 1, day, 9, 0, 0, 0).toISOString();
  }
  function updateCardDue(cardId: string, dateOnly: string | undefined) {
    updateCard(cardId, (item) => {
      const now = new Date();
      const due = dateOnly ? dueDateToIso(dateOnly) : now.toISOString();
      const fsrsCard = fsrsCardFromState(item.fsrs, now);
      return {
        ...item,
        fsrs: fsrsStateFromCard({
          ...fsrsCard,
          due: new Date(due),
        } as import("ts-fsrs").Card),
      };
    });
    void flushPendingSave();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="docs-workspace"
  onclick={(event) => preservePreviewModeForDocsLink(event, activePanel)}
>
  {#if activeFolderTag && folderDisplayMode === "panel"}
    <DocsFolderPanel
      {workspace}
      activeTag={activeFolderTag}
      activeNoteId={activeNoteId ?? selectedNote?.id ?? null}
      {activePanel}
      collapsed={folderPanelCollapsed}
      onSelectNote={onActiveNoteChange}
      onSelectPanel={onActivePanelChange}
      onSelectTag={onActiveFolderTagChange}
      onClose={() => {
        onActiveFolderTagChange(null);
        onFolderPanelCollapsedChange(false);
      }}
      onCollapsedChange={onFolderPanelCollapsedChange}
    />
  {/if}
  <div class="docs-main">
    {#if showLoadingState}
      {#if loadingState}
        {@render loadingState()}
      {:else}
        <div
          class="docs-empty-body"
          role="status"
          aria-label={workspace ? "Loading docs note" : "Loading docs workspace"}
        >
          <div class="docs-placeholder" aria-hidden="true"></div>
        </div>
      {/if}
    {:else}
      <DocsWorkspaceToolbar
        {draftNote}
        bind:filenameDraft
        {sidebarOpen}
        {yamlMode}
        {saving}
        {activePanel}
        {previewMode}
        showCollapseAll={activePanel === "note" && !yamlMode}
        hasCollapsedSections={hasCollapsedEditSections}
        collapseAllDisabled={!hasEditCollapseTarget}
        bind:displayMode
        {renderedDisplayMarkdown}
        {onToggleSidebar}
        onCommitFilename={commitFilename}
        onYamlModeChange={setYamlMode}
        onPanelChange={onActivePanelChange}
        {onPreviewModeChange}
        onToggleAllSections={toggleAllEditSections}
        onAddCard={addCard}
        {onSchedulePractice}
        {onImportAnkiPackage}
        onCopyRenderedMarkdown={copyRenderedMarkdown}
        onDeleteNote={deleteDraftNote}
      />
      {#if error}
        <div class="docs-alert">
          <AlertCircleIcon />
          <span>{error}</span>
        </div>
      {/if}
      {#if activePanel === "review"}
      <DocsReviewPanel
        dueCards={activeReviewQueue}
        {reviewScope}
        getNoteBlocks={getNoteBlocks}
        {sourceReferenceIndex}
        bind:reviewAnswerOpenById
        {onReviewCard}
      />
      {:else if !draftNote}
      <div class="docs-empty-body">
        {#if emptyState}
          {@render emptyState(createNote)}
        {:else}
          <div class="docs-placeholder">
            <button type="button" class="primary" onclick={createNote}>
              <PlusIcon />
              Create note
            </button>
          </div>
        {/if}
      </div>
      {:else if yamlMode}
      <div class="docs-yaml-pane">
        <YamlEditor
          value={yamlDraft}
          invalid={Boolean(yamlError)}
          frameless
          minHeight="100%"
          ariaLabel="Docs note YAML"
          {reviewDiffs}
          {onUndoReview}
          {onKeepReview}
          onChange={updateYamlDraft}
        />
        {#if yamlError}
          <div class="docs-alert small">
            <AlertCircleIcon />
            <span>{yamlError}</span>
          </div>
        {/if}
      </div>
      {:else if activePanel === "practice"}
        {#if codingPractice}
          {@render codingPractice(draftNote, activeCodingCard ?? null, replaceCodingCard)}
        {:else}
          <div class="docs-empty-body">No coding exercise is selected.</div>
        {/if}
    {:else if activePanel === "display"}
      <DocsDisplayPanel
        bind:displayMode
        note={draftNote}
        {renderedDisplayMarkdown}
        bookNavigation={bookWorkspaceView.bookNavigation}
        chapterNavigation={bookWorkspaceView.chapterNavigation}
        {saving}
        onToggleChapterComplete={toggleChapterComplete}
      />
    {:else if activePanel === "cards"}
      <section class="docs-note-surface">
        <DocsCardsPanel
          {draftNote}
          {previewMode}
          bind:cardOpenById
          bind:cardReferenceAddOpenById
          {tagSuggestions}
          {sourceReferenceIndex}
          {blockSuggestions}
          {cardDueAt}
          {updateCardDue}
          {updateCard}
          {moveCard}
          {removeCard}
          {addCard}
        />
        {#if reviewContent}
          {@render reviewContent()}
        {/if}
      </section>
    {:else}
      <div class="docs-note-surface">
        <ScrollArea.Root class="docs-note-tab-panel">
          <div class="docs-note-tab-panel__content">
            <DocsEditorPanel
              {draftNote}
              bind:propertiesOpen
              bind:blockOpenById
              {tagSuggestions}
              {aliasSuggestions}
              bookChapterOptions={bookWorkspaceView.chapterOptions}
              {setDraftField}
              {patchBlock}
              {updateBlockTitle}
              {updateBlockId}
              {moveBlock}
              {removeBlock}
              {addBlock}
              {onUploadAttachment}
            />
            {#if reviewContent}
              {@render reviewContent()}
            {/if}
          </div>
        </ScrollArea.Root>
      </div>
      {/if}
    {/if}
  </div>
</div>
