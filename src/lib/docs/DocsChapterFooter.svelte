<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import HomeIcon from '@lucide/svelte/icons/home';
	import SquareCheckIcon from '@lucide/svelte/icons/square-check';
	import SquareIcon from '@lucide/svelte/icons/square';
	import type { DocsBookChapterNavigation, DocsNote } from '../model';

	let {
		note,
		chapterNavigation,
		saving = false,
		onToggleComplete = () => {},
		onOpenNote = () => {}
	}: {
		note: DocsNote;
		chapterNavigation: DocsBookChapterNavigation;
		saving?: boolean;
		onToggleComplete?: (completed: boolean) => void | Promise<void>;
		onOpenNote?: (noteId: string) => void;
	} = $props();

	const completed = $derived(Boolean(note.completedAt));
	const previousChapter = $derived(chapterNavigation.previousChapter);
	const nextChapter = $derived(chapterNavigation.nextChapter);
	const homeAriaLabel = $derived(
		chapterNavigation.bookTitle
			? `${chapterNavigation.bookTitle} home`
			: 'Book home'
	);

	function toggleComplete() {
		if (saving) return;
		void onToggleComplete(!completed);
	}
</script>

<footer class="docs-chapter-footer" aria-label="Chapter navigation">
	<div class="docs-chapter-footer__complete" class:is-complete={completed}>
		{#if completed}
			<span class="docs-chapter-footer__badge" aria-hidden="true">
				<CheckIcon />
			</span>
		{/if}
	</div>

	<div class="docs-chapter-footer__nav">
		<div class="docs-chapter-footer__side docs-chapter-footer__side--prev">
			<div class="docs-chapter-footer__actions">
				{#if previousChapter}
					<button
						type="button"
						class="docs-chapter-footer__button"
						onclick={() => onOpenNote(previousChapter.noteId)}
					>
						<ArrowLeftIcon aria-hidden="true" />
						<span>Back lesson</span>
					</button>
				{:else}
					<span class="docs-chapter-footer__button is-disabled" aria-disabled="true">
						<ArrowLeftIcon aria-hidden="true" />
						<span>Back lesson</span>
					</span>
				{/if}
				<button
					type="button"
					class="docs-chapter-footer__button"
					aria-label={homeAriaLabel}
					onclick={() => onOpenNote(chapterNavigation.bookIndexNoteId)}
				>
					<HomeIcon aria-hidden="true" />
					<span>Home</span>
				</button>
			</div>
			{#if previousChapter}
				<small>{previousChapter.title}</small>
			{/if}
		</div>

		<div class="docs-chapter-footer__side docs-chapter-footer__side--next">
			<div class="docs-chapter-footer__actions">
				<button
					type="button"
					class="docs-chapter-footer__button docs-chapter-footer__complete-button"
					class:is-complete={completed}
					disabled={saving}
					aria-pressed={completed}
					onclick={toggleComplete}
				>
					{#if completed}
						<SquareCheckIcon aria-hidden="true" />
						<span>Completed</span>
					{:else}
						<SquareIcon aria-hidden="true" />
						<span>Mark As Completed</span>
					{/if}
				</button>
				{#if nextChapter}
					<button
						type="button"
						class="docs-chapter-footer__button"
						onclick={() => onOpenNote(nextChapter.noteId)}
					>
						<span>Next</span>
						<ArrowRightIcon aria-hidden="true" />
					</button>
				{:else}
					<span class="docs-chapter-footer__button is-disabled" aria-disabled="true">
						<span>Next</span>
						<ArrowRightIcon aria-hidden="true" />
					</span>
				{/if}
			</div>
			{#if nextChapter}
				<small>{nextChapter.title}</small>
			{/if}
		</div>
	</div>
</footer>

<style>
	.docs-chapter-footer {
		display: grid;
		gap: 1rem;
		margin-top: 1.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid color-mix(in srgb, var(--docs-border, var(--border)) 78%, transparent);
	}

	.docs-chapter-footer__complete {
		display: flex;
		justify-content: flex-end;
		min-height: 1.75rem;
	}

	.docs-chapter-footer__badge {
		display: grid;
		place-items: center;
		width: 1.85rem;
		height: 1.85rem;
		border-radius: 999px;
		background: #22c55e;
		color: white;
		box-shadow: 0 0.35rem 0.9rem color-mix(in srgb, #22c55e 35%, transparent);
	}

	.docs-chapter-footer__badge :global(svg) {
		width: 1rem;
		height: 1rem;
	}

	.docs-chapter-footer__nav {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.docs-chapter-footer__side {
		display: grid;
		gap: 0.35rem;
		min-width: 0;
	}

	.docs-chapter-footer__side--next {
		margin-left: auto;
		justify-items: end;
		text-align: right;
	}

	.docs-chapter-footer__actions {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 0.55rem;
	}

	.docs-chapter-footer__side--next .docs-chapter-footer__actions {
		justify-content: flex-end;
	}

	.docs-chapter-footer__button {
		display: inline-flex;
		align-items: center;
		align-self: start;
		width: fit-content;
		gap: 0.4rem;
		padding: 0.45rem 0.75rem;
		border: 1px solid color-mix(in srgb, #6366f1 45%, var(--docs-border, var(--border)));
		border-radius: 0.45rem;
		background: color-mix(in srgb, var(--docs-surface, var(--background)) 94%, transparent);
		color: #4f46e5;
		font: inherit;
		font-size: 0.9rem;
		font-weight: 600;
		line-height: 1.2;
		text-decoration: none;
		cursor: pointer;
	}

	.docs-chapter-footer__button :global(svg) {
		width: 0.95rem;
		height: 0.95rem;
	}

	.docs-chapter-footer__button:hover,
	.docs-chapter-footer__button:focus-visible {
		border-color: #4f46e5;
		outline: 0;
		box-shadow: 0 0 0 3px color-mix(in srgb, #4f46e5 16%, transparent);
	}

	.docs-chapter-footer__button.is-disabled {
		opacity: 0.45;
		cursor: not-allowed;
		pointer-events: none;
	}

	.docs-chapter-footer__complete-button.is-complete {
		border-color: color-mix(in srgb, #22c55e 55%, var(--docs-border, var(--border)));
		color: #15803d;
	}

	.docs-chapter-footer__side small {
		color: var(--docs-muted, var(--muted-foreground));
		font-size: 0.78rem;
		line-height: 1.35;
	}

	@media (max-width: 640px) {
		.docs-chapter-footer__nav {
			flex-direction: column;
		}

		.docs-chapter-footer__side--next {
			margin-left: 0;
			justify-items: start;
			text-align: left;
			width: 100%;
		}

		.docs-chapter-footer__side--next .docs-chapter-footer__actions {
			justify-content: flex-start;
		}
	}
</style>
