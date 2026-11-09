# Docs Cards And Review

Cards support spaced repetition with FSRS state stored on each card.

## Requirements

| ID | Requirement |
| --- | --- |
| LN-DOC-023 | Core Docs card editors and review surfaces MUST support `basic` and `cloze` card types. Coding exercise cards MUST be ignored by Core Docs UI. Card records MUST NOT include source refs, and parse and serialize MUST drop `sourceRefs` and `source_refs`. Block refs MUST stay on the card. The block-ref picker MUST use the design-core reference picker and MUST show each block title with a short snippet of that block. `Plugins/Docs/Cards` MUST render the document card preview. |
| LN-DOC-024 | The package MUST expose FSRS queue construction and rating helpers backed by `ts-fsrs`. Rating labels MUST be again, hard, good, and easy. |
| LN-DOC-025 | Cards and review panels MUST be openable through Docs commands and fill their workspace hosts without introducing page-level scroll owners outside the panel content. |
| LN-DOC-026 | Card preview stack motion and flip-card presentation MUST live in this package when Design Core does not yet export equivalents, and MUST be marked as design-core migration candidates. |
