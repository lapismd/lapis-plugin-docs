<script lang="ts">
	import EyeIcon from '@lucide/svelte/icons/eye';
	import DocsCardBackMatter from './DocsCardBackMatter.svelte';
	import DocsCardPrompt from './DocsCardPrompt.svelte';
	import DocsCardTagChips from './DocsCardTagChips.svelte';
	import { REVIEW_RATINGS, REVIEW_RATING_LABELS } from '../model/docs-review-constants';
	import { formatDocsReviewInterval, previewDocsCardRatings } from '../model/fsrs';
	import type { DocsCard, DocsRevisionBlock, DocsReviewRating } from '../model';
	import type { ReferenceIndex } from '@lapismd/design-core/forms';

	let {
		card,
		noteTitle,
		noteSourcePath = '',
		dueAt,
		noteBlocks = [],
		sourceReferenceIndex,
		revealed = false,
		peek = false,
		showIntervalPreview = false,
		onReveal,
		onHide,
		onReview
	}: {
		card: DocsCard;
		noteTitle: string;
		noteSourcePath?: string;
		dueAt?: string;
		noteBlocks?: DocsRevisionBlock[];
		sourceReferenceIndex: ReferenceIndex;
		revealed?: boolean;
		peek?: boolean;
		showIntervalPreview?: boolean;
		onReveal?: () => void;
		onHide?: () => void;
		onReview?: (rating: DocsReviewRating) => void | Promise<void>;
	} = $props();

	const ratingPreviews = $derived(
		showIntervalPreview && revealed && onReview ? previewDocsCardRatings(card) : null
	);
</script>

<div
	class={`docs-review-flip docs-card-preview-flip ${!peek && revealed ? 'docs-review-flip--revealed' : ''}`}
	data-card-type={card.type}
	data-card-status={card.status}
	data-peek={peek ? 'true' : undefined}
>
	{#if peek}
		<article class="docs-review-face docs-review-face--front docs-review-face--peek">
			<div class="docs-review-face__meta">
				<span class="docs-review-face__label">{noteTitle}</span>
				{#if card.tags.length}
					<DocsCardTagChips tags={card.tags} />
				{:else if dueAt}
					<span class="docs-review-face__label">Due {dueAt}</span>
				{/if}
			</div>
			<div class="docs-review-face__scroll">
				<div class="docs-review-face__prompt">
					<span>Question</span>
					<h3>
						<DocsCardPrompt {card} />
					</h3>
				</div>
			</div>
		</article>
	{:else}
		<div class="docs-review-flip__inner">
			<article class="docs-review-face docs-review-face--front" aria-hidden={revealed}>
				<div class="docs-review-face__meta">
					<span class="docs-review-face__label">{noteTitle}</span>
					{#if card.tags.length}
						<DocsCardTagChips tags={card.tags} />
					{:else if dueAt}
						<span class="docs-review-face__label">Due {dueAt}</span>
					{/if}
				</div>
				<div class="docs-review-face__scroll">
					<div class="docs-review-face__prompt">
						<span>Question</span>
						<h3>
							<DocsCardPrompt {card} />
						</h3>
					</div>
				</div>
				<div class="docs-review-face__actions">
					<button
						type="button"
						class="docs-review-show-answer"
						disabled={revealed}
						onclick={() => onReveal?.()}
					>
						<EyeIcon aria-hidden="true" />
						Show Answer
					</button>
				</div>
			</article>

			<article class="docs-review-face docs-review-face--back" aria-hidden={!revealed}>
				<div class="docs-review-face__meta">
					<span class="docs-review-face__label">Answer</span>
					<span class="docs-review-face__label">{card.type}</span>
				</div>
				<div class="docs-review-face__scroll">
					<DocsCardBackMatter
						{card}
						{noteSourcePath}
						{noteBlocks}
						{sourceReferenceIndex}
						showExtras={revealed}
					/>
				</div>
				<div class="docs-review-face__actions">
					{#if onReview}
						<div class="docs-rating-grid" aria-label="Rate your recall">
							{#each REVIEW_RATINGS as rating (rating)}
								<button
									type="button"
									class={`docs-rating-button docs-rating-button--${rating}`}
									disabled={!revealed}
									onclick={() => void onReview(rating)}
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
						<button
							type="button"
							class="docs-review-show-answer docs-card-preview-question-button"
							onclick={() => onHide?.()}
						>
							Show Question
						</button>
					{/if}
				</div>
			</article>
		</div>
	{/if}
</div>
