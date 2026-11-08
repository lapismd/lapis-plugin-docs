<script lang="ts">
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import type { DocsTagSummary } from "../../model";
  import {
    createDocsTagTree,
    docsTagCount,
    filterDocsTagsByPathMatch,
    type DocsTagTreeNode,
  } from "./docs-tag-tree";

  let {
    tags = [],
    selectedTags = [],
    openNodes = $bindable<Record<string, boolean>>({}),
    onSelectTag = () => {},
  }: {
    tags?: DocsTagSummary[];
    selectedTags?: string[];
    openNodes?: Record<string, boolean>;
    onSelectTag?: (tag: string) => void;
  } = $props();

  let query = $state("");
  const visibleTags = $derived(filterDocsTagsByPathMatch(tags, query));
  const tree = $derived(createDocsTagTree(visibleTags, "count"));

  function isOpen(tag: string) {
    return openNodes[tag] !== false;
  }

  function toggle(tag: string) {
    openNodes = { ...openNodes, [tag]: !isOpen(tag) };
  }
</script>

<label class="docs-sidebar__filters">
  <input class="docs-sidebar__search" placeholder="Filter tags" bind:value={query} />
</label>

{#snippet nodeList(nodes: DocsTagTreeNode[], depth: number)}
  {#each nodes as node (node.tag)}
    <div class="docs-sidebar__group">
      <button
        type="button"
        class="docs-sidebar__row"
        style={`padding-inline-start: ${0.35 + depth * 0.85}rem`}
        aria-current={selectedTags.includes(node.tag) ? "true" : undefined}
        onclick={() => onSelectTag(node.tag)}
      >
        {#if node.children.length}
          <span
            class="docs-sidebar__chevron"
            data-open={isOpen(node.tag) ? "true" : "false"}
            role="presentation"
            onclick={(event) => {
              event.stopPropagation();
              toggle(node.tag);
            }}
          >
            <ChevronRightIcon aria-hidden="true" />
          </span>
        {/if}
        <span class="docs-sidebar__label">{node.name}</span>
        <span class="docs-sidebar__count">{node.summary ? docsTagCount(node.summary) : node.count}</span>
      </button>
      {#if node.children.length && isOpen(node.tag)}
        {@render nodeList(node.children, depth + 1)}
      {/if}
    </div>
  {/each}
{/snippet}

<div class="docs-sidebar__group">
  {@render nodeList(tree, 0)}
</div>
