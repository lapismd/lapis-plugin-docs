import type {
  DocsCard,
  DocsDocType,
  DocsFsrsStateName,
  DocsNote,
  DocsReviewLog,
  DocsRevisionBlock,
} from "./types";

const SAMPLE_CREATED_AT = "2026-07-01T09:00:00.000Z";
const SAMPLE_UPDATED_AT = "2026-07-01T09:30:00.000Z";

export const SAMPLE_DOCS_BOOK_FOLDER = "sample-docs";
export const SAMPLE_DOCS_BOOK_INDEX_ID = "sample-docs-index";
export const SAMPLE_DOCS_BOOK_TAG = `books/${SAMPLE_DOCS_BOOK_FOLDER}`;

export const SAMPLE_DOCS_NOTE_IDS = [
  "sample-docs-schema-harness",
  "sample-docs-coding-drill",
  "sample-docs-system-design",
  "sample-docs-story-bank",
  "sample-docs-freeform",
  "sample-docs-index",
] as const;

export const SAMPLE_DOCS_CHAPTER_IDS = [
  "sample-docs-schema-harness",
  "sample-docs-coding-drill",
  "sample-docs-system-design",
  "sample-docs-story-bank",
  "sample-docs-freeform",
] as const satisfies ReadonlyArray<(typeof SAMPLE_DOCS_NOTE_IDS)[number]>;

function sourcePath(id: (typeof SAMPLE_DOCS_NOTE_IDS)[number]) {
  const filename = id === SAMPLE_DOCS_BOOK_INDEX_ID ? "index.md" : `${id}.md`;
  return `docs/${SAMPLE_DOCS_BOOK_FOLDER}/${filename}`;
}

function reviewLog(
  cardId: string,
  index: number,
  rating: DocsReviewLog["rating"],
  reviewedAt: string,
  due: string,
  state: DocsReviewLog["state"] = "Review",
): DocsReviewLog {
  return {
    id: `${cardId}-review-${index}`,
    rating,
    reviewedAt,
    state,
    due,
    stability: 2 + index * 1.5,
    difficulty: 5.5 - index * 0.35,
    elapsedDays: index,
    scheduledDays: Math.max(1, index * 2),
    learningSteps: 0,
  };
}

function reviewedCard(
  card: Omit<DocsCard, "fsrs" | "reviews">,
  options: {
    due: string;
    lastReview: string;
    reviews: DocsReviewLog[];
    state?: DocsFsrsStateName;
  },
): DocsCard {
  return {
    ...card,
    fsrs: {
      due: options.due,
      stability: 4.2,
      difficulty: 4.8,
      elapsedDays: 2,
      scheduledDays: 2,
      learningSteps: 0,
      reps: options.reviews.length,
      lapses: options.reviews.filter((review) => review.rating === "again")
        .length,
      state: options.state ?? "Review",
      lastReview: options.lastReview,
    },
    reviews: options.reviews,
  };
}

function freshCard(card: Omit<DocsCard, "fsrs" | "reviews">): DocsCard {
  return {
    ...card,
    fsrs: {
      due: SAMPLE_UPDATED_AT,
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      learningSteps: 0,
      reps: 0,
      lapses: 0,
      state: "New",
    },
    reviews: [],
  };
}

function note(input: {
  id: (typeof SAMPLE_DOCS_NOTE_IDS)[number];
  title: string;
  docType: DocsDocType;
  summary: string;
  learningGoal: string;
  aliases: string[];
  tags: string[];
  blocks: DocsRevisionBlock[];
  cards: DocsCard[];
  body: string;
  bookId?: string;
  book?: DocsNote["book"];
}): DocsNote {
  return {
    ...input,
    createdAt: SAMPLE_CREATED_AT,
    updatedAt: SAMPLE_UPDATED_AT,
    sourcePath: sourcePath(input.id),
  };
}

