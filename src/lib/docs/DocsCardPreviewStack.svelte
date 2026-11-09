<script lang="ts">
	import FlipCardDeck, { type FlipCardDeckContext } from "./candidates/FlipCardDeck.svelte";
	import DocsCardBackMatter from './DocsCardBackMatter.svelte';
	import DocsCardPrompt from './DocsCardPrompt.svelte';
	import DocsCardTagChips from './DocsCardTagChips.svelte';
	import { REVIEW_RATINGS, REVIEW_RATING_LABELS } from '../model/docs-review-constants';
	import { formatDocsReviewInterval, previewDocsCardRatings } from '../model/fsrs';
	import type {
		DocsCardStackItem,
		DocsCardStackMode,
		DocsReviewRating
	} from '../model';
	let {
		items,
		previewAnswerOpenById = $bindable({}),
		ariaLabel = 'Card previews',
		mode = 'browse',
		initialIndex = 0,
		blockSwipeWhenRevealed = false,
		onReviewCard
	}: {
		items: DocsCardStackItem[];
		previewAnswerOpenById: Record<string, boolean>;
		ariaLabel?: string;
		mode?: DocsCardStackMode;
		initialIndex?: number;
		blockSwipeWhenRevealed?: boolean;
		onReviewCard?: (
			noteId: string,
			cardId: string,
			rating: DocsReviewRating
		) => void | Promise<void>;
	} = $props();

	function keyFor(item: unknown) {
		return (item as DocsCardStackItem).key;
	}

	function ratingPreviewsFor(item: DocsCardStackItem, revealed: boolean) {
		return mode === 'study' && revealed && onReviewCard
			? previewDocsCardRatings(item.card)
			: null;
	}

	async function reviewItem(
		item: DocsCardStackItem,
		rating: DocsReviewRating,
		context: FlipCardDeckContext
	) {
		if (!onReviewCard || !item.noteId) return;
		await onReviewCard(item.noteId, item.card.id, rating);
		context.hide();
		if (mode === 'study') context.reset();
	}
</script>

<div class="docs-card-preview-stack">
	<FlipCardDeck
		{items}
		{keyFor}
		bind:revealedByKey={previewAnswerOpenById}
		{ariaLabel}
		mode={mode as 'browse' | 'study'}
		{initialIndex}
		{blockSwipeWhenRevealed}
		emptyLabel="No cards yet."
	>
	{#snippet front(item, context)}
		{@const stackItem = item as DocsCardStackItem}
		<div
			class="docs-review-face__content docs-review-face__content--front"
			id={stackItem.noteId ? `docs-card-${stackItem.noteId}-${stackItem.card.id}` : undefined}
		>
			<div class="docs-review-face__meta">
				<span class="docs-review-face__label">{stackItem.noteTitle}</span>
				{#if stackItem.card.tags.length}
					<DocsCardTagChips tags={stackItem.card.tags} />
				{:else if stackItem.dueAt}
					<span class="docs-review-face__label">Due {stackItem.dueAt}</span>
				{/if}
			</div>
			<div class="docs-review-face__prompt">
				<span>Question</span>
				<h3>
					<DocsCardPrompt card={stackItem.card} />
				</h3>
			</div>
		</div>
	{/snippet}

	{#snippet back(item, context)}
		{@const stackItem = item as DocsCardStackItem}
		<div class="docs-review-face__content docs-review-face__content--back">
			<div class="docs-review-face__meta">
				<span class="docs-review-face__label">Answer</span>
				<span class="docs-review-face__label">{stackItem.card.type}</span>
			</div>
			<DocsCardBackMatter
				card={stackItem.card}
				noteSourcePath={stackItem.noteSourcePath}
				noteBlocks={stackItem.noteBlocks ?? []}
				showExtras={context.revealed}
			/>
		</div>
	{/snippet}

	{#snippet backActions(item, context)}
		{@const stackItem = item as DocsCardStackItem}
		{@const ratingPreviews = ratingPreviewsFor(stackItem, context.revealed)}
		{#if onReviewCard && stackItem.noteId}
			<div class="docs-rating-grid" aria-label="Rate your recall">
				{#each REVIEW_RATINGS as rating (rating)}
					<button
						type="button"
						class={`docs-rating-button docs-rating-button--${rating}`}
						disabled={!context.revealed}
						onclick={() => void reviewItem(stackItem, rating, context)}
					>
						<span class="docs-rating-button__label">{REVIEW_RATING_LABELS[rating]}</span>
						{#if ratingPreviews}
							<span class="docs-rating-button__interval">
								{formatDocsReviewInterval(ratingPreviews[rating].due)}
							</span>
						{/if}
					</button>
				{/each}
			</div>
		{:else}
			<button type="button" class="flip-card-deck__primary-action docs-card-preview-question-button" onclick={context.hide}>
				Show Question
			</button>
		{/if}
	{/snippet}
	</FlipCardDeck>
</div>
