<script lang="ts">
	import DocsCardBlockExtra from './DocsCardBlockExtra.svelte';
	import DocsCardReviewAnswer from './DocsCardReviewAnswer.svelte';
	import DocsCardSourceExtra from './DocsCardSourceExtra.svelte';
	import {
		resolveCardBlockRefs,
		resolveCardSourceRefs
	} from '../model/docs-card-context';
	import type { DocsCard, DocsRevisionBlock } from '../model';
	import type { ReferenceIndex } from '@lapismd/design-core/forms';

	let {
		card,
		noteSourcePath = '',
		noteBlocks = [],
		sourceReferenceIndex,
		showExtras = false
	}: {
		card: DocsCard;
		noteSourcePath?: string;
		noteBlocks?: DocsRevisionBlock[];
		sourceReferenceIndex: ReferenceIndex;
		showExtras?: boolean;
	} = $props();

	const blockResolution = $derived(resolveCardBlockRefs({ blocks: noteBlocks }, card.blockRefs));
	const sourceResolution = $derived(resolveCardSourceRefs(card.sourceRefs, sourceReferenceIndex));
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

	{#if sourceResolution.resolved.length > 0 || sourceResolution.unresolved.length > 0}
		<DocsCardSourceExtra
			resolved={sourceResolution.resolved}
			unresolved={sourceResolution.unresolved}
		/>
	{/if}
{/if}
