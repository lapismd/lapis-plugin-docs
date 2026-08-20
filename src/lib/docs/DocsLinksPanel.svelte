<script lang="ts">
	import './DocsLinksPanel.css';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import MarkdownPreview from "./DocsMarkdownPreview.svelte";
	import type { DocsBacklink, DocsWikiLink } from '../model';

	let {
		ambiguousLinks,
		outgoingLinks,
		backlinks,
		onActiveNoteChange
	}: {
		ambiguousLinks: DocsWikiLink[];
		outgoingLinks: DocsWikiLink[];
		backlinks: DocsBacklink[];
		onActiveNoteChange: (noteId: string | null) => void;
	} = $props();
</script>

<section class="docs-links-panel">
	<div class="docs-links-panel__heading">
		<h3>Links</h3>
		<p>Backlinks and outgoing wikilinks.</p>
	</div>
	{#if ambiguousLinks.length}
		<div class="docs-alert small">
			<AlertCircleIcon />
			<span>Some wikilinks match multiple notes. Use a stable note id.</span>
		</div>
	{/if}
	<div class="docs-link-list">
		{#each outgoingLinks as link (`${link.raw}-${link.index}`)}
			<article class="docs-link-card">
				<small>Out</small>
				<MarkdownPreview value={link.raw} compact />
			</article>
		{/each}
		{#each backlinks as backlink (`${backlink.sourceNoteId}-${backlink.raw}`)}
			<article class="docs-link-card">
				<button
					type="button"
					class="docs-link-card__target"
					onclick={() => onActiveNoteChange(backlink.sourceNoteId)}
				>
					<small>Backlink from {backlink.sourceTitle}</small>
				</button>
				<MarkdownPreview value={backlink.excerpt} compact />
			</article>
		{:else}
			{#if outgoingLinks.length === 0}
				<p class="docs-muted">No links yet.</p>
			{/if}
		{/each}
	</div>
</section>
