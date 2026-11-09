import {
  defineConfig,
  singleIdVerification,
  tableRequirements,
} from "@lapismd/spec-validator";

export default defineConfig(tableRequirements(), {
  name: "lapis-plugin-docs",
  idPattern: /^(?:LN-DOC|LPD-SPEC)-\d{3}$/,
  ruleIds: {
    summary: "LPD-SPEC-001",
    governance: "LPD-SPEC-003",
    verification: "LPD-SPEC-003",
    book: "LPD-SPEC-001",
    bookIgnore: "LPD-SPEC-001",
    packageManifest: "LN-DOC-001",
    storybookMirrors: "LPD-SPEC-009",
    specFirst: "LPD-SPEC-002",
    internal: "LPD-SPEC-003",
  },
  diagnostics: {
    "SPEC-PKG-PORTABLE": "LPD-SPEC-004",
    "SPEC-PKG-MANIFEST-MISSING": "LN-DOC-001",
    "SPEC-PKG-MANIFEST": "LN-DOC-001",
    "DOCS-STORY-TAXONOMY": "LPD-SPEC-008",
  },
  validators: {
    summary: true,
    governance: {
      acceptance: false,
      normative: true,
      proseLimits: false,
      references: true,
      changeMap: false,
    },
    verification: singleIdVerification({
      headers: {
        ids: ["ID"],
        status: ["Status"],
        evidence: ["Evidence"],
        required: [],
      },
      statuses: ["Implemented", "Planned", "Visual pending"],
    }),
    book: true,
    storybookMirrors: {
      style: "src-spec-mdx",
      directory: "stories/spec",
      titlePrefix: "Specification",
      verifyTarget: true,
      verifyTitle: true,
      verifyContent: true,
      previewPath: ".storybook/preview.ts",
      verifyOrder: true,
    },
    packageManifest: {
      name: "@lapis-notes/lapis-plugin-docs",
      version: "0.2.0",
      privateAllowed: false,
      portableDependencies: true,
      manifestPath: "manifest.json",
      manifest: {
        id: "docs",
        distribution: "first-party-external",
        provenance: "official",
        enabledByDefault: true,
      },
    },
    specFirst: {
      mode: "mapped",
      canonicalPattern:
        "^spec/src/(?:plugins/(?:index|docs/(?:index|notes|runtime|cards))|spec-governance)\\.md$",
      ignore: [
        "(^|/)node_modules/",
        "(^|/)(?:dist|build|storybook-static)/",
        "^spec/book/",
        "^spec/src/(?:SUMMARY|verification)\\.md$",
        "^CHANGELOG\\.md$",
        "\\.(?:spec|test)\\.[cm]?[jt]sx?$",
      ],
      rules: [
        {
          pattern:
            "^(?:crates/|scripts/native-projection/|fixtures/native-projection/|NATIVE-PROJECTION\\.md$)",
          chapters: ["spec/src/plugins/docs/runtime.md"],
        },
        {
          pattern:
            "^src/lib/model/(?:types|markdown|markdown-normalize|sample|index)\\.",
          chapters: ["spec/src/plugins/docs/notes.md"],
        },
        {
          pattern:
            "^src/lib/model/(?:book|graph|workspace|docs-note-list|docs-relative-media|docs-media-context|coding-runtime|reference-utils)\\.",
          chapters: ["spec/src/plugins/docs/notes.md"],
        },
        {
          pattern:
            "^src/lib/model/(?:fsrs|docs-review-constants|docs-card-context|docs-card-preview-stack-motion)\\.",
          chapters: ["spec/src/plugins/docs/cards.md"],
        },
        {
          pattern:
            "^(?:src/lib/(?:docs-plugin|docs-view|docs-cards-view|docs-review-view|docs-document-view|docs-document-workspace|docs-path|docs-settings|docs-settings-tab|docs-repository|docs-index)\\.|src/lib/docs-workspace\\.svelte$|src/lib/docs/)",
          chapters: ["spec/src/plugins/docs/runtime.md"],
        },
        {
          pattern:
            "^(?:package\\.json$|manifest\\.json$|\\.storybook/|src/(?!lib/model/|lib/docs-plugin\\.|lib/docs-view\\.|lib/docs-cards-view\\.|lib/docs-review-view\\.|lib/docs-document-view\\.|lib/docs-document-workspace\\.|lib/docs-path\\.|lib/docs-settings|lib/docs-repository\\.|lib/docs-index\\.|lib/docs-workspace\\.svelte$|lib/docs/))",
          chapters: ["spec/src/plugins/docs/index.md"],
        },
        {
          pattern:
            "^(?:pnpm-|scripts/|\\.changeset/|\\.gitignore$|\\.github/|AGENTS\\.md$|spec-validator\\.config\\.mjs$|PROVENANCE\\.md$|README\\.md$)",
          chapters: ["spec/src/spec-governance.md"],
        },
      ],
      protected: [
        "^(?:package\\.json$|manifest\\.json$|src/|crates/|fixtures/native-projection/|NATIVE-PROJECTION\\.md$|\\.storybook/|pnpm-|scripts/|\\.changeset/config\\.json$|\\.gitignore$|\\.github/|AGENTS\\.md$|spec-validator\\.config\\.mjs$|PROVENANCE\\.md$)",
      ],
    },
  },
  plugins: ["scripts/spec-validation/storybook-taxonomy-audit.mjs"],
});