const schemaHarnessBlocks: DocsRevisionBlock[] = [
  {
    id: "text-overview",
    type: "text",
    title: "Overview",
    body: "Use this note to exercise every structured docs block, Mermaid rendering, every card metadata field, wiki links, tags, and rendered display modes.",
  },
  {
    id: "markdown-chapter-section",
    type: "markdown",
    title: "Markdown chapter section",
    body: [
      "Use **Markdown** blocks for longer chapter prose with Carta Write/Preview editing.",
      "",
      "- Lists and wiki links like [[sample-docs-index]] work here.",
      "- Untitled markdown continuations render without a stub heading.",
      "",
      "```ts",
      "const ready = true;",
      "```",
    ].join("\n"),
  },
  {
    id: "concept-desirable-difficulty",
    type: "concept",
    title: "Desirable difficulty",
    summary:
      "Revision should feel effortful enough to force retrieval without becoming noise.",
    keyPoints: [
      "Prompt before rereading.",
      "Mix near-miss examples.",
      "Review the weakest block first.",
    ],
    details:
      "The harness links cards to block ids so a reminder can point back to the exact concept, drill, story, or resource that created it.",
  },
  {
    id: "procedure-review-loop",
    type: "procedure",
    title: "Review loop",
    steps: [
      "Open the due card.",
      "Answer from memory.",
      "Compare against the block summary.",
      "Rate the card and update the next review.",
    ],
    notes:
      "This procedure is intentionally short so the rendered markdown and slide modes are easy to inspect.",
  },
  {
    id: "prompt-cache-invalidation",
    type: "prompt",
    title: "Cache invalidation prompt",
    problem:
      "Design a cache invalidation strategy for user profile updates served by multiple regional API workers.",
    requirements: [
      "Keep stale profile reads below one minute.",
      "Handle regional partition recovery.",
      "Expose observable invalidation lag.",
    ],
    approach:
      "Use versioned profile records, publish invalidation events, and fall back to version checks on hot reads.",
    traps: [
      "Relying only on TTL.",
      "Invalidating by broad tenant prefix.",
      "Ignoring replay after a queue outage.",
    ],
    tests: [
      "Profile update reaches all regions.",
      "Duplicate invalidation events are harmless.",
      "A missed event is repaired by version comparison.",
    ],
    answer:
      "Make writes authoritative, propagate invalidations asynchronously, and keep the read path able to detect stale versions.",
  },
  {
    id: "code-fsrs-helper",
    type: "code",
    title: "FSRS helper",
    language: "ts",
    caption: "A small deterministic card-state shape for fixture tests.",
    code: [
      "const state = {",
      "  due: '2026-07-02T09:00:00.000Z',",
      "  state: 'Review',",
      "  reps: 2",
      "};",
    ].join("\n"),
  },
  {
    id: "code-mermaid-review-pipeline",
    type: "code",
    title: "Review pipeline diagram",
    language: "mermaid",
    caption:
      "A comprehensive Mermaid flowchart covering subgraphs, decisions, and labeled edges for display rendering.",
    code: [
      "flowchart TB",
      "  %% Docs revision and review pipeline fixture",
      "  classDef entry fill:#dbeafe,stroke:#2563eb,color:#0f172a",
      "  classDef decision fill:#fef3c7,stroke:#d97706,color:#0f172a",
      "  classDef process fill:#ecfdf5,stroke:#059669,color:#0f172a",
      "  classDef storage fill:#f3e8ff,stroke:#7c3aed,color:#0f172a",
      "  classDef terminal fill:#fee2e2,stroke:#dc2626,color:#0f172a",
      "",
      '  subgraph Authoring["Authoring surface"]',
      "    direction TB",
      "    A([Open note]):::entry --> B[Edit structured blocks]",
      "    B --> C[Attach cards and source refs]",
      "    C --> D{Valid schema?}",
      "  end",
      "",
      "  D -->|No| E[Show validation errors]:::terminal",
      "  E --> B",
      "  D -->|Yes| F[Autosave note markdown]:::process",
      "",
      '  subgraph Rendering["Display rendering"]',
      "    direction LR",
      "    F --> G[Document markdown]",
      "    F --> H[Slide markdown]",
      "    F --> I[Mermaid diagrams]",
      "    G --> J[(Rendered preview)]:::storage",
      "    H --> J",
      "    I --> J",
      "  end",
      "",
      '  subgraph Review["Spaced review loop"]',
      "    direction TB",
      "    J --> K[Build due queue]",
      "    K --> L{Card due?}",
      "    L -->|No| M([Idle]):::terminal",
      "    L -->|Yes| N[Prompt from memory]:::process",
      "    N --> O[Reveal answer]",
      "    O --> P{Rate recall}",
      "    P -->|Again| Q[Reset interval]",
      "    P -->|Hard| R[Shorten interval]",
      "    P -->|Good| S[Advance interval]",
      "    P -->|Easy| T[Stretch interval]",
      "    Q --> U[(FSRS state)]:::storage",
      "    R --> U",
      "    S --> U",
      "    T --> U",
      "    U --> K",
      "  end",
      "",
      '  subgraph Recovery["Cache invalidation recovery"]',
      "    direction TB",
      "    V[Profile write]:::process --> W[Publish invalidation event]",
      "    W --> X{Event delivered?}",
      "    X -->|Yes| Y[Evict regional cache]",
      "    X -->|No| Z[Version check on read]:::decision",
      "    Z --> AA{Stale version?}",
      "    AA -->|Yes| Y",
      "    AA -->|No| AB([Serve cached profile]):::terminal",
      "    Y --> AC([Serve fresh profile]):::entry",
      "  end",
      "",
      "  U -. informs .-> V",
      "  C -. links cards to blocks .-> N",
    ].join("\n"),
  },
  {
    id: "table-fields",
    type: "table",
    title: "Schema coverage",
    columns: ["Area", "Fields exercised"],
    rows: [
      ["Note", "docType, summary, learningGoal, aliases, tags, body"],
      [
        "Block",
        "text, concept, procedure, prompt, code, mermaid code, table, callout, story, resources",
      ],
      ["Card", "type, status, sourceRefs, blockRefs, fsrs, reviews"],
    ],
  },
  {
    id: "callout-critical",
    type: "callout",
    title: "Harness reset",
    tone: "critical",
    body: "Seeding sample docs overwrites the bundled sample note ids with fixed fixture data.",
  },
  {
    id: "story-star-example",
    type: "story",
    title: "Structured STAR story",
    useFor: ["behavioral interview", "leadership", "ambiguity"],
    situation: "A release had scattered ownership and unclear regression risk.",
    task: "Create a repeatable readiness process without slowing the team.",
    action:
      "Grouped risks by user path, added release checklists, and made owners annotate evidence before signoff.",
    result:
      "The team caught two blocking regressions before release and reused the checklist later.",
    metrics: ["2 regressions caught", "1 checklist reused across 3 releases"],
  },
  {
    id: "resources-follow-up",
    type: "resources",
    title: "Follow-up resources",
    items: [
      {
        title: "Marp Markdown",
        url: "https://marp.app/",
        kind: "slides",
        notes: "Use the Display panel's slide mode output.",
      },
      {
        title: "FSRS",
        url: "https://github.com/open-spaced-repetition/fsrs4anki",
        kind: "scheduling",
        notes: "Review scheduling model used by the cards.",
      },
    ],
  },
];

