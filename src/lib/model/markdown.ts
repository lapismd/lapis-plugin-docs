import YAML from "yaml";

import {
  DOCS_NOTE_SCHEMA_VERSION,
  type DocsBookMetadata,
  type DocsCard,
  type DocsCodingExercise,
  type DocsFsrsState,
  type DocsNote,
  type DocsRevisionBlock,
  type DocsReviewLog,
} from "./types";
import { assertDocsId, compactObject } from "./markdown-normalize";

export {
  assertDocsId,
  createDocsNote,
  createDocsCodingExercise,
  isValidDocsId,
  normalizeDocsBlock,
  normalizeDocsCodingExercise,
  normalizeDocsCard,
  parseDocsNoteMarkdownFile,
  slugifyDocsId,
} from "./markdown-normalize";

function serializeFsrs(fsrsState: DocsFsrsState | undefined) {
  if (!fsrsState) return undefined;
  return compactObject({
    due: fsrsState.due,
    stability: fsrsState.stability,
    difficulty: fsrsState.difficulty,
    elapsedDays: fsrsState.elapsedDays,
    scheduledDays: fsrsState.scheduledDays,
    learningSteps: fsrsState.learningSteps,
    reps: fsrsState.reps,
    lapses: fsrsState.lapses,
    state: fsrsState.state,
    lastReview: fsrsState.lastReview,
  });
}

function serializeReviews(reviews: DocsReviewLog[]) {
  return reviews.map((review) =>
    compactObject({
      id: review.id,
      rating: review.rating,
      reviewedAt: review.reviewedAt,
      state: review.state,
      due: review.due,
      stability: review.stability,
      difficulty: review.difficulty,
      elapsedDays: review.elapsedDays,
      scheduledDays: review.scheduledDays,
      learningSteps: review.learningSteps,
    }),
  );
}

function serializeBook(book: DocsBookMetadata | undefined) {
  if (!book) return undefined;
  return {
    chapters: book.chapters.map((chapter) => ({
      noteId: assertDocsId(chapter.noteId),
    })),
  };
}

function serializeBlock(block: DocsRevisionBlock) {
  switch (block.type) {
    case "concept":
      return compactObject({
        id: block.id,
        type: block.type,
        title: block.title,
        summary: block.summary,
        keyPoints: block.keyPoints,
        details: block.details,
      });
    case "procedure":
      return compactObject({
        id: block.id,
        type: block.type,
        title: block.title,
        steps: block.steps,
        notes: block.notes,
      });
    case "prompt":
      return compactObject({
        id: block.id,
        type: block.type,
        title: block.title,
        problem: block.problem,
        requirements: block.requirements,
        approach: block.approach,
        traps: block.traps,
        tests: block.tests,
        answer: block.answer,
      });
    case "code":
      return compactObject({
        id: block.id,
        type: block.type,
        title: block.title,
        language: block.language,
        code: block.code,
        caption: block.caption,
      });
    case "table":
      return compactObject({
        id: block.id,
        type: block.type,
        title: block.title,
        columns: block.columns,
        rows: block.rows,
      });
    case "callout":
      return compactObject({
        id: block.id,
        type: block.type,
        title: block.title,
        tone: block.tone,
        body: block.body,
      });
    case "story":
      return compactObject({
        id: block.id,
        type: block.type,
        title: block.title,
        useFor: block.useFor,
        situation: block.situation,
        task: block.task,
        action: block.action,
        result: block.result,
        metrics: block.metrics,
      });
    case "resources":
      return compactObject({
        id: block.id,
        type: block.type,
        title: block.title,
        items: block.items.map((item) =>
          compactObject({
            title: item.title,
            url: item.url,
            kind: item.kind,
            notes: item.notes,
          }),
        ),
      });
    case "markdown":
      return compactObject({
        id: block.id,
        type: "markdown",
        title: block.title,
        body: block.body,
      });
    case "text":
    default:
      return compactObject({
        id: block.id,
        type: "text",
        title: block.title,
        body: block.body,
      });
  }
}

