<script lang="ts" module>
  import type { App } from "@lapis-notes/api";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";

  import PluginWorkspaceDemo from "./PluginWorkspaceDemo.svelte";

  const SCHEMA_HARNESS_PATH =
    "docs/sample-docs/sample-docs-schema-harness.doc.md";

  const { Story } = defineMeta({
    title: "Plugins/Docs/Registry Screenshots",
    component: PluginWorkspaceDemo,
    tags: ["registry-media", "visual-pending", "test"],
    parameters: {
      layout: "fullscreen",
      a11y: { test: "off" },
    },
  });

  function storyApp(canvasElement: HTMLElement): App {
    const root = canvasElement.querySelector<
      HTMLElement & { __lapisApp?: App }
    >('[data-testid="plugin-workspace-demo"]');
    if (!root?.__lapisApp) {
      throw new Error("The registry screenshot story has no active Lapis app");
    }
    return root.__lapisApp;
  }

  async function waitForReady(canvasElement: HTMLElement) {
    canvasElement.style.height = "100%";
    canvasElement.style.maxHeight = "100%";
    canvasElement.style.overflow = "hidden";
    const canvas = within(canvasElement);
    await waitFor(
      () => {
        expect(canvas.getByTestId("plugin-workspace-status")).toHaveTextContent(
          "ready",
        );
        expect(
          canvasElement.querySelector('[data-docs-ready="true"]'),
        ).toBeTruthy();
      },
      { timeout: 15_000 },
    );
    return canvas;
  }

  async function selectSchemaHarness(canvasElement: HTMLElement) {
    const sidebarElement = canvasElement.querySelector<HTMLElement>(
      '[data-ui-component="docs-sidebar"]',
    );
    expect(sidebarElement).toBeTruthy();
    const sidebar = within(sidebarElement!);
    const sampleBook = sidebar.getAllByRole("button", {
      name: /^Sample docs/,
    })[0];
    const bookChevron = sampleBook.querySelector<HTMLElement>(
      ".docs-sidebar__chevron",
    );
    if (bookChevron?.dataset.open !== "true") {
      await userEvent.click(sampleBook);
    }
    const sampleRows = await sidebar.findAllByRole("button", {
      name: /^Sample docs schema harness/,
    });
    await userEvent.click(sampleRows.at(-1)!);
    await waitFor(() => {
      expect(storyApp(canvasElement).workspace.getActiveFile()?.path).toBe(
        SCHEMA_HARNESS_PATH,
      );
    });
    return sidebar;
  }

  async function openSchemaHarness(canvasElement: HTMLElement) {
    await selectSchemaHarness(canvasElement);
    await waitFor(() => {
      expect(
        canvasElement.querySelector(".docs-display-view .docs-reading-anchor"),
      ).toBeTruthy();
    });
  }

  async function openCards(canvasElement: HTMLElement) {
    const sidebar = await selectSchemaHarness(canvasElement);
    await userEvent.click(await sidebar.findByRole("button", { name: /^Cards/ }));
    await waitFor(() => {
      expect(
        canvasElement.querySelector(".docs-note-tab-panel--cards"),
      ).toBeTruthy();
    });
  }
</script>

{#snippet stage()}
  <div class="docs-story-shell-stage">
    <div class="docs-story-shell-stage__surface">
      <PluginWorkspaceDemo displayMode="desktop" />
    </div>
  </div>
{/snippet}

<Story
  name="Workspace"
  play={async ({ canvasElement }) => {
    const canvas = await waitForReady(canvasElement);
    const app = storyApp(canvasElement);
    expect(app.plugins.isPluginEnabled("docs")).toBe(true);
    expect(app.workspace.rightSplit.collapsed).toBe(true);
    expect(
      await canvas.findByText(/Open chapters from the book navigation/),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    {@render stage()}
  {/snippet}
</Story>

<Story
  name="Reading"
  play={async ({ canvasElement }) => {
    await waitForReady(canvasElement);
    await openSchemaHarness(canvasElement);
  }}
>
  {#snippet template()}
    {@render stage()}
  {/snippet}
</Story>

<Story
  name="Cards"
  play={async ({ canvasElement }) => {
    await waitForReady(canvasElement);
    await openCards(canvasElement);
  }}
>
  {#snippet template()}
    {@render stage()}
  {/snippet}
</Story>
