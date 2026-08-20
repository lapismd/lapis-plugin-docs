<script lang="ts">
  /**
   * DESIGN_CORE_CANDIDATE: FlipCardDeck is listed under design-core Shared — later.
   * Keep this plugin-local until a public design-core export exists.
   */
  let {
    front,
    back,
    flipped = $bindable(false),
  }: {
    front: string;
    back: string;
    flipped?: boolean;
  } = $props();
</script>

<button
  type="button"
  class="docs-flip-card"
  data-ui-component="docs-flip-card"
  data-flipped={flipped ? "true" : "false"}
  aria-pressed={flipped}
  onclick={() => (flipped = !flipped)}
>
  <span class="docs-flip-card__face docs-flip-card__face--front">{front}</span>
  <span class="docs-flip-card__face docs-flip-card__face--back">{back}</span>
</button>

<style>
  .docs-flip-card {
    position: relative;
    display: grid;
    width: 100%;
    min-height: 12rem;
    padding: 0;
    border: 1px solid var(--ui-docs-border);
    border-radius: var(--ui-docs-radius);
    background: transparent;
    color: var(--ui-docs-foreground);
    cursor: pointer;
    perspective: 1000px;
  }

  .docs-flip-card__face {
    grid-area: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    border-radius: inherit;
    background: var(--ui-docs-card);
    text-align: center;
    backface-visibility: hidden;
    transition: transform 0.35s ease;
  }

  .docs-flip-card__face--back {
    transform: rotateY(180deg);
  }

  .docs-flip-card[data-flipped="true"] .docs-flip-card__face--front {
    transform: rotateY(180deg);
  }

  .docs-flip-card[data-flipped="true"] .docs-flip-card__face--back {
    transform: rotateY(0deg);
  }
</style>
