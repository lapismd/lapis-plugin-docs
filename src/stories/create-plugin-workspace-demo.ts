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

function tabs(
  id: string,
  children: Array<ReturnType<typeof leaf> | ReturnType<typeof sidebarGroup>>,
  options: { stacked?: boolean; currentTab?: number } = {},
) {
  return {
    id,
    type: "tabs",
    stacked: options.stacked ?? false,
    currentTab: options.currentTab ?? 0,
    children,
  };
}

function sidebarGroup(
  id: string,
  children: Array<ReturnType<typeof leaf>>,
) {
  return {
    id,
    type: "sidebar-group",
    name: "Docs",
    icon: "book-open",
    children,
    collapsed: Object.fromEntries(children.map((child) => [child.id, false])),
    panelSizes: Object.fromEntries(children.map((child) => [child.id, 100])),
  };
}

function docsLeaf(id: string) {
  return leaf(id, "Docs", "book-open", "docs");
}

function documentLeaf() {
  return leaf(
    "sample-docs-index",
    "index.doc.md",
    "book-open",
    "docs-document",
    { file: SAMPLE_DOCS_INDEX_PATH },
  );
}

function emptyDock(id: string) {
  return {
    id,
    type: "split",
    direction: "vertical",
    sizes: [100],
    children: [],
    width: "0px",
  };
}

export type DocsSidebarPlacement =
  | "shell"
  | "middle"
  | "stacked"
  | "left"
  | "right"
  | "bottom"
  | "group";

export function docsSidebarLayout(placement: DocsSidebarPlacement = "shell") {
  const documentTabs = tabs("docs-tabs", [documentLeaf()]);
  const mainDocument = {
    id: "main",
    type: "split",
    direction: "vertical",
    sizes: [100],
    children: [documentTabs],
  };
  if (placement === "middle") {
    return {
      main: {
        id: "main",
        type: "split",
        direction: "horizontal",
        sizes: [35, 65],
        children: [documentTabs, tabs("main-panel-tabs", [docsLeaf("panel-middle")])],
      },
      left: emptyDock("left"),
      right: emptyDock("right"),
      bottom: { ...tabs("bottom-panel", []), height: "0px" },
      floating: [],
      active: "panel-middle",
    };
  }
  if (placement === "stacked") {
    return {
      main: {
        id: "main",
        type: "split",
        direction: "horizontal",
        sizes: [35, 65],
        children: [
          documentTabs,
          tabs(
            "main-stacked-tabs",
            [
              leaf("stacked-workspace", "Workspace", "layout-template", "empty"),
              docsLeaf("panel-stacked"),
              leaf("stacked-reference", "Reference", "book-open", "empty"),
            ],
            { stacked: true, currentTab: 1 },
          ),
        ],
      },
      left: emptyDock("left"),
      right: emptyDock("right"),
      bottom: { ...tabs("bottom-panel", []), height: "0px" },
      floating: [],
      active: "panel-stacked",
    };
  }
  if (placement === "right") {
    return {
      main: mainDocument,
      left: emptyDock("left"),
      right: {
        id: "right",
        type: "split",
        direction: "vertical",
        sizes: [100],
        children: [tabs("right-panel-tabs", [docsLeaf("panel-right")])],
        width: "22rem",
      },
      bottom: { ...tabs("bottom-panel", []), height: "0px" },
      floating: [],
      active: "sample-docs-index",
    };
  }
  if (placement === "bottom") {
    return {
      main: mainDocument,
      left: emptyDock("left"),
      right: emptyDock("right"),
      bottom: {
        ...tabs("bottom-panel", [
          sidebarGroup("docs-bottom-group", [docsLeaf("panel-bottom")]),
        ]),
        height: "22rem",
      },
      floating: [],
      active: "sample-docs-index",
    };
  }
  if (placement === "group") {
    return {
      main: mainDocument,
      left: emptyDock("left"),
      right: {
        id: "right",
        type: "split",
        direction: "vertical",
        sizes: [100],
        children: [
          tabs("right-panel-tabs", [
            sidebarGroup("docs-sidebar-group", [docsLeaf("panel-grouped")]),
          ]),
        ],
        width: "24rem",
      },
      bottom: { ...tabs("bottom-panel", []), height: "0px" },
      floating: [],
      active: "sample-docs-index",
    };
  }
  if (placement === "left") {
    return {
      main: mainDocument,
      left: {
        id: "left",
        type: "split",
        direction: "vertical",
        sizes: [100],
        children: [tabs("left-panel-tabs", [docsLeaf("panel-left")])],
        width: "22rem",
      },
      right: emptyDock("right"),
      bottom: { ...tabs("bottom-panel", []), height: "0px" },
      floating: [],
      active: "sample-docs-index",
    };
  }
  return {
    main: mainDocument,
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
            docsLeaf("docs-home"),
            leaf("file-explorer", "Files", "folder-closed", "file-explorer"),
          ],
        },
      ],
      width: "18rem",
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

export function createPluginWorkspaceSeed(
  placement: DocsSidebarPlacement = "shell",
): Record<string, string> {
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
    ".lapis/workspace.json": JSON.stringify(docsSidebarLayout(placement), null, 2),
    ...notes,
  };
}

export async function bootPluginWorkspaceDemo(
  placement: DocsSidebarPlacement = "shell",
): Promise<{
  app: App;
  dispose: () => Promise<void>;
}> {
  let app!: App;
  app = new App({
    version: "0.0.1-story",
    configPath: ".lapis/app.json",
    adapter: new MemoryVaultAdapter(createPluginWorkspaceSeed(placement), {
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
