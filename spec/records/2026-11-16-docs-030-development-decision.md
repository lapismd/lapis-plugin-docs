# Docs0.3.0 exact development-only decision

The genuine version source is `3fc13f1e0b9adc07854c5ddb18dd53a561a0ede1`,
generated from merged supported-cohort/guard source
`d0bfb5d8227087dd95c9e550a740da46bcfaf85e`. Its only package change is
0.2.2→0.3.0, plus the expected runtime/canonical version markers, changelog and
consumed genuine minor note. Dependency ranges, resolved graph, source runtime,
guard bindings and all original gates are unchanged. This is a separately
reviewed delegated operator decision under the user's standing authority, not
an inherited approval from source07ac or another repository/release.

## Qualification before the decision

Current-head CI43832085425 passes all75 unit tests, package preparation and
production audit, cold static Storybook and all three interaction/accessibility
shards. Quality stops at the old approval binding. Its actual pinned collector
reports approval-binding-mismatch, full1LOW/production0. The same exact failing
command was reproduced locally at2026-11-16T08:38:54.894Z, exit1. Local strict,
frozen, source-pnpm10.32.1 installation, complete check and specification lanes
also pass on Node24.15. No gate, assertion, threshold or baseline is weakened.

The retained CI artifact is qualification input, not a published release:
`docs-npm-28a16e4a43eec462470ceb0ac6f500f35af72d33`, produced at the synthetic
PR merge revision in that run. The tarball's package and runtime manifest both
declare0.3.0 and its public peers match the supported cohort. Its142311 bytes
match the retained candidate checksum and integrity:

- SHA256: `edce8320c4c8c86ff1c7c175af6c27a59c6f0dab2400eb7c9ad8150c756916a1`.
- SHA512 integrity: `sha512-4LzpJQxDB1NG6ZRGXGj8sqBZyJqZLF6DE1HUW3hRtX4rOmD1Ulr64WoqnEGc6GdK0mFhTZoZuIQ0q1avdyESgA==`.

That artifact does not qualify a later source revision or authorize publication.
Fresh complete CI on the reviewed policy child and exact main artifact,
signatures/provenance and registry-consumer verification remain required.

## Exact scope and expiry

At2026-11-16T08:39:31.000Z, under standing delegated operator authority, accept
only GHSA-gcqx-w48m-w2h4, deepmerge4.3.1, LOW, exact development path
`.>@sveltejs/vite-plugin-svelte>deepmerge`, vulnerable range>=4.2.0<=4.3.1,
with no patched release (`<0.0.0`). This dependency is absent from the clean
production graph. It remains build-tool exposure, not a claim of no risk.

- Dependency source: `3fc13f1e0b9adc07854c5ddb18dd53a561a0ede1`.
- Manifest SHA256: `b6185beee3607ba0aed773d72062e6d3c926fac31c15bfde51ccdac2b382fd0b`.
- Lock SHA256: `de2cb227ba83e06423cb2b95c67c66dc80db8fcde600ef067f77fe2c62756a0f`.
- Expiry:2026-11-21T00:00:00.000Z, or an upstream fix/successor sooner.

All other findings, production exposure, path/version/source/lock mismatch,
unavailable evidence or expiry block. The pinned shared collector re-reads
upstream metadata and revalidates source, policy and decision record after
collection. Resolved findings retire their entries. The version recipe does not
write this decision or approve itself, and raw full/production JSON is retained.

The old binding is replaced rather than duplicated. The same actual pinned
collector accepted this decision at2026-11-16T08:41:26.139Z:temporary-development-
acceptance, allowed=true, exactly one accepted finding, raw full exit1 and
production exit0. It re-read official upstream registry metadata and revalidated
the unchanged source, graph, policy and record during collection. Final record
and canonical checks remain required before committing; complete fresh CI on
the pushed policy child remains the merge gate.
