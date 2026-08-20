import { Notice, PluginSettingTab, Setting, type App } from "@lapis-notes/api";
import type { DocsPlugin } from "./docs-plugin";
import type { DocsPluginSettingsPatch } from "./docs-settings";

export class DocsSettingsTab extends PluginSettingTab {
  constructor(app: App, private readonly docsPlugin: DocsPlugin) {
    super(app, docsPlugin);
  }

  display(): void {
    const settings = this.docsPlugin.getSettings();
    this.containerEl.empty();

    new Setting(this.containerEl)
      .setName("Docs root")
      .setDesc("Vault folder that holds Docs notes.")
      .addText((text) =>
        text.setValue(settings.docsRoot).onChange((docsRoot) =>
          void this.update({ docsRoot }),
        ),
      );
  }

  private async update(patch: DocsPluginSettingsPatch): Promise<void> {
    try {
      await this.docsPlugin.updateSettings(patch);
      this.display();
    } catch (error) {
      new Notice(error instanceof Error ? error.message : String(error));
    }
  }
}
