import YAML from "yaml";

import { codingRuntimeVersion } from "./coding-runtime";
import {
  DOCS_NOTE_SCHEMA_VERSION,
  type DocsBookMetadata,
  type CreateDocsNoteInput,
  type DocsCalloutTone,
  type DocsCard,
  type DocsCardStatus,
  type DocsCardType,
  type DocsCodingDifficulty,
  type DocsCodingExample,
  type DocsCodingExercise,
  type DocsCodingHint,
  type DocsCodingLanguage,
  type DocsCodingLanguageTemplate,
  type DocsCodingLiteral,
  type DocsCodingParameter,
  type DocsCodingSignature,
  type DocsCodingSolution,
  type DocsCodingValueType,
  type DocsDocType,
  type DocsFsrsState,
  type DocsMarkdownFile,
  type DocsNote,
  type DocsResourceItem,
  type DocsRevisionBlock,
  type DocsReviewLog,
  type DocsReviewRating,
  type DocsFsrsStateName,
} from "./types";

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const DOCS_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;

const DOC_TYPES = new Set<DocsDocType>([
  "revision",
  "coding-drill",
  "system-design",
  "story-bank",
  "index",
  "freeform",
]);
const CARD_TYPES = new Set<DocsCardType>(["basic", "cloze", "coding"]);
const CARD_STATUSES = new Set<DocsCardStatus>(["active", "suspended"]);
const REVIEW_RATINGS = new Set<DocsReviewRating>([
  "again",
  "hard",
  "good",
  "easy",
]);
const FSRS_STATES = new Set<DocsFsrsStateName>([
  "New",
  "Learning",
  "Review",
  "Relearning",
]);
const BLOCK_TYPES = new Set<DocsRevisionBlock["type"]>([
  "text",
  "markdown",
  "concept",
  "procedure",
  "prompt",
  "code",
  "table",
  "callout",
  "story",
  "resources",
]);
const CALLOUT_TONES = new Set<DocsCalloutTone>([
  "note",
  "tip",
  "warning",
  "critical",
]);
const CODING_DIFFICULTIES = new Set<DocsCodingDifficulty>([
  "easy",
  "medium",
  "hard",
]);
const CODING_LANGUAGES = new Set<DocsCodingLanguage>([
  "python",
  "java",
  "kotlin",
]);
const CODING_VALUE_TYPES = new Set<DocsCodingValueType>([
  "int",
  "long",
  "boolean",
  "string",
  "int[]",
  "long[]",
  "boolean[]",
  "string[]",
  "int[][]",
  "long[][]",
  "boolean[][]",
  "string[][]",
]);
const DEFAULT_CODING_LANGUAGES = [
  "python",
  "java",
  "kotlin",
] as const satisfies readonly DocsCodingLanguage[];
const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function nowIso(now = new Date()) {
  return now.toISOString();
}

export function isValidDocsId(value: string) {
  return DOCS_ID_PATTERN.test(value);
}

export function assertDocsId(value: string) {
  if (!isValidDocsId(value)) throw new Error(`Invalid docs id: ${value}`);
  return value;
}

export function slugifyDocsId(value: string, fallback = "note") {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || fallback;
}

function stringValue(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function numberValue(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.map((item) => stringValue(item).trim()).filter(Boolean)),
  );
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => stringValue(item).trim()).filter(Boolean);
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeBook(value: unknown): DocsBookMetadata | undefined {
  const record = recordValue(value);
  if (!Object.keys(record).length) return undefined;
  const chapters = Array.isArray(record.chapters)
    ? record.chapters
        .map((chapter) => {
          const chapterRecord = recordValue(chapter);
          const noteId = stringValue(
            chapterRecord.noteId ?? chapterRecord.note_id ?? chapterRecord.id,
          ).trim();
          if (!noteId) return null;
          return { noteId: assertDocsId(noteId) };
        })
        .filter((chapter): chapter is { noteId: string } => chapter !== null)
    : [];
  return { chapters };
}

export function compactObject<T extends Record<string, unknown>>(
  record: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === "string" && !value.trim()) return false;
      return true;
    }),
  ) as Partial<T>;
}

function splitFrontmatter(content: string) {
  const match = content.match(FRONTMATTER_PATTERN);
  if (!match) return { frontmatter: {}, body: content };
  return {
    frontmatter: recordValue(YAML.parse(match[1] ?? "") ?? {}),
    body: content.slice(match[0].length),
  };
}

