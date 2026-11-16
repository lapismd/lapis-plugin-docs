# Docs source-owned version runtime guard

The preceding source cohort and audit decisions remain at dependency source
`07aceddc9584d5d2ea9b99f129f759a0cac7dff2` and reviewed PR17 source
`9e8e7ec23fc5d7f412f180e76ebcb3699a00cfed`. This adoption changes no manifest,
lock, Changesets note/config, source recipe, public output or audit policy.

## Actual whole-recipe proof

[Hosted run43828625633](https://github.com/lapismd/lapis-ci/actions/runs/43828625633)
succeeded on reviewed shared source
`7242eb3bf246c266ba4a48c50eaaf01c2950a37d` (Lapis CI PR13). The receipt SHA256 is
`0202c1dc370cfcccd4fe93da8ff71e4ff13c06376ae949a36ed363fabf8ec51b`.
All15 raw source hashes and exact inputBindings were independently matched
against the immutable source proposal; the operational receipt remains a
hosted/local artifact rather than tracked source.

The proof uses actual Node24.15.0, pnpm10.32.1 and CLI3.0.3. Setup is frozen,
scripts-disabled, strict-peer and ignore-pnpmfile. The existing fenced
disposable checkout establishes an exact selected-source local baseline;
it never changes a user's repository main ref or any remote branch.
Deno is absent during the whole command before and after mutation. No writer
App is minted, no package is published and no registry tag is promoted.

The existing `.changeset/docs-supported-host-cohort.md` is genuine current
minor intent, SHA256
`73146f3748d9ec807e59fc3c18fbe72b1e804c08ae5884cdeb147d4d8026cbc6`.
Its receipt labels currentReleaseIntent=true and genuine-pending-source;
there is no historical restoration or synthetic note. Actual status and
`pnpm release:version` prepare the root package0.2.2→0.3.0, change its changelog
and consume that note. All five custom outputs synchronize to0.3.0:
manifest.json, canonical Docs index, validator package-version pin, governance
version marker and README package-version marker. This qualifies version
preparation, not signing, publication or later registry-consumer acceptance.

## Source adoption

The source-owned `.github/versioning-runtime.json` copies only the exact
reviewed inputBindings from that receipt. It keeps CLI3.0.3, pnpm10.32.1,
Changesets config SHA256
`7dd5cd533dff2d3e2408b6091b11ce311f3709995b6b0a215dfed6ee24b309a7`,
and the exact `node scripts/release.mjs version` command. Stable recipe inputs:

- `scripts/release.mjs`: SHA256 `3d2c5b8e427aef5eecf00d4d196c64291672ff7424bd039c77489302750b2056`.
- `pnpm-workspace.yaml`: SHA256 `89f23dc78ff0cadc29c72400d720748299543e9a8bec41544eef667000dbb4e5`.

The shared action is pinned to that reviewed7242 commit and runs after the
strict frozen install and before the existing writer App mint/action. The
trusted main/validation boundary, read-only workflow token, nonpersisted
checkout, single App token path, unchanged custom recipe/config and original
publication approval/provenance gates remain intact. The input guard does not
require a pending note, mutate source or replace the Changesets action's normal
empty no-op. No guard implementation is copied and no Deno prerequisite or
formatter policy is adapted to fit it. The stale old guard bookmark remains
historical, not merged or used as evidence.

Two fresh parsed integration regressions fail2/2 before adoption: missing
pre-mint guard, and missing bound input data. They verify the reviewed pin,
ordering, original authority/recipe shape, and actual config/helper/workspace
hashes rather than inferring portability from source CI. The directly affected
source/tooling suite and canonical checks qualify this integration; the already
completed73-unit/13-cold-App+axe/static cohort acceptance is retained. No product,
story, presentation or shared browser infrastructure changes justify repeating
those cold browser lanes solely for this source integration.

## Independent advisory boundary

The exact development policy remains byte-identical. Its current manifest and
lock hashes still bind07ac dependency ancestry. A real version PR changes those
manifest/lock/source bindings, so that approval intentionally fails closed and
cannot transfer to0.3.0. The version recipe does not write or approve its policy.
Any later delegated decision needs separately qualified genuine version source,
graph and artifact evidence; every unknown finding, production exposure,
changed path, expired entry and known fix continues to block. The current raw
full audit retains one exact development LOW; production has zero findings.

## Adoption verification

The exact original two regressions pass2/2 after integration. The complete
source unit suite passes75/75, and `pnpm check` passes with0 Svelte errors and
0 warnings. All three canonical check lanes and mapped source-first checks
pass. The exact pinned7242 runtime entrypoint independently accepts the actual
installed CLI3/source bindings on Node24.19.0. Formatter and actionlint pass.
Doctor reports7 passes and the existing wrapper-alias warning; semantic search
reports its explicit QMD-disabled fallback. No new validator or tool version is
introduced. The unchanged pinned audit collector again reports temporary
acceptance for the sole bound development LOW, raw full exit1/production exit0.
The previous13 cold App/axe cases and static/package acceptance remain evidence
for the unchanged functional cohort; this workflow/data slice does not repeat
those browser runs or claim publication qualification.
