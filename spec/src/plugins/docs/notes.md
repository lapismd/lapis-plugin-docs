# Docs Notes

Docs notes are Markdown files with YAML front matter. Notes may contain
structured blocks, freeform body text, cards, tags, aliases, and book metadata.

## Requirements

| ID         | Requirement                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LN-DOC-013 | Note ids MUST match `^[a-z0-9][a-z0-9-]{0,79}$`. Supported `docType` values MUST include `revision`, `coding-drill`, `system-design`, `story-bank`, `index`, and `freeform`. |
| LN-DOC-014 | Notes MUST round-trip through Docs parse and serialize helpers while preserving supported front-matter fields and body Markdown. Card `sourceRefs` and `source_refs` are not supported fields and MUST be dropped. |
| LN-DOC-015 | Books MUST derive chapter navigation from index notes that declare `book.chapters`. Chapter next and previous MUST resolve from that order. Chapter controls MUST open the target note in the current leaf. |
| LN-DOC-016 | Wiki links, backlinks, and tags MUST be derived from note content and front matter through the Docs graph helpers.                                                           |
| LN-DOC-017 | Package fixtures MUST ship only Core Docs sample notes as `*.doc.md` paths under `docs/`. Production vault corpora MUST NOT be packaged.                                     |

The frozen projection oracle also exercises these retained parsing rules.
Projection-only native work preserves rejection caused by card, coding, book
and block validation, even when those values are absent from the projected row.
It does not introduce a second note editor, serializer or FSRS scheduler.

The private native projection retains JavaScript string-number coercion and
whitespace rules, including `NaN`/`Infinity` and U+0085 being significant text.
Typed coding literals still require safe integers and the declared array
dimensions. Stable domain error messages and evaluation order remain part of
the retained projection contract.
