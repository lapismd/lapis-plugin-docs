import {
  Plugin,
  type App,
  type PluginManifest,
  type WorkspaceLeaf,
} from "@lapis-notes/api";
import { requestDocsDocumentSurface } from "./docs/docs-document-surface";
import { createDocsProjectionRegistration } from "./docs-index";
import { DocsDocumentView } from "./docs-document-view";
import {
  DOCS_DOCUMENT_VIEW_TYPE,
  DOCS_EXTENSIONS,
  DOCS_FILENAME_PATTERNS,
  isDocsDocumentPath,
} from "./docs-path";
import { DocsRepository, createVaultDocsFileStore } from "./docs-repository";
import {
  cloneDocsPluginSettings,
  migrateDocsPluginData,
  patchDocsPluginSettings,
  type DocsPluginDataV1,
  type DocsPluginSettings,
  type DocsPluginSettingsPatch,
} from "./docs-settings";
import { DocsSettingsTab } from "./docs-settings-tab";
import { DOCS_CARDS_VIEW_TYPE, DocsCardsView } from "./docs-cards-view";
import { DOCS_REVIEW_VIEW_TYPE, DocsReviewView } from "./docs-review-view";
import { DOCS_VIEW_TYPE, DocsView } from "./docs-view";

export const DOCS_PLUGIN_ID = "docs";

const MANIFEST: PluginManifest = {
  id: DOCS_PLUGIN_ID,
  name: "Docs",
  version: "0.1.0",
  minAppVersion: "0.0.1",
  description: "Vault-native Docs notes, books, cards, and FSRS review.",
  author: "Lapis Notes",
};

export class DocsPlugin extends Plugin {
  readonly repository: DocsRepository;
  clock: () => Date = () => new Date();
  private data: DocsPluginDataV1 = migrateDocsPluginData(null);
  private saveQueue: Promise<void> = Promise.resolve();
  private readonly settingsListeners = new Set<(settings: DocsPluginSettings) => void>();

  constructor(app: App, pluginManifest: PluginManifest = MANIFEST) {
    super(app, pluginManifest);
    this.repository = new DocsRepository(createVaultDocsFileStore(app));
  }

  async onload(): Promise<void> {
    this.data = migrateDocsPluginData(await this.loadData());
    this.registerIndexProjection(
      createDocsProjectionRegistration(this.getSettings().docsRoot),
    );
    this.registerSidebarView(
      DOCS_VIEW_TYPE,
      (leaf: WorkspaceLeaf) =>
        new DocsView(leaf, this.repository, () => this.clock(), {
          get: () => this.getSettings(),
          subscribe: (listener) => this.subscribeSettings(listener),
        }),
      { side: "left", title: "Docs", icon: "book-open" },
    );
    this.registerView(
      DOCS_DOCUMENT_VIEW_TYPE,
      (leaf: WorkspaceLeaf) =>
        new DocsDocumentView(leaf, this.repository, () => this.clock()),
    );
    this.registerView(
      DOCS_CARDS_VIEW_TYPE,
      (leaf: WorkspaceLeaf) =>
        new DocsCardsView(leaf, this.repository, () => this.clock(), {
          get: () => this.getSettings(),
          subscribe: (listener) => this.subscribeSettings(listener),
        }),
    );
    this.registerView(
      DOCS_REVIEW_VIEW_TYPE,
      (leaf: WorkspaceLeaf) =>
        new DocsReviewView(leaf, this.repository, () => this.clock(), {
          get: () => this.getSettings(),
          subscribe: (listener) => this.subscribeSettings(listener),
        }),
    );
    this.registerEditorView({
      id: DOCS_DOCUMENT_VIEW_TYPE,
      viewType: DOCS_DOCUMENT_VIEW_TYPE,
      label: "Docs",
      filenamePatterns: [...DOCS_FILENAME_PATTERNS],
      priority: "exclusive",
    });
    this.registerExtensions([...DOCS_EXTENSIONS], DOCS_DOCUMENT_VIEW_TYPE);
    this.addCommand({
      id: "open",
      name: "Open docs",
      callback: () => void this.openDocs(),
    });
    this.addCommand({
      id: "open-cards",
      name: "Open cards",
      callback: () => void this.openCards(),
    });
    this.addCommand({
      id: "review-note",
      name: "Review due cards (note)",
      callback: () => void this.openReview("note"),
    });
    this.addCommand({
      id: "review-workspace",
      name: "Review due cards (workspace)",
      callback: () => void this.openReview("workspace"),
    });
    this.addRibbonIcon("book-open", "Open Docs", () => void this.openDocs());
    this.addSettingTab(new DocsSettingsTab(this.app, this));
  }

  getSettings(): DocsPluginSettings {
    return cloneDocsPluginSettings(this.data.settings);
  }

  async updateSettings(patch: DocsPluginSettingsPatch): Promise<void> {
    this.data = {
      ...this.data,
      settings: patchDocsPluginSettings(this.data.settings, patch),
    };
    const snapshot: DocsPluginDataV1 = {
      version: this.data.version,
      settings: this.getSettings(),
    };
    this.saveQueue = this.saveQueue
      .catch(() => undefined)
      .then(() => this.saveData(snapshot));
    await this.saveQueue;
    for (const listener of this.settingsListeners) {
      listener(cloneDocsPluginSettings(snapshot.settings));
    }
  }

  subscribeSettings(
    listener: (settings: DocsPluginSettings) => void,
  ): () => void {
    this.settingsListeners.add(listener);
    return () => this.settingsListeners.delete(listener);
  }

  async openDocs(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(DOCS_VIEW_TYPE)[0];
    const leaf =
      existing ?? this.app.workspace.ensureSideLeaf(DOCS_VIEW_TYPE, "left");
    if (leaf.view.getViewType() !== DOCS_VIEW_TYPE) {
      await leaf.setViewState({ type: DOCS_VIEW_TYPE, active: true });
    }
    this.app.workspace.activateLeaf(leaf, {
      focusRootHost: false,
      source: "api",
      operation: "open-docs",
    });
    await this.app.workspace.revealLeaf(leaf);
  }

  async openCards(): Promise<void> {
    await this.focusDocumentPanel("cards");
  }

  async openReview(scope: "note" | "workspace"): Promise<void> {
    await this.focusDocumentPanel("review", scope);
  }

  private async focusDocumentPanel(
    panel: "cards" | "review",
    reviewScope?: "note" | "workspace",
  ): Promise<void> {
    const file = this.app.workspace.getActiveFile();
    const documentLeaf = this.app.workspace
      .getLeavesOfType(DOCS_DOCUMENT_VIEW_TYPE)
      .find((leaf) => leaf.view instanceof DocsDocumentView && leaf.view.file);
    const path =
      file && isDocsDocumentPath(file.path)
        ? file.path
        : documentLeaf?.view instanceof DocsDocumentView
          ? documentLeaf.view.file?.path
          : undefined;
    if (!path) return;
    requestDocsDocumentSurface(path, {
      panel,
      ...(reviewScope ? { reviewScope } : {}),
    });
    await this.app.workspace.openLinkText(path, "", false);
  }
}

export default DocsPlugin;
