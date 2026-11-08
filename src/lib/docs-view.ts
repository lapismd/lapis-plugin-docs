import { View, type WorkspaceLeaf } from "@lapis-notes/api";
import { mount, unmount } from "svelte";
import type { DocsRepository } from "./docs-repository";
import type { DocsPluginSettings } from "./docs-settings";
import DocsSidebarHost from "./docs/sidebar/DocsSidebarHost.svelte";

export const DOCS_VIEW_TYPE = "docs";

export type DocsSettingsSource = {
  get(): DocsPluginSettings;
  subscribe(listener: (settings: DocsPluginSettings) => void): () => void;
};

export class DocsView extends View {
  private component: Record<string, unknown> | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    private readonly repository: DocsRepository,
    private readonly clock: () => Date = () => new Date(),
    private readonly settings?: DocsSettingsSource,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return DOCS_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Docs";
  }

  getIcon(): string {
    return "book-open";
  }

  protected onOpen(): Promise<void> {
    return Promise.resolve();
  }

  protected onClose(): Promise<void> {
    return Promise.resolve();
  }

  onload(): void {
    this.containerEl.style.width = "100%";
    this.containerEl.style.height = "100%";
    this.containerEl.style.minHeight = "0";
    this.containerEl.style.overflow = "hidden";
    this.component = mount(DocsSidebarHost, {
      target: this.containerEl,
      props: {
        app: this.app,
        repository: this.repository,
        clock: this.clock,
        docsRoot: this.settings?.get().docsRoot ?? "docs",
      },
    }) as Record<string, unknown>;
  }

  onunload(): void {
    if (this.component) void unmount(this.component);
    this.component = null;
  }
}
