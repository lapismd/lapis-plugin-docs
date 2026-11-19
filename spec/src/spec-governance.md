# Specification Governance

## Requirements

| ID           | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LPD-SPEC-001 | `spec/src` MUST remain the canonical standalone specification and MUST build with mdBook.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| LPD-SPEC-002 | Protected package, manifest, source, Storybook, validation, and CI changes MUST update an owning canonical chapter in the same Jujutsu change. Host plugin-class registration is specified in LN-DOC-007 and does not move governance ownership.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| LPD-SPEC-003 | Every normative requirement ID MUST be unique and MUST have exactly one verification row with concrete evidence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| LPD-SPEC-004 | Published package manifests MUST use portable semver ranges and MUST NOT contain `workspace:`, `link:`, `file:`, or machine-specific dependency paths. Registry packages such as `yaml` and `ts-fsrs` MAY be added when the Docs model needs them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| LPD-SPEC-005 | Published LapisMD dependencies, including the `@lapismd/mira-editor` range that supplies the Markdown fallback extension set, MUST resolve through npm semver ranges and the lockfile. Anki package reading MUST resolve `fflate` and `@libsql/client` the same way. Unpublished first-party Lapis host packages MAY remain development-only until their publication plan is complete. External repositories MUST NOT become workspace members or mutate dependency `node_modules`. Workspace overrides MUST pin the CodeMirror and Lezer packages used by Storybook shell hosts.                                                                                                                                                                                                                                                                                                                                       |
| LPD-SPEC-006 | Package Storybook MUST expose checkout-owned `storybook`, `storybook:stop`, and `storybook:restart` commands. They MUST default to port 7040, honour `.env.storybook.local`, reuse one supervisor per checkout, and refuse to replace a listener owned by another checkout.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| LPD-SPEC-007 | Tracked agent guidance MUST require explicit or context-owned App access, restrict `globalThis.app`, and require the package ownership audit for App-related changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| LPD-SPEC-008 | Repository validation MUST reject story titles outside the `Plugins/Docs/*` taxonomy.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| LPD-SPEC-009 | Repository validation MUST compare every SUMMARY chapter with an exact metadata-only Storybook mirror.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| LPD-SPEC-010 | Canonical plugin chapters and stories MUST use the `Plugins/Docs` hierarchy. The repository README MUST follow the first-party plugin catalog structure and embed committed screenshots generated from deterministic registry capture stories.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| LPD-SPEC-011 | Tracked agent guidance MUST require preserving unrelated work, committing every independently verified change with Jujutsu without waiting for another request, and using a PR-quality message that explains what changed, why it changed, and which validation passed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| LPD-SPEC-012 | Native crate sources, parity harnesses and frozen oracle inputs MUST be protected by the spec-first map. New native code MUST remain Docs-owned and MUST NOT bypass the standalone specification gate or the required public API confirmation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| LPD-SPEC-013 | Native projection qualification MUST use a committed Cargo lockfile and pass locked tests, formatting and strict Clippy. The retained TypeScript oracle MUST remain unchanged; YAML diagnostic adaptations MUST record original/native details separately. Build caches and temporary worker evidence MUST remain ignored.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| LPD-SPEC-014 | Hosted CI MUST use the pinned `ghcr.io/lapismd/lapis-ci` image shared with Tasks and Notebook, select the exact CI revision with Jujutsu, and block on quality, unit, package, static Storybook, and sharded interaction lanes. The aggregate job MUST fail unless every lane succeeds. Storybook publication from `main` MUST upload the static build to GitHub Pages.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| LPD-SPEC-015 | After those lanes succeed, the main workflow MUST open a Changesets version pull request titled “chore: version Docs package” when pending changesets exist. Otherwise it MUST publish the qualified npm artifact to the public registry with GitHub Actions OIDC trusted publishing, provenance, and a registry receipt. The publish job MUST use the `npm-production` environment and MUST NOT publish from a pull request or a failed validation lane. After that publish succeeds, the workflow MUST notify dependency consumers through the pinned dependency-automation workflow, using the same publish boundary as Tasks. The version command MUST set `package.json`, `manifest.json`, the canonical release version, the validator package version pin, and the README package status to the same version. Generated `CHANGELOG.md` stays outside the spec-first map. Validator package version pin: `0.3.0`. |
| LPD-SPEC-016 | The existing delegated development-only acceptance MUST use the pinned shared collector and permit only one authorized LOW against its exact advisory, package, version, path, source commit and manifest/lock hashes. It MUST expire by 2026-11-21T00:00:00Z or an upstream fix, whichever comes first. Production findings, extra findings and mismatched or stale context MUST remain blocking; raw audits MUST be retained.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| LPD-SPEC-017 | Every hosted Docs dependency installation MUST enforce strict peer dependencies with a frozen registry lockfile and disabled local pnpm hooks. Peer warnings MUST NOT substitute for qualification or be suppressed through forced host versions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| LPD-SPEC-018 | Published Docs MUST require the qualified API 0.6.6, Design Core 0.13.4, Mira 0.2, repaired Editor 0.0.5 and Svelte 5.56.10 cohort, with Node 22.12 or later. Incompatible legacy peer combinations MUST NOT be advertised; App-backed and strict public-archive acceptance MUST qualify the supported cohort. Every locked Mermaid renderer path MUST use the repaired published plugin and Mermaid12 contract, without retaining the obsolete external ELK renderer.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| LPD-SPEC-019 | Before acquiring the repository-scoped version writer token, the trusted main version job MUST use the pinned shared Node24 runtime guard against source-owned CLI3/config/recipe input bindings qualified by a successful whole-recipe proof. It MUST preserve the custom version command, no-op semantics and all release gates, without copying the guard, changing Deno policy or authorizing advisory context changes. A genuine version change MUST NOT renew or rewrite its own audit approval.                                                                                                                                                                                                                                                                                                                                                                                                                  |

