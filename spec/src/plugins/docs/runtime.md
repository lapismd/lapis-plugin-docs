# Docs Runtime

The Docs plugin associates exclusive `*.doc.md` leaves, projects Docs notes,
mounts the library workspace, and opens file views for note, display, cards,
and FSRS review.

## Requirements

| ID         | Requirement                                                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LN-DOC-018 | The plugin MUST register a `docs/note` projection for `doc.md` files under the configured docs root and project only files that parse as Docs notes.                                                                                                                                                                                                                                      |
| LN-DOC-019 | The main-area view type `docs` MUST mount the Docs library leaf. Commands MUST include `docs:open`, `docs:open-cards`, `docs:review-note`, and `docs:review-workspace`.                                                                                                                                                                                                                   |
| LN-DOC-020 | The exclusive `docs-document` file view MUST open `*.doc.md` notes from the vault. Structured reading MUST use Docs rich display CSS. Block Markdown fragments MUST use the host `MarkdownRenderer` when the app provides one. Otherwise they MAY render through public Mira preview with the Lapis Markdown extension set, including Mermaid and host-registered Markdown plugins. Rendered Mira surfaces MUST inherit the parent background, and rendered Markdown MUST NOT keep Mira's default bottom padding. Heading outline clicks MUST scroll within the note. |
| LN-DOC-021 | Review ratings MUST update card FSRS fields in note front matter and write the note back to the vault.                                                                                                                                                                                                                                                                                    |
| LN-DOC-022 | Package Storybook MUST include `Plugins/Docs/Shell` stories that boot a public `App`, load `DocsPlugin`, and seed the copied sample-docs book as `*.doc.md` fixtures. The seeded `.lapis/workspace.json` MUST restore a `docs` leaf, keep the right sidebar closed, and open `docs/sample-docs/index.doc.md` as the active `docs-document` leaf. The story MUST record the CV comparison URL for that index. |
| LN-DOC-027 | `DocsPlugin` MUST register extensions `doc.md` and an exclusive editor view for `*.doc.md` with view type `docs-document`. Longest-suffix routing MUST beat plain `md`.                                                                                                                                                                                                                   |
| LN-DOC-028 | `DocsDocumentView` MUST extend `TextFileView`, round-trip note Markdown through parse and serialize helpers, and debounce vault writes on form edits.                                                                                                                                                                                                                                     |
| LN-DOC-029 | Note editing mode MUST use Docs form panels composed from public `@lapismd/design-core/forms` controls. Markdown prose fields, including card answers, MUST use `@lapismd/design-core/chat` `MarkdownComposer` in document mode with the send control omitted. Missing pickers MUST stay plugin-local `DESIGN_CORE_CANDIDATE` ports. |
| LN-DOC-030 | The planned private Docs-owned native projection MUST preserve the retained registration schema, root normalization, seven `docs/note` row fields and parser rejection behavior. Notes MUST retain source admission and publication authority. Native API implementation MUST wait for confirmation of the exports in `NATIVE-PROJECTION.md`; UI and FSRS scheduling remain out of scope. |
| LN-DOC-031 | Native projection parity MUST be measured against a frozen oracle executed from unchanged retained TypeScript sources, pinned dependency versions and recorded source hashes. The oracle MUST include registration, host source matching, projected values, parser errors and Core Docs samples. Oracle evidence MUST NOT claim native or host integration acceptance.                    |
| LN-DOC-032 | The private native crate MUST remain unpublished and accept only source text, source paths and root JSON. It MUST return projection data or an error without filesystem, network, database, host lifecycle, UI or scheduling authority. Its YAML 1.2 reader MUST retain numeric types until Docs string coercion and preserve literal Unicode source content.                             |
| LN-DOC-033 | The document leaf MUST present the reading body directly, without Column Canvas. Reading actions MUST live in the body header. The leaf MUST omit in-view history controls. The heading outline and book progress MUST stay inside the reading body, along its right edge, with the progress ring just above the outline rail. Chapter targets MUST open in the current leaf through workspace history. |

## Native projection preparation

[The bounded native projection proposal](../../../../NATIVE-PROJECTION.md)
records task `R3.2.1.2.11`, proposed exports, retained parser details and remaining
acceptance gates. `fixtures/native-projection/oracle.jsonl` is the retained
TypeScript baseline. Its source/dependency receipt is separate from native
implementation evidence. The approved YAML diagnostic adaptation preserves
rejection category and source location while allowing Rust parser-native prose;
stable Docs validation messages retain exact parity.

`crates/lapis-docs-projection` implements the confirmed pure boundary. The pinned
`saphyr` reader retains ordered YAML values, duplicate-key rejection, aliases,
quoted strings, non-finite numbers and literal U+0085. The crate owns Docs
normalization and rejection rules; it does not infer file admission or publish
rows. Native qualification covers 155 registration/projection scenarios from
the frozen oracle; its 12 host source-matching scenarios remain a separate
unchanged-TypeScript gate. Notes consumer integration remains a later slice.
