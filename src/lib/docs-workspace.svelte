<script lang="ts">
  import type { App } from "@lapis-notes/api";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";
  import { Mira } from "@lapismd/mira";
  import "@lapismd/mira/styles.css";
  import "@lapismd/mira/themes/obsidian.css";
  import { onMount } from "svelte";
  import type { DocsRepository } from "./docs-repository";
  import {
    DEFAULT_DOCS_PLUGIN_SETTINGS,
    type DocsPluginSettings,
  } from "./docs-settings";
  import type { DocsSettingsSource } from "./docs-view";
  import DocsFlipCard from "./docs/DocsFlipCard.svelte";
  import {
    REVIEW_RATINGS,
    REVIEW_RATING_LABELS,
    buildDocsReviewQueue,
    buildDocsWorkspace,
    renderDocsNoteMarkdown,
    reviewDocsCard,
    type DocsCard,
    type DocsNote,
    type DocsReviewQueueItem,
    type DocsReviewRating,
  } from "./model";

  let {
    app,
    repository,
    clock = () => new Date(),
    settingsSource,
    mode = "workspace" as "workspace" | "cards" | "review",
  }: {
    app: App;
    repository: DocsRepository;
    clock?: () => Date;
    settingsSource?: DocsSettingsSource;
    mode?: "workspace" | "cards" | "review";
  } = $props();

  let settings = $state<DocsPluginSettings>(DEFAULT_DOCS_PLUGIN_SETTINGS);
  let notes = $state<DocsNote[]>([]);
  let selectedId = $state<string | null>(null);
  let panel = $state<"display" | "cards" | "review">("display");
  let loadError = $state<string | null>(null);
  let flipped = $state(false);
  let reviewIndex = $state(0);

  const selected = $derived(
    notes.find((note) => note.id === selectedId) ?? notes[0] ?? null,
  );
  const coreCards = $derived(
    (selected?.cards ?? []).filter(
      (card) => card.type === "basic" || card.type === "cloze",
    ),
  );
  const markdown = $derived(
    selected ? renderDocsNoteMarkdown(selected) : "",
  );
  const workspace = $derived(buildDocsWorkspace(notes));
  const reviewQueue = $derived(buildDocsReviewQueue(notes, clock()));
  const activeReview = $derived(
    reviewQueue[reviewIndex] ?? reviewQueue[0] ?? null,
  );

  async function refresh() {
    try {
      notes = await repository.listNotes(settings.docsRoot);
      if (!selectedId && notes[0]) selectedId = notes[0].id;
      loadError = null;
    } catch (error) {
      loadError = error instanceof Error ? error.message : String(error);
    }
  }

  async function rate(rating: DocsReviewRating) {
    if (!activeReview) return;
    const note = notes.find((entry) => entry.id === activeReview.noteId);
    if (!note) return;
    const cardIndex = note.cards.findIndex(
      (card) => card.id === activeReview.card.id,
    );
    if (cardIndex < 0) return;
    const reviewed = reviewDocsCard(note.cards[cardIndex]!, rating, clock());
    const nextCards = note.cards.slice();
    nextCards[cardIndex] = reviewed;
    const nextNote: DocsNote = {
      ...note,
      cards: nextCards,
      updatedAt: clock().toISOString(),
    };
    await repository.writeNote(nextNote);
    await refresh();
    flipped = false;
    reviewIndex = Math.min(reviewIndex, Math.max(0, reviewQueue.length - 1));
  }

  onMount(() => {
    if (mode === "cards") panel = "cards";
    else if (mode === "review") panel = "review";
    settings = settingsSource?.get() ?? DEFAULT_DOCS_PLUGIN_SETTINGS;
    const unsubscribe = settingsSource?.subscribe((next) => {
      settings = next;
      void refresh();
    });
    void refresh();
    return () => unsubscribe?.();
  });
</script>

<div
  class="docs-workspace"
  data-ui-component="docs-workspace"
  data-mode={mode}
  data-docs-ready={notes.length > 0 ? "true" : "false"}
  data-app-owned={app ? "true" : "false"}
