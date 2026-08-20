# Docs Runtime

The Docs plugin associates exclusive `*.doc.md` leaves, projects Docs notes,
mounts the library workspace, and opens file views for note, display, cards,
and FSRS review.

## Requirements

| ID | Requirement |
| --- | --- |
| LN-DOC-018 | The plugin MUST register a `docs/note` projection for `doc.md` files under the configured docs root and project only files that parse as Docs notes. |
| LN-DOC-019 | The main-area view type `docs` MUST mount the Docs library leaf. Commands MUST include `docs:open`, `docs:open-cards`, `docs:review-note`, and `docs:review-workspace`. |
| LN-DOC-020 | The exclusive `docs-document` file view MUST open `*.doc.md` notes from the vault. Structured reading MUST use Docs rich display CSS. Block Markdown fragments MAY render through public Mira preview. |
| LN-DOC-021 | Review ratings MUST update card FSRS fields in note front matter and write the note back to the vault. |
| LN-DOC-022 | Package Storybook MUST include `Plugins/Docs/Shell` stories that boot a public `App`, load `DocsPlugin`, seed `*.doc.md` fixtures, restore a `docs` leaf, and open a `docs-document` leaf for a sample file. |
| LN-DOC-027 | `DocsPlugin` MUST register extensions `doc.md` and an exclusive editor view for `*.doc.md` with view type `docs-document`. Longest-suffix routing MUST beat plain `md`. |
| LN-DOC-028 | `DocsDocumentView` MUST extend `TextFileView`, round-trip note Markdown through parse and serialize helpers, and debounce vault writes on form edits. |
| LN-DOC-029 | Note editing mode MUST use Docs form panels composed from public `@lapismd/design-core/forms` controls. Missing pickers MUST stay plugin-local `DESIGN_CORE_CANDIDATE` ports. |
