# Docs readiness development-only decision

This is a new delegated operator review under the user's standing instruction
to complete the work and choose the logical option without further general
approval requests. It replaces the old exact Docs 0.3.0 binding; neither the old
record nor another repository's exception authorizes these changed bytes.
The recipe does not approve itself or edit this policy.

## Reviewed source and evidence

Dependency source: `4d5b4811a854eb9d3520acee93d64579df9b00b0`.
Manifest SHA256: `fef8f073445c2c412df8563d60d5862aa5dc037eb9ce49e296d415761c3b6b92`.
Lock SHA256: `091fbc8ffe2dc16a37802d9cc647c21a2ccd5027065311a7a85c5415b1e86b30`.

The only dependency change is the required released Deno-free development
validator 0.2.0 to 0.2.1, through a normal registry semver range. The importer,
package and snapshot replacement accounts for the complete ten-line lock diff;
production dependencies and public/runtime version 0.3.0 do not change.
The source release change adds bounded shared initial-install readiness while
retaining strict npm12 peers, disabled scripts, frozen reinstall, signature
verification, provenance, publint and immutable publication behavior.

Both exact regression targets reproduce one failure and pass after the fix.
All 27 release-boundary tests, 84 full units, spec/check/build/publint,
formatting and actionlint pass. Actual retained npm 0.3.0 verification passes
with 636 signatures and 178 attestations; it does not qualify a new artifact or
a whole version recipe for the changed source. See
[the source record](2026-11-16-shared-registry-readiness.md).

At 2026-11-16T18:27:14.097Z the unchanged exact shared collector, identical to
pinned Lapis CI2c756d80, reproduced exit1 / approval-binding-mismatch on this
source. Full raw audit has one LOW and production audit zero. No audit output
is suppressed or described as fully clean.

## Exact decision

At 2026-11-16T18:28:00.586Z, accept only GHSA-gcqx-w48m-w2h4,
LOW deepmerge4.3.1, on development-only path
`.>@sveltejs/vite-plugin-svelte>deepmerge`, vulnerable range
`>=4.2.0 <=4.3.1`, patched range `<0.0.0`. The actual audit identifies this
single path and the production graph has no finding. Build-tool exposure
remains real; acceptance is bounded to these reviewed inputs.

Expiry remains 2026-11-21T00:00:00.000Z, or an upstream fix/successor sooner.
No extension is granted. The collector must independently re-read official npm
metadata for fix availability and revalidate source, graph, policy and record
after collection. Any other advisory, path, package/version, source/manifest/
lock mismatch, production exposure, missing evidence or expiry blocks. The
old entry is replaced, not duplicated.

Fresh current-head hosted CI, exact main-artifact verification and the actual
hosted whole-version-recipe proof remain separate merge/deployment gates.
This decision creates no runtime version intent, upload, signing exception,
credential change, consumer admission or authority for another repository.

The same exact collector re-read official npm metadata and accepted this new
binding at2026-11-16T18:28:01.724Z: allowed=true,
status=temporary-development-acceptance, one accepted finding, full raw exit1
and production exit0. Source, dependency inputs, policy and record were
revalidated during collection. The immutable shared collector files have zero
diff from pinned2c756d80; no collector logic or audit policy was weakened.
