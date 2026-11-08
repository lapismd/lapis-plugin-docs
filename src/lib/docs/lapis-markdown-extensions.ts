import type {
  App,
  MarkdownPostProcessor,
  MarkdownPostProcessorContext,
  MarkdownRenderChild,
  MarkdownSectionInformation,
} from "@lapis-notes/api";
import { createMiraEditorExtensions } from "@lapismd/mira-editor";
import {
  defineMiraExtension,
  type MiraExtension,
  type MiraMarkdownPostProcessor,
} from "@lapismd/mira/extensions";

const DOCS_MARKDOWN_SURFACE = { id: "docs" } as const;

/** Host stubs take no arguments. A provided renderer accepts the markdown string. */
export function providedMarkdownRenderer(app: App | null) {
  const renderer = app?.props.markdownRenderer;
  if (typeof renderer !== "function" || renderer.length === 0) return null;
  return renderer;
}

/**
 * Reading extensions used by the Lapis Markdown view: Mira's Mermaid plugin
 * plus every Markdown post-processor registered with the host.
 */
export function lapisMarkdownExtensions(
  app: App | null,
  sourcePath: string,
  markdown: string,
): MiraExtension[] {
  const mermaidSetting = app?.configuration
    .getConfiguration()
    .get("markdown.mira.plugins.mermaid.enabled", true);
  const mermaidEnabled = mermaidSetting ?? true;
  const extensions = createMiraEditorExtensions({
    features: { mermaid: mermaidEnabled },
  });
  if (!app) return extensions;

  const processors = [
    ...app.markdownExtensions
      .getAll()
      .flatMap((contribution) =>
        contribution.postProcessor ? [contribution.postProcessor] : [],
      ),
    ...(app.mardownPostProcessor ?? []),
  ];
  const codeBlockProcessors = app.mardownCodeBlockPostProcessor ?? {};
  if (
    processors.length === 0 &&
    Object.keys(codeBlockProcessors).length === 0
  ) {
    return extensions;
  }

  return [
    ...extensions,
    defineMiraExtension({
      name: "lapis-markdown-plugins",
      postProcessors: [
        adaptLapisMarkdownPlugins(app, {
          sourcePath,
          markdown,
          processors,
          codeBlockProcessors,
        }),
      ],
    }),
  ];
}

function adaptLapisMarkdownPlugins(
  app: App,
  options: {
    sourcePath: string;
    markdown: string;
    processors: MarkdownPostProcessor[];
    codeBlockProcessors: Record<string, MarkdownPostProcessor[]>;
  },
): MiraMarkdownPostProcessor {
  return (el, node) => {
    let disposed = false;
    const children: MarkdownRenderChild[] = [];
    const context: MarkdownPostProcessorContext = {
      docId: options.sourcePath,
      sourcePath: options.sourcePath,
      frontmatter: null,
      mode: "reading",
      surface: DOCS_MARKDOWN_SURFACE,
      addChild(child) {
        children.push(child);
        child.load();
      },
      getSectionInfo(target) {
        return target === el ? sectionInfo(options.markdown, node) : null;
      },
    };

    void app.metadataCache
      .getFileCacheAsync(options.sourcePath)
      .then(async (metadata) => {
        if (disposed) return;
        context.frontmatter = metadata?.frontmatter ?? null;
        for (const processor of options.processors) {
          if (disposed) return;
          await processor(el, context);
        }
        await runCodeBlockProcessors(el, context, options.codeBlockProcessors);
      });

    return () => {
      disposed = true;
      for (const child of children.splice(0).reverse()) child.unload();
    };
  };
}

async function runCodeBlockProcessors(
  el: HTMLElement,
  context: MarkdownPostProcessorContext,
  processors: Record<string, MarkdownPostProcessor[]>,
): Promise<void> {
  const blocks = el.querySelectorAll("pre");
  for (const block of blocks) {
    const code = block.querySelector("code");
    const language = [...(code?.classList ?? [])]
      .find((name) => name.startsWith("language-"))
      ?.slice("language-".length);
    if (!language) continue;
    for (const processor of processors[language] ?? []) {
      await processor(block, context);
    }
  }
}

function sectionInfo(
  markdown: string,
  node: unknown,
): MarkdownSectionInformation | null {
  const typed = node as {
    position?: { start?: { offset?: number }; end?: { offset?: number } };
    type?: string;
    depth?: number;
  };
  const start = typed.position?.start?.offset;
  const nodeEnd = typed.position?.end?.offset;
  if (typeof start !== "number" || typeof nodeEnd !== "number") return null;

  let end = nodeEnd;
  if (typed.type === "heading" && typeof typed.depth === "number") {
    const heading = /^ {0,3}(#{1,6})\s+/gm;
    for (const match of markdown.slice(nodeEnd).matchAll(heading)) {
      if ((match[1]?.length ?? 7) <= typed.depth) {
        end = nodeEnd + (match.index ?? 0);
        break;
      }
    }
    if (end === nodeEnd) end = markdown.length;
  }

  const text = markdown.slice(start, end).replace(/\n+$/, "");
  const lineStart = markdown.slice(0, start).split("\n").length - 1;
  return {
    text,
    lineStart,
    lineEnd: lineStart + text.split("\n").length - 1,
  };
}
