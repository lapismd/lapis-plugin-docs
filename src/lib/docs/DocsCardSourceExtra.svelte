<script lang="ts">
	import type {
		ResolvedCardSourceRef,
		UnresolvedCardSourceRef
	} from '../model/docs-card-context';

	let {
		resolved = [],
		unresolved = []
	}: {
		resolved?: ResolvedCardSourceRef[];
		unresolved?: UnresolvedCardSourceRef[];
	} = $props();
</script>

{#if resolved.length > 0 || unresolved.length > 0}
	<section class="docs-card-extra docs-card-extra--sources" aria-label="Sources">
		<h4 class="docs-card-extra__heading">Sources</h4>
		<div class="docs-card-extra__items docs-card-source-list">
			{#each resolved as item (item.ref)}
				<article class="docs-card-source-row">
					<div class="docs-card-source-row__title">
						{#if item.reference.href}
							<a class="docs-card-source-row__link" href={item.reference.href} title={item.ref}>
								{item.reference.label}
							</a>
						{:else}
							<span class="docs-card-source-row__link" title={item.ref}>
								{item.reference.label}
							</span>
						{/if}
					</div>
					<p class="docs-card-source-row__path">{item.reference.path}</p>
					{#if item.reference.excerpt}
						<p class="docs-card-source-row__excerpt">{item.reference.excerpt}</p>
					{/if}
				</article>
			{/each}
			{#each unresolved as item (item.ref)}
				<article class="docs-card-source-row docs-card-source-row--unresolved">
					<div class="docs-card-source-row__title">
						<span class="docs-card-source-row__ref">{item.ref}</span>
						<span class="docs-card-source-row__error">
							{item.reason === 'duplicate'
								? `Duplicate reference (${item.duplicateCount} matches)`
								: 'Unresolved reference'}
						</span>
					</div>
					<p class="docs-card-source-row__help">
						{item.reason === 'duplicate'
							? 'Resolve duplicate markers in the CV before using this reference on a card.'
							: 'Keep this reference or remove it after updating CV markers.'}
					</p>
				</article>
			{/each}
		</div>
	</section>
{/if}
