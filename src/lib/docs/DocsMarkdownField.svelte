<script lang="ts">
  import { MarkdownComposer } from "@lapismd/design-core/chat";
  import { FormField } from "@lapismd/design-core/forms";

  let {
    value,
    label,
    placeholder = "",
    showLabel = true,
    onChange,
  }: {
    value: string;
    label: string;
    placeholder?: string;
    /** False when a parent form field already shows the visible label. */
    showLabel?: boolean;
    onChange: (value: string) => void;
  } = $props();
</script>

<div class="docs-markdown-field">
  {#if showLabel}
    <FormField {label} as="div">
      {@render composer()}
    </FormField>
  {:else}
    {@render composer()}
  {/if}
</div>

{#snippet composer()}
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
{/snippet}

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

  .docs-markdown-field :global(.ui-markdown-composer[data-presentation="document"]) {
    --_composer-avatar-width: 0px;
    --_composer-avatar-gap: 0px;
    --_composer-editor-padding: 0px;
    --ui-markdown-composer-editor-padding: 0px;
  }

  .docs-markdown-field :global(.ui-markdown-composer__avatar) {
    display: none;
  }
</style>
