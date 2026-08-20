export const CARD_STACK_MOTION = {
	rotateFactor: 3.5,
	scaleFactor: 0.045,
	pivot: '50% 100%',
	kickMs: 200,
	settleMs: 500,
	promoteDelayMs: 150,
	totalMs: 700,
	visibleDepth: 3
} as const;

export const CARD_STACK_KICK = {
	x: '40%',
	y: '-8%',
	rotate: 14,
	scale: 0.8
} as const;

export const CARD_STACK_ANIMATION_NAMES = {
	kick: 'docs-card-preview-deck-kick-next',
	settleBack: 'docs-card-preview-deck-settle-back',
	dealFromBack: 'docs-card-preview-deal-from-back',
	dealKickToFront: 'docs-card-preview-deal-kick-to-front',
	promoteStep: 'docs-card-preview-promote-step',
	fanStep: 'docs-card-preview-fan-step'
} as const;

export const CARD_STACK_SWIPE = {
	activationThresholdPx: 10,
	commitThresholdPx: 72,
	rotateFactor: 0.08,
	maxRotateDeg: 12,
	snapBackMs: 220
} as const;

export function swipeDragPose(deltaX: number) {
	const rotate = Math.max(
		-CARD_STACK_SWIPE.maxRotateDeg,
		Math.min(CARD_STACK_SWIPE.maxRotateDeg, deltaX * CARD_STACK_SWIPE.rotateFactor)
	);
	return { x: deltaX, rotate };
}

export function fanPose(depth: number) {
	return {
		rotate: depth * CARD_STACK_MOTION.rotateFactor,
		scale: 1 - depth * CARD_STACK_MOTION.scaleFactor
	};
}

export function fanStackOpacity(depth: number) {
	if (depth <= 0) return 1;
	if (depth === 1) return 0.96;
	return 0.92;
}

export function fanStackZIndex(depth: number) {
	if (depth <= 0) return 3;
	if (depth === 1) return 2;
	return 1;
}

export function fanTransform(depth: number) {
	const { rotate, scale } = fanPose(depth);
	return `rotate(${rotate}deg) scale(${scale})`;
}

export type CardStackMode = 'browse' | 'study';

export function wrappedCardIndex(index: number, cardCount: number) {
	if (cardCount <= 0) return 0;
	return ((index % cardCount) + cardCount) % cardCount;
}

export function clampCardIndex(index: number, cardCount: number) {
	if (cardCount <= 0) return 0;
	return Math.max(0, Math.min(index, cardCount - 1));
}

export function resolveStackIndex(index: number, cardCount: number, mode: CardStackMode) {
	return mode === 'browse' ? wrappedCardIndex(index, cardCount) : clampCardIndex(index, cardCount);
}

export function nextStackIndex(
	index: number,
	cardCount: number,
	mode: CardStackMode,
	direction: 'next' | 'prev'
) {
	const delta = direction === 'next' ? 1 : -1;
	return resolveStackIndex(index + delta, cardCount, mode);
}

export function canNavigateStack(
	index: number,
	cardCount: number,
	mode: CardStackMode,
	direction: 'next' | 'prev'
) {
	if (cardCount <= 1 || cardCount === 0) return false;
	if (mode === 'browse') return true;
	if (direction === 'prev') return index > 0;
	return index < cardCount - 1;
}

export function cardDepthInStack(
	topIndex: number,
	targetIndex: number,
	cardCount: number,
	visibleDepth: number = CARD_STACK_MOTION.visibleDepth
) {
	const depth = wrappedCardIndex(targetIndex - topIndex, cardCount);
	return Math.min(depth, visibleDepth - 1);
}

/** @deprecated Use cardDepthInStack with the start-state top index. */
export function incomingFanDepth(
	incomingIndex: number,
	newTopIndex: number,
	cardCount: number,
	visibleDepth: number = CARD_STACK_MOTION.visibleDepth
) {
	const fromIndex = wrappedCardIndex(newTopIndex + 1, cardCount);
	return cardDepthInStack(fromIndex, incomingIndex, cardCount, visibleDepth);
}
