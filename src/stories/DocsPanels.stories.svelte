<script lang="ts" module>
  import type { App, WorkspaceLeaf } from "@lapis-notes/api";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";

  import type { DocsSidebarPlacement } from "./create-plugin-workspace-demo";
  import PluginWorkspaceDemo from "./PluginWorkspaceDemo.svelte";

  const { Story } = defineMeta({
    title: "Plugins/Docs/Panels",
    component: PluginWorkspaceDemo,
    tags: ["visual-pending"],
    parameters: {
      layout: "fullscreen",
      a11y: { test: "off" },
    },
  });

  type Dock = "main" | "left" | "right" | "bottom";

  function storyApp(canvasElement: HTMLElement): App {
    const root = canvasElement.querySelector<
      HTMLElement & { __lapisApp?: App }
    >('[data-testid="plugin-workspace-demo"]');
    if (!root?.__lapisApp) {
      throw new Error("The docs panel story has no active Lapis app");
    }
    return root.__lapisApp;
  }

  function contains(node: unknown, leaf: WorkspaceLeaf): boolean {
    if (node === leaf) return true;
    if (!node || typeof node !== "object" || !("children" in node)) return false;
    const children = (node as { children?: unknown[] }).children;
    return Array.isArray(children) && children.some((child) => contains(child, leaf));
  }

  function dockOf(app: App, leaf: WorkspaceLeaf): Dock {
    if (contains(app.workspace.leftSplit, leaf)) return "left";
    if (contains(app.workspace.rightSplit, leaf)) return "right";
    if (contains(app.workspace.bottomPanel, leaf)) return "bottom";
    return "main";
  }

  async function playPlacement(
    canvasElement: HTMLElement,
    dock: Dock,
  ) {
    canvasElement.style.height = "100%";
    canvasElement.style.overflow = "hidden";
    const canvas = within(canvasElement);
    await waitFor(
      () => {
        expect(canvas.getByTestId("plugin-workspace-status")).toHaveTextContent("ready");
        expect(canvasElement.querySelector('[data-ui-component="docs-sidebar"]')).toBeTruthy();
      },
      { timeout: 15_000 },
    );
    const app = storyApp(canvasElement);
    const leaf = app.workspace.getLeavesOfType("docs")[0];
    expect(leaf).toBeTruthy();
    expect(dockOf(app, leaf)).toBe(dock);
    const sidebar = within(
      canvasElement.querySelector('[data-ui-component="docs-sidebar"]') as HTMLElement,
    );
    await userEvent.click(sidebar.getByRole("tab", { name: "Docs" }));
    expect(sidebar.getByRole("tab", { name: "Folders" })).toBeVisible();
    expect(sidebar.getByRole("tab", { name: "Links" })).toBeVisible();
    expect(sidebar.getByRole("tab", { name: "Tags" })).toBeVisible();

    const sample = sidebar.getAllByRole("button", { name: /^Sample docs/ })[0];
    await userEvent.click(sample);
    const cards = await sidebar.findByRole("button", { name: /^Cards/ });
    await userEvent.click(cards);
    await waitFor(() => {
      expect(canvasElement.querySelector(".docs-note-tab-panel--cards")).toBeTruthy();
    });
  }
</script>

{#snippet stage(placement: DocsSidebarPlacement)}
  <div class="docs-story-shell-stage">
    <div class="docs-story-shell-stage__surface">
      <PluginWorkspaceDemo {placement} />
    </div>
  </div>
{/snippet}

<Story
  name="Middle/Top Tabs"
  play={async ({ canvasElement }) => playPlacement(canvasElement, "main")}
>
  {#snippet template()}
    {@render stage("middle")}
  {/snippet}
</Story>

<Story
  name="Stacked Tabs"
  play={async ({ canvasElement }) => playPlacement(canvasElement, "main")}
>
  {#snippet template()}
    {@render stage("stacked")}
  {/snippet}
</Story>

<Story
  name="Left"
  play={async ({ canvasElement }) => playPlacement(canvasElement, "left")}
>
  {#snippet template()}
    {@render stage("left")}
  {/snippet}
</Story>

<Story
  name="Right"
  play={async ({ canvasElement }) => playPlacement(canvasElement, "right")}
>
  {#snippet template()}
    {@render stage("right")}
  {/snippet}
</Story>

<Story
  name="Bottom"
  play={async ({ canvasElement }) => playPlacement(canvasElement, "bottom")}
>
  {#snippet template()}
    {@render stage("bottom")}
  {/snippet}
</Story>

<Story
  name="Sidebar As a Group"
  play={async ({ canvasElement }) => playPlacement(canvasElement, "right")}
>
  {#snippet template()}
    {@render stage("group")}
  {/snippet}
</Story>
