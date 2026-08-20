<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import LayersIcon from '@lucide/svelte/icons/layers';
	import Rows3Icon from '@lucide/svelte/icons/rows-3';
	import TargetIcon from '@lucide/svelte/icons/target';
	import type { DocsNote, DocsRevisionBlock } from '../model';
	import DocsMarkdownPreview from './DocsMarkdownPreview.svelte';
	import DocsRichBlock from './DocsRichBlock.svelte';
	import './DocsSlidesPreview.css';
	import { DOC_TYPE_LABELS } from './docs-workspace-helpers';

	type RichSlide =
		| { kind: 'intro'; id: string }
		| { kind: 'block'; id: string; block: DocsRevisionBlock; index: number }
		| { kind: 'body'; id: string };

	let {
		markdown,
		note = null,
		activeSlide = $bindable(0)
	}: {
		markdown: string;
		note?: DocsNote | null;
		activeSlide?: number;
	} = $props();

	const markdownSlides = $derived(splitSlides(markdown));
	const richSlides = $derived(note ? buildRichSlides(note) : []);
	const slideCount = $derived(note ? richSlides.length : markdownSlides.length);
	const currentMarkdownSlide = $derived(markdownSlides[activeSlide] ?? '');
	const currentRichSlide = $derived(richSlides[activeSlide]);

	$effect(() => {
		if (activeSlide >= slideCount) activeSlide = Math.max(0, slideCount - 1);
	});

	function stripFrontmatter(value: string) {
		const trimmed = value.trim();
		if (!trimmed.startsWith('---')) return trimmed;
		const match = /^---\s*\n[\s\S]*?\n---\s*(?:\n|$)/.exec(trimmed);
		return match ? trimmed.slice(match[0].length).trim() : trimmed;
	}

	function splitSlides(value: string) {
		return stripFrontmatter(value)
			.split(/\n\s*---\s*\n/g)
			.map((slide) => slide.trim())
			.filter(Boolean);
	}

	function selectSlide(index: number) {
		activeSlide = Math.max(0, Math.min(index, slideCount - 1));
	}

	function buildRichSlides(value: DocsNote): RichSlide[] {
		return [
			{ kind: 'intro', id: `${value.id}-intro` },
			...value.blocks.map((block, index) => ({
				kind: 'block' as const,
				id: block.id,
				block,
				index
			})),
			...(value.body ? [{ kind: 'body' as const, id: `${value.id}-body` }] : [])
		];
	}

	function slideFrameClass(slide?: RichSlide) {
		const kind = slide?.kind ?? 'markdown';
		const blockType = slide?.kind === 'block' ? slide.block.type : kind;
		return `docs-slide-frame docs-slide-frame--rich docs-slide-frame--${blockType}`;
	}

</script>

{#snippet richSlide(slide: RichSlide, stacked = false)}
	{#if note}
		{#if slide.kind === 'intro'}
			<article class="docs-rich-hero docs-rich-slide-hero">
				<div class="docs-rich-hero__eyebrow">
					<BookOpenIcon aria-hidden="true" />
					<span>{DOC_TYPE_LABELS[note.docType] ?? note.docType}</span>
				</div>
				<h1>{note.title}</h1>
				{#if note.summary}
					<p class="docs-rich-hero__summary">{note.summary}</p>
				{/if}
				{#if note.learningGoal}
					<div class="docs-rich-goal">
						<TargetIcon aria-hidden="true" />
						<div>
							<span>Learning Goal</span>
							<p>{note.learningGoal}</p>
						</div>
					</div>
				{/if}
				{#if note.tags.length}
					<div class="docs-rich-tags" aria-label="Tags">
						{#each note.tags as tag (tag)}
							<span>#{tag}</span>
						{/each}
					</div>
				{/if}
			</article>
		{:else if slide.kind === 'block'}
			<DocsRichBlock
				block={slide.block}
				index={slide.index}
				sectionId={`${stacked ? 'slide-stack' : 'slide'}-${slide.block.id}`}
				headingIdPrefix={stacked ? 'docs-slide-stack-heading' : 'docs-slide-heading'}
				extraClass="docs-rich-slide-block"
				sourcePath={note.sourcePath}
			/>
		{:else if slide.kind === 'body'}
			<section class="docs-rich-block docs-rich-block--text docs-rich-additional docs-rich-slide-block">
				<div class="docs-rich-block__header">
					<div class="docs-rich-block__icon"><Rows3Icon aria-hidden="true" /></div>
					<div>
						<p>Appendix</p>
						<h2>Additional Notes</h2>
					</div>
				</div>
				<DocsMarkdownPreview value={note.body} floatingToc="off" sourcePath={note.sourcePath} />
			</section>
		{/if}
	{/if}
{/snippet}

{#if slideCount}
	<section class="docs-slides-preview" aria-label="Slides preview">
		<div class="docs-slides-preview__toolbar">
			<div>
				<LayersIcon aria-hidden="true" />
				<span>Slide {activeSlide} of {Math.max(slideCount - 1, 0)}</span>
			</div>
			<div class="docs-slides-preview__controls">
				<button
					type="button"
					aria-label="Previous slide"
					disabled={activeSlide === 0}
					onclick={() => selectSlide(activeSlide - 1)}
				>
					<ChevronLeftIcon aria-hidden="true" />
				</button>
				<button
					type="button"
					aria-label="Next slide"
					disabled={activeSlide === slideCount - 1}
					onclick={() => selectSlide(activeSlide + 1)}
				>
					<ChevronRightIcon aria-hidden="true" />
				</button>
			</div>
		</div>

		<div class="docs-slide-stage">
			<div class={note ? slideFrameClass(currentRichSlide) : 'docs-slide-frame'}>
				{#if note && currentRichSlide}
					{@render richSlide(currentRichSlide)}
				{:else}
					{#key `${activeSlide}:${currentMarkdownSlide}`}
						<DocsMarkdownPreview
							value={currentMarkdownSlide}
							floatingToc="off"
							sourcePath={note?.sourcePath ?? ''}
						/>
					{/key}
				{/if}
			</div>
		</div>

		<nav class="docs-slide-dots" aria-label="Select slide">
			{#each Array.from({ length: slideCount }) as _, index (index)}
				<button
					type="button"
					aria-label={`Show slide ${index}`}
					aria-current={activeSlide === index ? 'true' : undefined}
					onclick={() => selectSlide(index)}
				>
					{index}
				</button>
			{/each}
		</nav>

		<div class="docs-slides-stack" aria-label="All slides">
			{#each note ? richSlides : markdownSlides as slide, index (index)}
				<article class={note ? `${slideFrameClass(slide as RichSlide)} docs-slide-frame--stacked` : 'docs-slide-frame docs-slide-frame--stacked'}>
					<span>Slide {index}</span>
					{#if note}
						{@render richSlide(slide as RichSlide, true)}
					{:else}
						<DocsMarkdownPreview
							value={slide as string}
							floatingToc="off"
							sourcePath=""
						/>
					{/if}
				</article>
			{/each}
		</div>
	</section>
{:else}
	<p class="docs-muted">No slide content yet.</p>
{/if}