function idFromPath(path: string) {
  const filename = path.split("/").pop() ?? "";
  return filename.replace(/\.(?:md|markdown)$/i, "");
}

function normalizeDate(value: unknown, fallback: string) {
  const raw = stringValue(value).trim();
  if (!raw) return fallback;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function optionalIsoDate(value: unknown): string | undefined {
  const raw = stringValue(value).trim();
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function normalizeDocType(value: unknown): DocsDocType {
  return DOC_TYPES.has(value as DocsDocType)
    ? (value as DocsDocType)
    : "revision";
}

function normalizeCardType(value: unknown): DocsCardType {
  return CARD_TYPES.has(value as DocsCardType)
    ? (value as DocsCardType)
    : "basic";
}

function normalizeCardStatus(value: unknown): DocsCardStatus {
  return CARD_STATUSES.has(value as DocsCardStatus)
    ? (value as DocsCardStatus)
    : "active";
}

function codingFileName(language: DocsCodingLanguage) {
  if (language === "python") return "solution.py";
  if (language === "java") return "Solution.java";
  return "Solution.kt";
}

function codingStarterCode(language: DocsCodingLanguage) {
  if (language === "python") {
    return [
      "class Solution:",
      "    def solve(self):",
      "        return 0",
      "",
    ].join("\n");
  }
  if (language === "java") {
    return [
      "class Solution {",
      "    int solve() {",
      "        return 0;",
      "    }",
      "}",
      "",
    ].join("\n");
  }
  return [
    "class Solution {",
    "    fun solve(): Int {",
    "        return 0",
    "    }",
    "}",
    "",
  ].join("\n");
}

function defaultCodingLanguageTemplate(
  language: DocsCodingLanguage,
): DocsCodingLanguageTemplate {
	return {
		language,
		version: codingRuntimeVersion(language),
    fileName: codingFileName(language),
    starterCode: codingStarterCode(language),
  };
}

export function createDocsCodingExercise(
  exerciseId: string,
): DocsCodingExercise {
  const id = assertDocsId(exerciseId);
  return {
    id,
    difficulty: "easy",
    description: "",
    constraints: [],
    signature: {
      className: "Solution",
      methodName: "solve",
      parameters: [],
      returnType: "int",
    },
    languages: DEFAULT_CODING_LANGUAGES.map((language) =>
      defaultCodingLanguageTemplate(language),
    ),
    examples: [],
    hints: [],
    solutions: [],
  };
}

function normalizeCodingDifficulty(value: unknown): DocsCodingDifficulty {
  return CODING_DIFFICULTIES.has(value as DocsCodingDifficulty)
    ? (value as DocsCodingDifficulty)
    : "easy";
}

function normalizeCodingValueType(
  value: unknown,
  fallback: DocsCodingValueType,
): DocsCodingValueType {
  return CODING_VALUE_TYPES.has(value as DocsCodingValueType)
    ? (value as DocsCodingValueType)
    : fallback;
}

function normalizeCodingIdentifier(
  value: unknown,
  fallback: string,
  label: string,
) {
  const normalized = stringValue(value).trim() || fallback;
  if (!IDENTIFIER_PATTERN.test(normalized))
    throw new Error(`Invalid coding exercise ${label}.`);
  return normalized;
}

function normalizeCodingParameters(value: unknown): DocsCodingParameter[] {
  if (!Array.isArray(value)) return [];
  const names = new Set<string>();
  return value.map((item, index) => {
    const record = recordValue(item);
    const name = normalizeCodingIdentifier(
      record.name,
      `arg${index + 1}`,
      "parameter name",
    );
    if (names.has(name))
      throw new Error(`Duplicate coding exercise parameter: ${name}`);
    names.add(name);
    return { name, type: normalizeCodingValueType(record.type, "int") };
  });
}

function normalizeCodingLiteral(
  value: unknown,
  type: DocsCodingValueType,
): DocsCodingLiteral {
  const dimensions = type.endsWith("[][]") ? 2 : type.endsWith("[]") ? 1 : 0;
  const scalarType = type.replace(/\[\]/g, "") as
    | "int"
    | "long"
    | "boolean"
    | "string";
  const normalizeScalar = (candidate: unknown): DocsCodingLiteral => {
    if (
      (scalarType === "int" || scalarType === "long") &&
      typeof candidate === "number" &&
      Number.isSafeInteger(candidate)
    )
      return candidate;
    if (scalarType === "boolean" && typeof candidate === "boolean")
      return candidate;
    if (scalarType === "string" && typeof candidate === "string")
      return candidate;
    throw new Error(`Invalid ${type} coding test value.`);
  };
  if (dimensions === 0) return normalizeScalar(value);
  if (!Array.isArray(value))
    throw new Error(`Invalid ${type} coding test value.`);
  if (dimensions === 1) return value.map(normalizeScalar);
  return value.map((row) => {
    if (!Array.isArray(row))
      throw new Error(`Invalid ${type} coding test value.`);
    return row.map(normalizeScalar);
  });
}

function normalizeCodingExample(
  value: unknown,
  index: number,
  signature: DocsCodingSignature,
): DocsCodingExample {
  const record = recordValue(value);
  const id = stringValue(record.id).trim() || `case-${index + 1}`;
  if (!isValidDocsId(id)) throw new Error(`Invalid coding test case id: ${id}`);
  const suppliedArguments = record.arguments ?? record.args;
  const argumentsValue: unknown[] = Array.isArray(suppliedArguments)
    ? suppliedArguments
    : [];
  if (argumentsValue.length !== signature.parameters.length) {
    throw new Error(
      `Coding test case ${id} has the wrong number of arguments.`,
    );
  }
  return {
    id,
    ...(stringValue(record.title).trim()
      ? { title: stringValue(record.title).trim() }
      : {}),
    arguments: argumentsValue.map((argument, argumentIndex) =>
      normalizeCodingLiteral(
        argument,
        signature.parameters[argumentIndex]!.type,
      ),
    ),
    expected: normalizeCodingLiteral(record.expected, signature.returnType),
    ...(stringValue(record.explanation).trim()
      ? { explanation: stringValue(record.explanation).trim() }
      : {}),
  };
}

function normalizeCodingHints(value: unknown): DocsCodingHint[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.map((item, index) => {
    const record = recordValue(item);
    const id = stringValue(record.id).trim() || `hint-${index + 1}`;
    if (!isValidDocsId(id)) throw new Error(`Invalid coding hint id: ${id}`);
    if (ids.has(id)) throw new Error(`Duplicate coding hint id: ${id}`);
    ids.add(id);
    return {
      id,
      title: stringValue(record.title).trim() || `Hint ${index + 1}`,
      body: stringValue(record.body),
    };
  });
}

function normalizeCodingSolutions(
  value: unknown,
  languages: DocsCodingLanguageTemplate[],
): DocsCodingSolution[] {
  if (!Array.isArray(value)) return [];
  const availableLanguages = new Set(languages.map((template) => template.language));
  const seenLanguages = new Set<DocsCodingLanguage>();
  return value.map((item) => {
    const record = recordValue(item);
    const language = stringValue(record.language).trim() as DocsCodingLanguage;
    if (!CODING_LANGUAGES.has(language) || !availableLanguages.has(language)) {
      throw new Error(`Unsupported coding exercise solution language: ${language}`);
    }
    if (seenLanguages.has(language)) {
      throw new Error(`Duplicate coding exercise solution language: ${language}`);
    }
    seenLanguages.add(language);
    return {
      language,
      ...(stringValue(record.explanation).trim()
        ? { explanation: stringValue(record.explanation).trim() }
        : {}),
      code: stringValue(record.code),
    };
  });
}

function normalizeCodingLanguages(
  value: unknown,
): DocsCodingLanguageTemplate[] {
  if (!Array.isArray(value) || !value.length) {
    return DEFAULT_CODING_LANGUAGES.map((language) =>
      defaultCodingLanguageTemplate(language),
    );
  }
  const languages = new Set<DocsCodingLanguage>();
  const templates: DocsCodingLanguageTemplate[] = [];
  for (const item of value) {
    const record = recordValue(item);
    const language = stringValue(record.language).trim() as DocsCodingLanguage;
    if (!CODING_LANGUAGES.has(language))
      throw new Error(`Unsupported coding exercise language: ${language}`);
    if (languages.has(language))
      throw new Error(`Duplicate coding exercise language: ${language}`);
    languages.add(language);
    const defaults = defaultCodingLanguageTemplate(language);
    templates.push({
      language,
      version: stringValue(record.version).trim() || defaults.version,
      fileName:
        stringValue(record.fileName ?? record.file_name).trim() ||
        defaults.fileName,
      starterCode:
        stringValue(record.starterCode ?? record.starter_code) ||
        defaults.starterCode,
    });
  }
  return templates;
}

export function normalizeDocsCodingExercise(
  value: unknown,
  cardId: string,
): DocsCodingExercise {
  const record = recordValue(value);
  const fallback = createDocsCodingExercise(
    `exercise-${slugifyDocsId(cardId, "card")}`,
  );
  if (!Object.keys(record).length) return fallback;
  const id = stringValue(record.id).trim() || fallback.id;
  if (!isValidDocsId(id)) throw new Error(`Invalid coding exercise id: ${id}`);
  const signatureRecord = recordValue(record.signature);
  const signature: DocsCodingSignature = {
    className: normalizeCodingIdentifier(
      signatureRecord.className ?? signatureRecord.class_name,
      "Solution",
      "class name",
    ),
    methodName: normalizeCodingIdentifier(
      signatureRecord.methodName ?? signatureRecord.method_name,
      "solve",
      "method name",
    ),
    parameters: normalizeCodingParameters(signatureRecord.parameters),
    returnType: normalizeCodingValueType(
      signatureRecord.returnType ?? signatureRecord.return_type,
      "int",
    ),
  };
  const examples = Array.isArray(record.examples)
    ? record.examples.map((item, index) =>
        normalizeCodingExample(item, index, signature),
      )
    : [];
  const exampleIds = new Set<string>();
  for (const example of examples) {
    if (exampleIds.has(example.id))
      throw new Error(`Duplicate coding test case id: ${example.id}`);
    exampleIds.add(example.id);
  }
  const languages = normalizeCodingLanguages(record.languages);
  return {
    id,
    difficulty: normalizeCodingDifficulty(record.difficulty),
    description: stringValue(record.description).trim(),
    constraints: stringList(record.constraints),
    signature,
    languages,
    examples,
    hints: normalizeCodingHints(record.hints),
    solutions: normalizeCodingSolutions(record.solutions, languages),
  };
}

function normalizeFsrsStateName(value: unknown): DocsFsrsStateName {
  return FSRS_STATES.has(value as DocsFsrsStateName)
    ? (value as DocsFsrsStateName)
    : "New";
}

function normalizeReviewRating(value: unknown): DocsReviewRating | null {
  const rating =
    typeof value === "string"
      ? value.trim().toLowerCase()
      : String(value ?? "");
  return REVIEW_RATINGS.has(rating as DocsReviewRating)
    ? (rating as DocsReviewRating)
    : null;
}

function normalizeFsrs(value: unknown): DocsFsrsState | undefined {
  const record = recordValue(value);
  const due = normalizeDate(record.due, "");
  if (!due) return undefined;
  return {
    due,
    stability: numberValue(record.stability),
    difficulty: numberValue(record.difficulty),
    elapsedDays: numberValue(record.elapsedDays ?? record.elapsed_days),
    scheduledDays: numberValue(record.scheduledDays ?? record.scheduled_days),
    learningSteps: numberValue(record.learningSteps ?? record.learning_steps),
    reps: numberValue(record.reps),
    lapses: numberValue(record.lapses),
    state: normalizeFsrsStateName(record.state),
    ...(record.lastReview || record.last_review
      ? {
          lastReview: normalizeDate(
            record.lastReview ?? record.last_review,
            due,
          ),
        }
      : {}),
  };
}

function normalizeReview(value: unknown, index: number): DocsReviewLog | null {
  const record = recordValue(value);
  const rating = normalizeReviewRating(record.rating);
  const reviewedAt = normalizeDate(record.reviewedAt ?? record.review, "");
  const due = normalizeDate(record.due, "");
  if (!rating || !reviewedAt || !due) return null;
  return {
    id: stringValue(record.id).trim() || `review-${index + 1}`,
    rating,
    reviewedAt,
    state: normalizeFsrsStateName(record.state),
    due,
    stability: numberValue(record.stability),
    difficulty: numberValue(record.difficulty),
    elapsedDays: numberValue(record.elapsedDays ?? record.elapsed_days),
    scheduledDays: numberValue(record.scheduledDays ?? record.scheduled_days),
    learningSteps: numberValue(record.learningSteps ?? record.learning_steps),
  };
}

function normalizeReviews(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => normalizeReview(item, index))
    .filter((item): item is DocsReviewLog => item !== null);
}

function normalizeBlockType(value: unknown): DocsRevisionBlock["type"] {
  return BLOCK_TYPES.has(value as DocsRevisionBlock["type"])
    ? (value as DocsRevisionBlock["type"])
    : "text";
}

function normalizeCalloutTone(value: unknown): DocsCalloutTone {
  return CALLOUT_TONES.has(value as DocsCalloutTone)
    ? (value as DocsCalloutTone)
    : "note";
}

function blockId(record: Record<string, unknown>, index: number, type: string) {
  const raw = stringValue(record.id).trim();
  if (raw) {
    if (!isValidDocsId(raw)) throw new Error(`Invalid docs block id: ${raw}`);
    return raw;
  }
  return `block-${slugifyDocsId(
    stringValue(record.title).trim() || type || String(index + 1),
    "block",
  )}-${index + 1}`;
}

function normalizeResourceItem(value: unknown): DocsResourceItem | null {
  const record = recordValue(value);
  const title = stringValue(record.title ?? record.label).trim();
  const url = stringValue(record.url ?? record.href).trim();
  if (!title && !url) return null;
  return {
    title: title || url,
    url,
    kind: stringValue(record.kind ?? record.type).trim(),
    notes: stringValue(record.notes ?? record.body).trim(),
  };
}

function normalizeResourceItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeResourceItem)
    .filter((item): item is DocsResourceItem => item !== null);
}

