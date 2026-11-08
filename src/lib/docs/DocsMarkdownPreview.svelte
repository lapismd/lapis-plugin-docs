<script lang="ts">
  /**
   * Mira-backed Markdown preview for Docs rich reading surfaces.
   * Replaces CV Studio Carta MarkdownPreview without changing Docs layout CSS.
   */
  import { MarkdownPreview } from "@lapismd/mira/preview";
  import "@lapismd/mira/styles.css";
  import "@lapismd/mira/themes/obsidian.css";
  import { onDestroy } from "svelte";
  import type { MarkdownFloatingTocMode } from "./candidates/markdown-floating-toc";
  import {
    DOCS_MEDIA_SENTINEL_PREFIX,
    decodeDocsMediaSentinel,
    resolveDocsMediaRelativePath,
  } from "../model/docs-relative-media";
  import { getDocsMediaResolver } from "../model/docs-media-context";

  let {
    value = "",
    empty = "",
    compact = false,
    collapsedMaxHeight = 0,
    expandLabel = "Show more",
    collapseLabel = "Show less",
    floatingToc = "auto" as MarkdownFloatingTocMode,
    sourcePath = "",
    headingIdPrefix = "",
  }: {
    value?: string;
    empty?: string;
    compact?: boolean;
    collapsedMaxHeight?: number;
    expandLabel?: string;
    collapseLabel?: string;
    floatingToc?: MarkdownFloatingTocMode;
    sourcePath?: string;
    headingIdPrefix?: string;
  } = $props();

  const blobUrls = new Set<string>();
  let previewRoot = $state<HTMLDivElement | null>(null);
  let resolveGeneration = 0;
  let expanded = $state(false);

  const mediaResolver = getDocsMediaResolver();
  const displayValue = $derived(value.trim() ? value : empty);
  const collapseEnabled = $derived(collapsedMaxHeight > 0 && !expanded);

  function revokeBlobUrls() {
    for (const url of blobUrls) URL.revokeObjectURL(url);
    blobUrls.clear();
  }

  function mediaPathFromImage(
    img: HTMLImageElement,
    notePath: string,
  ): string | null {
    const dataPath = img.getAttribute("data-cv-docs-media");
    if (dataPath) return dataPath;

    const src = img.getAttribute("src") ?? "";
    if (!src) return null;
    if (src.startsWith(DOCS_MEDIA_SENTINEL_PREFIX)) {
      return decodeDocsMediaSentinel(src);
    }
    if (/^(https?:|data:|blob:)/i.test(src) || src.startsWith("/api/")) {
      return null;
    }
    if (!notePath) return null;
    return resolveDocsMediaRelativePath(src, notePath);
  }

  async function resolveSentinelImages(
    root: HTMLElement,
    generation: number,
  ) {
    const notePath = sourcePath.trim();
    const images = root.querySelectorAll<HTMLImageElement>(
      'img[data-cv-docs-media], img[src^="/__cvstudio-docs-media__/"], img[src^="../"], img[src^="./"], img[src^="media/"]',
    );
    await Promise.all(
      [...images].map(async (img) => {
        const relativePath = mediaPathFromImage(img, notePath);
        if (!relativePath) return;
        try {
          const resolved = await mediaResolver(relativePath);
          if (generation !== resolveGeneration) return;
          if (resolved.startsWith("blob:")) blobUrls.add(resolved);
          img.removeAttribute("data-cv-docs-media");
          img.src = resolved;
        } catch {
          if (generation !== resolveGeneration) return;
          img.removeAttribute("src");
          img.removeAttribute("data-cv-docs-media");
          img.alt = img.alt || "Media unavailable";
        }
      }),
    );
  }

  $effect(() => {
    const root = previewRoot;
    const _value = value;
    const _sourcePath = sourcePath;
    if (!root) return;

    revokeBlobUrls();
    const generation = ++resolveGeneration;

    const run = () => {
      if (generation !== resolveGeneration || !previewRoot) return;
      void resolveSentinelImages(previewRoot, generation);
    };

    const frame = requestAnimationFrame(run);
    const retry = setTimeout(run, 160);
    const observer = new MutationObserver(run);
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(retry);
      observer.disconnect();
    };
  });

  onDestroy(() => {
    resolveGeneration += 1;
    revokeBlobUrls();
  });
</script>

<div
  class="docs-markdown-preview-root"
  class:compact
  class:collapsed={collapseEnabled}
  style:--docs-preview-max-height={collapseEnabled
    ? `${collapsedMaxHeight}px`
    : undefined}
  data-heading-prefix={headingIdPrefix || undefined}
  data-floating-toc={floatingToc}
  bind:this={previewRoot}
>
  {#if displayValue}
    <MarkdownPreview
      value={displayValue}
      {sourcePath}
      embed={compact}
      class="docs-mira-markdown-preview"
    />
  {:else if empty}
    <p class="docs-markdown-preview-empty">{empty}</p>
  {/if}
  {#if collapsedMaxHeight > 0}
    <button
      type="button"
      class="docs-markdown-preview-expand"
      onclick={() => (expanded = !expanded)}
    >
      {expanded ? collapseLabel : expandLabel}
    </button>
  {/if}
</div>

<style>
  .docs-markdown-preview-root {
    min-width: 0;
  }

  .docs-markdown-preview-root.collapsed {
    max-height: var(--docs-preview-max-height);
    overflow: hidden;
  }

  .docs-markdown-preview-empty {
    margin: 0;
    color: var(--muted-foreground, inherit);
  }

  .docs-markdown-preview-expand {
    margin-top: 0.5rem;
  }

  .docs-markdown-preview-root :global(.docs-mira-markdown-preview),
  .docs-markdown-preview-root :global(.docs-mira-markdown-preview .cm-editor),
  .docs-markdown-preview-root :global(.docs-mira-markdown-preview .cm-scroller),
  .docs-markdown-preview-root :global(.docs-mira-markdown-preview .markdown-rendered),
  .docs-markdown-preview-root :global(.docs-mira-markdown-preview .markdown-preview-view) {
    background: transparent;
    color: inherit;
  }
</style>
