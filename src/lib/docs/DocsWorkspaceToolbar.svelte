<script lang="ts">
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import BrainIcon from "@lucide/svelte/icons/brain";
  import ChevronsDownUpIcon from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import ClipboardIcon from "@lucide/svelte/icons/clipboard";
  import PanelLeftIcon from "@lucide/svelte/icons/panel-left";
  import PencilIcon from "@lucide/svelte/icons/pencil";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import PresentationIcon from "@lucide/svelte/icons/presentation";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import UploadIcon from "@lucide/svelte/icons/upload";

  import WorkspaceHistoryControls from "./candidates/WorkspaceHistoryControls.svelte";
  import type { DocsNote, DocsNotePanel } from '../model';
  import type { DisplayMode } from "./docs-workspace-helpers";

  let {
    draftNote,
    filenameDraft = $bindable(""),
    sidebarOpen = false,
    yamlMode = false,
    saving = false,
    activePanel,
    previewMode = false,
    showCollapseAll = false,
    hasCollapsedSections = false,
    collapseAllDisabled = false,
    displayMode = $bindable("document"),
    renderedDisplayMarkdown = "",
    onToggleSidebar = () => {},
    onCommitFilename,
    onYamlModeChange,
    onPanelChange,
    onPreviewModeChange = () => {},
    onToggleAllSections = () => {},
    onAddCard,
    onSchedulePractice,
    onImportAnkiPackage,
    onCopyRenderedMarkdown = () => {},
    onDeleteNote,
  }: {
    draftNote: DocsNote | null;
    filenameDraft: string;
    sidebarOpen?: boolean;
    yamlMode?: boolean;
    saving?: boolean;
    activePanel: DocsNotePanel;
    previewMode?: boolean;
    showCollapseAll?: boolean;
    hasCollapsedSections?: boolean;
    collapseAllDisabled?: boolean;
    displayMode?: DisplayMode;
    renderedDisplayMarkdown?: string;
    onToggleSidebar?: () => void | Promise<void>;
    onCommitFilename: () => void | Promise<void>;
    onYamlModeChange: (enabled: boolean) => void;
    onPanelChange: (panel: DocsNotePanel) => void;
    onPreviewModeChange?: (enabled: boolean) => void;
    onToggleAllSections?: () => void;
    onAddCard: () => void;
    onSchedulePractice: (noteId: string) => void | Promise<void>;
    onImportAnkiPackage?: () => void | Promise<void>;
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

<header class="docs-toolbar">
  <div class="docs-toolbar__title">
    <button
      type="button"
      class="docs-toolbar__sidebar-toggle"
      aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
      title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
      aria-pressed={sidebarOpen}
      onclick={onToggleSidebar}
    >
      <PanelLeftIcon aria-hidden="true" />
    </button>
    <WorkspaceHistoryControls
      --workspace-history-border="var(--docs-border)"
      --workspace-history-background="var(--docs-surface)"
      --workspace-history-shadow="var(--docs-shadow)"
      --workspace-history-hover-background="color-mix(in srgb, var(--docs-subtle) 72%, transparent)"
    />
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
      <button
        type="button"
        class="docs-import-anki-button"
        aria-label="Import Anki package"
        title="Import Anki package"
        disabled={saving}
        onclick={() => void onImportAnkiPackage?.()}
      >
        <UploadIcon aria-hidden="true" />
      </button>
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
      onclick={() => draftNote && onSchedulePractice(draftNote.id)}
    >
      <BrainIcon />
      Practice
    </button>
    <button
      type="button"
      disabled={!draftNote}
      aria-label="Delete note"
      onclick={onDeleteNote}
    >
      <Trash2Icon />
    </button>
  </div>
</header>
