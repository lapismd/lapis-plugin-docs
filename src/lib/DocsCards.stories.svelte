<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { docsCardPreviewExample } from "./docs.example-sources";

  const { Story } = defineMeta({
    title: "Plugins/Docs/Cards",
    tags: ["visual-pending"],
    parameters: {
      docs: {
        description: {
          component:
            "Document card preview used by Cards and Review. The stack, face, and actions match the note card preview.",
          story: "Preview a sample Docs card with the document card styling.",
        },
        source: {
          code: docsCardPreviewExample,
          language: "svelte",
          type: "code",
        },
      },
    },
  });
</script>

<script lang="ts">
  import DocsCardPreviewStack from "./docs/DocsCardPreviewStack.svelte";
  import "./docs/DocsCardsReview.css";
  import "./docs/DocsWorkspace.css";
  import { sampleDocsNotes } from "./model";

  const note = sampleDocsNotes().find((item) => item.id === "sample-docs-index");
  const items = (note?.cards ?? []).map((card) => ({
    key: card.id,
    card,
    noteId: note?.id,
    noteTitle: note?.title ?? "",
    noteSourcePath: note?.sourcePath ?? "",
    noteBlocks: note?.blocks ?? [],
  }));
  let previewAnswerOpenById = $state<Record<string, boolean>>({});
</script>

<Story name="Card preview">
  {#snippet template()}
    <div class="docs-workspace docs-story-frame" style="height: 40rem; padding: 1.5rem;">
      <DocsCardPreviewStack {items} bind:previewAnswerOpenById />
    </div>
  {/snippet}
</Story>
