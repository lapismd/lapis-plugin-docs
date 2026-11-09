<script lang="ts">
  import { ReferencePicker } from "@lapismd/design-core/forms";
  import {
    docsBlockIdFromRef,
    docsBlockReferenceIndex,
    docsBlockRefMarker,
  } from "../model/docs-card-context";
  import type { DocsRevisionBlock } from "../model";

  let {
    blocks,
    refs,
    addOpen = $bindable(false),
    onAddOpenChange = () => {},
    onChange,
  }: {
    blocks: DocsRevisionBlock[];
    refs: string[];
    addOpen?: boolean;
    onAddOpenChange?: (open: boolean) => void;
    onChange: (refs: string[]) => void;
  } = $props();

  const referenceIndex = $derived(docsBlockReferenceIndex(blocks));
  const pickerRefs = $derived(refs.map((id) => docsBlockRefMarker(id)));
</script>

<ReferencePicker
  refs={pickerRefs}
  {referenceIndex}
  {addOpen}
  addLabel="Add block"
  addHeading="Block"
  searchPlaceholder="Search note blocks..."
  emptyLabel="No matching blocks."
  unresolvedLabel="Missing block"
  unresolvedDescription="This block is no longer on the note."
  {onAddOpenChange}
  onChange={(next) => onChange(next.map((ref) => docsBlockIdFromRef(ref)))}
>
  {#snippet searchOption(reference)}
    <span class="docs-block-ref-option">
      <span class="docs-block-ref-option__title">{reference.label}</span>
      {#if reference.excerpt}
        <span class="docs-block-ref-option__snippet">{reference.excerpt}</span>
      {/if}
    </span>
  {/snippet}
</ReferencePicker>

<style>
  .docs-block-ref-option {
    display: grid;
    min-width: 0;
    gap: 0.1rem;
  }

  .docs-block-ref-option__title {
    overflow: hidden;
    color: var(--foreground);
    font-size: 0.75rem;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .docs-block-ref-option__snippet {
    overflow: hidden;
    color: var(--muted-foreground);
    font-size: 0.72rem;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
