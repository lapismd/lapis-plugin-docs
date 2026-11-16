# Dependency security remediation

The immutable baseline is Docs main
`073f4a58ddcb414ad5ce93b4107c4262438290ff`. The new version-runtime guard is
preserved separately as unpushed Jujutsu bookmark
`maintenance/docs-runtime-guard-wip`; this dependency slice does not adopt it.

## Original failure and repaired graph

Actual baseline `pnpm audit --json` exited1 with25 advisories:4LOW,11MODERATE,
8HIGH and2CRITICAL. Direct Storybook/addon-vitest10.5.7 carried the critical
GHSA-f2ph-cmg5-wxc8 finding. Baseline production audit, independently reproduced
from only that commit's public manifest/lock/workspace metadata in a disposable
non-checkout fixture, exited1 with8 advisories:1LOW,3MODERATE and4HIGH.

Official npm metadata supports Storybook10.6.7 with Vite6 and the retained
Svelte plugin5.1.1. Vitest's maintained V4 tag is4.1.12 and supports Vite6.
The candidate pins that aligned Storybook cohort, Vite6.4.6 and Vitest/browser4.1.12.
CLI3.0.3, pnpm10.32.1, Changesets config and the complete custom version command
remain unchanged. Current devalue5.9.4, KaTeX0.18.10, source-map-js1.2.2,
glob14.0.6 and affected minimatch11.0.8 resolutions remove their fixed ranges.

The first override attempt caught a source configuration precedence issue:
pnpm10.32.1 uses the existing manifest `pnpm.overrides` in preference to YAML
workspace overrides. `pnpm config get overrides` displayed YAML floors, while
the actual lock retained only the manifest's existing Core0.13.2 override.
The final narrow floors therefore join that existing active manifest authority.
The original workspace policy and peer rules are unchanged; previously dormant
CodeMirror/host pins are not broadly activated. The regression inspects actual
lock versions, so it rejects ineffective declarations.

## Qualification and raw evidence

The three new regressions failed3/3 before changes and pass3/3 afterward. They
check the compatible cohort, actual fixed lock ranges and mandatory unsuppressed
full/production CI gates. The original Validate aggregate, quality, unit,
package, cold static Storybook and sharded interaction jobs remain authoritative.

On Node24, package build and publint pass; `pnpm check` passes with0 Svelte
errors/0 warnings, type diagnostics, source governance, App ownership and
no-Tailwind checks. All69 unit tests pass. The cold Storybook10.6.7/Vite6.4.6
static build passes, followed by a fresh full browser/axe run:5 files/13 tests
pass. Canonical spec3 lanes/spec-first and actionlint pass. No assertions,
functional diagnostics, visual thresholds or baselines are weakened.

The final raw full audit exits1 with one LOW only (0 moderate/high/critical).
Production audit exits0 with no findings. Raw JSON remains local evidence
outside the checkout, including baseline, intermediate ineffective-override and
final results; no raw finding is called clean or hidden. The existing API0.2.6
peer warning for Mira0.2.0 remains visible and unchanged from the source cohort.

## Remaining exact development finding

The remaining reviewed finding is
[GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4),
deepmerge4.3.1, path `.>@sveltejs/vite-plugin-svelte>deepmerge`, LOW.
The GitHub-reviewed advisory has no patched version. Official current Svelte
plugin5.1.1,6.2.4 and7.3.1 all still depend on deepmerge^4.3.1; upgrading Vite
majors would not remove it. The path is a declared development build-tool
dependency, absent from the clean production audit. Build tools still consume
source configuration and produce artifacts; this is not a claim of no risk.

Under the user's standing delegation, the operator selected a new exact,
development-only acceptance after the functional lanes above passed. This is
not a claim the user approved these hashes and does not transfer coordinator
or Visual Delta exceptions. No ignore or waiver is active in this dependency
commit. Admission still requires a separately reviewed shared guard and policy
bound to this reviewed dependency source and exact manifest/lock bytes, ending
no later than2026-11-21T00:00:00Z or earlier on a published fix/new release.
Every other finding/path, production exposure, changed source/lock, unavailable
evidence and expired policy remains blocking. A resolved finding retires the
exception rather than silently carrying its authority forward.

After immutable remediation and policy review, the actual shared version recipe
must be requalified against the new graph before restoring guard adoption.
The earlier successful recipe proof used the old vulnerable tuple and cannot
qualify this candidate's changed dependencies. No package bump, publication,
approval of another finding or activation change is introduced here.
