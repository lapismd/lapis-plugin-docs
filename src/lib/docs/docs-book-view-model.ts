import type { SearchableChoiceOption } from '@lapismd/design-core/forms';
import { buildDocsBooks, resolveDocsBookNavigation } from '../model/book';
import { docsSummariesToStubNotes } from '../model/workspace';
import { isDocsNoteSummary, type DocsNoteListItem } from '../model/docs-note-list';
import type {
	DocsBookChapterNavigation,
	DocsBookNavigation,
	DocsNote,
	DocsWorkspace,
	DocsWorkspaceIndex
} from '../model';

export type DocsBookWorkspaceView = {
	chapterOptions: SearchableChoiceOption[];
	bookNavigation: DocsBookNavigation | null;
	chapterNavigation: DocsBookChapterNavigation | null;
};

function notesWithDraftOverlay(notes: DocsNote[], draftNote: DocsNote | null) {
	if (!draftNote) return notes;
	let replaced = false;
	const next = notes.map((note) => {
		if (note.id !== draftNote.id) return note;
		replaced = true;
		return draftNote;
	});
	return replaced ? next : [...next, draftNote];
}

function notesForBookBuild(notes: DocsNoteListItem[]): DocsNote[] {
	if (!notes.length) return [];
	if (notes.every((note) => !isDocsNoteSummary(note))) {
		return notes as DocsNote[];
	}
	return docsSummariesToStubNotes(
		notes.map((note) =>
			isDocsNoteSummary(note)
				? note
				: {
						id: note.id,
						title: note.title,
						docType: note.docType,
						summary: note.summary,
						aliases: note.aliases,
						tags: note.tags,
						sourcePath: note.sourcePath,
						createdAt: note.createdAt,
						updatedAt: note.updatedAt,
						...(note.completedAt ? { completedAt: note.completedAt } : {}),
						cardCount: note.cards.length,
						blockCount: note.blocks.length,
						...(note.book ? { book: note.book } : {}),
						...(note.bookId ? { bookId: note.bookId } : {})
					}
		)
	);
}

export function docsBookWorkspaceView(
	workspace: DocsWorkspace | DocsWorkspaceIndex | null,
	notes: DocsNoteListItem[],
	activeNoteId: string | null,
	draftNote: DocsNote | null = null
): DocsBookWorkspaceView {
	const overlayNotes = notesWithDraftOverlay(notesForBookBuild(notes), draftNote);
	// Only rebuild books from the draft when the active draft owns a TOC (index note).
	// Rebuilding from summaries for every chapter open can drop siblings if the
	// index summary/book payload is incomplete in the client workspace.
	const draftOwnsBookToc = Boolean(draftNote?.book?.chapters?.length);
	const books =
		draftOwnsBookToc && workspace
			? buildDocsBooks(overlayNotes)
			: {
					books: workspace?.books ?? [],
					bookChaptersByNoteId: workspace?.bookChaptersByNoteId ?? {}
				};
	const chapterNavigation = activeNoteId
		? (books.bookChaptersByNoteId[activeNoteId] ?? null)
		: null;
	const indexBook = activeNoteId
		? (books.books.find((book) => book.indexNoteId === activeNoteId) ?? null)
		: null;
	const membershipBook = resolveDocsBookNavigation(books.books, chapterNavigation);

	return {
		chapterOptions: overlayNotes
			.filter((note) => note.id !== activeNoteId)
			.map((note) => ({
				value: note.id,
				label: note.title || note.id,
				keywords: [note.id, note.sourcePath, ...note.aliases, ...note.tags]
			})),
		bookNavigation: indexBook ?? membershipBook,
		chapterNavigation
	};
}
