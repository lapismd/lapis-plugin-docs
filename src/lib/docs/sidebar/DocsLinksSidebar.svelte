<script lang="ts">
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import type { DocsBacklink, DocsNoteSummary, DocsWikiLink } from "../../model";

  let {
    notes = [],
    backlinks = [],
    outgoingLinks = [],
    ambiguousLinks = [],
    onSelectNote = () => {},
  }: {
    notes?: DocsNoteSummary[];
    backlinks?: DocsBacklink[];
    outgoingLinks?: DocsWikiLink[];
    ambiguousLinks?: DocsWikiLink[];
    onSelectNote?: (noteId: string) => void;
  } = $props();

  let openGroups = $state<Record<string, boolean>>({
    backlinks: true,
    outgoing: true,
    ambiguous: true,
  });

  const titleById = $derived(new Map(notes.map((note) => [note.id, note.title])));
  const visibleOutgoing = $derived(
    outgoingLinks.filter((link) => !(link.ambiguousNoteIds?.length ?? 0)),
  );

  function toggle(group: string) {
    openGroups = { ...openGroups, [group]: !openGroups[group] };
  }
</script>

<div class="docs-sidebar__group">
  <button type="button" class="docs-sidebar__row" onclick={() => toggle("backlinks")}>
    <span class="docs-sidebar__chevron" data-open={openGroups.backlinks ? "true" : "false"}>
      <ChevronRightIcon aria-hidden="true" />
    </span>
    <span class="docs-sidebar__label">Backlinks</span>
    <span class="docs-sidebar__count">{backlinks.length}</span>
  </button>
  {#if openGroups.backlinks}
    <div class="docs-sidebar__children">{@render backlinkList()}</div>
  {/if}
  <button type="button" class="docs-sidebar__row" onclick={() => toggle("outgoing")}>
    <span class="docs-sidebar__chevron" data-open={openGroups.outgoing ? "true" : "false"}>
      <ChevronRightIcon aria-hidden="true" />
    </span>
    <span class="docs-sidebar__label">Outgoing</span>
    <span class="docs-sidebar__count">{visibleOutgoing.length}</span>
  </button>
  {#if openGroups.outgoing}
    <div class="docs-sidebar__children">{@render outgoingList()}</div>
  {/if}
  <button type="button" class="docs-sidebar__row" onclick={() => toggle("ambiguous")}>
    <span class="docs-sidebar__chevron" data-open={openGroups.ambiguous ? "true" : "false"}>
      <ChevronRightIcon aria-hidden="true" />
    </span>
    <span class="docs-sidebar__label">Ambiguous</span>
    <span class="docs-sidebar__count">{ambiguousLinks.length}</span>
  </button>
  {#if openGroups.ambiguous}
    <div class="docs-sidebar__children">{@render ambiguousList()}</div>
  {/if}
</div>

{#snippet backlinkList()}
  {#each backlinks as link (`${link.sourceNoteId}:${link.raw}`)}
    <button
      type="button"
      class="docs-sidebar__row"
      style="padding-inline-start: 1.6rem"
      onclick={() => onSelectNote(link.sourceNoteId)}
    >
      <span class="docs-sidebar__label">{link.sourceTitle || titleById.get(link.sourceNoteId) || link.sourceNoteId}</span>
    </button>
  {:else}
    <p class="docs-sidebar__empty">No backlinks.</p>
  {/each}
{/snippet}

{#snippet outgoingList()}
  {#each visibleOutgoing as link (`${link.target}:${link.index}`)}
    <button
      type="button"
      class="docs-sidebar__row"
      style="padding-inline-start: 1.6rem"
      disabled={!link.resolvedNoteId}
      onclick={() => link.resolvedNoteId && onSelectNote(link.resolvedNoteId)}
    >
      <span class="docs-sidebar__label">{link.label || titleById.get(link.resolvedNoteId ?? "") || link.target}</span>
    </button>
  {:else}
    <p class="docs-sidebar__empty">No outgoing links.</p>
  {/each}
{/snippet}

{#snippet ambiguousList()}
  {#each ambiguousLinks as link (`ambiguous:${link.target}:${link.index}`)}
    <p class="docs-sidebar__empty">{link.label || link.raw}</p>
  {:else}
    <p class="docs-sidebar__empty">No ambiguous links.</p>
  {/each}
{/snippet}
