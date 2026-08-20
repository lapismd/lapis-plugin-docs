export const DOCS_NOTE_SCHEMA_VERSION = "cvstudio.docs.note.v4";

export type DocsDocType =
  | "revision"
  | "coding-drill"
  | "system-design"
  | "story-bank"
  | "index"
  | "freeform";
export type DocsCardType = "basic" | "cloze" | "coding";
export type DocsCardStatus = "active" | "suspended";
export type DocsReviewRating = "again" | "hard" | "good" | "easy";
export type DocsNotePanel =
  | "note"
  | "display"
  | "cards"
  | "review"
  | "practice";
export type DocsFsrsStateName = "New" | "Learning" | "Review" | "Relearning";
export type DocsCalloutTone = "note" | "tip" | "warning" | "critical";

export type DocsCodingLanguage = "python" | "java" | "kotlin";
export type DocsCodingDifficulty = "easy" | "medium" | "hard";
export type DocsCodingValueType =
  | "int"
  | "long"
  | "boolean"
  | "string"
  | "int[]"
  | "long[]"
  | "boolean[]"
  | "string[]"
  | "int[][]"
  | "long[][]"
  | "boolean[][]"
  | "string[][]";
export type DocsCodingLiteral = string | number | boolean | DocsCodingLiteral[];

export type DocsCodingParameter = {
  name: string;
  type: DocsCodingValueType;
};

export type DocsCodingSignature = {
  className: string;
  methodName: string;
  parameters: DocsCodingParameter[];
  returnType: DocsCodingValueType;
};

export type DocsCodingLanguageTemplate = {
  language: DocsCodingLanguage;
  version: string;
  fileName: string;
  starterCode: string;
};

export type DocsCodingExample = {
  id: string;
  title?: string;
  arguments: DocsCodingLiteral[];
  expected: DocsCodingLiteral;
  explanation?: string;
};

export type DocsCodingHint = {
  id: string;
  title: string;
  body: string;
};

export type DocsCodingSolution = {
  language: DocsCodingLanguage;
  explanation?: string;
  code: string;
};

export type DocsCodingExercise = {
  id: string;
  difficulty: DocsCodingDifficulty;
  description: string;
  constraints: string[];
  signature: DocsCodingSignature;
  languages: DocsCodingLanguageTemplate[];
  examples: DocsCodingExample[];
  hints: DocsCodingHint[];
  solutions: DocsCodingSolution[];
};

export type DocsRevisionBlockBase = {
  id: string;
  title?: string;
};

export type DocsTextBlock = DocsRevisionBlockBase & {
  type: "text";
  body: string;
};

export type DocsMarkdownBlock = DocsRevisionBlockBase & {
  type: "markdown";
  body: string;
};

export type DocsConceptBlock = DocsRevisionBlockBase & {
  type: "concept";
  summary: string;
  keyPoints: string[];
  details: string;
};

export type DocsProcedureBlock = DocsRevisionBlockBase & {
  type: "procedure";
  steps: string[];
  notes: string;
};

export type DocsPromptBlock = DocsRevisionBlockBase & {
  type: "prompt";
  problem: string;
  requirements: string[];
  approach: string;
  traps: string[];
  tests: string[];
  answer: string;
};

export type DocsCodeBlock = DocsRevisionBlockBase & {
  type: "code";
  language: string;
  code: string;
  caption: string;
};

export type DocsTableBlock = DocsRevisionBlockBase & {
  type: "table";
  columns: string[];
  rows: string[][];
};

export type DocsCalloutBlock = DocsRevisionBlockBase & {
  type: "callout";
  tone: DocsCalloutTone;
  body: string;
};

export type DocsStoryBlock = DocsRevisionBlockBase & {
  type: "story";
  useFor: string[];
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics: string[];
};

export type DocsResourceItem = {
  title: string;
  url: string;
  kind: string;
  notes: string;
};

export type DocsResourcesBlock = DocsRevisionBlockBase & {
  type: "resources";
  items: DocsResourceItem[];
};

export type DocsRevisionBlock =
  | DocsTextBlock
  | DocsMarkdownBlock
  | DocsConceptBlock
  | DocsProcedureBlock
  | DocsPromptBlock
  | DocsCodeBlock
  | DocsTableBlock
  | DocsCalloutBlock
  | DocsStoryBlock
  | DocsResourcesBlock;

export type DocsBookChapterRef = {
  noteId: string;
};

export type DocsBookMetadata = {
  chapters: DocsBookChapterRef[];
};

export type DocsFsrsState = {
  due: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: DocsFsrsStateName;
  lastReview?: string;
};

export type DocsReviewLog = {
  id: string;
  rating: DocsReviewRating;
  reviewedAt: string;
  state: DocsFsrsStateName;
  due: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
};

