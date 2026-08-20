<script lang="ts">
  /**
   * File-leaf adapter: vault markdown ↔ ported DocsWorkspace for a single *.doc.md.
   */
  import type { App } from "@lapis-notes/api";
  import { onDestroy } from "svelte";
  import DocsWorkspace from "./docs/DocsWorkspace.svelte";
  import type { DocsRepository } from "./docs-repository";
  import {
    buildDocsWorkspace,
    docsNoteToMarkdown,
    parseDocsNoteMarkdownFile,
    reviewDocsCard,
    type DocsNote,
    type DocsNotePanel,
    type DocsReviewRating,
    type DocsReviewScope,
  } from "./model";

  let {
    app,
    markdownText = "",
    filePath = "",
    repository,
    clock = () => new Date(),
    onMarkdownChange = async () => {},
  }: {
    app: App;
    markdownText?: string;
    filePath?: string;
    repository?: DocsRepository;
    clock?: () => Date;
    onMarkdownChange?: (next: string) => void | Promise<void>;
  } = $props();

  let notes = $state<DocsNote[]>([]);
  let activePanel = $state<DocsNotePanel>("display");
  let reviewScope = $state<DocsReviewScope>("note");
  let previewMode = $state(true);
  let sidebarOpen = $state(false);
  let loading = $state(false);
  let saving = $state(false);
  let error = $state<string | null>(null);

  const activeNote = $derived.by(() => {
    const parsed = parseDocsNoteMarkdownFile({
      path: filePath || "untitled.doc.md",
      content: markdownText,
    });
    return parsed;
  });

  const workspace = $derived.by(() => {
    const catalog = notes.length
      ? notes.map((note) =>
          note.id === activeNote?.id && activeNote ? activeNote : note,
        )
      : activeNote
        ? [activeNote]
        : [];
    return buildDocsWorkspace(catalog, clock());
  });

  async function refreshCatalog() {
    if (!repository) {
      notes = activeNote ? [activeNote] : [];
      return;
    }
    loading = true;
    try {
      const listed = await repository.listNotes("docs");
      notes = listed.length ? listed : activeNote ? [activeNote] : [];
      error = null;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      notes = activeNote ? [activeNote] : [];
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    void filePath;
    void markdownText;
    void refreshCatalog();
  });

  async function persistNote(note: DocsNote) {
    saving = true;
    try {
      const next = docsNoteToMarkdown(note);
      await onMarkdownChange(next);
      if (repository) await repository.writeNote(note);
      error = null;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    } finally {
      saving = false;
    }
  }

  async function handleReview(
    noteId: string,
    cardId: string,
    rating: DocsReviewRating,
  ) {
    const note =
      notes.find((entry) => entry.id === noteId) ??
      (activeNote?.id === noteId ? activeNote : null);
    if (!note) return;
    const card = note.cards.find((entry) => entry.id === cardId);
    if (!card) return;
    const nextCard = reviewDocsCard(card, rating, clock());
    const nextNote: DocsNote = {
      ...note,
      cards: note.cards.map((entry) =>
        entry.id === cardId ? nextCard : entry,
      ),
      updatedAt: clock().toISOString(),
    };
    await persistNote(nextNote);
    await refreshCatalog();
  }

  onDestroy(() => {
    // Flush is owned by DocsDocumentView save coordinator.
  });

  // app used in openLinkText callback
</script>

<div class="docs-document-workspace" data-ui-component="docs-document">
  <DocsWorkspace
    {workspace}
    activeNote={activeNote}
    activeNoteId={activeNote?.id ?? null}
    {activePanel}
    {reviewScope}
    {previewMode}
    {sidebarOpen}
    {loading}
    {saving}
    {error}
    onToggleSidebar={() => {
      sidebarOpen = !sidebarOpen;
    }}
    onActiveNoteChange={(noteId) => {
      if (!noteId || !repository) return;
      const target = notes.find((note) => note.id === noteId);
      if (!target?.sourcePath) return;
      const file = app.vault.getFileByPath(target.sourcePath);
      if (file) void app.workspace.openLinkText(target.sourcePath, "", false);
    }}
    onActivePanelChange={(panel) => {
      activePanel = panel;
      if (panel === "display" || panel === "note") {
        previewMode = panel === "display";
      }
    }}
    onReviewScopeChange={(scope) => {
      reviewScope = scope;
    }}
    onPreviewModeChange={(enabled) => {
      previewMode = enabled;
      activePanel = enabled ? "display" : "note";
    }}
    onSaveNote={persistNote}
    onReviewCard={handleReview}
  />
</div>

<style>
  .docs-document-workspace {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }
</style>
