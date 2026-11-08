<script lang="ts">
  import { MarkdownComposer } from "@lapismd/design-core/chat";

  let {
    value,
    label,
    placeholder = "",
    onChange,
  }: {
    value: string;
    label: string;
    placeholder?: string;
    onChange: (value: string) => void;
  } = $props();
</script>

<div class="docs-markdown-field">
  <MarkdownComposer
    {value}
    {label}
    inputLabel={label}
    placeholder={placeholder || label}
    presentation="document"
    showSendButton={false}
    showHint={false}
    submitOnEnter={false}
    onChange={onChange}
    onSubmit={() => {}}
  />
</div>

<style>
  .docs-markdown-field {
    min-width: 0;
    min-height: 6.5rem;
  }

  .docs-markdown-field :global(.cm-editor),
  .docs-markdown-field :global(.cm-scroller),
  .docs-markdown-field :global(.cm-content) {
    background: transparent;
  }
</style>
