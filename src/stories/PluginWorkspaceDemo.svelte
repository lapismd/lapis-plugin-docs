<script lang="ts">
  import {
    WorkspaceShell,
    type WorkspaceShellProps,
  } from "@lapis-notes/workspace";
  import { onMount } from "svelte";
  import type { App } from "@lapis-notes/api";

  import { bootPluginWorkspaceDemo } from "./create-plugin-workspace-demo";

  let {
    displayMode = "desktop",
  }: {
    displayMode?: WorkspaceShellProps["displayMode"];
  } = $props();

  let app = $state<App | null>(null);
  let status = $state<"booting" | "ready" | "error">("booting");
  let errorMessage = $state("");
  let root = $state<HTMLDivElement>();

  $effect(() => {
    if (!root || !app) return;
    const ownedRoot = root as HTMLDivElement & { __lapisApp?: App };
    ownedRoot.__lapisApp = app;
    return () => {
      if (ownedRoot.__lapisApp === app) delete ownedRoot.__lapisApp;
    };
  });

  onMount(() => {
    let cancelled = false;
    const runtimePromise = bootPluginWorkspaceDemo();
    void runtimePromise
      .then((runtime) => {
        if (cancelled) return;
        app = runtime.app;
        status = "ready";
      })
      .catch((error) => {
        status = "error";
        errorMessage = error instanceof Error ? error.message : String(error);
      });

    return () => {
      cancelled = true;
      void runtimePromise.then((runtime) => runtime.dispose());
    };
  });
</script>

<div
  bind:this={root}
  class="plugin-workspace-demo"
  data-testid="plugin-workspace-demo"
  data-display-mode={displayMode}
  data-status={status}
>
  <span
    class="plugin-workspace-demo__status"
    data-testid="plugin-workspace-status"
  >
    {status}
  </span>
  {#if status === "error"}
    <div class="plugin-workspace-demo__error" role="alert">
      Unable to start the plugin workspace: {errorMessage}
    </div>
  {:else if app}
    <WorkspaceShell {app} {displayMode} workspaceLabel="Docs" />
  {/if}
</div>

<style>
  :global(html:has(body.sb-main-fullscreen .plugin-workspace-demo)),
  :global(body.sb-main-fullscreen:has(.plugin-workspace-demo)) {
    height: 100%;
    height: 100dvh;
    max-height: 100%;
    overflow: hidden;
  }

  :global(
      body.sb-main-fullscreen:has(#storybook-root .plugin-workspace-demo)
        #storybook-root
    ),
  :global(
      body.sb-main-fullscreen #storybook-root:has(.plugin-workspace-demo) > *
    ) {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    min-height: 0;
    overflow: hidden;
    padding: 0 !important;
  }

  .plugin-workspace-demo {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .plugin-workspace-demo__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  .plugin-workspace-demo__error {
    padding: 1rem;
  }
</style>
