---
schemaVersion: cvstudio.docs.note.v4
id: sample-docs-index
title: Sample docs
docType: index
summary: Bundled sample book that exercises every docs note type, block, and card fixture.
learningGoal: Use these fixtures to verify editing, display, cards, review, search, and book navigation.
aliases:
  - Sample Docs Index
  - Docs Fixtures
tags:
  - books/sample-docs
  - sample
  - sample/docs/index
  - index
  - resources/docs/index
book:
  chapters:
    - noteId: sample-docs-schema-harness
    - noteId: sample-docs-coding-drill
    - noteId: sample-docs-system-design
    - noteId: sample-docs-story-bank
    - noteId: sample-docs-freeform
createdAt: 2026-07-01T09:00:00.000Z
updatedAt: 2026-11-08T20:26:44.481Z
blocks:
  - id: index-links
    type: resources
    title: Fixture map
    items:
      - title: Schema harness
        url: cvstudio://docs/sample-docs-schema-harness
        kind: note
        notes: Full schema coverage.
      - title: Coding drill
        url: cvstudio://docs/sample-docs-coding-drill
        kind: note
        notes: Prompt block coverage.
cards:
  - id: card-index-purpose
    type: basic
    status: active
    prompt: What does the sample docs index fixture map?
    answer: It maps sample note ids to the harness areas they exercise.
    tags:
      - sample
      - resources/docs/index
      - index
    blockRefs:
      - index-links
    fsrs:
      due: 2026-07-01T09:30:00.000Z
      stability: 0
      difficulty: 0
      elapsedDays: 0
      scheduledDays: 0
      learningSteps: 0
      reps: 0
      lapses: 0
      state: New
---

Open chapters from the book navigation, or jump via wiki links like [[sample-docs-schema-harness]].