function normalizeTableRows(value: unknown, columns: string[]) {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (Array.isArray(row)) {
        return row.map((item) => stringValue(item).trim());
      }
      const record = recordValue(row);
      if (Object.keys(record).length === 0) return null;
      if (columns.length) {
        return columns.map((column) => stringValue(record[column]).trim());
      }
      return Object.values(record).map((item) => stringValue(item).trim());
    })
    .filter((row): row is string[] => Array.isArray(row) && row.length > 0);
}

export function normalizeDocsBlock(
  input: unknown,
  index: number,
): DocsRevisionBlock {
  const record = recordValue(input);
  const type = normalizeBlockType(record.type);
  const id = blockId(record, index, type);
  const title = stringValue(record.title).trim();
  switch (type) {
    case "concept":
      return {
        id,
        type,
        ...(title ? { title } : {}),
        summary: stringValue(record.summary).trim(),
        keyPoints: stringList(record.keyPoints ?? record.key_points),
        details: stringValue(record.details ?? record.body).trim(),
      };
    case "procedure":
      return {
        id,
        type,
        ...(title ? { title } : {}),
        steps: stringList(record.steps ?? record.items),
        notes: stringValue(record.notes ?? record.body).trim(),
      };
    case "prompt":
      return {
        id,
        type,
        ...(title ? { title } : {}),
        problem: stringValue(record.problem ?? record.body).trim(),
        requirements: stringList(record.requirements),
        approach: stringValue(record.approach).trim(),
        traps: stringList(record.traps),
        tests: stringList(record.tests),
        answer: stringValue(record.answer).trim(),
      };
    case "code":
      return {
        id,
        type,
        ...(title ? { title } : {}),
        language: stringValue(record.language ?? record.lang).trim(),
        code: stringValue(record.code ?? record.body).trim(),
        caption: stringValue(record.caption).trim(),
      };
    case "table": {
      const columns = stringList(record.columns ?? record.headers);
      return {
        id,
        type,
        ...(title ? { title } : {}),
        columns,
        rows: normalizeTableRows(record.rows, columns),
      };
    }
    case "callout":
      return {
        id,
        type,
        ...(title ? { title } : {}),
        tone: normalizeCalloutTone(record.tone),
        body: stringValue(record.body ?? record.summary).trim(),
      };
    case "story":
      return {
        id,
        type,
        ...(title ? { title } : {}),
        useFor: stringList(record.useFor ?? record.use_for),
        situation: stringValue(record.situation).trim(),
        task: stringValue(record.task).trim(),
        action: stringValue(record.action).trim(),
        result: stringValue(record.result).trim(),
        metrics: stringList(record.metrics),
      };
    case "resources":
      return {
        id,
        type,
        ...(title ? { title } : {}),
        items: normalizeResourceItems(record.items ?? record.resources),
      };
    case "markdown":
      return {
        id,
        type: "markdown",
        ...(title ? { title } : {}),
        body: stringValue(record.body ?? record.text).trim(),
      };
    case "text":
    default:
      return {
        id,
        type: "text",
        ...(title ? { title } : {}),
        body: stringValue(record.body ?? record.text).trim(),
      };
  }
}

