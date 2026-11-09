<script lang="ts">
  /**
   * Block Markdown field. Document-mode MarkdownComposer replaces the
   * CodeMirror markdown editor for prose and section bodies.
   */
  import DocsMarkdownField from "./DocsMarkdownField.svelte";

  let {
    value = $bindable(""),
    placeholder = "Write with Markdown...",
    ariaLabel = "Markdown block",
    minRows: _minRows = 8,
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

<DocsMarkdownField
  {value}
  label={ariaLabel}
  showLabel={false}
  {placeholder}
  onChange={(next) => {
    value = next;
  }}
/>
