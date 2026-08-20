import type { DocsNote } from '../model';

export function displaySlideCount(note: DocsNote | null | undefined) {
	if (!note) return 0;
	return 1 + note.blocks.length + (note.body.trim() ? 1 : 0);
}

export function clampDisplaySlideIndex(
	index: number,
	note: DocsNote | null | undefined
) {
	const count = displaySlideCount(note);
	if (count <= 0) return 0;
	return Math.max(0, Math.min(index, count - 1));
}

/** Block label "05" maps to slide index 5 (intro is 0). */
export function slideIndexForBlockIndex(blockIndex: number) {
	return blockIndex + 1;
}

export function displayFocusSelector(note: DocsNote, slideIndex: number) {
	const clamped = clampDisplaySlideIndex(slideIndex, note);
	if (clamped === 0) return `[data-display-slide-index="0"]`;
	if (clamped <= note.blocks.length) {
		return `[data-display-slide-index="${clamped}"]`;
	}
	return `[data-display-slide-index="${note.blocks.length + 1}"]`;
}

export function readVisibleDisplaySlideIndex(
	root: HTMLElement,
	scrollRoot: Element | null
) {
	const targets = Array.from(
		root.querySelectorAll<HTMLElement>('[data-display-slide-index]')
	);
	if (!targets.length) return 0;

	const viewportTop = scrollRoot?.getBoundingClientRect().top ?? 0;
	const focusLine = viewportTop + 56;

	let bestIndex = 0;
	for (const target of targets) {
		const index = Number(target.dataset.displaySlideIndex);
		if (!Number.isFinite(index)) continue;
		const rect = target.getBoundingClientRect();
		// Classic scrollspy: the active section is the last one at or above the focus line.
		if (rect.top <= focusLine) bestIndex = index;
	}

	return bestIndex;
}
