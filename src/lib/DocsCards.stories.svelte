<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DocsFlipCard from "./docs/DocsFlipCard.svelte";
  import { docsFlipCardExample } from "./docs.example-sources";

  const { Story } = defineMeta({
    title: "Plugins/Docs/Cards",
    component: DocsFlipCard,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        description: {
          component:
            "Plugin-local flip card for Docs review. Marked as a design-core migration candidate.",
          story: "Flip a basic Docs review card.",
        },
        source: {
          code: docsFlipCardExample,
          language: "svelte",
          type: "code",
        },
      },
    },
  });
</script>

<Story name="Flip Card">
  {#snippet template()}
    <div class="docs-story-frame" style="padding: 1.5rem; max-width: 28rem;">
      <DocsFlipCard
        front="When is token bucket better than a fixed window?"
        back="When bounded bursts are acceptable."
      />
    </div>
  {/snippet}
</Story>