function schemaHarnessNote() {
  return note({
    id: "sample-docs-schema-harness",
    title: "Sample docs schema harness",
    docType: "revision",
    summary:
      "A deterministic note that covers every structured docs field and card review state.",
    learningGoal:
      "Confirm structured editing, rendered markdown, Mermaid diagrams, slide output, search, links, cards, and review queues.",
    aliases: ["Docs Harness", "Revision Fixture"],
    tags: [
      SAMPLE_DOCS_BOOK_TAG,
      "sample",
      "sample/docs/schema-harness",
      "revision",
      "learning/revision/fsrs",
      "fsrs",
    ],
    bookId: SAMPLE_DOCS_BOOK_INDEX_ID,
    blocks: schemaHarnessBlocks,
    cards: [
      reviewedCard(
        {
          id: "card-desirable-difficulty",
          type: "basic",
          status: "active",
          prompt: "What makes a revision prompt a desirable difficulty?",
          answer:
            "It forces retrieval with enough friction to expose weak memory without adding irrelevant noise.",
          tags: ["sample", "learning/revision/memory", "memory"],
          sourceRefs: ["[^highlight]"],
          blockRefs: ["concept-desirable-difficulty"],
        },
        {
          due: "2026-07-02T09:00:00.000Z",
          lastReview: "2026-07-01T09:00:00.000Z",
          reviews: [
            reviewLog(
              "card-desirable-difficulty",
              1,
              "good",
              "2026-06-30T09:00:00.000Z",
              "2026-07-01T09:00:00.000Z",
              "Learning",
            ),
            reviewLog(
              "card-desirable-difficulty",
              2,
              "hard",
              "2026-07-01T09:00:00.000Z",
              "2026-07-02T09:00:00.000Z",
            ),
          ],
        },
      ),
      reviewedCard(
        {
          id: "card-cache-invalidation-cloze",
          type: "cloze",
          status: "active",
          prompt:
            "{{c1::Version checks}} repair missed cache invalidation events after queue recovery.",
          answer:
            "Version checks let readers detect stale cached records even when an invalidation event was missed.",
          tags: ["sample", "systems/cache/invalidation", "systems"],
          sourceRefs: ["[^summary]"],
          blockRefs: ["prompt-cache-invalidation", "code-fsrs-helper"],
        },
        {
          due: "2026-07-05T09:00:00.000Z",
          lastReview: "2026-07-01T09:10:00.000Z",
          reviews: [
            reviewLog(
              "card-cache-invalidation-cloze",
              1,
              "easy",
              "2026-07-01T09:10:00.000Z",
              "2026-07-05T09:00:00.000Z",
            ),
          ],
        },
      ),
      freshCard({
        id: "card-suspended-harness",
        type: "basic",
        status: "suspended",
        prompt: "Which sample card should stay out of the review queue?",
        answer: "The suspended harness card.",
        tags: ["sample", "learning/revision/suspended", "suspended"],
        sourceRefs: ["[^section]"],
        blockRefs: ["callout-critical"],
      }),
    ],
    body: [
      "This body tests freeform markdown after structured blocks.",
      "",
      "Related fixtures: [[sample-docs-coding-drill]] (metadata-only) and [[sample-docs-system-design]].",
      "",
      "#sample-body",
    ].join("\n"),
  });
}

