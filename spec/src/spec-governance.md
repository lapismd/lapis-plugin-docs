# Specification Governance

## Requirements

| ID           | Requirement                                                                                                                                                                                                                                                                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LPD-SPEC-001 | `spec/src` MUST remain the canonical standalone specification and MUST build with mdBook.                                                                                                                                                                                                                                                                                           |
| LPD-SPEC-002 | Protected package, manifest, source, Storybook, validation, and CI changes MUST update an owning canonical chapter in the same Jujutsu change. Host plugin-class registration is specified in LN-DOC-007 and does not move governance ownership.                                                                                                                                    |
| LPD-SPEC-003 | Every normative requirement ID MUST be unique and MUST have exactly one verification row with concrete evidence.                                                                                                                                                                                                                                                                    |
| LPD-SPEC-004 | Published package manifests MUST use portable semver ranges and MUST NOT contain `workspace:`, `link:`, `file:`, or machine-specific dependency paths. Registry packages such as `yaml` and `ts-fsrs` MAY be added when the Docs model needs them.                                                                                                                                  |
| LPD-SPEC-005 | Published LapisMD dependencies, including the `@lapismd/mira-editor` range that supplies the Markdown fallback extension set, MUST resolve through npm semver ranges and the lockfile. Anki package reading MUST resolve `fflate` and `@libsql/client` the same way. Unpublished first-party Lapis host packages MAY remain development-only until their publication plan is complete. External repositories MUST NOT become workspace members or mutate dependency `node_modules`. Workspace overrides MUST pin the CodeMirror and Lezer packages used by Storybook shell hosts. |
| LPD-SPEC-006 | Package Storybook MUST expose checkout-owned `storybook`, `storybook:stop`, and `storybook:restart` commands. They MUST default to port 7040, honour `.env.storybook.local`, reuse one supervisor per checkout, and refuse to replace a listener owned by another checkout.                                                                                                         |
| LPD-SPEC-007 | Tracked agent guidance MUST require explicit or context-owned App access, restrict `globalThis.app`, and require the package ownership audit for App-related changes.                                                                                                                                                                                                               |
| LPD-SPEC-008 | Repository validation MUST reject story titles outside the `Plugins/Docs/*` taxonomy.                                                                                                                                                                                                                                                                                               |
| LPD-SPEC-009 | Repository validation MUST compare every SUMMARY chapter with an exact metadata-only Storybook mirror.                                                                                                                                                                                                                                                                              |
| LPD-SPEC-010 | Canonical plugin chapters and stories MUST use the `Plugins/Docs` hierarchy. The repository README MUST follow the first-party plugin catalog structure and embed committed screenshots generated from deterministic registry capture stories.                                                                                                                                                                                              |
| LPD-SPEC-011 | Tracked agent guidance MUST require preserving unrelated work, committing every independently verified change with Jujutsu without waiting for another request, and using a PR-quality message that explains what changed, why it changed, and which validation passed.                                                                                                             |
| LPD-SPEC-012 | Native crate sources, parity harnesses and frozen oracle inputs MUST be protected by the spec-first map. New native code MUST remain Docs-owned and MUST NOT bypass the standalone specification gate or the required public API confirmation.                                                                                                                                      |
| LPD-SPEC-013 | Native projection qualification MUST use a committed Cargo lockfile and pass locked tests, formatting and strict Clippy. The retained TypeScript oracle MUST remain unchanged; YAML diagnostic adaptations MUST record original/native details separately. Build caches and temporary worker evidence MUST remain ignored.                                                          |
| LPD-SPEC-014 | Hosted CI MUST use the pinned `ghcr.io/lapismd/lapis-ci` image shared with Tasks and Notebook, select the exact CI revision with Jujutsu, and block on quality, unit, package, static Storybook, and sharded interaction lanes. The aggregate job MUST fail unless every lane succeeds. Storybook publication from `main` MUST upload the static build to GitHub Pages. |
| LPD-SPEC-015 | After those lanes succeed, the main workflow MUST open a Changesets version pull request titled “chore: version Docs package” when pending changesets exist. Otherwise it MUST publish the qualified npm artifact to the public registry with GitHub Actions OIDC trusted publishing, provenance, and a registry receipt. The publish job MUST use the `npm-production` environment and MUST NOT publish from a pull request or a failed validation lane. |

## Spec-first mapping notes

Protected Docs runtime and package-governance paths map through
`spec-validator.config.mjs`. Changes to that config, `PROVENANCE.md`, and
related governance files MUST keep this chapter in the same change so the
spec-first gate remains fail-closed for `*.doc.md` file-view work.

The Docs model does not keep a private reference-index module. Card block refs use the design-core reference picker.

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
