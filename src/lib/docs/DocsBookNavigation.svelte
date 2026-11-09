<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ListIcon from '@lucide/svelte/icons/list';
	import XIcon from '@lucide/svelte/icons/x';
	import type {
		DocsBookChapter,
		DocsBookChapterNavigation,
		DocsBookNavigation
	} from '../model';

	let {
		book,
		activeNoteId,
		chapterNavigation = null,
		variant = 'toc',
		onOpenNote = () => {}
	}: {
		book: DocsBookNavigation;
		activeNoteId: string;
		chapterNavigation?: DocsBookChapterNavigation | null;
		variant?: 'toc' | 'floating';
		onOpenNote?: (noteId: string) => void;
	} = $props();

	let floatingOpen = $state(false);

	const progressPercent = $derived(Math.max(0, Math.min(100, book.progressPercent)));
	const ringRadius = 15.5;
	const ringCircumference = 2 * Math.PI * ringRadius;
	const ringOffset = $derived(ringCircumference * (1 - progressPercent / 100));

	function openNote(noteId: string) {
		onOpenNote(noteId);
	}

	function isActive(chapter: DocsBookChapter) {
		return chapter.resolved && chapter.noteId === activeNoteId;
	}
</script>

{#if variant === 'toc'}
	<section class="docs-book-toc" aria-label="Book table of contents">
		<div class="docs-book-toc__header">
			<div class="docs-book-toc__icon"><ListIcon aria-hidden="true" /></div>
			<div>
				<p>Table of Contents</p>
				<span
					>{book.chapters.length} chapters · {book.completedCount}/{book.resolvedCount} complete</span
				>
			</div>
			<div
				class="docs-book-progress-ring"
				role="progressbar"
				aria-label="Book progress"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={progressPercent}
			>
				<svg viewBox="0 0 36 36" aria-hidden="true">
					<circle class="docs-book-progress-ring__track" cx="18" cy="18" r={ringRadius}></circle>
					<circle
						class="docs-book-progress-ring__fill"
						cx="18"
						cy="18"
						r={ringRadius}
						stroke-dasharray={ringCircumference}
						stroke-dashoffset={ringOffset}
					></circle>
				</svg>
				{#if progressPercent >= 100}
					<span class="docs-book-progress-ring__check"><CheckIcon /></span>
				{:else}
					<span class="docs-book-progress-ring__label">{progressPercent}%</span>
				{/if}
			</div>
		</div>
		<ol class="docs-book-chapters">
			{#each book.chapters as chapter (chapter.index + chapter.noteId)}
				<li
					class:resolved={chapter.resolved}
					class:is-active={isActive(chapter)}
					class:is-complete={chapter.completed}
				>
					{#if chapter.resolved}
						<button type="button" onclick={() => openNote(chapter.noteId)} aria-current={isActive(chapter) ? 'page' : undefined}>
							<span class="docs-book-chapters__index">
								{#if chapter.completed}
									<CheckIcon aria-hidden="true" />
								{:else}
									{chapter.index + 1}
								{/if}
							</span>
							<strong>{chapter.title}</strong>
							{#if chapter.summary}
								<small>{chapter.summary}</small>
							{/if}
						</button>
					{:else}
						<span class="docs-book-chapters__missing" aria-disabled="true">
							<span class="docs-book-chapters__index">{chapter.index + 1}</span>
							<strong>{chapter.title}</strong>
							<small>Missing note</small>
						</span>
					{/if}
				</li>
			{/each}
		</ol>
	</section>
{:else}
	<div class="docs-book-floating" class:is-open={floatingOpen}>
		<button
			type="button"
			class="docs-book-floating__trigger"
			aria-label={floatingOpen ? 'Hide book table of contents' : 'Open book table of contents'}
			aria-expanded={floatingOpen}
			aria-controls={`docs-book-floating-panel-${book.id}`}
			onclick={() => (floatingOpen = !floatingOpen)}
		>
			<span
				class="docs-book-progress-ring docs-book-progress-ring--trigger"
				role="presentation"
				aria-hidden="true"
			>
				<svg viewBox="0 0 36 36">
					<circle class="docs-book-progress-ring__track" cx="18" cy="18" r={ringRadius}></circle>
					<circle
						class="docs-book-progress-ring__fill"
						cx="18"
						cy="18"
						r={ringRadius}
						stroke-dasharray={ringCircumference}
						stroke-dashoffset={ringOffset}
					></circle>
				</svg>
				{#if progressPercent >= 100}
					<span class="docs-book-progress-ring__check"><CheckIcon /></span>
				{:else}
					<BookOpenIcon />
				{/if}
			</span>
		</button>
		{#if floatingOpen}
			<aside
				id={`docs-book-floating-panel-${book.id}`}
				class="docs-book-floating__panel"
				aria-label={`${book.title} book navigation`}
			>
				<div class="docs-book-floating__header">
					<div class="docs-book-floating__icon"><BookOpenIcon aria-hidden="true" /></div>
					<div class="docs-book-floating__title">
						<p>Book</p>
						<button
							type="button"
							aria-current={activeNoteId === book.indexNoteId ? 'page' : undefined}
							onclick={() => openNote(book.indexNoteId)}
						>
							{book.title}
						</button>
						<div class="docs-book-floating__progress">
							<div
								class="docs-book-floating__progress-track"
								role="progressbar"
								aria-label="Book progress"
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={progressPercent}
							>
								<span
									class="docs-book-floating__progress-fill"
									style={`width: ${progressPercent}%`}
								></span>
							</div>
							<small>{progressPercent}%</small>
						</div>
					</div>
					<button
						type="button"
						class="docs-book-floating__close"
						aria-label="Close book table of contents"
						onclick={() => (floatingOpen = false)}
					>
						<XIcon aria-hidden="true" />
					</button>
				</div>
				<ol class="docs-book-floating__chapters">
					{#each book.chapters as chapter (chapter.index + chapter.noteId)}
						<li
							class:is-active={isActive(chapter)}
							class:is-missing={!chapter.resolved}
							class:is-complete={chapter.completed}
						>
							{#if chapter.resolved}
								<button type="button" onclick={() => openNote(chapter.noteId)} aria-current={isActive(chapter) ? 'page' : undefined}>
									<span class="docs-book-chapters__index">
										{#if chapter.completed}
											<CheckIcon aria-hidden="true" />
										{:else}
											{chapter.index + 1}
										{/if}
									</span>
									<strong>{chapter.title}</strong>
								</button>
							{:else}
								<span aria-disabled="true">
									<span class="docs-book-chapters__index">{chapter.index + 1}</span>
									<strong>{chapter.title}</strong>
								</span>
							{/if}
						</li>
					{/each}
				</ol>
				{#if chapterNavigation?.previousChapter || chapterNavigation?.nextChapter}
					<div class="docs-book-floating__controls" aria-label="Chapter navigation">
						{#if chapterNavigation.previousChapter}
							<button type="button" onclick={() => {
								const previous = chapterNavigation?.previousChapter;
								if (previous) openNote(previous.noteId);
							}}>
								<ArrowLeftIcon aria-hidden="true" />
								<span>Previous</span>
							</button>
						{:else}
							<span aria-disabled="true">
								<ArrowLeftIcon aria-hidden="true" />
								<span>Previous</span>
							</span>
						{/if}
						{#if chapterNavigation.nextChapter}
							<button type="button" onclick={() => {
								const next = chapterNavigation?.nextChapter;
								if (next) openNote(next.noteId);
							}}>
								<span>Next</span>
								<ArrowRightIcon aria-hidden="true" />
							</button>
						{:else}
							<span aria-disabled="true">
								<span>Next</span>
								<ArrowRightIcon aria-hidden="true" />
							</span>
						{/if}
					</div>
				{/if}
			</aside>
		{/if}
	</div>
{/if}

<style>
	.docs-book-toc {
		display: grid;
		gap: 1rem;
		margin: 1.5rem 0;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		background: var(--background);
		box-shadow: 0 0.75rem 2rem color-mix(in srgb, var(--foreground) 8%, transparent);
	}

	.docs-book-toc__header,
	.docs-book-floating__header {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		min-width: 0;
	}

	.docs-book-toc__icon,
	.docs-book-floating__icon {
		display: grid;
		flex: 0 0 auto;
		width: 2rem;
		height: 2rem;
		place-items: center;
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--primary) 10%, transparent);
		color: var(--primary);
	}

	.docs-book-toc__icon :global(svg),
	.docs-book-floating__icon :global(svg) {
		width: 1rem;
		height: 1rem;
	}

	.docs-book-toc__header > div:nth-child(2),
	.docs-book-floating__title {
		min-width: 0;
		flex: 1 1 auto;
	}

	.docs-book-toc__header p,
	.docs-book-floating__header p {
		margin: 0;
		color: var(--muted-foreground);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.docs-book-toc__header span {
		color: var(--muted-foreground);
		font-size: 0.82rem;
	}

	.docs-book-progress-ring {
		position: relative;
		display: grid;
		flex: 0 0 auto;
		width: 2.35rem;
		height: 2.35rem;
		place-items: center;
	}

	.docs-book-progress-ring svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.docs-book-progress-ring__track,
	.docs-book-progress-ring__fill {
		fill: none;
		stroke-width: 3;
	}

	.docs-book-progress-ring__track {
		stroke: color-mix(in srgb, var(--border) 85%, transparent);
	}

	.docs-book-progress-ring__fill {
		stroke: #22c55e;
		stroke-linecap: round;
		transition: stroke-dashoffset 180ms ease;
	}

	.docs-book-progress-ring__label,
	.docs-book-progress-ring__check {
		position: relative;
		z-index: 1;
		color: var(--foreground);
		font-size: 0.58rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.docs-book-progress-ring__check {
		display: grid;
		place-items: center;
		color: #16a34a;
	}

	.docs-book-progress-ring__check :global(svg) {
		width: 0.85rem;
		height: 0.85rem;
	}

	.docs-book-progress-ring--trigger {
		width: 100%;
		height: 100%;
		color: var(--foreground);
	}

	.docs-book-progress-ring--trigger > :global(.lucide) {
		position: relative;
		z-index: 1;
		width: 0.95rem;
		height: 0.95rem;
	}

	.docs-book-chapters,
	.docs-book-floating__chapters {
		display: grid;
		gap: 0.45rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.docs-book-chapters li > button,
	.docs-book-chapters__missing {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr);
		gap: 0.2rem 0.75rem;
		padding: 0.7rem;
		border: 1px solid var(--border);
		border-radius: 0.45rem;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
		width: 100%;
	}

	.docs-book-chapters li.is-active > button,
	.docs-book-floating__chapters li.is-active > button {
		border-color: color-mix(in srgb, var(--primary) 60%, var(--border));
		background: color-mix(in srgb, var(--primary) 8%, transparent);
	}

	.docs-book-chapters li.is-complete > button .docs-book-chapters__index,
	.docs-book-floating__chapters li.is-complete > button .docs-book-chapters__index {
		background: color-mix(in srgb, #22c55e 18%, transparent);
		color: #15803d;
	}

	.docs-book-chapters li > button:hover,
	.docs-book-chapters li > button:focus-visible {
		border-color: var(--ring);
		outline: 0;
	}

	.docs-book-chapters__index {
		display: grid;
		width: 1.7rem;
		height: 1.7rem;
		place-items: center;
		border-radius: 999px;
		background: color-mix(in srgb, var(--foreground) 9%, transparent);
		color: var(--muted-foreground);
		font-size: 0.72rem;
		font-weight: 700;
	}

	.docs-book-chapters li > button:has(small) .docs-book-chapters__index,
	.docs-book-chapters__missing:has(small) .docs-book-chapters__index {
		grid-row: 1 / span 2;
		align-self: center;
	}

	.docs-book-chapters__index :global(svg) {
		width: 0.85rem;
		height: 0.85rem;
	}

	.docs-book-chapters strong {
		align-self: center;
		font-size: 0.95rem;
	}

	.docs-book-chapters small {
		grid-column: 2;
		color: var(--muted-foreground);
		line-height: 1.45;
	}

	.docs-book-chapters__missing {
		opacity: 0.62;
	}

	.docs-book-floating {
		/* Center on the same axis as the TOC rail / chapter scroll ring. */
		--docs-book-floating-size: 2.35rem;
		position: absolute;
		top: 0.85rem;
		right: max(
			calc(
				0.8rem + var(--markdown-floating-toc-scrollbar-offset, 1rem) +
					(var(--markdown-floating-toc-gutter, 1.45rem) - var(--docs-book-floating-size)) / 2
			),
			calc(
				env(safe-area-inset-right) + var(--markdown-floating-toc-scrollbar-offset, 1rem) +
					(var(--markdown-floating-toc-gutter, 1.45rem) - var(--docs-book-floating-size)) / 2
			)
		);
		z-index: 36;
		width: var(--docs-book-floating-size);
		pointer-events: none;
	}

	.docs-book-floating.is-open {
		width: 20rem;
	}

	.docs-book-floating__trigger,
	.docs-book-floating__close {
		display: grid;
		place-items: center;
		border: 1px solid var(--border);
		background: color-mix(in srgb, var(--background) 95%, transparent);
		color: var(--foreground);
		cursor: pointer;
		backdrop-filter: blur(10px);
	}

	.docs-book-floating__trigger {
		position: absolute;
		top: 0;
		right: 0;
		width: var(--docs-book-floating-size);
		height: var(--docs-book-floating-size);
		padding: 0;
		border-radius: 999px;
		box-shadow: 0 0.7rem 1.5rem color-mix(in srgb, var(--foreground) 12%, transparent);
		pointer-events: auto;
	}

	.docs-book-floating__trigger:hover,
	.docs-book-floating__trigger:focus-visible,
	.docs-book-floating__close:hover,
	.docs-book-floating__close:focus-visible {
		border-color: var(--ring);
		color: var(--primary);
		outline: 0;
	}

	.docs-book-floating__close :global(svg) {
		width: 1rem;
		height: 1rem;
	}

	.docs-book-floating__panel {
		position: absolute;
		top: 0;
		right: 2.9rem;
		z-index: 1;
		display: grid;
		width: 16.75rem;
		max-height: min(70vh, 34rem);
		gap: 0.75rem;
		padding: 0.75rem;
		overflow: auto;
		border: 1px solid var(--border);
		border-radius: 0.55rem;
		background: color-mix(in srgb, var(--background) 95%, transparent);
		box-shadow: 0 0.9rem 2rem color-mix(in srgb, var(--foreground) 12%, transparent);
		backdrop-filter: blur(10px);
		pointer-events: auto;
	}

	.docs-book-floating__title {
		min-width: 0;
		flex: 1 1 auto;
	}

	.docs-book-floating__progress {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin-top: 0.35rem;
	}

	.docs-book-floating__progress-track {
		position: relative;
		flex: 1 1 auto;
		height: 0.35rem;
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
		border-radius: 999px;
		background: color-mix(in srgb, var(--muted-foreground) 14%, transparent);
	}

	.docs-book-floating__progress-fill {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: #22c55e;
		transition: width 180ms ease;
	}

	.docs-book-floating__progress small {
		flex: 0 0 auto;
		min-width: 1.75rem;
		color: var(--muted-foreground);
		font-size: 0.72rem;
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

	.docs-book-floating__close {
		flex: 0 0 auto;
		width: 1.85rem;
		height: 1.85rem;
		border-radius: 0.45rem;
	}

	.docs-book-floating__title > button {
		display: block;
		min-width: 0;
		border: 0;
		background: transparent;
		color: var(--foreground);
		font: inherit;
		font-size: 0.84rem;
		font-weight: 700;
		line-height: 1.25;
		text-decoration: none;
	}

	.docs-book-floating__title > button:hover,
	.docs-book-floating__title > button:focus-visible {
		color: var(--primary);
		outline: 0;
	}

	.docs-book-floating__chapters {
		gap: 0.15rem;
	}

	.docs-book-floating__chapters li > button,
	.docs-book-floating__chapters li > span {
		display: grid;
		grid-template-columns: 1.7rem minmax(0, 1fr);
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem;
		border: 1px solid transparent;
		border-radius: 0.4rem;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
		width: 100%;
	}

	.docs-book-floating__chapters li > button:hover,
	.docs-book-floating__chapters li > button:focus-visible {
		border-color: var(--ring);
		outline: 0;
	}

	.docs-book-floating__chapters strong {
		min-width: 0;
		overflow: hidden;
		font-size: 0.78rem;
		font-weight: 650;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.docs-book-floating__chapters li.is-missing {
		opacity: 0.55;
	}

	.docs-book-floating__controls {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.4rem;
		padding-top: 0.35rem;
		border-top: 1px solid var(--border);
	}

	.docs-book-floating__controls button,
	.docs-book-floating__controls > span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		min-height: 1.9rem;
		border: 1px solid var(--border);
		border-radius: 0.4rem;
		background: transparent;
		color: var(--foreground);
		font: inherit;
		font-size: 0.72rem;
		cursor: pointer;
		font-weight: 700;
		text-decoration: none;
	}

	.docs-book-floating__controls button:hover,
	.docs-book-floating__controls button:focus-visible {
		border-color: var(--ring);
		outline: 0;
	}

	.docs-book-floating__controls > span {
		color: var(--muted-foreground);
		opacity: 0.5;
	}

	.docs-book-floating__controls :global(svg) {
		width: 0.8rem;
		height: 0.8rem;
	}

	@media (max-width: 700px) {
		.docs-book-floating.is-open {
			width: calc(100vw - 1.5rem);
		}

		.docs-book-floating__panel {
			top: 2.75rem;
			right: 0;
			width: min(16.75rem, calc(100vw - 1.5rem));
			max-height: min(62vh, 28rem);
		}
	}
</style>
