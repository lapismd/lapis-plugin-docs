# Docs Plugin

`@lapis-notes/lapis-plugin-docs` owns the first-party external Docs catalog and
plugin runtime. A Docs note is a `*.doc.md` Markdown file with YAML front matter
under a configurable vault root. The filesystem is authoritative. The plugin
registers a `docs/note` projection, a movable Docs sidebar tree, exclusive
`docs-document` file views, note reading modes, cards, and FSRS review. Coding
practice is out of scope. Hosted CI uses the same pinned image and blocking
lanes as Tasks and Notebook.

Reusable leaf controls come from public Design Core APIs. Markdown reading uses
the host `MarkdownRenderer` when the app provides one, and otherwise public Mira
preview with Mira editor extensions. Near-miss shared UI such as
flip-card decks MUST be owned in this package and marked as design-core
migration candidates.

## Requirements

| ID | Requirement |
| --- | --- |
| LN-DOC-001 | The standalone repository MUST ship `@lapis-notes/lapis-plugin-docs` as a versioned first-party external package whose runtime manifest id is `docs`, distribution is `first-party-external`, provenance is `official`, and `enabledByDefault` is `true`. Release package and runtime manifest version: `0.1.1`. |
| LN-DOC-002 | `DocsPlugin` MUST extend the public API `Plugin` surface. `onload` MUST register the docs projection, the movable `docs` sidebar tree docked on the left by default, the exclusive `docs-document` file view, note/cards/review surfaces on that document, `docs:open`, ribbon, and Docs settings governed by LN-DOC-012. The Docs, Folders, Links, and Tags switch MUST use the design-core button, mark the selected view, and truncate its labels when space is limited. Due and Review all MUST include icons. |
| LN-DOC-003 | Production and Storybook source MUST receive `App` explicitly or from API context and MUST NOT read or assign `globalThis.app`. |
| LN-DOC-004 | The package MUST own Core Docs workspace components and native `--ui-docs-*` CSS. Reusable leaf controls MUST come from public `@lapismd/design-core` exports. Structured Docs reading MUST keep Docs rich display CSS. Block Markdown MUST use the host `MarkdownRenderer` when the app provides one, and otherwise MAY use public `@lapismd/mira` preview with extensions from public `@lapismd/mira-editor`. Anki package reading MUST use registry `fflate` and `@libsql/client` ranges. |
| LN-DOC-005 | The published runtime MUST NOT depend on `/Users/stevejuma/code/cv`, `@cvstudio/*`, Carta, or coding-practice host services. Package Storybook MAY depend on `@lapis-notes/workspace`, File Explorer, Search, and Markdown for shell stories. |
| LN-DOC-006 | Package Storybook MUST run on port 7040, build as a static site without executing desktop-only Anki imports, compile Svelte stories in Vitest, fail `pnpm test:storybook` on axe violations, and keep changed visual stories `visual-pending`. Registry media capture stories MUST be deterministic and MUST NOT require Visual Delta setup or baselines. `Plugins/Docs/Cards` MUST render the document card preview. |
| LN-DOC-007 | Desktop and web hosts MUST register and load this plugin. They MUST NOT register Docs workspace views, commands, or ribbon items themselves. |
| LN-DOC-008 | The public package export MUST include `DocsPlugin`, Docs view types including `docs-document`, and Core Docs workspace surfaces. |
| LN-DOC-009 | Autodocs Show Code MUST use public `@lapis-notes/lapis-plugin-docs` imports, not story-only harness wrappers. |
| LN-DOC-010 | Near-miss shared presentation such as flip-card decks MUST be recreated in this package, marked `DESIGN_CORE_CANDIDATE`, and MUST NOT add Design Core APIs from this repository. |
| LN-DOC-011 | Coding practice panels, Piston runners, LSP sidecars, timed sessions, and AI coach surfaces MUST NOT ship in Core Docs. The document toolbar MUST NOT include a Practice action. `coding-drill` MAY remain a note `docType` metadata value. |
| LN-DOC-012 | Docs plugin data MUST be versioned and MAY store the docs vault root path. The default root MUST be `docs`. Settings MUST migrate absent data to defaults and notify open Docs views after persistence. |
