# Native Docs projection contract and progress

Task: `R3.2.1.2.11`. Updated: **2026-10-25 23:15:58 UTC**. Status: native source
qualified; Notes host integration and package tooling intake remain pending.
The canonical contract is
[Docs Runtime](spec/src/plugins/docs/runtime.md). This proposal does not expose
or approve a published API. The user authorized routine scoped backlog
decisions, and the coordinating lane approved the private exports below.

## Bounded outcome

Move the pure `docs/note` projection algorithm into a private Docs-owned Rust
crate. Preserve the retained `createDocsProjectionRegistration` and
`parseDocsNoteMarkdownFile` behavior. Notes continues to own vault admission,
source matching, index publication, database writes and plugin lifecycle.

This slice excludes Docs UI, file editing, serialization, links/backlinks, book
navigation, FSRS scheduling/review writes, host routing and new features. It
does include existing parse rejection rules that can prevent a projection row.

## Approved private exports

Package: `lapis-docs-projection`, with `publish = false`, located at
`crates/lapis-docs-projection`. No npm entry point changes are proposed.

```rust
pub fn registration(docs_root: &serde_json::Value) -> serde_json::Value;

pub fn project_note(
    path: &str,
    content: &str,
) -> Result<serde_json::Value, ProjectionError>;

pub struct ProjectionError {
    pub message: String,
}
```

`ProjectionError` implements `Display` and `std::error::Error`. No file-system,
network, database, clock, Tauri or host configuration handle crosses this
boundary. The native crate does not start a process or publish an index row.
The coordinating lane confirmed these scoped exports before implementation.

## Registration and source ownership

The registration has local id `note`, version `1`, visibility `public` and
source `{ extensions: ["doc.md"], pathPrefix: normalizedRoot }`. The host
qualifies it as `docs/note`.

Root normalization accepts a JSON value, uses `docs` for non-strings, trims
JavaScript whitespace and leading/trailing forward slashes, then uses `docs`
if empty. It does not collapse interior separators, backslashes, dot segments
or case. These retained details do not grant filesystem authority.

The host's unchanged `matchesProjectionSource` matches its supplied extension
case-insensitively after removing one leading dot. It matches the normalized
root exactly or followed by `/`; it does not infer extensions from filenames,
case-fold paths or normalize backslashes. The projection callback itself does
not repeat matching. The oracle records this separation; the private crate
does not export a competing matcher.

Fields retain these exact definitions and names:

| Field     | Type   | Indexed | Cardinality |
| --------- | ------ | ------- | ----------- |
| id        | string | true    | omitted     |
| title     | string | true    | omitted     |
| docType   | string | true    | omitted     |
| path      | path   | true    | omitted     |
| tags      | string | true    | many        |
| cardCount | number | false   | omitted     |
| bookId    | string | true    | omitted     |

## Row and parser parity

A successful projection returns one row with the parsed note id, kind `note`
and exactly seven data fields. `edges` is empty. `path` preserves the supplied
source path, `cardCount` counts normalized cards, and a missing/invalid `bookId`
becomes an empty string. No timestamp is projected.

Frontmatter is recognized only by the retained anchored delimiter expression.
The parser accepts YAML mappings and treats other document shapes as empty
frontmatter. String coercion accepts strings and JavaScript numbers, but not
booleans, arrays or objects. Tags are trimmed, deduplicated in first-seen order
and omit empty values. Camel-case aliases win unless nullish.

Missing ids derive from the final forward-slash path component after removing
only `.md` or `.markdown`. Slugging lowercases, replaces non-ASCII-alphanumeric
runs with hyphens, trims hyphens and truncates to 72 characters. Explicit ids
must match `^[a-z0-9][a-z0-9-]{0,79}$`. A missing title uses the slugged path,
including its retained `.doc` portion, with hyphens replaced by spaces.

Supported doc types are `revision`, `coding-drill`, `system-design`,
`story-bank`, `index` and `freeform`; other values become `revision`.

The existing parser validates cards, coding exercises, book chapters and
blocks even though most of those fields are not projected. Invalid identifiers,
duplicate coding parameters/test cases/hints/languages/solutions, unsupported
languages, argument counts and typed coding literals retain their rejection
behavior and stable domain error messages. Error order is observable: note id,
cards/coding metadata, book chapters, then blocks. FSRS scheduling is excluded;
parse-only acceptance of its metadata remains covered by the oracle.

Malformed YAML remains a projection failure. The frozen oracle records the
retained parser's error name, code, message and `String(error)`. The retained
Notes host publishes `error.message` for Error instances, not the stringified
`Error:` prefix. The approved diagnostic adaptation preserves YAML rejection
category and source location while allowing parser-native diagnostic prose.
Stable Docs domain messages still match exactly. Original and native YAML
diagnostics remain visible in acceptance evidence; byte-identical third-party
diagnostic prose is not a claimed guarantee.

