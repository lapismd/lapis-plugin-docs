import {
  TextFileView,
  type TFile,
  type WorkspaceLeaf,
} from "@lapis-notes/api";
import { mount, unmount } from "svelte";
import {
  DOCS_DOCUMENT_VIEW_TYPE,
  isDocsDocumentPath,
} from "./docs-path";
import type { DocsRepository } from "./docs-repository";
import DocsDocumentWorkspace from "./docs-document-workspace.svelte";

type DocsSaveRequest = { file: TFile; value: string };

class DocsSaveCoordinator {
  private chain: Promise<void> = Promise.resolve();
  private pending: DocsSaveRequest | null = null;

  constructor(
    private readonly write: (request: DocsSaveRequest) => Promise<void>,
  ) {}

  queue(request: DocsSaveRequest): Promise<void> {
    this.pending = request;
    this.chain = this.chain
      .catch(() => undefined)
      .then(async () => {
        const next = this.pending;
        this.pending = null;
        if (!next) return;
        await this.write(next);
      });
    return this.chain;
  }

  flush(): Promise<void> {
    return this.chain;
  }
}

export class DocsDocumentView extends TextFileView {
  private component: Record<string, unknown> | null = null;
  private readonly saves = new DocsSaveCoordinator(async ({ file, value }) =>
    this.app.vault.modify(file, value),
  );

  constructor(
    leaf?: WorkspaceLeaf,
    private readonly repository?: DocsRepository,
    private readonly clock: () => Date = () => new Date(),
  ) {
    super(leaf);
  }

  getViewType(): string {
    return DOCS_DOCUMENT_VIEW_TYPE;
  }

  getDisplayText(): string {
    return this.file?.baseName ?? "Docs";
  }

  getIcon(): string {
    return "book-open";
  }

  canAcceptExtension(extension: string): boolean {
    const normalized = extension.toLowerCase().replace(/^\./, "");
    if (normalized === "doc.md") return true;
    return isDocsDocumentPath(this.file?.path ?? "");
  }

  getViewData(): string {
    return this.data;
  }

  setViewData(data: string, _clear?: boolean): void {
    this.data = data;
    this.editor.setValue(data);
    this.reload();
  }

  clear(): void {
    this.data = "";
    this.editor.setValue("");
    this.reload();
  }

  onload(): void {
    this.reload();
  }

  async onunload(): Promise<void> {
    await this.saves.flush();
    this.unmountWorkspace();
  }

  async onUnloadFile(file: TFile): Promise<void> {
    await this.saves.flush();
    await super.onUnloadFile(file);
  }

  protected async onClose(): Promise<void> {
    await this.saves.flush();
    this.unmountWorkspace();
  }

  private persistMarkdown(next: string): Promise<void> {
    if (next === this.data) return Promise.resolve();
    this.data = next;
    this.editor.setValue(next);
    if (!this.file) return Promise.resolve();
    return this.saves.queue({ file: this.file.copy(), value: next });
  }

  private unmountWorkspace(): void {
    if (!this.component) return;
    unmount(this.component as Parameters<typeof unmount>[0]);
    this.component = null;
  }

  private fillLeafSurface(element: HTMLElement | null | undefined): void {
    if (!element) return;
    element.style.display = "flex";
    element.style.flexDirection = "column";
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.minHeight = "0";
    element.style.overflow = "hidden";
  }

  private reload(): void {
    const target = this.contentEl ?? this.containerEl;
    if (!target) return;
    this.unmountWorkspace();
    target.empty();
    this.fillLeafSurface(this.containerEl);
    this.fillLeafSurface(target);
    this.component = mount(DocsDocumentWorkspace, {
      target,
      props: {
        app: this.app,
        markdownText: this.data,
        filePath: this.file?.path ?? "",
        repository: this.repository,
        clock: this.clock,
        onMarkdownChange: (next: string) => this.persistMarkdown(next),
      },
    }) as Record<string, unknown>;
  }
}
