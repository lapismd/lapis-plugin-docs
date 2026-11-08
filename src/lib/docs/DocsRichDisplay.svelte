<script lang="ts">
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import Rows3Icon from '@lucide/svelte/icons/rows-3';
	import TargetIcon from '@lucide/svelte/icons/target';
	import MarkdownFloatingToc from './candidates/MarkdownFloatingToc.svelte';
	import { pinReadingChrome } from './pin-reading-chrome';
	import type {
		DocsBookChapterNavigation,
		DocsBookNavigation as DocsBookNavigationModel,
		DocsNote,
		DocsRevisionBlock
	} from '../model';
	import DocsBookNavigation from './DocsBookNavigation.svelte';
	import DocsChapterFooter from './DocsChapterFooter.svelte';
	import DocsChapterScrollRing from './DocsChapterScrollRing.svelte';
	import DocsMarkdownPreview from './DocsMarkdownPreview.svelte';
	import DocsRichBlock from './DocsRichBlock.svelte';
	import {
		clampDisplaySlideIndex,
		displayFocusSelector,
		readVisibleDisplaySlideIndex
	} from './docs-display-focus';
	import { BLOCK_TYPE_LABELS, DOC_TYPE_LABELS } from './docs-workspace-helpers';

	let {
		note,
		focusSlideIndex = 0,
		bookNavigation = null,
		chapterNavigation = null,
		saving = false,
		onFocusSlideIndexChange = () => {},
		onToggleChapterComplete = () => {},
		onOpenNote = () => {}
	}: {
		note: DocsNote;
		focusSlideIndex?: number;
		bookNavigation?: DocsBookNavigationModel | null;
		chapterNavigation?: DocsBookChapterNavigation | null;
		saving?: boolean;
		onFocusSlideIndexChange?: (index: number) => void;
		onToggleChapterComplete?: (completed: boolean) => void | Promise<void>;
		onOpenNote?: (noteId: string) => void;
	} = $props();

	let documentElement = $state<HTMLElement | null>(null);
	let ignoreObserver = false;
	let lastScrolledIndex = $state<number | null>(null);
	let trackedNoteId = $state<string | null>(null);
	let chapterScrollPercent = $state(0);

	const outline = $derived(
		note.blocks
			.map((block, index) => ({
				id: block.id,
				title: blockTitle(block),
				type: BLOCK_TYPE_LABELS[block.type] ?? block.type,
				index: index + 1,
				include: !(block.type === 'markdown' && !block.title?.trim())
			}))
			.filter((item) => item.include)
	);
	const appendixTitle = $derived(note.blocks.length ? 'Additional Notes' : 'Notes');
	const appendixSlideIndex = $derived(note.blocks.length + 1);
	const activeBookNavigation = $derived(bookNavigation ?? null);
	const showReadingChrome = $derived(Boolean(chapterNavigation && activeBookNavigation));

	function blockTitle(block: DocsRevisionBlock) {
		return block.title?.trim() || BLOCK_TYPE_LABELS[block.type] || block.type;
	}

	function scrollParentFor(element: HTMLElement) {
		const viewport = element.closest('[data-slot="scroll-area"]')?.querySelector(
			'[data-slot="scroll-area-viewport"]'
		);
		if (viewport instanceof HTMLElement) return viewport;

		let current = element.parentElement;
		while (current) {
			const style = getComputedStyle(current);
			if (/(auto|scroll)/.test(style.overflowY)) return current;
			current = current.parentElement;
		}
		return null;
	}

	function readChapterScrollPercent(scrollRoot: Element | null) {
		if (!scrollRoot || !(scrollRoot instanceof HTMLElement)) return 0;
		const maxScroll = scrollRoot.scrollHeight - scrollRoot.clientHeight;
		if (maxScroll <= 0) return scrollRoot.scrollHeight > scrollRoot.clientHeight ? 0 : 100;
		return Math.max(0, Math.min(100, (scrollRoot.scrollTop / maxScroll) * 100));
	}

	function scrollToFocusIndex(index: number) {
		const root = documentElement;
		if (!root) return;
		const scrollRoot = scrollParentFor(root);
		ignoreObserver = true;
		lastScrolledIndex = index;
		// Aligning the hero with scrollIntoView leaves content padding scrolled away
		// (~1% on long notes). Reset the viewport for the intro slide instead.
		if (index === 0) {
			if (scrollRoot) scrollRoot.scrollTop = 0;
		} else {
			const target = root.querySelector<HTMLElement>(displayFocusSelector(note, index));
			target?.scrollIntoView({ block: 'start', behavior: 'auto' });
		}
		requestAnimationFrame(() => {
			ignoreObserver = false;
			chapterScrollPercent = readChapterScrollPercent(scrollRoot);
		});
	}

	function publishVisibleIndex() {
		const root = documentElement;
		if (!root || ignoreObserver) return;
		const scrollRoot = scrollParentFor(root);
		const next = readVisibleDisplaySlideIndex(root, scrollRoot);
		if (next === focusSlideIndex) return;
		lastScrolledIndex = next;
		onFocusSlideIndexChange(next);
	}

	$effect(() => {
		const root = documentElement;
		const noteId = note.id;
		const index = clampDisplaySlideIndex(focusSlideIndex, note);
		if (!root) return;

		// Note switches reuse this component and the ScrollArea viewport, so always
		// reset scroll when the note changes — even if focus is already slide 0.
		if (trackedNoteId !== noteId) {
			trackedNoteId = noteId;
			lastScrolledIndex = null;
			const scrollRoot = scrollParentFor(root);
			if (scrollRoot) scrollRoot.scrollTop = 0;
			chapterScrollPercent = 0;
			if (index === 0) {
				lastScrolledIndex = 0;
				return;
			}
		}

		if (lastScrolledIndex === index) return;
		scrollToFocusIndex(index);
	});

	$effect(() => {
		const root = documentElement;
		if (!root) return;
		const scrollRoot = scrollParentFor(root);
		let allowFocusPublish = false;
		let frame = 0;

		const updateScrollProgress = () => {
			chapterScrollPercent = readChapterScrollPercent(scrollRoot);
		};

		const onScroll = () => {
			if (frame) cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				frame = 0;
				updateScrollProgress();
				if (!allowFocusPublish) return;
				publishVisibleIndex();
			});
		};
		scrollRoot?.addEventListener('scroll', onScroll, { passive: true });
		updateScrollProgress();

		const resizeObserver =
			scrollRoot && typeof ResizeObserver !== 'undefined'
				? new ResizeObserver(() => updateScrollProgress())
				: null;
		if (scrollRoot && resizeObserver) resizeObserver.observe(scrollRoot);

		// Only track scroll after mount so a restored slide focus is not
		// immediately overwritten by the initial layout pass.
		const timer = setTimeout(() => {
			allowFocusPublish = true;
			updateScrollProgress();
		}, 0);

		return () => {
			clearTimeout(timer);
			if (frame) cancelAnimationFrame(frame);
			resizeObserver?.disconnect();
			scrollRoot?.removeEventListener('scroll', onScroll);
		};
	});
