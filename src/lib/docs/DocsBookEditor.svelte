<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { EntryActions, type SearchableChoiceOption } from '@lapismd/design-core/forms';
	import SearchableChoicePicker from './candidates/SearchableChoicePicker.svelte';
	import { slugifyDocsId } from '../model/markdown';
	import type { DocsBookMetadata } from '../model';

	let {
		book,
		noteOptions = [],
		onChange = () => {}
	}: {
		book: DocsBookMetadata;
		noteOptions?: SearchableChoiceOption[];
		onChange?: (book: DocsBookMetadata) => void;
	} = $props();

	function normalizeChapterId(value: string) {
		const trimmed = value.trim();
		if (!trimmed) return '';
		return slugifyDocsId(trimmed, trimmed);
	}

	function setChapters(chapters: DocsBookMetadata['chapters']) {
		onChange({ chapters });
	}

	function patchChapter(chapterIndex: number, noteId: string) {
		setChapters(
			book.chapters.map((chapter, index) =>
				index === chapterIndex ? { noteId } : chapter
			)
		);
	}

	function addChapter() {
		setChapters([...book.chapters, { noteId: '' }]);
	}

	function removeChapter(chapterIndex: number) {
		setChapters(book.chapters.filter((_, index) => index !== chapterIndex));
	}

	function moveChapter(chapterIndex: number, direction: -1 | 1) {
		const targetIndex = chapterIndex + direction;
		if (targetIndex < 0 || targetIndex >= book.chapters.length) return;
		const nextChapters = [...book.chapters];
		const [chapter] = nextChapters.splice(chapterIndex, 1);
		nextChapters.splice(targetIndex, 0, chapter);
		setChapters(nextChapters);
	}
</script>

<div class="docs-book-editor">
	{#each book.chapters as chapter, chapterIndex (chapterIndex)}
		<EntryActions
			index={chapterIndex}
			total={book.chapters.length}
			removeLabel={`Remove chapter ${chapter.noteId || chapterIndex + 1}`}
			onMove={(direction) => moveChapter(chapterIndex, direction)}
			onRemove={() => removeChapter(chapterIndex)}
		>
			<div class="docs-book-editor__row">
				<span>{chapterIndex + 1}</span>
				<SearchableChoicePicker
					value={chapter.noteId}
					options={noteOptions}
					placeholder="Select note"
					searchPlaceholder="Search notes..."
					emptyLabel="No notes found."
					ariaLabel={`Book chapter ${chapterIndex + 1}`}
					normalize={normalizeChapterId}
					onChange={(noteId) => patchChapter(chapterIndex, noteId)}
				/>
			</div>
		</EntryActions>
	{/each}
	<button type="button" class="docs-book-editor__add" onclick={addChapter}>
		<PlusIcon aria-hidden="true" />
		<span>Add chapter</span>
	</button>
</div>

<style>
	.docs-book-editor {
		display: grid;
		gap: 0.4rem;
		width: 100%;
		min-width: 0;
	}

	.docs-book-editor__row {
		display: grid;
		grid-template-columns: 1.6rem minmax(0, 1fr);
		align-items: center;
		gap: 0.55rem;
		min-width: 0;
		padding-block: 0.2rem;
	}

	.docs-book-editor__row > span {
		display: grid;
		width: 1.35rem;
		height: 1.35rem;
		place-items: center;
		border-radius: 999px;
		background: color-mix(in srgb, currentColor 8%, transparent);
		color: var(--muted-foreground);
		font-size: 0.72rem;
		font-weight: 650;
		line-height: 1;
	}

	.docs-book-editor__add {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		width: 100%;
		min-height: 2.1rem;
		border: 1px dashed var(--border);
		border-radius: 0.4rem;
		background: transparent;
		color: var(--muted-foreground);
		font-size: 0.82rem;
		font-weight: 650;
		cursor: pointer;
	}

	.docs-book-editor__add:hover,
	.docs-book-editor__add:focus-visible {
		border-color: var(--ring);
		color: var(--foreground);
		outline: 0;
	}

	.docs-book-editor__add :global(svg) {
		width: 0.95rem;
		height: 0.95rem;
	}
</style>
