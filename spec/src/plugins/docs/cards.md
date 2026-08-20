# Docs Cards And Review

Cards support spaced repetition with FSRS state stored on each card.

## Requirements

| ID | Requirement |
| --- | --- |
| LN-DOC-023 | Core Docs card editors and review surfaces MUST support `basic` and `cloze` card types. Coding exercise cards MUST be ignored by Core Docs UI. |
| LN-DOC-024 | The package MUST expose FSRS queue construction and rating helpers backed by `ts-fsrs`. Rating labels MUST be again, hard, good, and easy. |
| LN-DOC-025 | Cards and review panels MUST be openable through Docs commands and fill their workspace hosts without introducing page-level scroll owners outside the panel content. |
| LN-DOC-026 | Card preview stack motion and flip-card presentation MUST live in this package when Design Core does not yet export equivalents, and MUST be marked as design-core migration candidates. |