</script>

<article class="docs-rich-document" bind:this={documentElement}>
	<div class="docs-reading-anchor" use:pinReadingChrome>
		<MarkdownFloatingToc root={documentElement} />
		{#if showReadingChrome}
			<DocsChapterScrollRing {chapterScrollPercent} />
		{/if}
		{#if activeBookNavigation?.chapters.length}
			<DocsBookNavigation
				variant="floating"
				book={activeBookNavigation}
				activeNoteId={note.id}
				{chapterNavigation}
				{onOpenNote}
			/>
		{/if}
	</div>
	<header class="docs-rich-hero" data-display-slide-index="0">
		<div class="docs-rich-hero__eyebrow">
			<BookOpenIcon aria-hidden="true" />
			<span>{DOC_TYPE_LABELS[note.docType] ?? note.docType}</span>
		</div>
		<h1
			id={`docs-heading-${note.id}`}
			data-cv-heading="true"
			data-cv-heading-level="1"
			data-cv-heading-title={note.title}
		>
			{note.title}
		</h1>
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
	</header>

	{#if bookNavigation?.indexNoteId === note.id && bookNavigation.chapters.length}
		<DocsBookNavigation variant="toc" book={bookNavigation} activeNoteId={note.id} {onOpenNote} />
	{/if}

	{#if outline.length}
		<nav class="docs-rich-outline" aria-label="Document outline">
			<div>
				<p>We'll Cover</p>
				<span>{outline.length} sections</span>
			</div>
			<ol>
				{#each outline as item (item.id)}
					<li>
						<a href={`#${item.id}`}>
							<span>{item.index}</span>
							<strong>{item.title}</strong>
							<small>{item.type}</small>
						</a>
					</li>
				{/each}
			</ol>
		</nav>
	{/if}

	<div class="docs-rich-blocks">
		{#each note.blocks as block, index (block.id)}
			<DocsRichBlock
				{block}
				{index}
				dataDisplaySlideIndex={index + 1}
				sourcePath={note.sourcePath}
			/>
		{/each}
	</div>

	{#if note.body}
		<section
			class="docs-rich-block docs-rich-block--text docs-rich-additional"
			data-display-slide-index={appendixSlideIndex}
		>
			<div class="docs-rich-block__header">
				<div class="docs-rich-block__icon"><Rows3Icon aria-hidden="true" /></div>
				<div>
					<p>Appendix</p>
					<h2
						id={`docs-heading-${note.id}-appendix`}
						data-cv-heading="true"
						data-cv-heading-level="2"
						data-cv-heading-title={appendixTitle}
					>
						{appendixTitle}
					</h2>
				</div>
			</div>
			<DocsMarkdownPreview
				value={note.body}
				floatingToc="off"
				sourcePath={note.sourcePath}
				headingIdPrefix={`docs-md-${note.id}-appendix`}
			/>
		</section>
	{/if}

	{#if showReadingChrome && chapterNavigation}
		<DocsChapterFooter
			{note}
			{chapterNavigation}
			{saving}
			onToggleComplete={onToggleChapterComplete}
			{onOpenNote}
		/>
	{/if}
</article>
