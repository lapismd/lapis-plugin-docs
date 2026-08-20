# Docs catalog provenance

Core Docs domain modules and presentation were adapted from CV Studio
`packages/docs` (`@cvstudio/docs`) and Studio docs host chrome.

## File association

Lapis associates Core Docs notes with exclusive `*.doc.md` leaves
(`docs-document` TextFileView). CV Studio itself stores plain `data/docs/**/*.md`;
`.doc.md` is a Lapis routing choice, not a CV Studio format change.

## Dependency remap

- `carta-md` / `@cvstudio/ui` Markdown preview → public `@lapismd/mira/preview`
- block Markdown editing → public `@lapismd/design-core/forms` `CodeEditor`
- FormField / YamlEditor / ChipAutocomplete / EntryActions / ReferencePicker /
  SegmentedControl / DatePicker / ScrollArea → public `@lapismd/design-core`
- In-plugin `DESIGN_CORE_CANDIDATE` ports under `src/lib/docs/candidates/`:
  - `FlipCardDeck.svelte`
  - `TagEditor.svelte`
  - `ChoiceMenu.svelte`
  - `SearchableChoicePicker.svelte`
  - `StructuredTable.svelte` / `StructuredTableEditor.svelte`
  - `MarkdownFloatingToc.svelte`
  - `WorkspaceHistoryControls.svelte`
- reference helpers → in-plugin `model/reference-utils.ts`
  (`DESIGN_CORE_CANDIDATE`)

No runtime or build dependency on `/Users/stevejuma/code/cv` or `@cvstudio/*`.
The production vault corpus under `data/docs` is not shipped; fixtures come from
`sample.ts` only. Coding practice remains excluded.
