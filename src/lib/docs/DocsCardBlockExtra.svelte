<script lang="ts">
	import { renderDocsBlockMarkdown } from '../model/markdown';
	import type { DocsRevisionBlock } from '../model';
	import DocsMarkdownPreview from './DocsMarkdownPreview.svelte';
	import { BLOCK_TYPE_LABELS } from './docs-workspace-helpers';

	let {
		blocks = [],
		missingRefs = [],
		sourcePath = ''
	}: {
		blocks: DocsRevisionBlock[];
		missingRefs?: string[];
		sourcePath?: string;
	} = $props();

	function blockTitle(block: DocsRevisionBlock) {
		return block.title?.trim() || BLOCK_TYPE_LABELS[block.type] || block.type;
	}
</script>

{#if blocks.length > 0 || missingRefs.length > 0}
	<section class="docs-card-extra docs-card-extra--blocks" aria-label="From note">
		<h4 class="docs-card-extra__heading">From note</h4>
		<div class="docs-card-extra__items">
			{#each blocks as block (block.id)}
				<article class="docs-card-extra__block">
					<p class="docs-card-extra__block-label">{blockTitle(block)}</p>
					<div class="docs-card-extra__block-body application-markdown-preview is-compact">
						<DocsMarkdownPreview
							compact
							value={renderDocsBlockMarkdown(block, 3)}
							{sourcePath}
						/>
					</div>
				</article>
			{/each}
			{#each missingRefs as ref (ref)}
				<p class="docs-card-extra__missing">Missing block: {ref}</p>
			{/each}
		</div>
	</section>
{/if}
