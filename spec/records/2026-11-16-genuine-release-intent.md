# Genuine release intent and publisher routing

Docs main run [43937153595](https://github.com/lapismd/lapis-plugin-docs/actions/runs/43937153595)
passed its validation and version jobs after readiness adoption, but skipped
publication verification. The native Changesets action reported pending work
for maintenance notes even though the actual installed CLI3.0.3
returned an empty `releases` array and no version PR existed. The retained
`.changeset/docs-registry-readiness.md` contains no product release entries.

The shared fix is [Lapis CI PR20](https://github.com/lapismd/lapis-ci/pull/20),
pinned to `6b4ed4d29fba971c04a7f6b66a0f2231f024e82e`. Its opt-in qualified
runtime guard invokes the installed CLI's read-only status planner before
writer authority and emits intent only after input revalidation. Planning
failure remains blocking. Empty plans return false; genuine versions and
unchanged-version workspace dependency rewrites return true.

Docs routes its version-job output from this shared guard. Writer App minting
and the unchanged Changesets action require the exact true result. The existing
publisher still requires every validation lane and a successful version job,
and now additionally requires the exact false result rather than accepting a
missing output. No implementation is copied into Docs. The custom
`node scripts/release.mjs version` command, its three bound helper inputs,
configuration, source qualification JSON, manifests, lockfile, maintenance note,
public/runtime0.3.0 and advisory bindings remain unchanged.

The separate actual readiness version-recipe receipt43934766066 still proves
the unchanged helper call graph and five custom version outputs. Its full
source tuple includes the old workflow and is not claimed to match this new
workflow. This change needs its own current-head workflow validation and actual
main publisher-verification acceptance; the historical receipt cannot replace
those gates. No artificial product bump or release note is introduced.

The exact new `scripts/ci.test.mjs` writer/publication regression failed once
before implementation (one failure, seven unselected). It checks shared immutable
input qualification, planner opt-in, guard-before-writer order, both true-only
writer conditions, routed job output and explicit false-only publication.
Shared source passes206 checks including real installed CLI2 and CLI3 fixtures.
The actual guarded Docs entry point returned `hasChangesets=false` without
changing notes, manifests or recipes. A first wider unit run exposed two old
policy assertions (83 passed, two failed): one required unconditional App
minting, and one pinned the former guard commit. Their exact two-file rerun
reproduced both failures. They now require the narrower genuine-intent writer
condition and the new immutable shared source; all five authentication/runtime
controls pass, retaining scopes, main-only admission, source hashes and
no-fallback assertions. The complete unit suite passes85/85.

Specification/App-ownership checks, full check (zero Svelte errors or warnings),
build, publint, formatter and workflow actionlint pass locally. No presentation
source changed. Hosted current-head CI and main publication verification remain
pending; those outcomes are not inferred from local checks.
