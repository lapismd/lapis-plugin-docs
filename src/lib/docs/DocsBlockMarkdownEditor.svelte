<script lang="ts">
  /**
   * Block Markdown editor using design-core CodeEditor (Markdown language).
   * Avoids Carta / @cvstudio; Mira is reserved for rich reading previews.
   */
  import { CodeEditor } from "@lapismd/design-core/forms";

  let {
    value = $bindable(""),
    placeholder = "Write with Markdown...",
    ariaLabel = "Markdown block",
    minRows = 8,
    compact: _compact = true,
    floatingToc: _floatingToc = "off" as const,
    sourcePath: _sourcePath = "",
    attachmentUpload: _attachmentUpload,
  }: {
    value?: string;
    placeholder?: string;
    ariaLabel?: string;
    minRows?: number;
    compact?: boolean;
    floatingToc?: "auto" | "off" | "always";
    sourcePath?: string;
    attachmentUpload?: unknown;
  } = $props();
</script>

<div class="docs-block-markdown-editor" style:--docs-md-min-rows={minRows}>
  <CodeEditor
    bind:value
    language="markdown"
    {ariaLabel}
    {placeholder}
  />
</div>

<style>
  .docs-block-markdown-editor {
    min-width: 0;
    min-height: calc(var(--docs-md-min-rows, 8) * 1.35rem);
  }
</style>