function compactNote(
  id: (typeof SAMPLE_DOCS_NOTE_IDS)[number],
  docType: DocsDocType,
  title: string,
  block: DocsRevisionBlock,
  card: DocsCard,
  extraTags: string[] = [],
) {
  return note({
    id,
    title,
    docType,
    summary: `${title} fixture for docs ${docType} rendering.`,
    learningGoal: `Exercise the ${docType} document type in filters, metadata, and display output.`,
    aliases: [title.replace(/^Sample docs /, "")],
    tags: [
      SAMPLE_DOCS_BOOK_TAG,
      "sample",
      `sample/docs/${docType}`,
      docType,
      ...extraTags,
    ],
    bookId: SAMPLE_DOCS_BOOK_INDEX_ID,
    blocks: [block],
    cards: [card],
    body: `Back to [[sample-docs-schema-harness|the schema harness]].`,
  });
}

const sampleDocsChapterNotes: DocsNote[] = [
  schemaHarnessNote(),
  compactNote(
    "sample-docs-coding-drill",
    "coding-drill",
    "Sample docs coding drill",
    {
      id: "coding-two-sum",
      type: "prompt",
      title: "Two pointer drill",
      problem: "Return indices for a sorted two-sum target.",
      requirements: [
        "O(n) time",
        "O(1) extra space",
        "Explain duplicate handling",
      ],
      approach: "Move the low or high pointer based on the current sum.",
      traps: [
        "Returning values instead of indices",
        "Skipping duplicate values incorrectly",
      ],
      tests: ["[2, 7, 11, 15], target 9", "[1, 1, 3], target 2"],
      answer:
        "Use two pointers and preserve original index assumptions in the prompt.",
    },
    freshCard({
      id: "card-two-sum-prompt",
      type: "basic",
      status: "active",
      prompt: "What pointer move keeps a sorted two-sum search correct?",
      answer: "Move the low or high pointer based on the current sum.",
      tags: ["sample", "algorithms/two-pointer", "coding-drill"],
      sourceRefs: ["[^section]"],
      blockRefs: ["coding-two-sum"],
    }),
    ["algorithms/two-pointer"],
  ),
  compactNote(
    "sample-docs-system-design",
    "system-design",
    "Sample docs system design",
    {
      id: "design-rate-limiter",
      type: "table",
      title: "Rate limiter tradeoffs",
      columns: ["Design", "Good for", "Watch out"],
      rows: [
        ["Token bucket", "Bursty clients", "Clock drift"],
        ["Sliding window", "Strict fairness", "Higher storage cost"],
      ],
    },
    reviewedCard(
      {
        id: "card-token-bucket",
        type: "basic",
        status: "active",
        prompt:
          "When is token bucket a better rate limiter than a fixed window?",
        answer:
          "When bounded bursts are acceptable and smoother average throughput matters.",
        tags: ["sample", "systems/design/rate-limiting", "system-design"],
        sourceRefs: ["[^highlight]"],
        blockRefs: ["design-rate-limiter"],
      },
      {
        due: "2026-07-03T09:00:00.000Z",
        lastReview: "2026-07-01T11:00:00.000Z",
        reviews: [
          reviewLog(
            "card-token-bucket",
            1,
            "hard",
            "2026-07-01T11:00:00.000Z",
            "2026-07-03T09:00:00.000Z",
          ),
        ],
      },
    ),
    ["systems/design/rate-limiting"],
  ),
  compactNote(
    "sample-docs-story-bank",
    "story-bank",
    "Sample docs story bank",
    {
      id: "story-conflict",
      type: "story",
      title: "Stakeholder conflict",
      useFor: ["conflict", "ownership"],
      situation: "Two teams disagreed on who should own a migration.",
      task: "Find a decision path that preserved delivery momentum.",
      action:
        "Mapped operational responsibilities, proposed ownership boundaries, and documented tradeoffs.",
      result:
        "The migration proceeded with clearer on-call and escalation paths.",
      metrics: ["1 ownership doc", "2 teams aligned"],
    },
    freshCard({
      id: "card-story-action",
      type: "basic",
      status: "active",
      prompt: "What action anchors the stakeholder conflict story?",
      answer: "Mapping responsibilities and documenting ownership tradeoffs.",
      tags: ["sample", "interview/behavioral/stories", "behavioral"],
      sourceRefs: ["[^stories/story_acme_platform]"],
      blockRefs: ["story-conflict"],
    }),
    ["interview/behavioral/stories"],
  ),
  compactNote(
    "sample-docs-freeform",
    "freeform",
    "Sample docs freeform",
    {
      id: "freeform-note",
      type: "text",
      title: "Freeform note",
      body: "This note keeps the structured metadata but leaves most content in body markdown.",
    },
    freshCard({
      id: "card-freeform-body",
      type: "basic",
      status: "active",
      prompt: "Where does freeform fixture content mostly live?",
      answer:
        "In the markdown body, while still preserving typed metadata and cards.",
      tags: ["sample", "notes/freeform", "freeform"],
      sourceRefs: ["[^text]"],
      blockRefs: ["freeform-note"],
    }),
    ["notes/freeform"],
  ),
];

