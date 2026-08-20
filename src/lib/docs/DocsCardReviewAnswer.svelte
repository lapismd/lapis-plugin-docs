<script lang="ts">
	import BrainIcon from '@lucide/svelte/icons/brain';
	import DocsCardPrompt from './DocsCardPrompt.svelte';
	import DocsMarkdownPreview from './DocsMarkdownPreview.svelte';
	import { docsCardAnswerMarkdown } from './docs-card-answer-markdown';
	import type { DocsCard } from '../model';

	let { card, noteSourcePath = '' }: { card: DocsCard; noteSourcePath?: string } = $props();

	const renderedAnswer = $derived(docsCardAnswerMarkdown(card.answer));
</script>

{#if card.type === 'cloze'}
	<div class="docs-review-face__prompt docs-review-face__prompt--answer">
		<h3>
			<DocsCardPrompt {card} revealClozes />
		</h3>
	</div>
	<div class="docs-review-face__answer docs-review-face__answer--context">
		<BrainIcon aria-hidden="true" />
		<div>
			<span class="docs-review-face__answer-label">Context</span>
			<DocsMarkdownPreview
				value={renderedAnswer}
				empty="No additional context has been added yet."
				compact
				floatingToc="off"
				sourcePath={noteSourcePath}
				headingIdPrefix={`docs-card-${card.id}-answer`}
			/>
		</div>
	</div>
{:else}
	<div class="docs-review-face__answer">
		<BrainIcon aria-hidden="true" />
		<DocsMarkdownPreview
			value={renderedAnswer}
			empty="No answer has been added yet."
			compact
			floatingToc="off"
			sourcePath={noteSourcePath}
			headingIdPrefix={`docs-card-${card.id}-answer`}
		/>
	</div>
{/if}
