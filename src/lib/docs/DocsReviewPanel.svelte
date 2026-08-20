<script lang="ts">
	import DocsCardPreviewStack from './DocsCardPreviewStack.svelte';
	import type { DocsReviewQueueItem, DocsReviewRating, DocsReviewScope, DocsRevisionBlock } from '../model';
	import * as ScrollArea from "@lapismd/design-core/shadcn/scroll-area";
	import type { ReferenceIndex } from '@lapismd/design-core/forms';

	let {
		dueCards,
		reviewScope = 'note',
		getNoteBlocks = () => [],
		sourceReferenceIndex,
		reviewAnswerOpenById = $bindable({}),
		onReviewCard
	}: {
		dueCards: DocsReviewQueueItem[];
		reviewScope?: DocsReviewScope;
		getNoteBlocks?: (noteId: string) => DocsRevisionBlock[];
		sourceReferenceIndex: ReferenceIndex;
		reviewAnswerOpenById: Record<string, boolean>;
		onReviewCard: (
			noteId: string,
			cardId: string,
			rating: DocsReviewRating
		) => void | Promise<void>;
	} = $props();

	const stackItems = $derived(
		dueCards.map((item) => ({
			key: `${item.noteId}:${item.cardId}`,
			card: item.card,
			noteId: item.noteId,
			noteTitle: item.noteTitle,
			noteSourcePath: item.noteSourcePath,
			noteBlocks: getNoteBlocks(item.noteId),
			dueAt: item.dueAt.slice(0, 10)
		}))
	);
</script>

<ScrollArea.Root class="docs-review-view">
	<section class="docs-review-view__content">
		{#if dueCards.length === 0}
			<p class="docs-muted">
				{reviewScope === 'workspace'
					? 'No cards are due.'
					: 'No cards are due for this note.'}
			</p>
		{:else}
			{#if reviewScope === 'workspace'}
				<header class="docs-review-view__header">
					<p class="docs-review-view__summary">
						{dueCards.length} {dueCards.length === 1 ? 'card' : 'cards'} due across your docs
					</p>
				</header>
			{/if}
			<DocsCardPreviewStack
				items={stackItems}
				{sourceReferenceIndex}
				ariaLabel={reviewScope === 'workspace' ? 'All due cards' : 'Due cards'}
				mode="study"
				blockSwipeWhenRevealed={true}
				bind:previewAnswerOpenById={reviewAnswerOpenById}
				{onReviewCard}
			/>
		{/if}
	</section>
</ScrollArea.Root>
