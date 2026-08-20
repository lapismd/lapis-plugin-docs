<script lang="ts">
	import * as ScrollArea from "@lapismd/design-core/shadcn/scroll-area";
	import type { DocsBookChapterNavigation, DocsBookNavigation, DocsNote } from '../model';
	import DocsMarkdownPreview from './DocsMarkdownPreview.svelte';
	import DocsRichDisplay from './DocsRichDisplay.svelte';
	import DocsSlidesPreview from './DocsSlidesPreview.svelte';
	import { clampDisplaySlideIndex } from './docs-display-focus';
	import './DocsDisplayPanel.css';
	import type { DisplayMode } from './docs-workspace-helpers';

	let {
		displayMode = $bindable('document'),
		note,
		renderedDisplayMarkdown,
		bookNavigation = null,
		chapterNavigation = null,
		saving = false,
		onToggleChapterComplete = () => {}
	}: {
		displayMode: DisplayMode;
		note: DocsNote | null;
		renderedDisplayMarkdown: string;
		bookNavigation?: DocsBookNavigation | null;
		chapterNavigation?: DocsBookChapterNavigation | null;
		saving?: boolean;
		onToggleChapterComplete?: (completed: boolean) => void | Promise<void>;
	} = $props();

	let focusSlideIndex = $state(0);
	let trackedNoteId = $state<string | null>(null);

	$effect(() => {
		const noteId = note?.id ?? null;
		if (noteId === trackedNoteId) {
			focusSlideIndex = clampDisplaySlideIndex(focusSlideIndex, note);
			return;
		}
		trackedNoteId = noteId;
		focusSlideIndex = 0;
	});
</script>

<ScrollArea.Root
	class={`docs-display-view${displayMode === 'slides' ? ' docs-display-view--slides' : ''}`}
>
	<section class="docs-display-view__content">
		<div class="docs-display-preview" class:docs-display-preview--slides={displayMode === 'slides'}>
			{#if displayMode === 'slides'}
				<DocsSlidesPreview
					markdown={renderedDisplayMarkdown}
					{note}
					bind:activeSlide={focusSlideIndex}
				/>
			{:else if note}
				<DocsRichDisplay
					{note}
					focusSlideIndex={focusSlideIndex}
					{bookNavigation}
					{chapterNavigation}
					{saving}
					onFocusSlideIndexChange={(index) => {
						focusSlideIndex = clampDisplaySlideIndex(index, note);
					}}
					{onToggleChapterComplete}
				/>
			{:else}
				<DocsMarkdownPreview
					value={renderedDisplayMarkdown}
					empty="No display content yet."
					sourcePath=""
				/>
			{/if}
		</div>
	</section>
</ScrollArea.Root>
