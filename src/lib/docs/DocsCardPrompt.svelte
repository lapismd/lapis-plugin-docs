<script lang="ts">
	import { docsCardQuestionParts } from './docs-card-display';
	import type { DocsCard } from '../model';

	let {
		card,
		revealClozes = false
	}: {
		card: DocsCard;
		revealClozes?: boolean;
	} = $props();
</script>

{#each docsCardQuestionParts(card) as part}
	{#if part.kind === 'cloze'}
		<span
			class={revealClozes
				? 'docs-cloze-gap docs-cloze-gap--revealed'
				: part.hint
					? 'docs-cloze-gap docs-cloze-gap--hint'
					: 'docs-cloze-gap'}
			aria-label={revealClozes
				? 'Revealed cloze answer'
				: part.hint
					? `Hidden cloze, hint: ${part.hint}`
					: 'Hidden cloze'}
		>
			{revealClozes ? part.text : part.hint ?? ''}
		</span>
	{:else}
		{part.text}
	{/if}
{/each}
