import { describe, expect, it } from 'vitest';

import { formatDocsReviewInterval, previewDocsCardRatings } from './fsrs';
import type { DocsCard } from './types';

const card: DocsCard = {
	id: 'card-interval',
	type: 'basic',
	status: 'active',
	prompt: 'Prompt',
	answer: 'Answer',
	tags: [],
	blockRefs: [],
	fsrs: {
		due: '2026-07-02T09:00:00.000Z',
		stability: 0,
		difficulty: 0,
		elapsedDays: 0,
		scheduledDays: 0,
		learningSteps: 0,
		reps: 0,
		lapses: 0,
		state: 'New'
	},
	reviews: []
};

describe('formatDocsReviewInterval', () => {
	it('formats short learning intervals in minutes', () => {
		const now = new Date('2026-07-02T09:00:00.000Z');
		expect(formatDocsReviewInterval('2026-07-02T09:10:00.000Z', now)).toBe('10m');
	});

	it('formats longer intervals in days', () => {
		const now = new Date('2026-07-02T09:00:00.000Z');
		expect(formatDocsReviewInterval('2026-07-05T09:00:00.000Z', now)).toBe('3d');
	});
});

describe('previewDocsCardRatings', () => {
	it('returns projected due dates for each rating', () => {
		const previews = previewDocsCardRatings(card, new Date('2026-07-02T09:00:00.000Z'));
		expect(previews.again.due).toBeTruthy();
		expect(previews.good.due).toBeTruthy();
		expect(new Date(previews.good.due).getTime()).toBeGreaterThan(
			new Date(previews.again.due).getTime()
		);
	});
});
