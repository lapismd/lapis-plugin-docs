export const docsWorkspaceExample = `<script lang="ts">
  import { DocsPlugin } from "@lapis-notes/lapis-plugin-docs";
  import { App } from "@lapis-notes/api";

  const app = new App();
  await app.plugins.loadCorePlugins([{
    plugin: DocsPlugin,
    required: false,
    enabledByDefault: true,
    distribution: "first-party-external",
  }]);
</script>
`;

export const docsCardPreviewExample = `<script lang="ts">
  import { DocsPlugin } from "@lapis-notes/lapis-plugin-docs";
  import { App } from "@lapis-notes/api";

  const app = new App();
  await app.plugins.loadCorePlugins([{
    plugin: DocsPlugin,
    required: false,
    enabledByDefault: true,
    distribution: "first-party-external",
  }]);
</script>
`;