LPD-SPEC-015 version PRs MUST use the existing dependency App only on canonical
main, scoped to this repository with contents and pull-request write permissions.
Missing credentials MUST fail closed and checkout MUST NOT persist credentials.
The version job's workflow token remains read-only. Changesets MUST NOT create
GitHub releases directly; the separate existing qualified publisher retains its
OIDC, signatures, provenance, registry verification and workflow credentials.

LPD-SPEC-015 and LPD-SPEC-019 MUST derive pending version work from the pinned
shared guard's successful actual CLI release plan, before acquiring a writer.
Empty maintenance note files alone MUST NOT create version intent or suppress
the publisher verifier. The version writer and Changesets action MUST run only
for an explicit `true` result. Publication MUST require successful validation,
a successful version job and the explicit `false` result; missing, failed or
malformed planning evidence MUST NOT admit publication. The shared guard MUST
retain actual workspace dependency rewrites and recheck bound inputs after
planning. This workflow routing change MUST preserve the source version command,
its qualified helper closure, existing notes, public versions and advisory
bindings. Shared-source and hosted consumer evidence remain separate.

## Spec-first mapping notes

LPD-SPEC-014 requires the quality job's full dependency audit and the package
job's production audit to fail closed at every severity before the existing
Validate aggregate can admit publication. Only the separately authorized exact
development-only policy under LPD-SPEC-016 may qualify its bounded LOW; production
must remain clean. Fixed advisory ranges must remain
excluded from the tracked graph. Tooling remediation must preserve the supported
Node24/Storybook10/Vite6/Vitest4 cohort and the existing CLI3 version recipe;
an unfixed advisory remains blocking without a separately authorized policy.

Protected Docs runtime and package-governance paths map through
`spec-validator.config.mjs`. Changes to that config, `PROVENANCE.md`, and
related governance files MUST keep this chapter in the same change so the
spec-first gate remains fail-closed for `*.doc.md` file-view work.

The Docs model does not keep a private reference-index module. Card block refs use the design-core reference picker.

The supported source intake resolves API `0.6.6`, Design Core `0.13.4`, Mira
`0.2.0`, repaired Editor `0.0.5`, UI `0.2.1` and Svelte `5.56.10`. Its genuine
minor Changeset removes the incompatible legacy public host combinations.
The public/runtime release version remains `0.2.2` until normal versioning.

The shared `@lapismd/spec-validator` package is repository validation tooling,
not a runtime package. It MUST resolve from npm through the root development
dependency. This exception does not weaken source-first validation for runtime
Lapis, Design Core, or Mira dependencies.

Native projection preparation uses a separate pinned Docker worker while
unrelated dependency edits exist in the default checkout. Its temporary
dependencies and source export are validation inputs, not package release
metadata; this preparation cannot close package tooling intake.

Native source qualification is distinct from npm presentation/build intake and
from Notes consumer admission. The Rust crate adds no npm dependency, changes
no TypeScript runtime source and does not close those separate host gates.

Hosted CI follows the Tasks and Notebook lane split inside that shared image.
Quality selects the pushed revision before `validation:check`, `spec:check`,
and `check`. Unit, package audit, static Storybook, and three interaction
shards run beside it, and the aggregate job fails closed.

The Design Core 0.13 intake retains the public component and App ownership
contracts. `spec:search` and `spec:index` expose the installed Node validator
for local requirement discovery; neither command runs in CI validation lanes.

The current host cohort replaces the former Core development override and
legacy peer suppression with supported registry contracts. Public peer floors
and the Node minimum change truthfully under minor release intent. Quality,
interaction, accessibility, immutable publication and provenance gates remain
required. Historical maintenance records retain their original evidence.

The full audit collector runs after frozen installation and before Jujutsu
selects its specification working revision, preserving the committed Git HEAD
needed for exact dependency-source discovery. Its raw full/production JSON and
bounded decision are retained even when later quality checks fail.

The 0.3.0 development policy binds genuine version source
`3fc13f1e0b9adc07854c5ddb18dd53a561a0ede1` and its exact manifest/lock hashes.
The earlier source07ac approval failed closed after version preparation. The
separately qualified delegated decision is recorded in
`spec/records/2026-11-16-docs-030-development-decision.md`; its raw one-LOW full audit
is not clean. This authority expires November21 at00:00UTC or on a known fix
sooner, and does not admit any runtime finding or alternate dependency path.