## Frozen oracle and acceptance

`scripts/native-projection/cases.mjs` defines independent deterministic inputs.
The oracle executes unchanged retained TypeScript exports from the frozen
source revision. The source receipt hashes the complete Docs model import
surface, registration/settings modules and the host's matching module.
`fixtures/native-projection/oracle.jsonl` records each input and observed result.
`scripts/native-projection/oracle.mjs` checks regeneration byte-for-byte; it
does not update expected output unless explicitly passed `--write`.

Oracle dependencies use their retained lockfile versions in a separate pinned
Docker worker. Temporary dependency installation and source staging are not
publishable manifest changes. The main checkout's pending dependency edits
remain outside this slice, so this evidence cannot close package tooling intake.

Implementation acceptance requires the unchanged oracle to pass against Rust,
native unit/error tests, formatting, strict Clippy, standalone specification
validation and all applicable package checks. A later Notes slice owns host
admission/publication integration and consumer parity. No native implementation,
host acceptance or migration completion is claimed by the frozen oracle.

## Oracle preparation evidence

The pinned Docker worker froze and independently regenerated 167 scenarios:
122 accepted outputs and 45 intentional parser rejections. All 19 retained
Docs source hashes and the actual host matching module were checked before
bundling. Four quoted/plain/block/JSON cases preserve literal U+0085 bytes.
The unknown-tag case retains the original parser's non-failing warning.

Commands executed inside the single worker:

```sh
node scripts/native-projection/build-oracle.mjs \
  --host-source /worker/input/host/index-projection.ts \
  --output /worker/oracle-bundle.mjs
node scripts/native-projection/oracle.mjs --module /worker/oracle-bundle.mjs
spec-validator validate
spec-validator first
spec-validator check
```

Standalone validation passed seven validators, seven chapters and 43
requirements. Spec-first passed nine protected files and three canonical
chapters. The check lane also built mdBook. Changed Markdown, JavaScript and
JSON formatting passed with the pinned worker formatter.

Package-wide TypeScript/Svelte, unit, build and publint lanes are not claimed
by this preparation slice. Default `package.json` and `pnpm-lock.yaml` remain
unrelated dirty intake work; neither file is changed in this workspace. Native
source qualification is recorded separately below.

## Native source qualification

The private `crates/lapis-docs-projection` crate implements the confirmed
registration and projection exports. Its modules separate schema, note
projection, value coercion and coding metadata validation. It retains parse
rejection without implementing unused UI/scheduling outputs or moving host
admission/publication into the plugin.

Pinned `saphyr` 0.3.0 exposes typed YAML 1.2 values. Docs retains non-finite
numbers until its JavaScript-compatible string conversion and uses the exact
JavaScript whitespace set. The retained literal U+0085, alias, duplicate-key,
unknown-tag and Core Docs sample cases pass. No TypeScript runtime source or
npm dependency changes are part of the native slice.

The native integration test exercises 155 frozen registration/projection
scenarios: 110 accepted outcomes, 42 exact domain failures and three YAML
syntax failures with the approved diagnostic adaptation. The 12 host matching
cases are exercised separately by the unchanged TypeScript oracle; they are
not counted as native matching implementation. The initial candidate reader
had two non-finite scalar mismatches; the selected typed reader has zero.

`fixtures/native-projection/native-yaml-diagnostics.json` records original and
native diagnostics for malformed flow syntax, duplicate keys and multiple
documents. Tests require the corresponding rejection category and source
location rather than accepting an arbitrary error. The malformed-flow EOF
position is the same source boundary with parser-native line rendering.

All commands below passed in the single pinned 4 CPU/12 GiB Docker worker:

```sh
cargo test --manifest-path crates/lapis-docs-projection/Cargo.toml \
  --locked --all-features
cargo clippy --manifest-path crates/lapis-docs-projection/Cargo.toml \
  --locked --all-targets --all-features -- -D warnings
cargo fmt --manifest-path crates/lapis-docs-projection/Cargo.toml --check
```

Standalone specification validate/spec-first/check and mdBook, changed-file
formatting, the unchanged 167-case TypeScript oracle and retained source hash
checks also pass. Rust source files are at most 137 lines; the oracle test is
84 lines. The original TypeScript oracle SHA-256 remains
`28d56eca760ccd5cb37940bb6883a490cbcb3831c67bc198396e1aa943487bbd`.

This closes the Docs-owned source prerequisite. Notes still needs to consume
the crate while preserving its vault policy, database authority and plugin
lifecycle. Full npm package tooling intake remains distinct and pending; no
host, UI, release or consumer qualification is claimed here.
