---
schemaVersion: cvstudio.docs.note.v4
id: sample-docs-schema-harness
title: Sample docs schema harness
docType: revision
summary: A deterministic note that covers every structured docs field and card review state.
learningGoal: Confirm structured editing, rendered markdown, Mermaid diagrams, slide output, search,
  links, cards, and review queues.
aliases:
  - Docs Harness
  - Revision Fixture
tags:
  - books/sample-docs
  - sample
  - sample/docs/schema-harness
  - revision
  - learning/revision/fsrs
  - fsrs
bookId: sample-docs-index
createdAt: 2026-07-01T09:00:00.000Z
updatedAt: 2026-11-08T20:23:23.889Z
blocks:
  - id: text-overview
    type: text
    title: Overview
    body: Use this note to exercise every structured docs block, Mermaid rendering, every card metadata
      field, wiki links, tags, and rendered display modes.
  - id: markdown-chapter-section
    type: markdown
    title: Markdown chapter section
    body: |-
      Use **Markdown** blocks for longer chapter prose with Carta Write/Preview editing.

      - Lists and wiki links like [[sample-docs-index]] work here.
      - Untitled markdown continuations render without a stub heading.

      ```ts
      const ready = true;
      ```
  - id: concept-desirable-difficulty
    type: concept
    title: Desirable difficulty
    summary: Revision should feel effortful enough to force retrieval without becoming noise.
    keyPoints:
      - Prompt before rereading.
      - Mix near-miss examples.
      - Review the weakest block first.
    details: The harness links cards to block ids so a reminder can point back to the exact concept,
      drill, story, or resource that created it.
  - id: procedure-review-loop
    type: procedure
    title: Review loop
    steps:
      - Open the due card.
      - Answer from memory.
      - Compare against the block summary.
      - Rate the card and update the next review.
    notes: This procedure is intentionally short so the rendered markdown and slide modes are easy to
      inspect.
  - id: prompt-cache-invalidation
    type: prompt
    title: Cache invalidation prompt
    problem: Design a cache invalidation strategy for user profile updates served by multiple regional
      API workers.
    requirements:
      - Keep stale profile reads below one minute.
      - Handle regional partition recovery.
      - Expose observable invalidation lag.
    approach: Use versioned profile records, publish invalidation events, and fall back to version
      checks on hot reads.
    traps:
      - Relying only on TTL.
      - Invalidating by broad tenant prefix.
      - Ignoring replay after a queue outage.
    tests:
      - Profile update reaches all regions.
      - Duplicate invalidation events are harmless.
      - A missed event is repaired by version comparison.
    answer: Make writes authoritative, propagate invalidations asynchronously, and keep the read path
      able to detect stale versions.
  - id: code-fsrs-helper
    type: code
    title: FSRS helper
    language: ts
    code: |-
      const state = {
        due: '2026-07-02T09:00:00.000Z',
        state: 'Review',
        reps: 2
      };
    caption: A small deterministic card-state shape for fixture tests.
  - id: code-mermaid-review-pipeline
    type: code
    title: Review pipeline diagram
    language: mermaid
    code: |-
      flowchart TB
        %% Docs revision and review pipeline fixture
        classDef entry fill:#dbeafe,stroke:#2563eb,color:#0f172a
        classDef decision fill:#fef3c7,stroke:#d97706,color:#0f172a
        classDef process fill:#ecfdf5,stroke:#059669,color:#0f172a
        classDef storage fill:#f3e8ff,stroke:#7c3aed,color:#0f172a
        classDef terminal fill:#fee2e2,stroke:#dc2626,color:#0f172a

        subgraph Authoring["Authoring surface"]
          direction TB
          A([Open note]):::entry --> B[Edit structured blocks]
          B --> C[Attach cards and block refs]
          C --> D{Valid schema?}
        end

        D -->|No| E[Show validation errors]:::terminal
        E --> B
        D -->|Yes| F[Autosave note markdown]:::process

        subgraph Rendering["Display rendering"]
          direction LR
          F --> G[Document markdown]
          F --> H[Slide markdown]
          F --> I[Mermaid diagrams]
          G --> J[(Rendered preview)]:::storage
          H --> J
          I --> J
        end

        subgraph Review["Spaced review loop"]
          direction TB
          J --> K[Build due queue]
          K --> L{Card due?}
          L -->|No| M([Idle]):::terminal
          L -->|Yes| N[Prompt from memory]:::process
          N --> O[Reveal answer]
          O --> P{Rate recall}
          P -->|Again| Q[Reset interval]
          P -->|Hard| R[Shorten interval]
          P -->|Good| S[Advance interval]
          P -->|Easy| T[Stretch interval]
          Q --> U[(FSRS state)]:::storage
          R --> U
          S --> U
          T --> U
          U --> K
        end

        subgraph Recovery["Cache invalidation recovery"]
          direction TB
          V[Profile write]:::process --> W[Publish invalidation event]
          W --> X{Event delivered?}
          X -->|Yes| Y[Evict regional cache]
          X -->|No| Z[Version check on read]:::decision
          Z --> AA{Stale version?}
          AA -->|Yes| Y
          AA -->|No| AB([Serve cached profile]):::terminal
          Y --> AC([Serve fresh profile]):::entry
        end

        U -. informs .-> V
        C -. links cards to blocks .-> N
    caption: A comprehensive Mermaid flowchart covering subgraphs, decisions, and labeled edges for
      display rendering.
  - id: table-fields
    type: table
    title: Schema coverage
    columns:
      - Area
      - Fields exercised
    rows:
      - - Note
        - docType, summary, learningGoal, aliases, tags, body
      - - Block
        - text, concept, procedure, prompt, code, mermaid code, table, callout, story, resources
      - - Card
        - type, status, blockRefs, fsrs, reviews
  - id: callout-critical
    type: callout
    title: Harness reset
    tone: critical
    body: Seeding sample docs overwrites the bundled sample note ids with fixed fixture data.
  - id: story-star-example
    type: story
    title: Structured STAR story
    useFor:
      - behavioral interview
      - leadership
      - ambiguity
    situation: A release had scattered ownership and unclear regression risk.
    task: Create a repeatable readiness process without slowing the team.
    action: Grouped risks by user path, added release checklists, and made owners annotate evidence
      before signoff.
    result: The team caught two blocking regressions before release and reused the checklist later.
    metrics:
      - 2 regressions caught
      - 1 checklist reused across 3 releases
  - id: resources-follow-up
    type: resources
    title: Follow-up resources
    items:
      - title: Marp Markdown
        url: https://marp.app/
        kind: slides
        notes: Use the Display panel's slide mode output.
      - title: FSRS
        url: https://github.com/open-spaced-repetition/fsrs4anki
        kind: scheduling
        notes: Review scheduling model used by the cards.
