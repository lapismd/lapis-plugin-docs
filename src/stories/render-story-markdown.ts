import type { App, Component } from "@lapis-notes/api";
import { MarkdownPreview } from "@lapismd/mira/preview";
import { mount, unmount } from "svelte";

import { lapisMarkdownExtensions } from "../lib/docs/lapis-markdown-extensions";

/** Story host renderer: Lapis Markdown extensions, including Mermaid, into the API element. */
export function createStoryMarkdownRenderer(resolveApp: () => App) {
  return async (
    markdown: string,
    el: HTMLElement,
    sourcePath: string,
    component: Component,
  ) => {
    el.replaceChildren();
    const target = document.createElement("div");
    target.className = "docs-mira-markdown-preview";
    el.append(target);
    const mounted = mount(MarkdownPreview, {
      target,
      props: {
        value: markdown,
        sourcePath,
        class: "docs-mira-markdown-preview",
        extensions: lapisMarkdownExtensions(resolveApp(), sourcePath, markdown),
      },
    });
    component.register(() => {
      void unmount(mounted);
    });
  };
}
