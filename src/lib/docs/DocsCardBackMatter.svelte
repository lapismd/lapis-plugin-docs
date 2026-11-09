<script lang="ts">
	import DocsCardBlockExtra from './DocsCardBlockExtra.svelte';
	import DocsCardReviewAnswer from './DocsCardReviewAnswer.svelte';
	import { resolveCardBlockRefs } from '../model/docs-card-context';
	import type { DocsCard, DocsRevisionBlock } from '../model';

	let {
		card,
		noteSourcePath = '',
		noteBlocks = [],
		showExtras = false
	}: {
		card: DocsCard;
		noteSourcePath?: string;
		noteBlocks?: DocsRevisionBlock[];
		showExtras?: boolean;
	} = $props();

	const blockResolution = $derived(resolveCardBlockRefs({ blocks: noteBlocks }, card.blockRefs));
</script>

<DocsCardReviewAnswer {card} {noteSourcePath} />

{#if showExtras}
	{#if blockResolution.resolved.length > 0 || blockResolution.missing.length > 0}
		<DocsCardBlockExtra
			blocks={blockResolution.resolved.map((item) => item.block)}
			missingRefs={blockResolution.missing.map((item) => item.ref)}
			sourcePath={noteSourcePath}
		/>
	{/if}
{/if}
