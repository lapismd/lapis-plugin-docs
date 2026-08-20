import {
  Plugin,
  type App,
  type PluginManifest,
  type WorkspaceLeaf,
} from "@lapis-notes/api";
import { createDocsProjectionRegistration } from "./docs-index";
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
    this.registerView(
      DOCS_VIEW_TYPE,
      (leaf: WorkspaceLeaf) =>
        new DocsView(leaf, this.repository, () => this.clock(), {
          get: () => this.getSettings(),
          subscribe: (listener) => this.subscribeSettings(listener),
        }),
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
    await this.revealView(DOCS_VIEW_TYPE);
  }

  async openCards(): Promise<void> {
    await this.revealView(DOCS_CARDS_VIEW_TYPE);
  }

  async openReview(_scope: "note" | "workspace"): Promise<void> {
    await this.revealView(DOCS_REVIEW_VIEW_TYPE);
  }

  private async revealView(type: string): Promise<void> {
    const leaf =
      this.app.workspace.getLeavesOfType(type)[0] ??
      this.app.workspace.getLeaf();
    if (leaf.view.getViewType() !== type) {
      await leaf.setViewState({ type, active: true });
    }
    this.app.workspace.activeLeaf = leaf;
    await this.app.workspace.revealLeaf(leaf);
  }
}

export default DocsPlugin;
