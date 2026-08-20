# Docs Runtime

The Docs plugin loads vault Markdown under the configured docs root, projects
Docs notes, and mounts workspace surfaces.

## Requirements

| ID | Requirement |
| --- | --- |
| LN-DOC-018 | The plugin MUST register a `docs/note` projection for Markdown under the configured docs root and project only files that parse as Docs notes. |
| LN-DOC-019 | The main-area view type `docs` MUST mount the Docs workspace leaf. Commands MUST include `docs:open`, `docs:open-cards`, `docs:review-note`, and `docs:review-workspace`. |
| LN-DOC-020 | Note display and editing modes MUST open Docs notes from the vault. Reading output MUST render through public Mira preview surfaces under the Lapis theme. |
| LN-DOC-021 | Review ratings MUST update card FSRS fields in note front matter and write the note back to the vault. |
| LN-DOC-022 | Package Storybook MUST include a `Plugins/Docs/Shell` story that boots a public `App`, loads Markdown hosts and `DocsPlugin`, seeds sample Docs notes, and restores a `docs` leaf. |
