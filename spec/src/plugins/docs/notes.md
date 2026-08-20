# Docs Notes

Docs notes are Markdown files with YAML front matter. Notes may contain
structured blocks, freeform body text, cards, tags, aliases, and book metadata.

## Requirements

| ID | Requirement |
| --- | --- |
| LN-DOC-013 | Note ids MUST match `^[a-z0-9][a-z0-9-]{0,79}$`. Supported `docType` values MUST include `revision`, `coding-drill`, `system-design`, `story-bank`, `index`, and `freeform`. |
| LN-DOC-014 | Notes MUST round-trip through Docs parse and serialize helpers while preserving supported front-matter fields and body Markdown. |
| LN-DOC-015 | Books MUST derive chapter navigation from index notes that declare `book.chapters`. Chapter next and previous MUST resolve from that order. |
| LN-DOC-016 | Wiki links, backlinks, and tags MUST be derived from note content and front matter through the Docs graph helpers. |
| LN-DOC-017 | Package fixtures MUST ship only Core Docs sample notes as `*.doc.md` paths under `docs/`. Production vault corpora MUST NOT be packaged. |
