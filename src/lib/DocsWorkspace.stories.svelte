<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor, within } from "storybook/test";
  import type { App } from "@lapis-notes/api";
  import DocsWorkspace from "./docs-workspace.svelte";
  import { docsWorkspaceExample } from "./docs.example-sources";
  import { DocsRepository, type DocsFileStore } from "./docs-repository";
  import { docsNoteToMarkdown, sampleDocsNotes } from "./model";

  function createMemoryStore(): DocsFileStore {
    const files = new Map(
      sampleDocsNotes().map((note) => [
        note.sourcePath,
        docsNoteToMarkdown(note),
      ]),
    );
    return {
      async read(path) {
        const content = files.get(path);
        if (content === undefined) throw new Error(`Missing ${path}`);
        return content;
      },
      async write(path, content) {
        files.set(path, content);
      },
      async listMarkdown(root) {
        const prefix = root.replace(/^\/+|\/+$/g, "");
        return [...files.keys()]
          .filter((path) => path.startsWith(`${prefix}/`))
          .sort();
      },
    };
  }

  const repository = new DocsRepository(createMemoryStore());
  const app = { vault: {} } as App;

  const { Story } = defineMeta({
    title: "Plugins/Docs/Workspace",
    component: DocsWorkspace,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        description: {
          component:
            "Core Docs workspace with note list, display, cards, and FSRS review.",
          story: "Sample Docs notes in the Core Docs workspace.",
        },
        source: {
          code: docsWorkspaceExample,
          language: "svelte",
          type: "code",
        },
      },
    },
  });
</script>

<Story
  name="Sample Notes"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-docs-ready="true"]'),
      ).toBeTruthy();
    });
    expect(await canvas.findByText("Sample docs schema harness")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="docs-story-frame" style="height: 32rem;">
      <DocsWorkspace {app} {repository} />
    </div>
  {/snippet}
</Story>
