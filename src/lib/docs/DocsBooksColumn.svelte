<script lang="ts">
  import type { DocsBookNavigation, DocsNoteListItem } from "../model";

  let {
    books = [],
    notes = [],
    activeNoteId = null,
    onOpenNote = () => {},
  }: {
    books?: DocsBookNavigation[];
    notes?: DocsNoteListItem[];
    activeNoteId?: string | null;
    onOpenNote?: (noteId: string) => void;
  } = $props();

  const claimedIds = $derived(
    new Set(
      books.flatMap((book) => [
        book.indexNoteId,
        ...book.chapters.map((chapter) => chapter.noteId),
      ]),
    ),
  );
  const standaloneNotes = $derived(
    notes.filter((note) => !claimedIds.has(note.id)),
  );
</script>

<nav class="docs-books" aria-label="Books">
  {#if books.length}
    {#each books as book (book.id)}
      <section class="docs-books__book" aria-label={book.title}>
        <button
          type="button"
          class="docs-books__index"
          aria-current={activeNoteId === book.indexNoteId ? "page" : undefined}
          onclick={() => onOpenNote(book.indexNoteId)}
        >
          {book.title}
        </button>
        <ol>
          {#each book.chapters as chapter (chapter.index + chapter.noteId)}
            <li>
              {#if chapter.resolved}
                <button
                  type="button"
                  aria-current={activeNoteId === chapter.noteId ? "page" : undefined}
                  onclick={() => onOpenNote(chapter.noteId)}
                >
                  <span>{chapter.index + 1}</span>
                  {chapter.title}
                </button>
              {:else}
                <span class="docs-books__missing">{chapter.title}</span>
              {/if}
            </li>
          {/each}
        </ol>
      </section>
    {/each}
  {:else}
    <p class="docs-books__empty">No books in this vault.</p>
  {/if}
  {#if standaloneNotes.length}
    <section class="docs-books__book" aria-label="Notes">
      <p>Notes</p>
      <ol>
        {#each standaloneNotes as note (note.id)}
          <li>
            <button
              type="button"
              aria-current={activeNoteId === note.id ? "page" : undefined}
              onclick={() => onOpenNote(note.id)}
            >
              {note.title || note.id}
            </button>
          </li>
        {/each}
      </ol>
    </section>
  {/if}
</nav>