export type DocsCard = {
  id: string;
  type: DocsCardType;
  status: DocsCardStatus;
  prompt: string;
  answer: string;
  tags: string[];
  sourceRefs: string[];
  blockRefs: string[];
  fsrs?: DocsFsrsState;
  reviews: DocsReviewLog[];
  /** Required when type is coding; coding cards do not enter the FSRS queue. */
  exercise?: DocsCodingExercise;
};

export type DocsNote = {
  id: string;
  title: string;
  docType: DocsDocType;
  summary: string;
  learningGoal: string;
  aliases: string[];
  tags: string[];
  book?: DocsBookMetadata;
  /** Index note id when this note is a chapter of a book. */
  bookId?: string;
  blocks: DocsRevisionBlock[];
  cards: DocsCard[];
  body: string;
  /** ISO timestamp when the note was marked complete for reading progress. */
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  sourcePath: string;
};

/** Sidebar / index payload without bodies, blocks, or card content. */
export type DocsNoteSummary = {
  id: string;
  title: string;
  docType: DocsDocType;
  summary: string;
  aliases: string[];
  tags: string[];
  sourcePath: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cardCount: number;
  blockCount: number;
  dueCardCount?: number;
  book?: DocsBookMetadata;
  bookId?: string;
};

export type DocsMarkdownFile = {
  path: string;
  content: string;
};

export type DocsWikiLink = {
  sourceNoteId: string;
  raw: string;
  target: string;
  label?: string;
  resolvedNoteId?: string;
  ambiguousNoteIds?: string[];
  index: number;
};

export type DocsBacklink = {
  sourceNoteId: string;
  sourceTitle: string;
  raw: string;
  label?: string;
  excerpt: string;
};

export type DocsGraph = {
  links: DocsWikiLink[];
  backlinks: Record<string, DocsBacklink[]>;
  unresolvedLinks: DocsWikiLink[];
  ambiguousLinks: DocsWikiLink[];
  tags: DocsTagSummary[];
};

export type DocsTagSummary = {
  tag: string;
  noteCount: number;
  cardCount: number;
};

export type DocsReviewQueueItem = {
  noteId: string;
  noteTitle: string;
  noteSourcePath?: string;
  cardId: string;
  card: DocsCard;
  dueAt: string;
};

export type DocsBookChapter = {
  index: number;
  noteId: string;
  title: string;
  summary: string;
  sourcePath: string;
  resolved: boolean;
  completed: boolean;
  completedAt?: string;
};

export type DocsBookNavigation = {
  id: string;
  indexNoteId: string;
  title: string;
  summary: string;
  sourcePath: string;
  chapters: DocsBookChapter[];
  completedCount: number;
  resolvedCount: number;
  progressPercent: number;
};

/** Slim chapter membership — resolve full TOC via `books` + `bookId`. */
export type DocsBookChapterNavigation = {
  bookId: string;
  bookIndexNoteId: string;
  bookTitle: string;
  progressPercent: number;
  completedCount: number;
  resolvedCount: number;
  chapter: DocsBookChapter;
  previousChapter?: DocsBookChapter;
  nextChapter?: DocsBookChapter;
};

/**
 * Due-card queue for the index payload. Includes full cards (queue is small)
 * so review UI works without loading every note body.
 */
export type DocsReviewQueueSummaryItem = DocsReviewQueueItem;

/** Workspace list payload without full note bodies. */
export type DocsWorkspaceIndex = {
  notes: DocsNoteSummary[];
  graph: DocsGraph;
  reviewQueue: DocsReviewQueueSummaryItem[];
  tags: DocsTagSummary[];
  books: DocsBookNavigation[];
  bookChaptersByNoteId: Record<string, DocsBookChapterNavigation>;
};

export type DocsCardStackMode = "browse" | "study";

export type DocsReviewScope = "note" | "workspace";

export type DocsCardStackItem = {
  key: string;
  card: DocsCard;
  noteId?: string;
  noteTitle: string;
  noteSourcePath?: string;
  noteBlocks?: DocsRevisionBlock[];
  dueAt?: string;
};

export type DocsWorkspace = {
  notes: DocsNote[];
  graph: DocsGraph;
  reviewQueue: DocsReviewQueueItem[];
  tags: DocsTagSummary[];
  books: DocsBookNavigation[];
  bookChaptersByNoteId: Record<string, DocsBookChapterNavigation>;
};

export type CreateDocsNoteInput = {
  id?: string;
  title?: string;
  docType?: DocsDocType;
  summary?: string;
  learningGoal?: string;
  aliases?: string[];
  tags?: string[];
  book?: DocsBookMetadata;
  bookId?: string;
  blocks?: Partial<DocsRevisionBlock>[];
  body?: string;
  cards?: Partial<DocsCard>[];
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};
