# Docs explicit-user development HIGH decision

This records the exact explicit user approval given in the organisation cleanup
thread for HIGH GHSA-fc5q-39xc-vjpf. It does not transfer Community, Tasks,
Mira, Core, or coordinator authority. Production findings and every unmatched
full finding remain blocking.

## Reviewed source and evidence

Dependency source: `b9d3dace06f6eab9e72ac265c2b926f9cad9a2cc`.
Manifest SHA256: `2c86428e3288b9fe9c52ec43bccdd418e860482ae992358a189e8471e443b4da`.
Lock SHA256: `a4de8f38490964aa14a7cce5916f24b2fbfb06dafb38480c0360b5825d9e381e`.
Workspace SHA256: `27f43cf8dc1d33bf2770bfe0a6b6768b1a76b2ab00801bcb123378b61d1781e0`.

The disabled proposal at `.github/development-audit-high-proposal.json` bound
these identities before approval. Shared collector pin remains
`63e64958e9b271d36feba06a162ee02b079a3206`. Raw full audit retains HIGH1 with
all other severities0; production audit is clean; muted is empty. The existing
LOW deepmerge approval remains separate and unchanged.

## Exact decision

At 2026-11-18T13:30:52.633Z, under explicit-user authority, accept only
GHSA-fc5q-39xc-vjpf, HIGH picomatch 4.0.7, on development-only path
`.>@changesets/cli>@changesets/config>picomatch`, vulnerable range `<=4.0.7`,
patched range `<0.0.0`.

Expiry remains 2026-11-19T00:00:00.000Z, or sooner on a known patch or official
stable successor above 4.0.7. The shared checker additionally limits HIGH to 48
hours from this approval timestamp. No renewal, broader ignore, production
exception, or cross-repository transfer is granted.
