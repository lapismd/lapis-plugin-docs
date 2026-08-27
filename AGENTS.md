# Docs plugin repository guidance

This repository owns the first-party external Lapis plugin whose runtime ID is
`docs` and whose package is `@lapis-notes/lapis-plugin-docs`.

## Ownership and compatibility

- Keep Docs domain model, Core Docs workspace UI, native `--ui-docs-*` CSS, and
  the plugin runtime in this repository.
- Consume host facilities through published `@lapis-notes/api`,
  `@lapismd/design-core`, and `@lapismd/mira` exports.
- Do not depend on `/Users/stevejuma/code/cv`, `@cvstudio/*`, or coding-practice
  host services. Package Storybook MAY depend on workspace hosts and Markdown
  for `Plugins/Docs/Shell`.
- Preserve runtime ID `docs`. Package and repository names do not authorize a
  later vault migration.
- Keep production host registration in Lapis. Hosts load the plugin class;
  `onload` registers views, commands, ribbon, settings, and the docs projection.
  Package Storybook owns Docs acceptance under `Plugins/Docs/*`; Lapis Storybook
  must not duplicate those stories.
- Recreate near-miss shared UI in this package and mark it
  `DESIGN_CORE_CANDIDATE` in source plus `PROVENANCE.md`. Do not add design-core
  APIs from this repository.

## Application ownership

- First-party runtime and package Storybook code must receive `App` explicitly
  or derive it from the API component context.
- Do not read or assign `globalThis.app`.
- Run `pnpm check:app-ownership` for App-related changes. It is wired into both
  `pnpm check` and `pnpm spec:check`.

## Specification and validation

- Canonical requirements live in `spec/src`; protected implementation changes
  require corresponding canonical specification changes.
- Run `pnpm spec:check`, `pnpm check`, `pnpm test`, `pnpm build`, `pnpm
  publint`, and Storybook interaction, accessibility, and static-build checks
  when stories or presentation change.
- Consume published LapisMD dependencies through normal npm semver ranges.
  Unpublished first-party Lapis host packages remain development-only until
  their own publication plan is complete.
- Treat visual status separately from functional validation. Never create or
  replace Visual Delta baselines without explicit approval.

## Version control

- Use Jujutsu for status, diffs, commits, bookmarks, and history work.
- Preserve unrelated work and keep each change independently verifiable.
- After each verified change, run `jj commit` with a PR-quality message that
  explains what changed, why it changed, and the validation that passed. Keep the
  message descriptive enough for review context rather than using a terse
  label. This is a standing request; do not wait for the user to ask.
