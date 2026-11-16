# Docs shared registry readiness

This independently verified maintenance slice is based on main
`9286d2f02b2172835eddb689a128a4f30a111d47`. Requirements LPD-SPEC-015,
LPD-SPEC-019 and LN-DOC-001 retain the published 0.3.0 package, runtime identity
and host contracts. The empty maintenance note creates no release intent.

## Exact regressions

On Node 24.15.0 and source-owned pnpm 10.32.1, the following exact targets each
reproduced one failure before implementation and passed one test afterward:

- `pnpm exec vitest run --project unit scripts/release-install-readiness.test.mjs -t 'binds installation readiness'`
  (four other cases unselected).
- `pnpm exec vitest run --project unit scripts/release-install-integration.test.mjs -t 'skip-different installation'`
  (three other cases unselected).

The latter demonstrates the existing receipt defect: local candidate SHA512
was reported even when independently verified published bytes differed.
Installation and the receipt now use the verified published identity. Strict
candidate mismatches, tampered bytes and missing source-pinned setup stop before
acceptance commands. Full affected release validation passes 27 tests across
six files. The full unit lane passes 84 tests, with zero remaining failures.

## Shared source and preserved gates

The immutable setup points to Lapis CI
`c9fed365342109997587bd9a5a3b63066e8373aa`, preserving the actual publisher's
npm 12.0.2, strict peers and disabled lifecycle scripts. The shared source owns
install-v1 observation, exact propagation-error classification, fresh per-attempt
caches, bounded owned process teardown and read-only retries. Docs owns a single
60-second monotonic budget covering full-version observation, tarball download
and initial installation; it cannot restart the grace window at each phase.
The existing twelve-probe, five-second observation cadence remains bounded.
Frozen npm ci, strict peers, signature audit, provenance, publint, immutable
publication and skip-different behavior remain blocking. No upload retry is
introduced.

The required validator update changes only the released Deno-free development
resolution from 0.2.0 to 0.2.1. Doctor passes with the existing deliberate script
alias warning. Semantic search reports QMD disabled and falls back to repository
rg discovery; the owning canonical governance and verification were read and
updated. No runtime dependency or public release intent changes.

## Local verification and pending deployment

`pnpm spec:check` passes all three specification lanes and the App ownership
audit. `pnpm check`, `pnpm test`, `pnpm build`, `pnpm publint`, formatting and
actionlint pass. No stories, presentation or shared browser infrastructure
changed. Full pnpm audit retains exactly the unfixed development-only LOW
GHSA-gcqx-w48m-w2h4; production audit has zero findings. The old audit decision
is not transferred to the new source/manifest/lock binding.

The new imported helper is included in the proposed three-file version-runtime
closure. Those hashes are review input, not an actual whole-recipe receipt.
Before merge: land and qualify shared CI, run the actual main-hosted Docs
version recipe against these exact source inputs, inspect all five coordinated
metadata outputs and unchanged dependency graph, and pass final current-head
CI with a separately reviewed development-only audit decision. The historical
recipe receipt does not qualify these changed script bytes. Actual publication,
consumer admission and visual approval remain separate evidence.

## Genuine retained artifact acceptance

The actual unchanged 142311-byte npm 0.3.0 candidate from main9286d2f0 passes
the new verifier with the shared c9fed365 helper and isolated checksum-bound
npm12.0.2. Its SHA256 remains
`edce8320c4c8c86ff1c7c175af6c27a59c6f0dab2400eb7c9ad8150c756916a1`.
Readiness completed in27.671seconds of59.461seconds remaining after metadata
and tarball observation. Frozen npm ci,636 verified registry signatures,
178 attestations and publint pass; no upload or release modification occurred.
The retained artifact is publication evidence for its original source only,
not a newly built candidate or whole-version-recipe proof for this slice.

The first shared protocol harness invocation used Docs' pnpm10.32.1 in the
shared CI checkout; its pinned pnpm10.34.5 process fixtures correctly rejected
version drift (two failures). Selecting the shared checkout's actual pinned
manager, without changing the source fixture or assertions, passes all21
protocol tests before the real Docs verifier runs. Docs' own source checks
continue to use its unchanged pnpm10.32.1.