function serializeCard(card: DocsCard) {
  return compactObject({
    id: card.id,
    type: card.type,
    status: card.status,
    prompt: card.prompt,
    answer: card.answer,
    tags: card.tags,
    blockRefs: card.blockRefs,
    ...(card.type === "coding" && card.exercise
      ? { exercise: serializeCodingExercise(card.exercise) }
      : {
          fsrs: serializeFsrs(card.fsrs),
          reviews: serializeReviews(card.reviews),
        }),
  });
}

function serializeCodingExercise(exercise: DocsCodingExercise) {
  return compactObject({
    id: assertDocsId(exercise.id),
    difficulty: exercise.difficulty,
    description: exercise.description,
    constraints: exercise.constraints,
    signature: {
      className: exercise.signature.className,
      methodName: exercise.signature.methodName,
      parameters: exercise.signature.parameters.map((parameter) => ({
        name: parameter.name,
        type: parameter.type,
      })),
      returnType: exercise.signature.returnType,
    },
    languages: exercise.languages.map((language) => ({
      language: language.language,
      version: language.version,
      fileName: language.fileName,
      starterCode: language.starterCode,
    })),
    examples: exercise.examples.map((example) =>
      compactObject({
        id: assertDocsId(example.id),
        title: example.title,
        arguments: example.arguments,
        expected: example.expected,
        explanation: example.explanation,
      }),
    ),
    hints: (exercise.hints ?? []).map((hint) => ({
      id: assertDocsId(hint.id),
      title: hint.title,
      body: hint.body,
    })),
    solutions: (exercise.solutions ?? []).map((solution) =>
      compactObject({
        language: solution.language,
        explanation: solution.explanation,
        code: solution.code,
      }),
    ),
  });
}

export function docsNoteToFrontmatter(note: DocsNote) {
  return compactObject({
    schemaVersion: DOCS_NOTE_SCHEMA_VERSION,
    id: assertDocsId(note.id),
    title: note.title,
    docType: note.docType,
    summary: note.summary,
    learningGoal: note.learningGoal,
    aliases: note.aliases,
    tags: note.tags,
    book: serializeBook(note.book),
    bookId: note.bookId,
    completedAt: note.completedAt,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    blocks: note.blocks.map(serializeBlock),
    cards: note.cards.map(serializeCard),
  });
}

export function docsNoteToMarkdown(note: DocsNote) {
  const frontmatter = docsNoteToFrontmatter(note);
  const body = note.body.trim();
  return `---\n${YAML.stringify(frontmatter, { lineWidth: 100 }).trimEnd()}\n---\n${
    body ? `\n${body}\n` : ""
  }`;
}

function markdownHeading(level: number, title: string) {
  return `${"#".repeat(Math.max(1, Math.min(level, 6)))} ${title}`;
}

function compactMarkdown(parts: Array<string | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join("\n\n");
}

function markdownList(items: string[], ordered = false) {
  return items
    .map((item, index) => `${ordered ? `${index + 1}.` : "-"} ${item}`)
    .join("\n");
}

function markdownTableCell(value: string) {
  return value.replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function markdownTable(columns: string[], rows: string[][]) {
  if (!columns.length) return "";
  const header = `| ${columns.map(markdownTableCell).join(" | ")} |`;
  const separator = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows
    .map((row) => {
      const cells = columns.map((_, index) =>
        markdownTableCell(row[index] ?? ""),
      );
      return `| ${cells.join(" | ")} |`;
    })
    .join("\n");
  return [header, separator, body].filter(Boolean).join("\n");
}

function blockTitle(block: DocsRevisionBlock) {
  return block.title?.trim() || block.type.replace("-", " ");
}

function renderCalloutBody(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => `> ${line}`)
    .join("\n");
}