function sampleDocsIndexNote(): DocsNote {
  return note({
    id: SAMPLE_DOCS_BOOK_INDEX_ID,
    title: "Sample docs",
    docType: "index",
    summary:
      "Bundled sample book that exercises every docs note type, block, and card fixture.",
    learningGoal:
      "Use these fixtures to verify editing, display, cards, review, search, and book navigation.",
    aliases: ["Sample Docs Index", "Docs Fixtures"],
    tags: [
      SAMPLE_DOCS_BOOK_TAG,
      "sample",
      "sample/docs/index",
      "index",
      "resources/docs/index",
    ],
    book: {
      chapters: SAMPLE_DOCS_CHAPTER_IDS.map((noteId) => ({ noteId })),
    },
    blocks: [
      {
        id: "index-links",
        type: "resources",
        title: "Fixture map",
        items: [
          {
            title: "Schema harness",
            url: "lapis://docs/sample-docs-schema-harness",
            kind: "note",
            notes: "Full schema coverage.",
          },
          {
            title: "Coding drill",
            url: "lapis://docs/sample-docs-coding-drill",
            kind: "note",
            notes: "Prompt block and coding-drill docType metadata.",
          },
        ],
      },
    ],
    cards: [
      freshCard({
        id: "card-index-purpose",
        type: "basic",
        status: "active",
        prompt: "What does the sample docs index fixture map?",
        answer: "It maps sample note ids to the harness areas they exercise.",
        tags: ["sample", "resources/docs/index", "index"],
        sourceRefs: ["[^section]"],
        blockRefs: ["index-links"],
      }),
    ],
    body: "Open chapters from the book navigation, or jump via wiki links like [[sample-docs-schema-harness]].",
  });
}

const sampleDocsNotesData: DocsNote[] = [
  ...sampleDocsChapterNotes,
  sampleDocsIndexNote(),
];

export function sampleDocsNotes(): DocsNote[] {
  return JSON.parse(JSON.stringify(sampleDocsNotesData)) as DocsNote[];
}
