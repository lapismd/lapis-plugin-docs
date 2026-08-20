import type { DocsReviewRating } from './types';

export const REVIEW_RATINGS: DocsReviewRating[] = ['again', 'hard', 'good', 'easy'];

export const REVIEW_RATING_LABELS: Record<DocsReviewRating, string> = {
	again: 'Again',
	hard: 'Hard',
	good: 'Good',
	easy: 'Easy'
};

export const REVIEW_RATING_KEYS: Record<string, DocsReviewRating> = {
	'1': 'again',
	'2': 'hard',
	'3': 'good',
	'4': 'easy'
};