export function renderDocsBlockMarkdown(
  block: DocsRevisionBlock,
  headingLevel = 2,
) {
  const title = markdownHeading(headingLevel, blockTitle(block));
  switch (block.type) {
    case "concept":
      return compactMarkdown([
        title,
        block.summary,
        block.keyPoints.length ? markdownList(block.keyPoints) : undefined,
        block.details,
      ]);
    case "procedure":
      return compactMarkdown([
        title,
        block.steps.length ? markdownList(block.steps, true) : undefined,
        block.notes,
      ]);
    case "prompt":
      return compactMarkdown([
        title,
        block.problem,
        block.requirements.length
          ? `${markdownHeading(headingLevel + 1, "Requirements")}\n\n${markdownList(
              block.requirements,
            )}`
          : undefined,
        block.approach
          ? `${markdownHeading(headingLevel + 1, "Approach")}\n\n${block.approach}`
          : undefined,
        block.traps.length
          ? `${markdownHeading(headingLevel + 1, "Traps")}\n\n${markdownList(
              block.traps,
            )}`
          : undefined,
        block.tests.length
          ? `${markdownHeading(headingLevel + 1, "Good tests")}\n\n${markdownList(
              block.tests,
            )}`
          : undefined,
        block.answer
          ? `${markdownHeading(headingLevel + 1, "Answer")}\n\n${block.answer}`
          : undefined,
      ]);
    case "code":
      return compactMarkdown([
        title,
        block.caption,
        `\`\`\`${block.language}\n${block.code}\n\`\`\``,
      ]);
    case "table":
      return compactMarkdown([title, markdownTable(block.columns, block.rows)]);
    case "callout":
      return compactMarkdown([
        `> [!${block.tone.toUpperCase()}]${block.title ? ` ${block.title}` : ""}`,
        renderCalloutBody(block.body),
      ]);
    case "story":
      return compactMarkdown([
        title,
        block.useFor.length
          ? `**Use for:** ${block.useFor.join(", ")}`
          : undefined,
        block.situation ? `**Situation:** ${block.situation}` : undefined,
        block.task ? `**Task:** ${block.task}` : undefined,
        block.action ? `**Action:** ${block.action}` : undefined,
        block.result ? `**Result:** ${block.result}` : undefined,
        block.metrics.length
          ? `${markdownHeading(headingLevel + 1, "Metrics")}\n\n${markdownList(
              block.metrics,
            )}`
          : undefined,
      ]);
    case "resources":
      return compactMarkdown([
        title,
        block.items
          .map((item) => {
            const label = item.url
              ? `[${item.title}](${item.url})`
              : item.title;
            const meta = [item.kind, item.notes].filter(Boolean).join(" - ");
            return `- ${label}${meta ? ` - ${meta}` : ""}`;
          })
          .join("\n"),
      ]);
    case "markdown":
      return compactMarkdown([block.title ? title : undefined, block.body]);
    case "text":
    default:
      return compactMarkdown([block.title ? title : undefined, block.body]);
  }
}

export function renderDocsNoteMarkdown(
  note: DocsNote,
  options: { mode?: "document" | "slides" } = {},
) {
  const mode = options.mode ?? "document";
  const intro = compactMarkdown([
    markdownHeading(1, note.title),
    note.summary,
    note.learningGoal ? `**Learning goal:** ${note.learningGoal}` : undefined,
  ]);
  const renderedBlocks = note.blocks.map((block) =>
    renderDocsBlockMarkdown(block, mode === "slides" ? 2 : 2),
  );
  const body =
    note.body && note.blocks.length
      ? compactMarkdown([markdownHeading(2, "Additional notes"), note.body])
      : note.body;
  if (mode === "slides") {
    return compactMarkdown([
      `---\nmarp: true\ntitle: ${JSON.stringify(note.title)}\n---`,
      [intro, ...renderedBlocks, body]
        .map((part) => part.trim())
        .filter(Boolean)
        .join("\n\n---\n\n"),
    ]);
  }
  return compactMarkdown([intro, ...renderedBlocks, body]);
}