function normalizeDocsBlocks(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((block, index) => normalizeDocsBlock(block, index));
}

export function normalizeDocsCard(
  input: unknown,
  index: number,
  timestamp: string,
): DocsCard {
  const record = recordValue(input);
  const prompt = stringValue(record.prompt).trim();
  const answer = stringValue(record.answer).trim();
  const id =
    stringValue(record.id).trim() ||
    `card-${slugifyDocsId(prompt || answer || String(index + 1), "card")}`;
  if (!isValidDocsId(id)) throw new Error(`Invalid docs card id: ${id}`);
  const type = normalizeCardType(record.type);
  return {
    id,
    type,
    status: normalizeCardStatus(record.status),
    prompt,
    answer,
    tags: stringArray(record.tags),
    blockRefs: stringArray(record.blockRefs ?? record.block_refs),
    ...(type === "coding"
      ? { exercise: normalizeDocsCodingExercise(record.exercise, id) }
      : {}),
    ...(type === "coding" ? {} : { fsrs: normalizeFsrs(record.fsrs) }),
    reviews: type === "coding" ? [] : normalizeReviews(record.reviews),
  };
}

export function createDocsNote(
  input: CreateDocsNoteInput = {},
  now = new Date(),
): DocsNote {
  const timestamp = nowIso(now);
  const title = input.title?.trim() || "Untitled note";
  const id = assertDocsId(input.id?.trim() || slugifyDocsId(title));
  return {
    id,
    title,
    docType: normalizeDocType(input.docType),
    summary: input.summary?.trim() ?? "",
    learningGoal: input.learningGoal?.trim() ?? "",
    aliases: stringArray(input.aliases),
    tags: stringArray(input.tags),
    book: normalizeBook(input.book),
    ...(() => {
      const bookId = input.bookId?.trim();
      return bookId && isValidDocsId(bookId) ? { bookId } : {};
    })(),
    blocks: normalizeDocsBlocks(input.blocks),
    cards: (input.cards ?? []).map((card, index) =>
      normalizeDocsCard(card, index, timestamp),
    ),
    body: input.body ?? "",
    ...(() => {
      const completedAt = optionalIsoDate(input.completedAt);
      return completedAt ? { completedAt } : {};
    })(),
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
    sourcePath: `docs/${id}.doc.md`,
  };
}

