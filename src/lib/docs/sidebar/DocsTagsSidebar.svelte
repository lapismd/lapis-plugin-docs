<script lang="ts">
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import FolderTreeIcon from "@lucide/svelte/icons/folder-tree";
  import HashIcon from "@lucide/svelte/icons/hash";
  import ListIcon from "@lucide/svelte/icons/list";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import type { DocsTagSummary } from "../../model";
  import type { DocsTagsViewMode } from "./docs-sidebar-ui-storage";
  import {
    createDocsTagTree,
    docsTagCount,
    filterDocsTagsByPathMatch,
    normalizeDocsTag,
    sortDocsTagSummaries,
    type DocsTagSortMode,
    type DocsTagTreeNode,
  } from "./docs-tag-tree";

  let {
    tags = [],
    selectedTags = [],
    viewMode = $bindable<DocsTagsViewMode>("tree"),
    openNodes = $bindable<Record<string, boolean>>({}),
    onSelectTag = () => {},
  }: {
    tags?: DocsTagSummary[];
    selectedTags?: string[];
    viewMode?: DocsTagsViewMode;
    openNodes?: Record<string, boolean>;
    onSelectTag?: (tag: string) => void;
  } = $props();

  let query = $state("");
  let sortMode = $state<DocsTagSortMode>("count");

  const filteredTags = $derived(sortDocsTagSummaries(filterDocsTagsByPathMatch(tags, query), sortMode));
  const tree = $derived(createDocsTagTree(filteredTags, sortMode));
  const selectedTagSet = $derived(
    new Set(selectedTags.map((tag) => normalizeDocsTag(tag).toLowerCase()).filter(Boolean)),
  );
  const hierarchyLabel = $derived(
    viewMode === "tree"
      ? "Showing tag hierarchy. Switch to flat tags."
      : "Showing flat tags. Switch to tag hierarchy.",
  );

  function isOpen(tag: string) {
    return openNodes[tag] !== false;
  }

  function toggle(tag: string) {
    openNodes = { ...openNodes, [tag]: !isOpen(tag) };
  }

  function selectTag(tag: string) {
    const normalized = normalizeDocsTag(tag);
    if (normalized) onSelectTag(normalized);
  }

  function isSelected(tag: string) {
    return selectedTagSet.has(normalizeDocsTag(tag).toLowerCase());
  }
</script>

<div class="docs-tags">
  <div class="docs-tags__tools">
    <input class="docs-sidebar__search" placeholder="Search tags" bind:value={query} />
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      class="docs-tags__mode"
      aria-pressed={viewMode === "tree"}
      aria-label={hierarchyLabel}
      title={hierarchyLabel}
      onclick={() => (viewMode = viewMode === "tree" ? "flat" : "tree")}
    >
      {#if viewMode === "tree"}
        <FolderTreeIcon aria-hidden="true" />
      {:else}
        <ListIcon aria-hidden="true" />
      {/if}
    </Button>
  </div>

  <div class="docs-sidebar__segment" role="group" aria-label="Sort tags">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      class="docs-sidebar__view"
      aria-pressed={sortMode === "count"}
      onclick={() => (sortMode = "count")}
    >
      <span class="docs-sidebar__view-label">Frequency</span>
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      class="docs-sidebar__view"
      aria-pressed={sortMode === "name"}
      onclick={() => (sortMode = "name")}
    >
      <span class="docs-sidebar__view-label">Name</span>
    </Button>
  </div>

  {#if viewMode === "tree"}
    <div class="docs-sidebar__group">
      {#each tree as node (node.tag)}
        {@render tagNode(node, 0)}
      {:else}
        <p class="docs-sidebar__empty">No tags match the current filter.</p>
      {/each}
    </div>
  {:else}
    <div class="docs-sidebar__group">
      {#each filteredTags as tag (tag.tag)}
        <button
          type="button"
          class="docs-sidebar__row"
          aria-pressed={isSelected(tag.tag)}
          title={`#${tag.tag}`}
          onclick={() => selectTag(tag.tag)}
        >
          <HashIcon class="docs-sidebar__hash" aria-hidden="true" />
          <span class="docs-sidebar__label">{tag.tag}</span>
          <span class="docs-sidebar__count">{docsTagCount(tag)}</span>
        </button>
      {:else}
        <p class="docs-sidebar__empty">No tags match the current filter.</p>
      {/each}
    </div>
  {/if}
</div>

{#snippet tagNode(node: DocsTagTreeNode, depth: number)}
  {@const expanded = node.children.length > 0 && isOpen(node.tag)}
  <div class="docs-sidebar__group">
    <div class="docs-tags__row" style={`padding-inline-start: ${depth * 0.85}rem`}>
      {#if node.children.length}
        <button
          type="button"
          class="docs-sidebar__chevron"
          aria-label={expanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
          aria-expanded={expanded}
          data-open={expanded ? "true" : "false"}
          onclick={() => toggle(node.tag)}
        >
          <ChevronRightIcon aria-hidden="true" />
        </button>
      {:else}
        <span class="docs-tags__spacer" aria-hidden="true"></span>
      {/if}
      <button
        type="button"
        class="docs-sidebar__row"
        aria-pressed={isSelected(node.tag)}
        title={`#${node.tag}`}
        onclick={() => selectTag(node.tag)}
      >
        <HashIcon class="docs-sidebar__hash" aria-hidden="true" />
        <span class="docs-sidebar__label">{node.name}</span>
        <span class="docs-sidebar__count">{node.count}</span>
      </button>
    </div>
    {#if expanded}
      <div class="docs-sidebar__group">
        {#each node.children as child (child.tag)}
          {@render tagNode(child, depth + 1)}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}
