<script lang="ts">
	let {
		tags = [],
		limit = 2
	}: {
		tags?: string[];
		limit?: number;
	} = $props();

	const visibleTags = $derived(tags.slice(0, limit));
</script>

{#if visibleTags.length}
	<span class="docs-review-face__tags" aria-label="Tags">
		{#each visibleTags as tag (tag)}
			<span class="docs-review-face__tag">#{tag}</span>
		{/each}
	</span>
{/if}