The historical Node24 recipe proof is hosted run43828625633 on reviewed Lapis CI
`7242eb3bf246c266ba4a48c50eaaf01c2950a37d`, using immutable Docs source
`9e8e7ec23fc5d7f412f180e76ebcb3699a00cfed` and its genuine minor note.
The actual unchanged CLI3 command prepares0.3.0 with all five custom metadata
outputs and no Deno. Its source-owned input bindings guard the same version
job before App minting; empty Changesets retain the action's existing no-op
behavior. Evidence and boundaries are recorded in
`spec/records/2026-11-16-version-runtime-adoption.md`.

## Registry installation readiness

LPD-SPEC-015 publication verification MUST use the immutable shared Lapis CI
registry-readiness setup with exact npm12.0.2 strict peers and disabled lifecycle
scripts. Docs owns a single60000ms monotonic readiness deadline, beginning before
full-version metadata observation and covering the tarball and initial clean
install. Its existing twelve metadata probes and five-second cadence remain
bounded by that same deadline; only the remaining budget reaches the helper.
Install-v1 metadata and the installed candidate MUST match the independently
verified published name, version and SHA512 integrity. In skip-different mode,
the receipt MUST describe those published bytes. Identity, integrity, authority,
peer and unrelated installation failures MUST block; only the shared exact
propagation/transient policy may retry read-only observation/initial install.
Frozen npm ci, strict peers, npm signature audit, provenance, publint and all
existing validation/publication boundaries remain blocking. Uploads are never
replayed by readiness. Missing shared setup MUST fail closed.

LPD-SPEC-019 bindings MUST include the new imported release helper. Changed
release-source bytes require a fresh actual hosted whole-version-recipe proof;
proposed input hashes and the historical receipt do not prove qualification.
This maintenance slice creates no runtime release intent and MUST NOT renew or
transfer any advisory approval to changed source or lockfile bytes.

The readiness maintenance development decision is separately recorded in
`spec/records/2026-11-16-readiness-development-decision.md`. It accepts only
the same exact unfixed development LOW on dependency source4d5b4811 and the
new manifest/lock hashes, under delegated operator authority. Expiry remains
November21 at00:00UTC or an available fix sooner; raw full audit remains one
LOW and production zero. All other failures still block. The historical recipe
receipt remains historical until the changed closure has actual hosted proof.

## Shared dependency workflow

| ID | Requirement |
| --- | --- |
| LPD-SPEC-020 | Compatible Core development intake MUST retain public peer contracts and registry coordinates, verify source-owned policy and exact current catalog facts in two managed chapters, and run the independent offline guard in ordinary quality/check lanes outside specification exemptions. Only a forward0.13 patch may change the development pin, matching override and mechanical lock closure. Named audit evidence, the exact public-host tuple and the mapped `Core<version>, runtime versions` token MAY receive only guard-derived graph-hash or Core-version substitutions; public compatibility evidence, source identity, authority, approval, expiry and all other bytes MUST remain unchanged. Unrelated source/catalog changes MUST fail. |
| LPD-SPEC-021 | Successful existing CI/npm and Pages workflows MAY send a completion hint only through the reviewed immutable coordinator implementation and its matching source policy. Verification MUST precede App minting and final dispatch; candidate code/artifacts/caches, callback self-triggers and inherited secrets MUST remain excluded. Source activation and every audit, functional, publication and ownership gate remain separate. |

Core0.13.4, runtime versions and public peers remain unchanged; version guarding
retains the reviewed development-coordinate workspace digest.
HIGH admission MUST remain disabled until exact user approval; it ends
November19 at00:00UTC or a fix, whichever comes first.
Existing LOW acceptance and every other gate remain; no approval transfers.

| ID | Requirement |
| --- | --- |
| LPD-SPEC-022 | Specification discovery MUST use the repository-owned system QMD collection when available and retain explicit doctor/search diagnostics without downloading QMD models in CI. |

## Current development catalog

These managed facts describe only the Core development catalog. Public runtime
contracts and every normal validation and publication gate remain independent.

<!-- dependency-intake:core-development:start -->

```json
{
  "schemaVersion": 1,
  "kind": "development-dependency-intake",
  "dependency": "@lapismd/design-core",
  "version": "0.13.4",
  "peer": "^0.13.4",
  "integrity": "sha512-pKZpaKOsGVZxV9CJVf309EhKl8YMcj92vxnL26Pv+PXe8thjD2qMaaK+xtqnWjLh3Esevbd2SSnxyUj4x18ikw==",
  "importers": {
    ".": {
      "specifier": "0.13.4",
      "version": "0.13.4(svelte@5.56.10)(tailwindcss@4.1.12)"
    }
  },
  "policySha256": "a2723a9eb60f2e64b845adbfece1d5fba7bab4117d4ec4fa3e8c5b016cae9052"
}
```

<!-- dependency-intake:core-development:end -->