>
  <aside class="docs-workspace__sidebar">
    <header class="docs-workspace__sidebar-header">
      <h2>Docs</h2>
      <p>{notes.length} notes · {workspace.reviewQueue.length} due</p>
    </header>
    <div class="docs-workspace__scroll">
      <ScrollArea>
        <ul class="docs-workspace__list">
          {#each notes as note (note.id)}
            <li>
              <button
                type="button"
                class="docs-workspace__note"
                data-selected={selected?.id === note.id ? "true" : "false"}
                onclick={() => {
                  selectedId = note.id;
                  flipped = false;
                  if (note.sourcePath) {
                    const file = app.vault.getFileByPath(note.sourcePath);
                    if (file) {
                      const leaf = app.workspace.getLeaf("tab");
                      void leaf.openFile(file).then(() => {
                        app.workspace.setActiveLeaf(leaf, { focus: true });
                      });
                    }
                  }
                }}
              >
                <span class="docs-workspace__note-title">{note.title}</span>
                <span class="docs-workspace__note-meta">{note.docType}</span>
              </button>
            </li>
          {/each}
        </ul>
      </ScrollArea>
    </div>
  </aside>

  <section class="docs-workspace__main">
    <header class="docs-workspace__toolbar">
      <div class="docs-workspace__tabs" role="tablist" aria-label="Docs panels">
        <Button
          variant={panel === "display" ? "default" : "outline"}
          size="sm"
          onclick={() => (panel = "display")}
        >
          Display
        </Button>
        <Button
          variant={panel === "cards" ? "default" : "outline"}
          size="sm"
          onclick={() => (panel = "cards")}
        >
          Cards
        </Button>
        <Button
          variant={panel === "review" ? "default" : "outline"}
          size="sm"
          onclick={() => (panel = "review")}
        >
          Review
        </Button>
      </div>
      {#if selected}
        <p class="docs-workspace__summary">{selected.summary}</p>
      {/if}
    </header>

    {#if loadError}
      <p class="docs-workspace__error" role="alert">{loadError}</p>
    {:else if !selected}
      <p class="docs-workspace__empty">No Docs notes under `{settings.docsRoot}`.</p>
    {:else if panel === "display"}
      <div class="docs-workspace__scroll docs-workspace__scroll--padded">
        <ScrollArea>
          <Mira
            value={markdown}
            mode="preview"
            readonly
            toolbar={false}
            theme="obsidian"
            colorMode="inherit"
            spellcheck={false}
            blockControls={false}
          />
        </ScrollArea>
      </div>
    {:else if panel === "cards"}
      <div class="docs-workspace__scroll docs-workspace__scroll--padded">
        <ScrollArea>
          <div class="docs-workspace__cards">
            {#each coreCards as card (card.id)}
              <article class="docs-workspace__card">
                <h3>{card.prompt}</h3>
                <p>{card.answer}</p>
                <p class="docs-workspace__note-meta">{card.type} · {card.status}</p>
              </article>
            {:else}
              <p class="docs-workspace__empty">No basic or cloze cards on this note.</p>
            {/each}
          </div>
        </ScrollArea>
      </div>
    {:else}
      <div class="docs-workspace__review">
        {#if activeReview}
          {@const card: DocsCard = activeReview.card}
          {@const item: DocsReviewQueueItem = activeReview}
          <p class="docs-workspace__note-meta">
            {item.noteTitle} · {reviewQueue.length} due
          </p>
          <DocsFlipCard bind:flipped front={card.prompt} back={card.answer} />
          <div class="docs-workspace__ratings">
            {#each REVIEW_RATINGS as rating (rating)}
              <Button
                variant="outline"
                size="sm"
                onclick={() => void rate(rating)}
              >
                {REVIEW_RATING_LABELS[rating]}
              </Button>
            {/each}
          </div>
        {:else}
          <p class="docs-workspace__empty">No cards are due for review.</p>
        {/if}
      </div>
    {/if}
  </section>
</div>

<style>
  .docs-workspace {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr);
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background: var(--ui-docs-background);
    color: var(--ui-docs-foreground);
  }

  .docs-workspace__sidebar,
  .docs-workspace__main {
    display: flex;
    min-height: 0;
    min-width: 0;
    flex-direction: column;
  }

  .docs-workspace__sidebar {
    border-inline-end: 1px solid var(--ui-docs-border);
    background: var(--ui-docs-muted);
  }

  .docs-workspace__sidebar-header,
  .docs-workspace__toolbar {
    padding: 0.75rem 1rem;
    border-block-end: 1px solid var(--ui-docs-border);
  }

  .docs-workspace__sidebar-header h2,
  .docs-workspace__sidebar-header p,
  .docs-workspace__summary,
  .docs-workspace__empty,
  .docs-workspace__error,
  .docs-workspace__note-meta {
    margin: 0;
  }

  .docs-workspace__sidebar-header p,
  .docs-workspace__summary,
  .docs-workspace__note-meta {
    color: var(--ui-docs-muted-foreground);
    font-size: 0.8125rem;
  }

  .docs-workspace__scroll {
    flex: 1 1 auto;
    min-height: 0;
  }

  .docs-workspace__scroll--padded {
    padding: 1rem;
  }

  .docs-workspace__list {
    margin: 0;
    padding: 0.5rem;
    list-style: none;
  }

  .docs-workspace__note {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 0.15rem;
    margin: 0 0 0.35rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid transparent;
    border-radius: var(--ui-docs-radius);
    background: transparent;
    color: inherit;
    text-align: start;
    cursor: pointer;
  }

  .docs-workspace__note[data-selected="true"] {
    border-color: var(--ui-docs-border);
    background: var(--ui-docs-card);
  }

  .docs-workspace__note-title {
    font-weight: 600;
  }

  .docs-workspace__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1rem;
  }

  .docs-workspace__tabs {
    display: flex;
    gap: 0.5rem;
  }

  .docs-workspace__cards {
    display: grid;
    gap: 0.75rem;
  }

  .docs-workspace__card {
    padding: 1rem;
    border: 1px solid var(--ui-docs-border);
    border-radius: var(--ui-docs-radius);
    background: var(--ui-docs-card);
  }

  .docs-workspace__card h3,
  .docs-workspace__card p {
    margin: 0;
  }

  .docs-workspace__card h3 {
    margin-block-end: 0.5rem;
  }

  .docs-workspace__review {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .docs-workspace__ratings {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .docs-workspace__empty,
  .docs-workspace__error {
    padding: 1rem;
  }

  .docs-workspace__error {
    color: var(--ui-destructive, #b91c1c);
  }
</style>