cards:
  - id: card-desirable-difficulty
    type: basic
    status: active
    prompt: What makes a revision prompt a desirable difficulty?
    answer: It forces retrieval with enough friction to expose weak memory without adding irrelevant noise.
    tags:
      - sample
      - learning/revision/memory
      - memory
    blockRefs:
      - concept-desirable-difficulty
    fsrs:
      due: 2026-07-02T09:00:00.000Z
      stability: 4.2
      difficulty: 4.8
      elapsedDays: 2
      scheduledDays: 2
      learningSteps: 0
      reps: 2
      lapses: 0
      state: Review
      lastReview: 2026-07-01T09:00:00.000Z
    reviews:
      - id: card-desirable-difficulty-review-1
        rating: good
        reviewedAt: 2026-06-30T09:00:00.000Z
        state: Learning
        due: 2026-07-01T09:00:00.000Z
        stability: 3.5
        difficulty: 5.15
        elapsedDays: 1
        scheduledDays: 2
        learningSteps: 0
      - id: card-desirable-difficulty-review-2
        rating: hard
        reviewedAt: 2026-07-01T09:00:00.000Z
        state: Review
        due: 2026-07-02T09:00:00.000Z
        stability: 5
        difficulty: 4.8
        elapsedDays: 2
        scheduledDays: 4
        learningSteps: 0
  - id: card-cache-invalidation-cloze
    type: cloze
    status: active
    prompt: "{{c1::Version checks}} repair missed cache invalidation events after queue recovery."
    answer: Version checks let readers detect stale cached records even when an invalidation event was
      missed.
    tags:
      - sample
      - systems/cache/invalidation
      - systems
    blockRefs:
      - prompt-cache-invalidation
      - code-fsrs-helper
    fsrs:
      due: 2026-07-05T09:00:00.000Z
      stability: 4.2
      difficulty: 4.8
      elapsedDays: 2
      scheduledDays: 2
      learningSteps: 0
      reps: 1
      lapses: 0
      state: Review
      lastReview: 2026-07-01T09:10:00.000Z
    reviews:
      - id: card-cache-invalidation-cloze-review-1
        rating: easy
        reviewedAt: 2026-07-01T09:10:00.000Z
        state: Review
        due: 2026-07-05T09:00:00.000Z
        stability: 3.5
        difficulty: 5.15
        elapsedDays: 1
        scheduledDays: 2
        learningSteps: 0
  - id: card-suspended-harness
    type: basic
    status: suspended
    prompt: Which sample card should stay out of the review queue?
    answer: The suspended harness card.
    tags:
      - sample
      - learning/revision/suspended
      - suspended
    blockRefs:
      - callout-critical
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

This body tests freeform markdown after structured blocks.

Related fixtures: [[sample-docs-coding-drill]] and [[sample-docs-system-design]].

#sample-body
