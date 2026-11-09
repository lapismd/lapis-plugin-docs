<script lang="ts">
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import ChevronsDownUpIcon from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import ClipboardIcon from "@lucide/svelte/icons/clipboard";
  import PencilIcon from "@lucide/svelte/icons/pencil";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import PresentationIcon from "@lucide/svelte/icons/presentation";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import UploadIcon from "@lucide/svelte/icons/upload";

  import type { DocsNote, DocsNotePanel } from '../model';
  import type { DisplayMode } from "./docs-workspace-helpers";

  let {
    draftNote,
    filenameDraft = $bindable(""),
    yamlMode = false,
    saving = false,
    activePanel,
    previewMode = false,
    showCollapseAll = false,
    hasCollapsedSections = false,
    collapseAllDisabled = false,
    displayMode = $bindable("document"),
    renderedDisplayMarkdown = "",
    onCommitFilename,
    onYamlModeChange,
    onPanelChange,
    onPreviewModeChange = () => {},
    onToggleAllSections = () => {},
    onAddCard,
    onImportAnkiPackage,
    onCopyRenderedMarkdown = () => {},
    onDeleteNote,
  }: {
    draftNote: DocsNote | null;
    filenameDraft: string;
    yamlMode?: boolean;
    saving?: boolean;
    activePanel: DocsNotePanel;
    previewMode?: boolean;
    showCollapseAll?: boolean;
    hasCollapsedSections?: boolean;
    collapseAllDisabled?: boolean;
    displayMode?: DisplayMode;
    renderedDisplayMarkdown?: string;
    onCommitFilename: () => void | Promise<void>;
    onYamlModeChange: (enabled: boolean) => void;
    onPanelChange: (panel: DocsNotePanel) => void;
    onPreviewModeChange?: (enabled: boolean) => void;
    onToggleAllSections?: () => void;
    onAddCard: () => void;
    onImportAnkiPackage?: (file: File) => void | Promise<void>;
    onCopyRenderedMarkdown?: () => void | Promise<void>;
    onDeleteNote: () => void | Promise<void>;
  } = $props();

  function toggleDisplayMode() {
    displayMode = displayMode === "slides" ? "document" : "slides";
  }

  const isPreviewActive = $derived(
    activePanel === "display" || (activePanel === "cards" && previewMode),
  );

  function togglePreviewMode() {
    if (activePanel === "cards") {
      onPreviewModeChange(!previewMode);
      return;
    }
    onPanelChange(activePanel === "display" ? "note" : "display");
  }
</script>

<div class="docs-toolbar">
  <div class="docs-toolbar__title">
    <div>
      {#if draftNote}
        <input
          class="docs-toolbar__filename-input"
          bind:value={filenameDraft}
          aria-label="Note filename"
          spellcheck={false}
          onblur={() => void onCommitFilename()}
          onkeydown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
        />
      {:else}
        <h1>Docs</h1>
      {/if}
    </div>
  </div>
  <div class="docs-toolbar__actions">
    {#if draftNote}
      <button
        type="button"
        class="docs-yaml-switch"
        role="switch"
        aria-checked={yamlMode}
        aria-label="YAML"
        onclick={() => onYamlModeChange(!yamlMode)}
      >
        <span class="docs-yaml-switch-track" aria-hidden="true">
          <span class="docs-yaml-switch-thumb"></span>
        </span>
        <span>YAML</span>
      </button>
      {#if activePanel !== "practice"}
      <button
        type="button"
        class="docs-view-toggle"
        aria-label={isPreviewActive ? "Switch to edit mode" : "Switch to preview mode"}
        title={isPreviewActive ? "Switch to edit mode" : "Switch to preview mode"}
        disabled={yamlMode}
        onclick={togglePreviewMode}
      >
        {#if isPreviewActive}
          <PencilIcon aria-hidden="true" />
        {:else}
          <BookOpenIcon aria-hidden="true" />
        {/if}
      </button>
      {/if}
      {#if showCollapseAll && !yamlMode}
        <button
          type="button"
          class="docs-collapse-all-button"
          aria-label={hasCollapsedSections ? "Expand all sections" : "Collapse all sections"}
          title={hasCollapsedSections ? "Expand all sections" : "Collapse all sections"}
          disabled={collapseAllDisabled}
          onclick={onToggleAllSections}
        >
          {#if hasCollapsedSections}
            <ChevronsUpDownIcon aria-hidden="true" />
          {:else}
            <ChevronsDownUpIcon aria-hidden="true" />
          {/if}
        </button>
      {/if}
      {#if activePanel === "display" && !yamlMode}
        <button
          type="button"
          class="docs-display-mode-toggle"
          aria-label={displayMode === "slides" ? "Switch to document view" : "Switch to slides view"}
          title={displayMode === "slides" ? "Switch to document view" : "Switch to slides view"}
          onclick={toggleDisplayMode}
        >
          {#if displayMode === "slides"}
            <BookOpenIcon aria-hidden="true" />
            <span>Document</span>
          {:else}
            <PresentationIcon aria-hidden="true" />
            <span>Slides</span>
          {/if}
        </button>
        <button
          type="button"
          class="docs-display-copy-button"
          aria-label="Copy display markdown"
          title="Copy display markdown"
          disabled={!renderedDisplayMarkdown.trim()}
          onclick={() => void onCopyRenderedMarkdown()}
        >
          <ClipboardIcon aria-hidden="true" />
        </button>
      {/if}
    {/if}
    {#if saving}
      <span class="docs-save-status" aria-live="polite">Saving…</span>
    {/if}
    {#if onImportAnkiPackage}
      <label
        class="docs-import-anki-button"
        aria-label="Import Anki package"
        title="Import Anki package"
      >
        <UploadIcon aria-hidden="true" />
        <input
          class="docs-import-anki-input"
          type="file"
          accept=".apkg,application/octet-stream"
          aria-label="Anki package file"
          disabled={saving}
          onchange={(event) => {
            const input = event.currentTarget;
            if (!(input instanceof HTMLInputElement)) return;
            const file = input.files?.[0];
            input.value = "";
            if (file) void onImportAnkiPackage?.(file);
          }}
        />
      </label>
    {/if}
    {#if activePanel === "cards" && !yamlMode && !previewMode}
      <button type="button" disabled={!draftNote} onclick={onAddCard}>
        <PlusIcon />
        Add card
      </button>
    {/if}
    <button
      type="button"
      disabled={!draftNote}
      aria-label="Delete note"
      onclick={onDeleteNote}
    >
      <Trash2Icon />
    </button>
  </div>
</div>
