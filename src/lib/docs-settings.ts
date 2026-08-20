export const DOCS_PLUGIN_DATA_VERSION = 1 as const;

export type DocsPluginSettings = {
  docsRoot: string;
};

export type DocsPluginSettingsPatch = {
  docsRoot?: string;
};

export type DocsPluginDataV1 = {
  version: typeof DOCS_PLUGIN_DATA_VERSION;
  settings: DocsPluginSettings;
};

export const DEFAULT_DOCS_PLUGIN_SETTINGS: DocsPluginSettings = Object.freeze({
  docsRoot: "docs",
});

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeDocsRoot(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_DOCS_PLUGIN_SETTINGS.docsRoot;
  const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
  return trimmed || DEFAULT_DOCS_PLUGIN_SETTINGS.docsRoot;
}

export function cloneDocsPluginSettings(
  settings: DocsPluginSettings,
): DocsPluginSettings {
  return { docsRoot: settings.docsRoot };
}

export function mergeDocsPluginSettings(value: unknown): DocsPluginSettings {
  const stored = recordValue(value);
  return {
    docsRoot: normalizeDocsRoot(stored.docsRoot),
  };
}

export function patchDocsPluginSettings(
  settings: DocsPluginSettings,
  patch: DocsPluginSettingsPatch,
): DocsPluginSettings {
  return {
    docsRoot:
      patch.docsRoot !== undefined
        ? normalizeDocsRoot(patch.docsRoot)
        : settings.docsRoot,
  };
}

export function migrateDocsPluginData(value: unknown): DocsPluginDataV1 {
  const stored = recordValue(value);
  return {
    version: DOCS_PLUGIN_DATA_VERSION,
    settings: mergeDocsPluginSettings(stored.settings ?? stored),
  };
}
