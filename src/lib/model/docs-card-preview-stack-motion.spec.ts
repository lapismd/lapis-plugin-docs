import { describe, expect, it } from 'vitest';
import {
	CARD_STACK_ANIMATION_NAMES,
	CARD_STACK_KICK,
	CARD_STACK_MOTION,
	canNavigateStack,
	cardDepthInStack,
	clampCardIndex,
	fanPose,
	fanStackOpacity,
	fanStackZIndex,
	incomingFanDepth,
	nextStackIndex,
	resolveStackIndex,
	swipeDragPose,
	wrappedCardIndex
} from './docs-card-preview-stack-motion';

describe('docs-card-preview-stack-motion', () => {
	it('exposes shared kick pose constants for forward and reverse overlays', () => {
		expect(CARD_STACK_KICK).toEqual({
			x: '40%',
			y: '-8%',
			rotate: 14,
			scale: 0.8
		});
		expect(CARD_STACK_ANIMATION_NAMES.dealFromBack).toBe('docs-card-preview-deal-from-back');
		expect(CARD_STACK_ANIMATION_NAMES.dealKickToFront).toBe('docs-card-preview-deal-kick-to-front');
	});

	it('computes cumulative fan poses from depth', () => {
		expect(fanPose(0)).toEqual({ rotate: 0, scale: 1 });
		expect(fanPose(1)).toEqual({
			rotate: CARD_STACK_MOTION.rotateFactor,
			scale: 1 - CARD_STACK_MOTION.scaleFactor
		});
		expect(fanPose(2)).toEqual({
			rotate: CARD_STACK_MOTION.rotateFactor * 2,
			scale: 1 - CARD_STACK_MOTION.scaleFactor * 2
		});
	});

	it('maps stack depth to opacity and z-index layers', () => {
		expect(fanStackOpacity(0)).toBe(1);
		expect(fanStackOpacity(1)).toBe(0.96);
		expect(fanStackOpacity(2)).toBe(0.92);
		expect(fanStackZIndex(0)).toBe(3);
		expect(fanStackZIndex(1)).toBe(2);
		expect(fanStackZIndex(2)).toBe(1);
	});

	it('wraps card indices for looping navigation', () => {
		expect(wrappedCardIndex(0, 3)).toBe(0);
		expect(wrappedCardIndex(3, 3)).toBe(0);
		expect(wrappedCardIndex(-1, 3)).toBe(2);
		expect(wrappedCardIndex(0, 0)).toBe(0);
	});

	it('derives card depth from the start-state deck', () => {
		expect(cardDepthInStack(0, 1, 3)).toBe(1);
		expect(cardDepthInStack(0, 2, 3)).toBe(2);
		expect(cardDepthInStack(1, 0, 2)).toBe(1);
		expect(cardDepthInStack(2, 1, 3)).toBe(2);
	});

	it('keeps incomingFanDepth aligned with start-state depth math', () => {
		expect(incomingFanDepth(2, 2, 3)).toBe(2);
		expect(incomingFanDepth(0, 0, 3)).toBe(2);
		expect(incomingFanDepth(1, 1, 3)).toBe(2);
		expect(incomingFanDepth(1, 1, 2)).toBe(1);
	});

	it('derives swipe drag pose from horizontal offset', () => {
		expect(swipeDragPose(0)).toEqual({ x: 0, rotate: 0 });
		expect(swipeDragPose(100)).toEqual({ x: 100, rotate: 8 });
		expect(swipeDragPose(-200)).toEqual({ x: -200, rotate: -12 });
	});

	it('clamps card indices for linear study navigation', () => {
		expect(clampCardIndex(0, 3)).toBe(0);
		expect(clampCardIndex(3, 3)).toBe(2);
		expect(clampCardIndex(-1, 3)).toBe(0);
		expect(resolveStackIndex(3, 3, 'study')).toBe(2);
		expect(resolveStackIndex(3, 3, 'browse')).toBe(0);
		expect(nextStackIndex(2, 3, 'study', 'next')).toBe(2);
		expect(nextStackIndex(0, 3, 'study', 'prev')).toBe(0);
	});

	it('disables study navigation at queue ends', () => {
		expect(canNavigateStack(0, 3, 'study', 'prev')).toBe(false);
		expect(canNavigateStack(2, 3, 'study', 'next')).toBe(false);
		expect(canNavigateStack(1, 3, 'study', 'next')).toBe(true);
		expect(canNavigateStack(0, 3, 'browse', 'prev')).toBe(true);
	});
});
