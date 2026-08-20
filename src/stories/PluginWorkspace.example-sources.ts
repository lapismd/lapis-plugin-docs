export const PluginWorkspaceExample = `<script lang="ts">
  import { App } from "@lapis-notes/api";
  import { WorkspaceShell } from "@lapis-notes/workspace";
  import { MarkdownPlugin } from "@lapis-notes/markdown";
  import { FileExplorerPlugin } from "@lapis-notes/file-explorer";
  import { SearchPlugin } from "@lapis-notes/search";
  import { DocsPlugin } from "@lapis-notes/lapis-plugin-docs";

  const app = new App(/* vault adapter + seeded docs/*.md */);
  app.plugins.registerCorePlugins([
    { plugin: MarkdownPlugin, required: false, enabledByDefault: true },
    { plugin: FileExplorerPlugin, required: false, enabledByDefault: true },
    { plugin: SearchPlugin, required: false, enabledByDefault: true },
    {
      plugin: DocsPlugin,
      required: false,
      enabledByDefault: true,
      distribution: "first-party-external",
    },
  ]);
  await app.plugins.loadPlugins({
    communityPlugins: "disabled",
    optionalCorePlugins: "configured",
  });
  await app.workspace.loadLayout();
</script>

<WorkspaceShell {app} workspaceLabel="Docs" />
`;
