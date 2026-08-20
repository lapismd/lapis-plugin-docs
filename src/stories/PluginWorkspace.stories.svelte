<script lang="ts" module>
  import type { App } from "@lapis-notes/api";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor, within } from "storybook/test";

  import PluginWorkspaceDemo from "./PluginWorkspaceDemo.svelte";
  import { PluginWorkspaceExample } from "./PluginWorkspace.example-sources";

  const { Story } = defineMeta({
    title: "Plugins/Docs/Shell",
    component: PluginWorkspaceDemo,
    tags: ["visual-pending"],
    parameters: {
      layout: "fullscreen",
      a11y: {
        test: "off",
      },
      docs: {
        canvas: { className: "workspace-shell-docs-canvas" },
        source: {
          code: PluginWorkspaceExample,
          language: "svelte",
          type: "code",
        },
        story: { height: "700px", inline: false },
      },
    },
  });

  function storyApp(canvasElement: HTMLElement): App {
    const root = canvasElement.querySelector<
      HTMLElement & { __lapisApp?: App }
    >('[data-testid="plugin-workspace-demo"]');
    if (!root?.__lapisApp) {
      throw new Error("The plugin workspace story has no active Lapis app");
    }
    return root.__lapisApp;
  }

  async function waitForReady(canvasElement: HTMLElement) {
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
</script>

<Story
  name="Desktop Workspace"
  args={{ displayMode: "desktop" }}
  parameters={{
    docs: {
      description: {
        story:
          "Boot the public Lapis App with DocsPlugin, seed sample Docs notes, and restore a main-area docs leaf.",
      },
    },
  }}
  play={async ({ canvasElement }) => {
    canvasElement.style.height = "100%";
    canvasElement.style.maxHeight = "100%";
    canvasElement.style.overflow = "hidden";
    const canvas = await waitForReady(canvasElement);
    const app = storyApp(canvasElement);
    expect(app.plugins.isPluginEnabled("docs")).toBe(true);
    expect(app.workspace.getLeavesOfType("docs")).toHaveLength(1);
    expect(app.workspace.activeLeaf?.view.getViewType()).toBe("docs");
    expect(await canvas.findByText("Sample docs schema harness")).toBeVisible();
  }}
>
  {#snippet template(args)}
    <div class="docs-story-shell-stage">
      <div class="docs-story-shell-stage__surface">
        <PluginWorkspaceDemo displayMode={args.displayMode} />
      </div>
    </div>
  {/snippet}
</Story>
