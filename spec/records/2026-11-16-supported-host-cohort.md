# Supported Docs host cohort and development audit

## Public contract and release intent

The source baseline is Docs main `073f4a58ddcb414ad5ce93b4107c4262438290ff`.
The earlier security graph is retained at
`c5f1aac305d47e667d9fd6f38f4c5a8236dafe22`; its historical record is not current
peer qualification. This slice adopts released registry contracts: API0.6.6,
Design Core0.13.4, Mira0.2.0, Editor0.0.5, UI0.2.1 and Svelte5.56.10.
File Explorer0.2.8, Markdown0.3.2, Search0.1.12 and Workspace0.4.6 supply the
matching App-backed development hosts. Numeric package selections do not move
`next` or `latest` tags.

Editor0.0.5 and Mermaid plugin0.0.5 were published from Mira version source
`f0c18ff0aef5f48e3f3cfbb8f1b786c0ec6e0db4`; dedicated release run
[43811922461](https://github.com/lapismd/mira-mde/actions/runs/43811922461)
passed publication, installed/provenance verification and release notification.
The plugin supplies Mermaid12.3.0 and removes the old external ELK renderer.

Public peer floors become API^0.6.6, Core^0.13.4, Mira~0.2.0 and Editor~0.0.5;
Svelte remains5.56.10. Node22.12+ reflects the supported renderer minimum.
The old Core override and peer-warning suppression are removed. CodeMirror,
Lezer and date development versions align with the selected Core public graph.
Legacy API0.2.8/Core13/Mira2 is not supported: the old Docs archive rejects API6
under strict peers. A genuine minor Changeset prepares Docs0.3.0 through the
normal release recipe. No current package/version marker is manually bumped.

## Before/after evidence

The initial three source-cohort regressions failed3/3 before implementation.
The final host-cohort suite passes4/4 and dependency-security suite passes3/3;
App ownership passes1/1. Every hosted dependency installation, including Pages,
now requires strict peers, frozen lockfiles and disabled local pnpm hooks.

The first full cold Storybook attempt failed all5 suites before running any
story. A fresh Cards-only process with HAR/trace and Vite optimizer logging
reproduced1 failing suite/0 tests. HTTP requests succeeded; the browser reported
that dayjs CommonJS did not export default. The lock had retained plugin0.0.4
and Mermaid11 through Markdown's existing range, while Editor0.0.5 introduced
Mermaid12; the explicit Mermaid prebundle therefore covered the old closure.
A normal transitive update within the existing published range selected
plugin0.0.5 for every path. No override, alias, helper, story or assertion was
added to conceal the failure. The new lock regression rejects old renderer
paths and external ELK. The exact fresh Cards target passes1/1 afterward.

A fresh, owned empty-cache full Storybook process then passed5 files/13
interaction and accessibility tests. All221 recorded source-file hashes stayed
unchanged during that run; builds and specification writes were serialized
outside it. This is a graph correction, not an asserted runtime startup fix.
All73 unit tests pass. `pnpm check` reports0 Svelte errors/0 warnings and passes
App ownership, no-Tailwind, source governance and type checks. Package build,
publint and a separate cold static Storybook build pass. Chunk-size and existing
static-build diagnostics remain visible. No visual baseline or threshold changes.

A separately packed public archive installs with strict peers into an empty
registry consumer using the cohort above, without overrides or allowed peer
versions. Frozen replay passes and its complete production audit reports0.
The candidate archive is labelled validation input at its existing0.2.2;
only the normal version PR may prepare0.3.0. Its SHA256 is
`88c5da2534a365b10775d216513af7df9db2f1a0c381726916418d7654fe04d9`.
All103 public JS/Svelte/CSS files match the original archive byte-for-byte.
The public manifest nevertheless changes real peers, Node engine and date
runtime dependency3.12.2→3.12.4; the minor release intent is truthful metadata
and compatibility work, not a manufactured guard-test bump.

## Audit boundary and decision

Before remediation, the raw source full audit reported25 findings
(4LOW/11MODERATE/8HIGH/2CRITICAL); production was already affected with8 findings
(1LOW/3MODERATE/4HIGH). It was not previously clean. The fixed current graph's
raw full audit exits1 with exactly one LOW; production exits0 with no findings.
The repaired dependencies are external package dependencies, not bundled
runtime JS. Fresh packed consumer production acceptance is independently clean.

The sole remaining finding is
[GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4),
`deepmerge@4.3.1`, LOW, exact path
`.>@sveltejs/vite-plugin-svelte>deepmerge`, vulnerable range
`>=4.2.0 <=4.3.1`, no patched release (`<0.0.0`). It is a development build-tool
path absent from the clean production graph. Build-tool execution remains an
exposure; this is not a claim of no risk.

The pinned shared collector is Lapis CI
`2c756d802f95777a33980b8b1e74f6986498d86e`. It runs after frozen installation
and before Jujutsu selects a spec revision, preserving checked-out Git HEAD
for exact dependency-source discovery. Full/production raw JSON and its bounded
decision are retained even on failure. All original aggregate, package,
interaction, accessibility, release subject/provenance and immutable-publisher
gates remain required.

The dependency commit starts with approvals empty. After every functional and
static gate above passes, a separate decision may bind only this finding to
that immutable dependency source and exact manifest/lock hashes under the
user's standing delegation. This is a new delegated operator decision, not
hash-specific user approval and not a transfer of coordinator or Visual Delta
exceptions. Expiry is2026-11-21T00:00:00Z, or a published fix sooner. Any other
finding, production exposure, changed path/source/lock, unavailable evidence,
expired approval or known fix blocks admission; resolution retires the entry.

## Remaining qualification

The old runtime-guard bookmark remains preserved and unpushed. Its earlier
whole-recipe proof binds the old graph and is not claimed for this cohort.
After this immutable graph is reviewed, the unchanged custom CLI3 version
recipe needs a fresh shared hosted proof before guard adoption. No writer App,
publication, tag promotion, activation change or credential change occurs here.
Local raw logs/audits and HAR/trace evidence remain outside source under
the local `docs03-*` cache evidence; hosted CI supplies canonical clean-checkout gates.

## Bound delegated operator decision

After the full supported-cohort gates above passed, the exact shared collector
reproduced `blocked/unapproved-finding` with the initially empty policy on
2026-11-16T07:46:09.426Z. This decision authorizes only the described LOW under
the user's standing delegation, at2026-11-16T07:46:22.000Z, ending
2026-11-21T00:00:00.000Z or a known fix sooner. This is not an exact hash-specific
approval personally given by the user.

- Dependency source: `07aceddc9584d5d2ea9b99f129f759a0cac7dff2`.
- Manifest SHA256: `c42c00fc9614fb574556446887bb3bc736ee8e99c8c504b08d160911e58e62d6`.
- Lock SHA256: `de2cb227ba83e06423cb2b95c67c66dc80db8fcde600ef067f77fe2c62756a0f`.
- Authority: `delegated-operator`, limited to this development-only finding.

The subsequent real invocation at2026-11-16T07:46:59.481Z returned
`temporary-development-acceptance`, allowed=true, exactly one accepted finding,
raw full exit1 and production exit0. It re-read official upstream registry
metadata and revalidated the unchanged source, graph and policy after collection. Neither result may be described as a clean
full audit. Source changes, another finding, a newer stable upstream release,
a published patch, production exposure or expiry must block automatically.
