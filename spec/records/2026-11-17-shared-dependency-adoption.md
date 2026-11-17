# Docs shared dependency workflow preparation

This is a held source adoption under LPD-SPEC-020 and LPD-SPEC-021.
The coordinator entry remains `full`; Notebook remains the only active pilot.
No package version, public peer, runtime source, visual baseline or publication
authority changes. No new release note is added.

## Shared wiring and existing authority

Coordinator PR73 merged the exact CI/npm and Pages completion IDs/paths/events.
The caller and implementation both pin source
`2cef3b7fdf5e68012c3fa58b017822ea8b218230`. Only the explicit existing App
secret is passed; no candidate checkout, artifact, cache or callback self-trigger
is admitted. The read-only existing-App probe
[44162254578](https://github.com/lapismd/dependency-automation/actions/runs/44162254578)
succeeded without key retrieval, copying or rotation. Current open issues/PRs
were empty before this adoption. Historical main CI/Pages were green.

## Source qualification

Before implementation `pnpm check:dependency-intake` failed because the task
did not exist (one missing-feature failure). The new independent offline guard
passes current source and the actual pnpm Core0.13.4→0.13.5 lock regeneration
against the shared preparer. All15 focused regressions pass, including stale or
ambiguous facts, changed policy, public contract/catalog drift, unrelated
peer-context edges, prefix-sharing identities and immutable integrity changes.
The compressed fixture contains this repository's actual before/after files;
it is not a renamed Notebook graph. Public peers remain unchanged.

The reviewed Node24 runtime guard is pinned to Lapis CI
`dd71275c5b2618afceae0b97ee0a071649781971`. The development workspace policy
binds every byte except one supported Core0.13 development patch coordinate.
All original release/config/helper hashes remain bound. It runs before merge
and again before the existing writer boundary. The installed CLI3.0.3 and exact
package manager accept current source with intent=false. In a separate isolated
copy, an uncommitted-to-source genuine patch note yields intent=true and the
actual unchanged `pnpm release:version` succeeds. No publication occurs.
This local proof does not claim a current-source hosted release-job receipt.

Doctor and actual QMD search succeed. The guard remains in ordinary check/quality
and canonical aggregate lanes outside bot specification exemptions.

## Required security hold

Fresh full audit reports **one HIGH** GHSA-fc5q-39xc-vjpf, picomatch4.0.7 at
`.>@changesets/cli>@changesets/config>picomatch`; production audit has zero
findings. No patched version is recorded (`<0.0.0`), and the current Changesets
CLI/config releases still use this dependency. The version workflow can execute
this tooling with a repository-scoped writer App, so production cleanliness
alone does not waive the finding. The separately approved coordinator paths
do not authorize this consumer path. No new exception or weakened audit is added.
All required audit, functional, accessibility, publication and ownership gates
remain blocking. Merge, callback settlement and per-entry writer activation
remain pending until those gates and source acceptance pass.

## Input receipts

- `package.json` SHA256 `2c86428e3288b9fe9c52ec43bccdd418e860482ae992358a189e8471e443b4da`
- `pnpm-lock.yaml` SHA256 `a4de8f38490964aa14a7cce5916f24b2fbfb06dafb38480c0360b5825d9e381e`
- `.github/dependency-automation/canonical-intake.json` SHA256 `a2723a9eb60f2e64b845adbfece1d5fba7bab4117d4ec4fa3e8c5b016cae9052`
- `scripts/fixtures/core-intake.json.gz` SHA256 `06a76d1ca736d68adc94fd8be9ded278da4f28c73c24a01480981135f842443a`

## Completed local lanes and source-owned normalization

`pnpm spec:check`, `pnpm check`, `pnpm test` (104/104), `pnpm build`
(including publint), `pnpm build-storybook`, the fresh `pnpm test:storybook`
(13/13) and actionlint pass. The original full-suite workflow-contract failures
were2/100 after adopting the new shared guard; updated exact pin/workspace
contract assertions now pass in the104-test suite. The15 focused intake cases
had two fixture-assumption errors during authoring; both were repaired against
this repository's real graph, and final15/15 pass without weaker assertions.

pnpm10.32.1 preferred the package-level override map over workspace overrides.
The five unchanged security override selectors/values are consolidated into
`pnpm-workspace.yaml` beside the existing catalog overrides and exact Core pin.
Actual pnpm regeneration normalizes peer metadata, removes stale minimatch11.0.5
and aligns glob14.0.6 to the already-present minimatch11.0.8. The final frozen
registry install passes. Repeating the actual forward Core patch then has no
unrelated graph changes and passes both independent and coordinator guards.
The old LOW audit approval is not rewritten or transferred to the new inputs.
The fresh HIGH audit remains blocking and this source PR stays draft.
