# Docs catalog provenance

Core Docs domain modules and presentation were adapted from CV Studio
`packages/docs` (`@cvstudio/docs`) and Studio docs host chrome.

Dependency remap:

- `carta-md` / `@cvstudio/ui` Markdown → public `@lapismd/mira`
- leaf controls → public `@lapismd/design-core`
- reference helpers → in-plugin `reference-utils.ts`
  (`DESIGN_CORE_CANDIDATE`)
- `FlipCardDeck` / card preview stack motion → in-plugin Docs components
  (`DESIGN_CORE_CANDIDATE`; design-core lists FlipCardDeck under Shared — later)

No runtime or build dependency on `/Users/stevejuma/code/cv` or `@cvstudio/*`.
The production vault corpus under `data/docs` is not shipped; fixtures come from
`sample.ts` only. Coding practice remains excluded.
