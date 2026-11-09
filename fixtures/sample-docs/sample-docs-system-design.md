---
schemaVersion: cvstudio.docs.note.v3
id: sample-docs-system-design
title: Sample docs system design
docType: system-design
summary: Sample docs system design fixture for docs system-design rendering.
learningGoal: Exercise the system-design document type in filters, metadata, and display output.
aliases:
  - system design
tags:
  - books/sample-docs
  - sample
  - sample/docs/system-design
  - system-design
  - systems/design/rate-limiting
bookId: sample-docs-index
createdAt: 2026-07-01T09:00:00.000Z
updatedAt: 2026-07-01T09:30:00.000Z
blocks:
  - id: design-rate-limiter
    type: table
    title: Rate limiter tradeoffs
    columns:
      - Design
      - Good for
      - Watch out
    rows:
      - - Token bucket
        - Bursty clients
        - Clock drift
      - - Sliding window
        - Strict fairness
        - Higher storage cost
cards:
  - id: card-token-bucket
    type: basic
    status: active
    prompt: When is token bucket a better rate limiter than a fixed window?
    answer: When bounded bursts are acceptable and smoother average throughput matters.
    tags:
      - sample
      - systems/design/rate-limiting
      - system-design
    blockRefs:
      - design-rate-limiter
    fsrs:
      due: 2026-07-03T09:00:00.000Z
      stability: 4.2
      difficulty: 4.8
      elapsedDays: 2
      scheduledDays: 2
      learningSteps: 0
      reps: 1
      lapses: 0
      state: Review
      lastReview: 2026-07-01T11:00:00.000Z
    reviews:
      - id: card-token-bucket-review-1
        rating: hard
        reviewedAt: 2026-07-01T11:00:00.000Z
        state: Review
        due: 2026-07-03T09:00:00.000Z
        stability: 3.5
        difficulty: 5.15
        elapsedDays: 1
        scheduledDays: 2
        learningSteps: 0
---

Back to [[sample-docs-schema-harness|the schema harness]].
