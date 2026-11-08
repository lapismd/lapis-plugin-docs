---
schemaVersion: cvstudio.docs.note.v3
id: sample-docs-story-bank
title: Sample docs story bank
docType: story-bank
summary: Sample docs story bank fixture for docs story-bank rendering.
learningGoal: Exercise the story-bank document type in filters, metadata, and display output.
aliases:
  - story bank
tags:
  - books/sample-docs
  - sample
  - sample/docs/story-bank
  - story-bank
  - interview/behavioral/stories
bookId: sample-docs-index
createdAt: 2026-07-01T09:00:00.000Z
updatedAt: 2026-07-01T09:30:00.000Z
blocks:
  - id: story-conflict
    type: story
    title: Stakeholder conflict
    useFor:
      - conflict
      - ownership
    situation: Two teams disagreed on who should own a migration.
    task: Find a decision path that preserved delivery momentum.
    action: Mapped operational responsibilities, proposed ownership boundaries, and documented tradeoffs.
    result: The migration proceeded with clearer on-call and escalation paths.
    metrics:
      - 1 ownership doc
      - 2 teams aligned
cards:
  - id: card-story-action
    type: basic
    status: active
    prompt: What action anchors the stakeholder conflict story?
    answer: Mapping responsibilities and documenting ownership tradeoffs.
    tags:
      - sample
      - interview/behavioral/stories
      - behavioral
    sourceRefs:
      - "[^stories/story_acme_platform]"
    blockRefs:
      - story-conflict
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
