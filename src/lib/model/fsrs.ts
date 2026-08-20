import {
  Rating,
  State,
  createEmptyCard,
  fsrs,
  generatorParameters,
  type Card,
  type CardInput,
  type Grade,
  type ReviewLog,
} from "ts-fsrs";

import {
  type DocsCard,
  type DocsFsrsState,
  type DocsFsrsStateName,
  type DocsNote,
  type DocsReviewLog,
  type DocsReviewQueueItem,
  type DocsReviewRating,
} from "./types";

export const docsFsrsParameters = generatorParameters({
  request_retention: 0.9,
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: ["1m", "10m"],
  relearning_steps: ["10m"],
});

const ratingMap = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
} as const satisfies Record<DocsReviewRating, Grade>;

const ratingNameByValue = new Map<Rating, DocsReviewRating>([
  [Rating.Again, "again"],
  [Rating.Hard, "hard"],
  [Rating.Good, "good"],
  [Rating.Easy, "easy"],
]);

function stateName(value: State): DocsFsrsStateName {
  return State[value] as DocsFsrsStateName;
}

function stateValue(value: DocsFsrsStateName): State {
  return State[value];
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function toIso(value: Date | string) {
  return toDate(value).toISOString();
}

export function fsrsStateFromCard(card: Card): DocsFsrsState {
  return {
    due: toIso(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: stateName(card.state),
    ...(card.last_review ? { lastReview: toIso(card.last_review) } : {}),
  };
}

export function fsrsCardFromState(
  state: DocsFsrsState | undefined,
  now = new Date(),
): CardInput | Card {
  if (!state) return createEmptyCard(now);
  return {
    due: toDate(state.due),
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: state.elapsedDays,
    scheduled_days: state.scheduledDays,
    learning_steps: state.learningSteps,
    reps: state.reps,
    lapses: state.lapses,
    state: stateValue(state.state),
    last_review: state.lastReview ? toDate(state.lastReview) : null,
  };
}

function reviewLogId(cardId: string, review: Date) {
  const stamp = review
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/[^0-9TZ]+/g, "")
    .replace(/Z$/, "")
    .toLowerCase();
  return `${cardId}-${stamp}`;
}

function docsReviewLog(
  cardId: string,
  log: ReviewLog,
  fallbackRating: DocsReviewRating,
): DocsReviewLog {
  return {
    id: reviewLogId(cardId, log.review),
    rating: ratingNameByValue.get(log.rating) ?? fallbackRating,
    reviewedAt: log.review.toISOString(),
    state: stateName(log.state),
    due: log.due.toISOString(),
    stability: log.stability,
    difficulty: log.difficulty,
    elapsedDays: log.elapsed_days,
    scheduledDays: log.scheduled_days,
    learningSteps: log.learning_steps,
  };
}

export function reviewDocsCard(
  card: DocsCard,
  rating: DocsReviewRating,
  reviewedAt = new Date(),
): DocsCard {
  if (card.type === "coding")
    throw new Error("Coding cards are evaluated through exercise submissions.");
  const scheduler = fsrs(docsFsrsParameters);
  const result = scheduler.next(
    fsrsCardFromState(card.fsrs, reviewedAt),
    reviewedAt,
    ratingMap[rating],
  );
  return {
    ...card,
    fsrs: fsrsStateFromCard(result.card),
    reviews: [...card.reviews, docsReviewLog(card.id, result.log, rating)],
  };
}

function dueAt(card: DocsCard, now: Date) {
  return card.fsrs?.due ?? now.toISOString();
}

export function buildDocsReviewQueue(
  notes: DocsNote[],
  now = new Date(),
): DocsReviewQueueItem[] {
  const nowMs = now.getTime();
  return notes
    .flatMap((note) =>
      note.cards
        .filter((card) => card.status === "active" && card.type !== "coding")
        .map((card) => ({
          noteId: note.id,
          noteTitle: note.title,
          noteSourcePath: note.sourcePath,
          cardId: card.id,
          card,
          dueAt: dueAt(card, now),
        })),
    )
    .filter((item) => new Date(item.dueAt).getTime() <= nowMs)
    .sort((left, right) => {
      const dueDiff =
        new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
      if (dueDiff !== 0) return dueDiff;
      return `${left.noteTitle}/${left.cardId}`.localeCompare(
        `${right.noteTitle}/${right.cardId}`,
      );
    });
}

export function previewDocsCardRatings(card: DocsCard, now = new Date()) {
  const scheduler = fsrs(docsFsrsParameters);
  const preview = scheduler.repeat(fsrsCardFromState(card.fsrs, now), now);
  return {
    again: fsrsStateFromCard(preview[Rating.Again].card),
    hard: fsrsStateFromCard(preview[Rating.Hard].card),
    good: fsrsStateFromCard(preview[Rating.Good].card),
    easy: fsrsStateFromCard(preview[Rating.Easy].card),
  } satisfies Record<DocsReviewRating, DocsFsrsState>;
}

function formatDateOnly(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDocsReviewInterval(due: string, now = new Date()) {
  const dueDate = toDate(due);
  const diffMs = dueDate.getTime() - now.getTime();
  if (diffMs <= 0) return "<1m";
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 60) return `${days}d`;
  return formatDateOnly(dueDate);
}
