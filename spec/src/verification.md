# Verification

| ID | Status | Evidence |
| --- | --- | --- |
| LPD-SPEC-001 | Implemented | `pnpm spec:build` builds the standalone mdBook. |
| LPD-SPEC-002 | Implemented | `pnpm spec:first` maps protected changes to canonical chapters. |
| LPD-SPEC-003 | Implemented | `pnpm spec:validate` enforces unique definitions and one verification row per ID. |
| LPD-SPEC-004 | Implemented | Manifest validation rejects non-portable protocols. |
| LPD-SPEC-005 | Implemented | `pnpm-workspace.yaml` uses `link:` overrides and pins CodeMirror and Lezer; the package is the only workspace member. |
| LPD-SPEC-006 | Implemented | Package scripts and supervisor smoke checks cover the checkout-owned 7040 lane. |
| LPD-SPEC-007 | Implemented | `AGENTS.md` defines App ownership and the required source audit. |
| LPD-SPEC-008 | Implemented | The repository taxonomy audit covers every story title under `Plugins/Docs`. |
| LPD-SPEC-009 | Implemented | Exact Storybook mirror validation covers every SUMMARY chapter. |
| LPD-SPEC-010 | Implemented | Canonical plugin chapters and stories use the `Plugins/Docs` hierarchy. |
| LPD-SPEC-011 | Implemented | `AGENTS.md` requires unrelated-work preservation, independently verified Jujutsu commits, and review-context messages. |
| LN-DOC-001 | Implemented | Package identity, manifest, build, and pack inspection. |
| LN-DOC-002 | Implemented | Plugin onload registers projection, views, commands, ribbon, and settings. |
| LN-DOC-003 | Implemented | Application-ownership audit excludes `globalThis.app`. |
| LN-DOC-004 | Implemented | Docs sources import public Design Core and Mira primitives with native Docs CSS. |
| LN-DOC-005 | Implemented | Published runtime excludes forbidden packages; Storybook may depend on workspace hosts. |
| LN-DOC-006 | Implemented | Storybook Vitest accessibility annotations fail axe violations; stories stay `visual-pending`. |
| LN-DOC-007 | Implemented | Hosts register DocsPlugin only; views come from plugin onload. |
| LN-DOC-008 | Implemented | Public `src/lib/index.ts` exports the plugin and view types. |
| LN-DOC-009 | Implemented | Autodocs stories set `parameters.docs.source` to public package imports. |
| LN-DOC-010 | Implemented | Flip-card and reference helpers are marked `DESIGN_CORE_CANDIDATE` in source and `PROVENANCE.md`. |
| LN-DOC-011 | Implemented | Core Docs UI omits practice panels; fixtures keep `coding-drill` as metadata with basic cards. |
| LN-DOC-012 | Implemented | Versioned settings store docs root defaulting to `docs`. |
| LN-DOC-013 | Implemented | Domain types and sample notes cover the required docTypes and id pattern. |
| LN-DOC-014 | Implemented | Unit tests cover parse/serialize and sample fixtures. |
| LN-DOC-015 | Implemented | Book helpers and sample index note declare chapter order. |
| LN-DOC-016 | Implemented | Graph helpers extract wiki links, backlinks, and tags. |
| LN-DOC-017 | Implemented | `sample.ts` ships fixtures only; vault corpus is not packaged. |
| LN-DOC-018 | Implemented | `docs-index` registers `docs/note` for `doc.md` under the docs root. |
| LN-DOC-019 | Implemented | View types and commands are registered in `DocsPlugin`. |
| LN-DOC-020 | Implemented | `DocsDocumentView` mounts Docs rich display; block Markdown uses Mira preview. |
| LN-DOC-021 | Implemented | Review flow writes FSRS updates through the docs repository. |
| LN-DOC-022 | Implemented | `Plugins/Docs/Shell` seeds `*.doc.md` fixtures and covers library plus document leaves. |
| LN-DOC-023 | Implemented | Cards UI filters to basic and cloze; FlipCardDeck drives review stacks. |
| LN-DOC-024 | Implemented | `fsrs.ts` and review constants cover queue and ratings. |
| LN-DOC-025 | Implemented | Cards and review views mount workspace-filling panels. |
| LN-DOC-026 | Implemented | FlipCardDeck and related candidates live under `src/lib/docs/candidates/`. |
| LN-DOC-027 | Implemented | `registerExtensions(["doc.md"])` and exclusive `*.doc.md` editor view. |
| LN-DOC-028 | Implemented | `DocsDocumentView` extends `TextFileView` with debounced vault writes. |
| LN-DOC-029 | Implemented | `DocsEditorPanel` remaps to design-core forms; missing controls are candidates. |
