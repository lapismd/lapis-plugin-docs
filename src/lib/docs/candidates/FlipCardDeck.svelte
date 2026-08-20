<script lang="ts">
	/**
	 * DESIGN_CORE_CANDIDATE: FlipCardDeck — ported for Docs; promote to design-core/forms later.
	 */
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import ListOrderedIcon from '@lucide/svelte/icons/list-ordered';
	import type { Snippet } from 'svelte';

	export type FlipCardDeckMode = 'browse' | 'study';

	export type FlipCardDeckContext = {
		key: string;
		index: number;
		count: number;
		peek: boolean;
		revealed: boolean;
		reveal: () => void;
		hide: () => void;
		toggle: () => void;
		next: () => void;
		previous: () => void;
		goTo: (index: number) => void;
		reset: () => void;
	};

	type SwipeDrag = {
		pointerId: number;
		startX: number;
		startY: number;
		deltaX: number;
		active: boolean;
		target: HTMLElement;
	};

	let {
		items = [],
		keyFor = defaultKeyFor,
		revealedByKey = $bindable({}),
		ariaLabel = 'Card deck',
		emptyLabel = 'No cards yet.',
		mode = 'browse',
		initialIndex = 0,
		blockSwipeWhenRevealed = true,
		indexControlLabel = '',
		indexControlTarget = 0,
		frontActionLabel = 'Show Answer',
		backActionLabel = 'Show Question',
		front,
		back,
		backActions
	}: {
		items: unknown[];
		keyFor?: (item: unknown, index: number) => string;
		revealedByKey: Record<string, boolean>;
		ariaLabel?: string;
		emptyLabel?: string;
		mode?: FlipCardDeckMode;
		initialIndex?: number;
		blockSwipeWhenRevealed?: boolean;
		indexControlLabel?: string;
		indexControlTarget?: number;
		frontActionLabel?: string;
		backActionLabel?: string;
		front: Snippet<[unknown, FlipCardDeckContext]>;
		back: Snippet<[unknown, FlipCardDeckContext]>;
		backActions?: Snippet<[unknown, FlipCardDeckContext]>;
	} = $props();

	const visibleDepth = 3;
	const swipeActivationThreshold = 8;
	const swipeCommitThreshold = 96;

	let activeIndex = $state(0);
	let appliedInitialIndex = $state<number | null>(null);
	let swipeDrag = $state<SwipeDrag | null>(null);
	let swipeOwnerDocument = $state<Document | null>(null);
	let swipeReleaseX = $state<number | null>(null);
	let swipeReleaseTimer: ReturnType<typeof setTimeout> | undefined;

	const cardCount = $derived(items.length);
	const resolvedIndex = $derived(resolveIndex(activeIndex, cardCount, mode));
	const visibleCount = $derived(
		mode === 'study'
			? Math.min(visibleDepth, Math.max(0, cardCount - resolvedIndex))
			: Math.min(visibleDepth, cardCount)
	);
	const stackItems = $derived(
		Array.from({ length: visibleCount }, (_, depth) => {
			const index = resolveIndex(resolvedIndex + depth, cardCount, mode);
			const item = items[index];
			return {
				item,
				index,
				depth,
				key: item ? keyFor(item, index) : `${index}`
			};
		}).filter((entry) => entry.item !== undefined)
	);
	const canGoPrevious = $derived(cardCount > 1 && (mode === 'browse' || resolvedIndex > 0));
	const canGoNext = $derived(cardCount > 1 && (mode === 'browse' || resolvedIndex < cardCount - 1));
	const topKey = $derived(stackItems[0]?.key ?? '');
	const topRevealed = $derived(topKey ? revealedByKey[topKey] === true : false);

	$effect(() => {
		if (cardCount === 0) {
			activeIndex = 0;
			return;
		}
		if (initialIndex !== appliedInitialIndex) {
			appliedInitialIndex = initialIndex;
			activeIndex = resolveIndex(initialIndex, cardCount, mode);
			return;
		}
		const next = resolveIndex(activeIndex, cardCount, mode);
		if (next !== activeIndex) activeIndex = next;
	});

	$effect(() => {
		return () => {
			clearSwipeDrag();
			resetSwipeRelease();
		};
	});

	function defaultKeyFor(item: unknown, index: number) {
		if (item && typeof item === 'object' && 'id' in item) return String(item.id);
		return String(index);
	}

	function resolveIndex(index: number, count: number, valueMode: FlipCardDeckMode) {
		if (count <= 0) return 0;
		if (valueMode === 'study') return Math.min(Math.max(index, 0), count - 1);
		return ((index % count) + count) % count;
	}

	function currentResolvedIndex() {
		return resolveIndex(activeIndex, items.length, mode);
	}

	function currentTopKey() {
		const count = items.length;
		if (count === 0) return '';
		const index = currentResolvedIndex();
		const item = items[index];
		return item ? keyFor(item, index) : '';
	}

	function currentTopRevealed() {
		const key = currentTopKey();
		return key ? revealedByKey[key] === true : false;
	}

	function canNavigatePrevious() {
		const count = items.length;
		if (count <= 1) return false;
		return mode === 'browse' || currentResolvedIndex() > 0;
	}

	function canNavigateNext() {
		const count = items.length;
		if (count <= 1) return false;
		return mode === 'browse' || currentResolvedIndex() < count - 1;
	}

	function setRevealed(key: string, revealed: boolean) {
		revealedByKey = { ...revealedByKey, [key]: revealed };
	}

	function focusFaceAction(source: Element | null, face: 'front' | 'back') {
		const flip = source?.closest('.flip-card-deck__flip-inner');
		const targetFace = flip?.querySelector<HTMLElement>(`.flip-card-deck__face--${face}`);
		if (!targetFace) return;

		// The incoming face must accept focus before the outgoing face becomes hidden.
		targetFace.inert = false;
		const action = targetFace.querySelector<HTMLElement>('.flip-card-deck__primary-action');
		action?.focus({ preventScroll: true });
	}

	function revealCard(key: string, source: Element | null = document.activeElement) {
		focusFaceAction(source, 'back');
		setRevealed(key, true);
	}

	function hideCard(key: string, source: Element | null = document.activeElement) {
		focusFaceAction(source, 'front');
		setRevealed(key, false);
	}

	function hideTopCard() {
		const key = currentTopKey();
		if (!key) return;
		hideCard(key);
	}

	function resetDeck() {
		activeIndex = 0;
	}

	function showPreviousCard() {
		if (!canNavigatePrevious()) return;
		hideTopCard();
		activeIndex = resolveIndex(currentResolvedIndex() - 1, items.length, mode);
	}

	function showNextCard() {
		if (!canNavigateNext()) return;
		hideTopCard();
		activeIndex = resolveIndex(currentResolvedIndex() + 1, items.length, mode);
	}

	function showCardAt(index: number) {
		if (items.length === 0) return;
		hideTopCard();
		activeIndex = resolveIndex(index, items.length, mode);
	}

	function contextFor(key: string, index: number, peek: boolean): FlipCardDeckContext {
		const revealed = revealedByKey[key] === true;
		return {
			key,
			index,
			count: items.length,
			peek,
			revealed,
			reveal: () => revealCard(key),
			hide: () => hideCard(key),
			toggle: () => setRevealed(key, !revealed),
			next: showNextCard,
			previous: showPreviousCard,
			goTo: showCardAt,
			reset: resetDeck
		};
	}

	function shouldIgnoreInteractiveTarget(target: EventTarget | null) {
		if (!(target instanceof HTMLElement)) return true;
		return Boolean(
			target.closest(
				'button, a, input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]'
			)
		);
	}

	function clearSwipeListeners() {
		if (!swipeOwnerDocument) return;
		swipeOwnerDocument.removeEventListener('pointermove', handleSwipePointerMove);
		swipeOwnerDocument.removeEventListener('pointerup', handleSwipePointerUp);
		swipeOwnerDocument.removeEventListener('pointercancel', handleSwipePointerUp);
		swipeOwnerDocument = null;
	}

	function clearSwipeDrag(releasePointerCapture = true) {
		const drag = swipeDrag;
		clearSwipeListeners();
		if (
			releasePointerCapture &&
			drag &&
			typeof drag.target.hasPointerCapture === 'function' &&
			drag.target.hasPointerCapture(drag.pointerId)
		) {
			drag.target.releasePointerCapture(drag.pointerId);
		}
		swipeDrag = null;
	}

	function resetSwipeRelease() {
		if (swipeReleaseTimer !== undefined) clearTimeout(swipeReleaseTimer);
		swipeReleaseTimer = undefined;
		swipeReleaseX = null;
	}

	function animateSwipeRelease(fromX: number) {
		resetSwipeRelease();
		swipeReleaseX = fromX;
		requestAnimationFrame(() => {
			swipeReleaseX = 0;
			swipeReleaseTimer = setTimeout(resetSwipeRelease, 220);
		});
	}

	function topCardSwipeOffset() {
		if (swipeDrag?.active) return swipeDrag.deltaX;
		if (swipeReleaseX !== null) return swipeReleaseX;
		return 0;
	}

	function swipeDragStyle(deltaX: number) {
		const limited = Math.max(-180, Math.min(180, deltaX));
		const rotate = limited / 18;
		return `--flip-card-drag-x:${limited}px;--flip-card-drag-rotate:${rotate}deg`;
	}

	function handleTopCardPointerDown(event: PointerEvent) {
		if (
			mode !== 'browse' ||
			cardCount <= 1 ||
			(event.pointerType === 'mouse' && event.button !== 0) ||
			event.isPrimary === false ||
			shouldIgnoreInteractiveTarget(event.target) ||
			(blockSwipeWhenRevealed && currentTopRevealed())
		) {
			return;
		}
		const target = event.currentTarget;
		if (!(target instanceof HTMLElement)) return;
		resetSwipeRelease();
		swipeDrag = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			deltaX: 0,
			active: false,
			target
		};
		swipeOwnerDocument = target.ownerDocument;
		target.setPointerCapture(event.pointerId);
		swipeOwnerDocument.addEventListener('pointermove', handleSwipePointerMove);
		swipeOwnerDocument.addEventListener('pointerup', handleSwipePointerUp);
		swipeOwnerDocument.addEventListener('pointercancel', handleSwipePointerUp);
	}

	function handleSwipePointerMove(event: PointerEvent) {
		const drag = swipeDrag;
		if (!drag || drag.pointerId !== event.pointerId) return;
		const deltaX = event.clientX - drag.startX;
		const deltaY = event.clientY - drag.startY;
		if (!drag.active) {
			const distance = Math.hypot(deltaX, deltaY);
			if (distance < swipeActivationThreshold) return;
			if (Math.abs(deltaX) <= Math.abs(deltaY)) {
				clearSwipeDrag();
				return;
			}
			event.preventDefault();
			swipeDrag = { ...drag, active: true, deltaX };
			return;
		}
		event.preventDefault();
		swipeDrag = { ...drag, deltaX };
	}

	function handleSwipePointerUp(event: PointerEvent) {
		const drag = swipeDrag;
		if (!drag || drag.pointerId !== event.pointerId) return;
		const { deltaX, active, target } = drag;
		if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
		clearSwipeDrag(false);
		if (!active) return;
		if (deltaX <= -swipeCommitThreshold) {
			resetSwipeRelease();
			showNextCard();
			return;
		}
		if (deltaX >= swipeCommitThreshold) {
			resetSwipeRelease();
			showPreviousCard();
			return;
		}
		animateSwipeRelease(deltaX);
	}

	function shouldIgnoreKeyboard(event: KeyboardEvent) {
		if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return true;
		const target = event.target;
		if (!(target instanceof HTMLElement)) return false;
		return Boolean(
			target.closest(
				'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]'
			)
		);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (shouldIgnoreKeyboard(event)) return;
		if (event.key === ' ' || event.key === 'Enter') {
			const key = currentTopKey();
			if (!key || currentTopRevealed()) return;
			event.preventDefault();
			setRevealed(key, true);
			return;
		}
		if (event.key === 'Escape') {
			const key = currentTopKey();
			if (!key || !currentTopRevealed()) return;
			event.preventDefault();
			setRevealed(key, false);
			return;
		}
		if (event.key === 'ArrowLeft' || event.key === 'h') {
			if (!canNavigatePrevious()) return;
			event.preventDefault();
			showPreviousCard();
			return;
		}
		if (event.key === 'ArrowRight' || event.key === 'l') {
			if (!canNavigateNext()) return;
			event.preventDefault();
			showNextCard();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if cardCount === 0}
	<div class="flip-card-deck-empty">{emptyLabel}</div>
{:else}
	<div class="flip-card-deck" aria-label={ariaLabel} role="region">
		{#if cardCount > 1}
			<div class="flip-card-deck__controls">
				<button
					type="button"
					class="flip-card-deck__nav"
					aria-label="Previous card"
					disabled={!canGoPrevious}
					onclick={showPreviousCard}
				>
					<ChevronLeftIcon aria-hidden="true" />
				</button>
				<p class="flip-card-deck__count">Card {resolvedIndex + 1} of {cardCount}</p>
				{#if indexControlLabel}
					<button
						type="button"
						class="flip-card-deck__index-nav"
						aria-label={indexControlLabel}
						disabled={resolvedIndex === resolveIndex(indexControlTarget, cardCount, mode)}
						onclick={() => showCardAt(indexControlTarget)}
					>
						<ListOrderedIcon aria-hidden="true" />
						<span class="flip-card-deck__sr-only">{indexControlLabel}</span>
					</button>
				{/if}
				<button
					type="button"
					class="flip-card-deck__nav"
					aria-label="Next card"
					disabled={!canGoNext}
					onclick={showNextCard}
				>
					<ChevronRightIcon aria-hidden="true" />
				</button>
			</div>
		{/if}

		<div class="flip-card-deck__stack">
			{#each stackItems as { item, key, index, depth } (`${key}:${depth}`)}
				{@const peek = depth !== 0}
				{@const context = contextFor(key, index, peek)}
				{@const swipeOffset = depth === 0 ? topCardSwipeOffset() : 0}
				<div
					class="flip-card-deck__slot"
					class:flip-card-deck__slot--swiping={depth === 0 && swipeDrag?.active}
					class:flip-card-deck__slot--swipe-reset={depth === 0 && swipeReleaseX !== null && !swipeDrag?.active}
					style={depth === 0 && (swipeDrag?.active || swipeReleaseX !== null)
						? swipeDragStyle(swipeOffset)
						: undefined}
					data-depth={depth}
					aria-hidden={peek ? 'true' : undefined}
					inert={peek}
					onpointerdown={depth === 0 ? handleTopCardPointerDown : undefined}
				>
					<div
						class="flip-card-deck__flip"
						class:flip-card-deck__flip--revealed={!peek && context.revealed}
						data-peek={peek ? 'true' : undefined}
					>
						{#if peek}
							<article class="flip-card-deck__face flip-card-deck__face--front flip-card-deck__face--peek">
								<div class="flip-card-deck__face-scroll">
									{@render front(item, context)}
								</div>
							</article>
						{:else}
							<div class="flip-card-deck__flip-inner">
							<article class="flip-card-deck__face flip-card-deck__face--front" aria-hidden={context.revealed} inert={context.revealed}>
									<div class="flip-card-deck__face-scroll flip-card-deck__face-scroll--front">
										{@render front(item, context)}
									</div>
									<div class="flip-card-deck__face-actions">
									<button
										type="button"
										class="flip-card-deck__primary-action"
										onclick={(event) => revealCard(context.key, event.currentTarget)}
									>
											<EyeIcon aria-hidden="true" />
											{frontActionLabel}
										</button>
									</div>
								</article>
							<article class="flip-card-deck__face flip-card-deck__face--back" aria-hidden={!context.revealed} inert={!context.revealed}>
									<div class="flip-card-deck__face-scroll">
										{@render back(item, context)}
									</div>
									<div class="flip-card-deck__face-actions">
										{#if backActions}
											{@render backActions(item, context)}
										{:else}
											<button type="button" class="flip-card-deck__primary-action" onclick={context.hide}>
												{backActionLabel}
											</button>
										{/if}
									</div>
								</article>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.flip-card-deck {
		--flip-card-accent: #2563eb;
		--flip-card-accent-alt: #06b6d4;
		--flip-card-border: var(--border, color-mix(in srgb, #111 16%, transparent));
		--flip-card-muted: var(--muted-foreground, #64748b);
		--flip-card-surface: var(--card, #fff);
		--flip-card-foreground: var(--foreground, #111827);
		--flip-card-height: clamp(22rem, 48svh, 36rem);
		display: grid;
		gap: 0.85rem;
		outline: 0;
	}

	.flip-card-deck__controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.8rem;
	}

	.flip-card-deck__count {
		min-width: 7rem;
		margin: 0;
		color: var(--flip-card-muted);
		font-size: 0.82rem;
		font-weight: 750;
		text-align: center;
	}

	.flip-card-deck__nav,
	.flip-card-deck__index-nav,
	.flip-card-deck :global(.flip-card-deck__primary-action) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		border: 1px solid var(--flip-card-border);
		background: color-mix(in srgb, var(--flip-card-surface) 92%, transparent);
		color: var(--flip-card-foreground);
		cursor: pointer;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 800;
		transition:
			background 140ms ease,
			border-color 140ms ease,
			transform 140ms ease;
	}

	.flip-card-deck__nav {
		width: 2.35rem;
		height: 2.35rem;
		border-radius: 999px;
	}

.flip-card-deck__index-nav {
  box-sizing: border-box;
  width: 1.65rem;
  min-width: 1.65rem;
  height: 1.65rem;
  min-height: 1.65rem;
  border-color: transparent;
  border-radius: 0.45rem;
  background: transparent;
  color: var(--flip-card-muted);
  padding: 0.34rem;
}

	.flip-card-deck :global(.flip-card-deck__primary-action) {
		min-height: 2.5rem;
		border-radius: 0.7rem;
		padding: 0.55rem 0.85rem;
	}

	.flip-card-deck__nav:hover:not(:disabled),
	.flip-card-deck__nav:focus-visible:not(:disabled),
	.flip-card-deck :global(.flip-card-deck__primary-action:hover:not(:disabled)),
	.flip-card-deck :global(.flip-card-deck__primary-action:focus-visible:not(:disabled)) {
		border-color: color-mix(in srgb, var(--flip-card-accent) 42%, var(--flip-card-border));
		background: color-mix(in srgb, var(--flip-card-accent) 9%, var(--flip-card-surface));
		transform: translateY(-1px);
	}

	.flip-card-deck__index-nav:hover:not(:disabled),
	.flip-card-deck__index-nav:focus-visible:not(:disabled) {
		border-color: transparent;
		background: color-mix(in srgb, var(--flip-card-accent) 11%, transparent);
		color: color-mix(in srgb, var(--flip-card-accent) 76%, var(--flip-card-foreground));
		transform: translateY(-1px);
	}

	.flip-card-deck__nav:disabled,
	.flip-card-deck__index-nav:disabled,
	.flip-card-deck :global(.flip-card-deck__primary-action:disabled) {
		cursor: default;
		opacity: 0.45;
	}

	.flip-card-deck__nav :global(svg),
	.flip-card-deck :global(.flip-card-deck__primary-action svg) {
		width: 1rem;
		height: 1rem;
	}

.flip-card-deck__index-nav :global(svg) {
  width: 0.8rem;
  height: 0.8rem;
}

	.flip-card-deck__sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}

	.flip-card-deck__stack {
		position: relative;
		width: min(100%, 44rem);
		min-height: var(--flip-card-height);
		margin: 0 auto;
		overflow: visible;
		perspective: 1100px;
		touch-action: pan-y pinch-zoom;
	}

	.flip-card-deck__slot {
		position: absolute;
		inset: 0;
		transform-origin: 50% 100%;
		transition:
			transform 320ms cubic-bezier(0.34, 1.25, 0.64, 1),
			opacity 220ms ease;
	}

	.flip-card-deck__slot[data-depth='0'] {
		z-index: 3;
		cursor: grab;
		transform: rotate(0deg) scale(1);
	}

	.flip-card-deck__slot[data-depth='0'].flip-card-deck__slot--swiping {
		cursor: grabbing;
		transition: none;
		transform: translate(var(--flip-card-drag-x, 0), 0) rotate(var(--flip-card-drag-rotate, 0deg));
	}

	.flip-card-deck__slot[data-depth='0'].flip-card-deck__slot--swipe-reset {
		transform: translate(var(--flip-card-drag-x, 0), 0) rotate(var(--flip-card-drag-rotate, 0deg));
	}

	.flip-card-deck__slot[data-depth='1'] {
		z-index: 2;
		opacity: 0.94;
		pointer-events: none;
		transform: rotate(3.5deg) scale(0.955);
	}

	.flip-card-deck__slot[data-depth='2'] {
		z-index: 1;
		opacity: 0.88;
		pointer-events: none;
		transform: rotate(7deg) scale(0.91);
	}

	.flip-card-deck__flip,
	.flip-card-deck__flip-inner,
	.flip-card-deck__face {
		width: 100%;
		height: 100%;
		min-height: var(--flip-card-height);
	}

	.flip-card-deck__flip {
		position: relative;
	}

	.flip-card-deck__flip-inner {
		position: relative;
		transform-style: preserve-3d;
		transition: transform 460ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.flip-card-deck__flip--revealed .flip-card-deck__flip-inner {
		transform: rotateY(180deg);
	}

	.flip-card-deck__face {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--flip-card-accent) 30%, var(--flip-card-border));
		border-radius: 1rem;
		backface-visibility: hidden;
		background:
			linear-gradient(145deg, color-mix(in srgb, var(--flip-card-accent) 13%, transparent), transparent 15rem),
			linear-gradient(320deg, color-mix(in srgb, var(--flip-card-accent-alt) 10%, transparent), transparent 16rem),
			color-mix(in srgb, var(--flip-card-surface) 96%, transparent);
		box-shadow: 0 24px 65px color-mix(in srgb, #000 13%, transparent);
		color: var(--flip-card-foreground);
		padding: clamp(1rem, 4vw, 1.7rem);
	}

	.flip-card-deck__face--back {
		transform: rotateY(180deg);
		border-color: color-mix(in srgb, var(--flip-card-accent-alt) 32%, var(--flip-card-border));
		background:
			linear-gradient(135deg, color-mix(in srgb, var(--flip-card-accent-alt) 13%, transparent), transparent 14rem),
			linear-gradient(315deg, color-mix(in srgb, var(--flip-card-accent) 10%, transparent), transparent 16rem),
			color-mix(in srgb, var(--flip-card-surface) 96%, transparent);
	}

	.flip-card-deck__face--peek {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.flip-card-deck__face[aria-hidden='true'] {
		pointer-events: none;
	}

	.flip-card-deck__face-scroll {
		flex: 1 1 auto;
		min-height: 0;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;
	}

	.flip-card-deck__face-scroll--front {
		display: flex;
		align-items: stretch;
		justify-content: flex-start;
	}

	.flip-card-deck__face-actions {
		flex-shrink: 0;
		margin-top: auto;
	}

	.flip-card-deck-empty {
		display: grid;
		min-height: 10rem;
		place-items: center;
		border: 1px dashed var(--flip-card-border, color-mix(in srgb, #111 18%, transparent));
		border-radius: 0.85rem;
		color: var(--flip-card-muted, #64748b);
		font-size: 0.86rem;
		font-weight: 700;
		padding: 1rem;
		text-align: center;
	}

	@media (max-width: 720px) {
		.flip-card-deck {
			--flip-card-height: clamp(20rem, 64svh, 34rem);
		}

		.flip-card-deck__stack {
			width: min(100%, 33rem);
		}

		.flip-card-deck__face {
			padding: 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.flip-card-deck__slot,
		.flip-card-deck__flip-inner,
		.flip-card-deck__index-nav,
		.flip-card-deck__nav,
		.flip-card-deck :global(.flip-card-deck__primary-action) {
			transition: none;
		}
	}
</style>
