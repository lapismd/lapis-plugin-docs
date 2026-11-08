---
schemaVersion: cvstudio.docs.note.v3
id: sample-docs-freeform
title: Sample docs freeform
docType: freeform
summary: Sample docs freeform fixture for docs freeform rendering.
learningGoal: Exercise the freeform document type in filters, metadata, and display output.
aliases:
  - freeform
tags:
  - books/sample-docs
  - sample
  - sample/docs/freeform
  - freeform
  - notes/freeform
bookId: sample-docs-index
createdAt: 2026-07-01T09:00:00.000Z
updatedAt: 2026-07-01T09:30:00.000Z
blocks:
  - id: freeform-note
    type: text
    title: Freeform note
    body: This note keeps the structured metadata but leaves most content in body markdown.
cards:
  - id: card-freeform-body
    type: basic
    status: active
    prompt: Where does freeform fixture content mostly live?
    answer: In the markdown body, while still preserving typed metadata and cards.
    tags:
      - sample
      - notes/freeform
      - freeform
    sourceRefs:
      - "[^text]"
    blockRefs:
      - freeform-note
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

Back to [[sample-docs-schema-harness|the schema harness]].
