import type { DocsNoteSummary } from '../../model';

export type DocsNoteSortMode =
  | 'title-asc'
  | 'title-desc'
  | 'updated-desc'
  | 'updated-asc'
  | 'created-desc'
  | 'created-asc';

export const DOCS_NOTE_SORT_OPTIONS = [
  { value: 'title-asc', label: 'File Name (A to Z)' },
  { value: 'title-desc', label: 'File Name (Z to A)' },
  { value: 'updated-desc', label: 'Modified time (new to old)' },
  { value: 'updated-asc', label: 'Modified time (old to new)' },
  { value: 'created-desc', label: 'Created time (new to old)' },
  { value: 'created-asc', label: 'Created time (old to new)' }
] as const satisfies ReadonlyArray<{ value: DocsNoteSortMode; label: string }>;

export const DEFAULT_DOCS_NOTE_SORT: DocsNoteSortMode = 'title-asc';

export function isDocsNoteSortMode(value: unknown): value is DocsNoteSortMode {
  return DOCS_NOTE_SORT_OPTIONS.some((option) => option.value === value);
}

export function docsNoteSortLabel(mode: DocsNoteSortMode) {
  return (
    DOCS_NOTE_SORT_OPTIONS.find((option) => option.value === mode)?.label ??
    DOCS_NOTE_SORT_OPTIONS[0].label
  );
}

function compareText(left: string, right: string) {
  return left.localeCompare(right, undefined, { sensitivity: 'base' });
}

function compareTime(left: string, right: string) {
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);
  const safeLeft = Number.isFinite(leftTime) ? leftTime : 0;
  const safeRight = Number.isFinite(rightTime) ? rightTime : 0;
  return safeLeft - safeRight;
}

export function compareDocsNotes(left: DocsNoteSummary, right: DocsNoteSummary, mode: DocsNoteSortMode) {
  switch (mode) {
    case 'title-desc':
      return compareText(right.title, left.title) || compareText(left.id, right.id);
    case 'updated-desc':
      return (
        compareTime(right.updatedAt, left.updatedAt) ||
        compareText(left.title, right.title) ||
        compareText(left.id, right.id)
      );
    case 'updated-asc':
      return (
        compareTime(left.updatedAt, right.updatedAt) ||
        compareText(left.title, right.title) ||
        compareText(left.id, right.id)
      );
    case 'created-desc':
      return (
        compareTime(right.createdAt, left.createdAt) ||
        compareText(left.title, right.title) ||
        compareText(left.id, right.id)
      );
    case 'created-asc':
      return (
        compareTime(left.createdAt, right.createdAt) ||
        compareText(left.title, right.title) ||
        compareText(left.id, right.id)
      );
    case 'title-asc':
    default:
      return compareText(left.title, right.title) || compareText(left.id, right.id);
  }
}

export function sortDocsNotes(notes: DocsNoteSummary[], mode: DocsNoteSortMode = DEFAULT_DOCS_NOTE_SORT) {
  return [...notes].sort((left, right) => compareDocsNotes(left, right, mode));
}
