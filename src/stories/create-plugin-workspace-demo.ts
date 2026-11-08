import {
  App,
  installApplicationCompatibility,
  MemoryAppDatabase,
  MemoryVaultAdapter,
} from "@lapis-notes/api";
import { FileExplorerPlugin } from "@lapis-notes/file-explorer";
import { MarkdownPlugin } from "@lapis-notes/markdown";
import { SearchPlugin } from "@lapis-notes/search";

import { DocsPlugin } from "../lib";
import { createStoryMarkdownRenderer } from "./render-story-markdown";
import {
  SAMPLE_DOCS_INDEX_PATH,
  sampleDocsFixtureVault,
} from "./sample-docs-fixtures";

function leaf(
  id: string,
  title: string,
  icon: string,
  type: string,
  state: Record<string, unknown> = {},
) {
  return {
    id,
    type: "leaf",
    state: { type, state, icon, title },
  };
}

function workspaceLayout() {
  return {
    main: {
      id: "main",
      type: "split",
      direction: "vertical",
      sizes: [100],
      children: [
        {
          id: "docs-tabs",
          type: "tabs",
          stacked: false,
          currentTab: 1,
          children: [
            leaf("docs-home", "Docs", "book-open", "docs"),
            leaf(
              "sample-docs-index",
              "index.doc.md",
              "book-open",
              "docs-document",
              { file: SAMPLE_DOCS_INDEX_PATH },
            ),
          ],
        },
      ],
    },
    left: {
      id: "left",
      type: "split",
      direction: "vertical",
      sizes: [100],
      children: [
        {
          id: "left-tabs",
          type: "tabs",
          stacked: false,
          currentTab: 0,
          children: [
            leaf("file-explorer", "Files", "folder-closed", "file-explorer"),
          ],
        },
      ],
      width: "16rem",
    },
    right: {
      id: "right",
      type: "split",
      direction: "vertical",
      sizes: [100],
      children: [
        {
          id: "right-tabs",
          type: "tabs",
          stacked: false,
          currentTab: 0,
          children: [leaf("search", "Search", "search", "search")],
        },
      ],
      width: "0px",
    },
    bottom: {
      id: "bottom",
      type: "tabs",
      currentTab: 0,
      children: [],
      height: "0px",
    },
    floating: [],
    active: "sample-docs-index",
  };
}

export function createPluginWorkspaceSeed(): Record<string, string> {
  const notes = sampleDocsFixtureVault();
  return {
    ".lapis/app.json": JSON.stringify(
      {
        "editor.defaultViewForNewTabs": "editing",
        "editor.alwaysFocusNewTabs": true,
        "appearence.interface.showTabTitleBar": true,
        "workspace.fileExplorer.autoRevealCurrentFile": true,
      },
      null,
      2,
    ),
    ".lapis/workspace.json": JSON.stringify(workspaceLayout(), null, 2),
    ...notes,
  };
}

export async function bootPluginWorkspaceDemo(): Promise<{
  app: App;
  dispose: () => Promise<void>;
}> {
  let app!: App;
  app = new App({
    version: "0.0.1-story",
    configPath: ".lapis/app.json",
    adapter: new MemoryVaultAdapter(createPluginWorkspaceSeed(), {
      name: "Docs Plugin Workspace",
      vaultId: "docs-plugin-workspace",
      clock: 1_700_000_000_000,
    }),
    appDatabase: new MemoryAppDatabase("docs-plugin-workspace"),
    workspaceShell: { application: { name: "Lapis Notes" } },
    markdownRenderer: createStoryMarkdownRenderer(() => app),
  });
  const disposeApplicationCompatibility = installApplicationCompatibility(app);

  app.plugins.registerCorePlugins([
    {
      plugin: MarkdownPlugin,
      required: false,
      enabledByDefault: true,
    },
    {
      plugin: FileExplorerPlugin,
      required: false,
      enabledByDefault: true,
    },
    { plugin: SearchPlugin, required: false, enabledByDefault: true },
    {
      plugin: DocsPlugin,
      required: false,
      enabledByDefault: true,
      distribution: "first-party-external",
    },
  ]);

  await app.vault.load();
  await app.configuration.load();
  await app.plugins.loadPlugins({
    communityPlugins: "disabled",
    optionalCorePlugins: "configured",
  });
  const docsPlugin = app.plugins.plugins.get("docs");
  if (docsPlugin instanceof DocsPlugin) {
    docsPlugin.clock = () => new Date("2026-07-02T12:00:00.000Z");
  }
  const stopWatchingMetadata = app.metadataTypeManager.trackChanges();
  await app.metadataCache.load();
  const searchPlugin = app.plugins.plugins.get("search");
  if (searchPlugin instanceof SearchPlugin) {
    await searchPlugin.refreshIndex("docs-plugin-workspace");
  }
  await app.workspace.loadLayout();

  return {
    app,
    dispose: async () => {
      stopWatchingMetadata();
      for (const plugin of [...app.plugins.corePlugins].reverse()) {
        await plugin.disable().catch(() => undefined);
      }
      await app.workspace.disposeWorkspaceHost();
      await app.appDatabase.close();
      disposeApplicationCompatibility();
    },
  };
}
