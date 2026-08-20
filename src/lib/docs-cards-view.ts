import { View, type WorkspaceLeaf } from "@lapis-notes/api";
import { mount, unmount } from "svelte";
import type { DocsRepository } from "./docs-repository";
import type { DocsSettingsSource } from "./docs-view";
import DocsWorkspace from "./docs-workspace.svelte";

export const DOCS_CARDS_VIEW_TYPE = "docs-cards";

export class DocsCardsView extends View {
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
    return DOCS_CARDS_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Docs Cards";
  }

  getIcon(): string {
    return "layers";
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
    this.component = mount(DocsWorkspace, {
      target: this.containerEl,
      props: {
        app: this.app,
        repository: this.repository,
        clock: this.clock,
        settingsSource: this.settings,
        mode: "cards",
      },
    }) as Record<string, unknown>;
  }

  onunload(): void {
    if (this.component) void unmount(this.component);
    this.component = null;
  }
}