export function parseDocsNoteMarkdownFile(file: DocsMarkdownFile): DocsNote {
  const { frontmatter, body } = splitFrontmatter(file.content);
  const fallbackTimestamp = nowIso();
  const title =
    stringValue(frontmatter.title).trim() ||
    slugifyDocsId(idFromPath(file.path), "Untitled note").replace(/-/g, " ");
  const id = assertDocsId(
    stringValue(frontmatter.id).trim() ||
      slugifyDocsId(idFromPath(file.path) || title),
  );
  const timestamp = normalizeDate(
    frontmatter.updatedAt ?? frontmatter.updated_at,
    fallbackTimestamp,
  );
  const cards = Array.isArray(frontmatter.cards)
    ? frontmatter.cards.map((card, index) =>
        normalizeDocsCard(card, index, timestamp),
      )
    : [];
  return {
    id,
    title,
    docType: normalizeDocType(frontmatter.docType ?? frontmatter.doc_type),
    summary: stringValue(frontmatter.summary).trim(),
    learningGoal: stringValue(
      frontmatter.learningGoal ?? frontmatter.learning_goal,
    ).trim(),
    aliases: stringArray(frontmatter.aliases),
    tags: stringArray(frontmatter.tags),
    book: normalizeBook(frontmatter.book),
    ...(() => {
      const bookId = stringValue(
        frontmatter.bookId ?? frontmatter.book_id,
      ).trim();
      return bookId && isValidDocsId(bookId) ? { bookId } : {};
    })(),
    blocks: normalizeDocsBlocks(frontmatter.blocks ?? frontmatter.sections),
    cards,
    body: body.trim(),
    ...(() => {
      const completedAt = optionalIsoDate(
        frontmatter.completedAt ?? frontmatter.completed_at,
      );
      return completedAt ? { completedAt } : {};
    })(),
    createdAt: normalizeDate(
      frontmatter.createdAt ?? frontmatter.created_at,
      timestamp,
    ),
    updatedAt: timestamp,
    sourcePath: file.path,
  };
}
