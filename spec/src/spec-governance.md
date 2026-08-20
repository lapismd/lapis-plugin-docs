# Specification Governance

## Requirements

| ID | Requirement |
| --- | --- |
| LPD-SPEC-001 | `spec/src` MUST remain the canonical standalone specification and MUST build with mdBook. |
| LPD-SPEC-002 | Protected package, manifest, source, Storybook, validation, and CI changes MUST update an owning canonical chapter in the same Jujutsu change. Host plugin-class registration is specified in LN-DOC-007 and does not move governance ownership. |
| LPD-SPEC-003 | Every normative requirement ID MUST be unique and MUST have exactly one verification row with concrete evidence. |
| LPD-SPEC-004 | Published package manifests MUST use portable semver ranges and MUST NOT contain `workspace:`, `link:`, `file:`, or machine-specific dependency paths. Registry packages such as `yaml` and `ts-fsrs` MAY be added when the Docs model needs them. |
| LPD-SPEC-005 | Colocated siblings MUST resolve through `link:`-valued workspace-level overrides. Siblings MUST NOT become workspace members or mutate sibling `node_modules`. Workspace overrides MUST pin the CodeMirror and Lezer packages used by Storybook shell hosts. |
| LPD-SPEC-006 | Package Storybook MUST expose checkout-owned `storybook`, `storybook:stop`, and `storybook:restart` commands. They MUST default to port 7040, honour `.env.storybook.local`, reuse one supervisor per checkout, and refuse to replace a listener owned by another checkout. |
| LPD-SPEC-007 | Tracked agent guidance MUST require explicit or context-owned App access, restrict `globalThis.app`, and require the package ownership audit for App-related changes. |
| LPD-SPEC-008 | Repository validation MUST reject story titles outside the `Plugins/Docs/*` taxonomy. |
| LPD-SPEC-009 | Repository validation MUST compare every SUMMARY chapter with an exact metadata-only Storybook mirror. |
| LPD-SPEC-010 | Canonical plugin chapters and stories MUST use the `Plugins/Docs` hierarchy. |
| LPD-SPEC-011 | Tracked agent guidance MUST require preserving unrelated work, committing every independently verified change with Jujutsu without waiting for another request, and using a PR-quality message that explains what changed, why it changed, and which validation passed. |

## Spec-first mapping notes

Protected Docs runtime and package-governance paths map through
`spec-validator.config.mjs`. Changes to that config, `PROVENANCE.md`, and
related governance files MUST keep this chapter in the same change so the
spec-first gate remains fail-closed for `*.doc.md` file-view work.
