<script lang="ts">
  import type { App, TFile } from "@lapis-notes/api";
  import type { DocsRepository } from "../../docs-repository";
  import { requestDocsDocumentSurface } from "../docs-document-surface";
  import {
    buildDocsWorkspaceIndex,
    createDocsNote,
    slugifyDocsId,
    type DocsNote,
    type DocsNotePanel,
    type DocsReviewScope,
    type DocsWorkspaceIndex,
  } from "../../model";
  import DocsSidebar from "./DocsSidebar.svelte";

  let {
    app,
    repository,
    docsRoot = "docs",
    clock = () => new Date(),
    onImportAnkiPackage = undefined,
  }: {
    app: App;
    repository: DocsRepository;
    docsRoot?: string;
    clock?: () => Date;
    onImportAnkiPackage?: (file: File) => void | Promise<void>;
  } = $props();

  let notes = $state<DocsNote[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let activePath = $state<string | null>(null);
  let activePanel = $state<DocsNotePanel>("display");
  let reviewScope = $state<DocsReviewScope>("note");

  const workspace = $derived<DocsWorkspaceIndex>(
    buildDocsWorkspaceIndex(notes, clock()),
  );
  const activeNote = $derived(
    notes.find((note) => note.sourcePath === activePath) ?? null,
  );

  async function refresh() {
    loading = true;
    try {
      notes = await repository.listNotes(docsRoot);
      error = null;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    void docsRoot;
    void refresh();
  });

  $effect(() => {
    const workspace = app.workspace;
    activePath = workspace.getActiveFile()?.path ?? null;
    const fileOpen = workspace.on("file-open", (file: TFile | null) => {
      activePath = file?.path ?? null;
    });
    return () => workspace.offref(fileOpen);
  });

  async function openNote(
    noteId: string,
    panel: DocsNotePanel = "note",
    scope?: DocsReviewScope,
  ) {
    const note = notes.find((entry) => entry.id === noteId);
    if (!note?.sourcePath) return;
    if (scope) reviewScope = scope;
    activePanel = panel === "note" ? "display" : panel;
    requestDocsDocumentSurface(note.sourcePath, {
      panel,
      ...(scope ? { reviewScope: scope } : {}),
    });
    activePath = note.sourcePath;
    const file = app.vault.getFileByPath(note.sourcePath);
    if (file) await app.workspace.openLinkText(note.sourcePath, "", false);
  }

  async function importPackage(file: File) {
    const { importAnkiPackageFile } = await import("../import-anki-package");
    await importAnkiPackageFile({
      app,
      repository,
      docsRoot,
      file,
      now: clock(),
    });
    await refresh();
  }

  async function createNote() {
    const title = "Untitled note";
    const id = slugifyDocsId(`${title}-${clock().getTime()}`);
    const note = createDocsNote({ id, title }, clock());
    note.sourcePath = `${docsRoot}/${id}.doc.md`;
    await repository.writeNote(note);
    await refresh();
    await openNote(note.id, "note");
  }
</script>

<DocsSidebar
  {workspace}
  {loading}
  {error}
  activeNoteId={activeNote?.id ?? null}
  {activePanel}
  {reviewScope}
  onSelectNote={(noteId) => void openNote(noteId, "note")}
  onSelectPanel={(noteId, panel, scope) => void openNote(noteId, panel, scope)}
  onCreateNote={() => void createNote()}
  onStartWorkspaceReview={() => {
    const due = workspace.reviewQueue[0];
    if (!due) return;
    void openNote(due.noteId, "review", "workspace");
  }}
  onImportAnkiPackage={onImportAnkiPackage ?? importPackage}
/>
