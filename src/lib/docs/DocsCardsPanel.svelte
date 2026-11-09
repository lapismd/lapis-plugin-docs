<script lang="ts">
	import PlusIcon from "@lucide/svelte/icons/plus";
	import { DatePicker } from "@lapismd/design-core/forms";
	import ChipAutocomplete from "@lapismd/design-core/forms/ChipAutocomplete.svelte";
	import TagEditor from "./candidates/TagEditor.svelte";
	import * as ScrollArea from "@lapismd/design-core/shadcn/scroll-area";
	import DocsCardPreviewStack from "./DocsCardPreviewStack.svelte";
	import DocsMarkdownField from "./DocsMarkdownField.svelte";
	import {
		FormField,
		FormSectionHeader,
		ReferencePicker,
		SegmentedControl,
		type ReferenceIndex
	} from "@lapismd/design-core/forms";
	import { slugifyDocsId } from '../model/markdown';
	import type { DocsCard, DocsCardStatus, DocsCardType, DocsNote } from '../model';

	let {
		draftNote,
		previewMode = false,
		cardOpenById = $bindable({}),
		cardReferenceAddOpenById = $bindable({}),
		tagSuggestions,
		sourceReferenceIndex,
		blockSuggestions,
		cardDueAt,
		updateCardDue,
		updateCard,
		moveCard,
		removeCard,
		addCard
	}: {
		draftNote: DocsNote;
		previewMode?: boolean;
		cardOpenById: Record<string, boolean>;
		cardReferenceAddOpenById: Record<string, boolean>;
		tagSuggestions: string[];
		sourceReferenceIndex: ReferenceIndex;
		blockSuggestions: string[];
		cardDueAt: (card: DocsCard) => string | undefined;
		updateCardDue: (cardId: string, dateOnly: string | undefined) => void;
		updateCard: (cardId: string, updater: (card: DocsCard) => DocsCard) => void;
		moveCard: (cardId: string, direction: -1 | 1) => void;
		removeCard: (cardId: string) => void;
		addCard: () => void;
	} = $props();

	let previewAnswerOpenById = $state<Record<string, boolean>>({});
	let previewTargetCardId = $state(readPreviewTargetCardId());

	const previewStackItems = $derived(
		draftNote.cards.map((card) => ({
			key: card.id,
			card,
			noteId: draftNote.id,
			noteTitle: draftNote.title,
			noteSourcePath: draftNote.sourcePath,
			noteBlocks: draftNote.blocks,
			dueAt: cardDueAt(card)
		}))
	);
	const previewInitialIndex = $derived.by(() => {
		if (!previewTargetCardId) return 0;
		const index = draftNote.cards.findIndex((card) => card.id === previewTargetCardId);
		return index < 0 ? 0 : index;
	});

	$effect(() => {
		if (!previewMode || typeof window === 'undefined') return;
		const syncPreviewTarget = () => {
			previewTargetCardId = readPreviewTargetCardId();
		};
		syncPreviewTarget();
		window.addEventListener('hashchange', syncPreviewTarget);
		return () => {
			window.removeEventListener('hashchange', syncPreviewTarget);
		};
	});

	function readPreviewTargetCardId() {
		if (typeof window === 'undefined') return '';
		const prefix = `#docs-card-${draftNote.id}-`;
		const hash = window.location.hash;
		if (!hash.startsWith(prefix)) return '';
		try {
			return decodeURIComponent(hash.slice(prefix.length));
		} catch {
			return hash.slice(prefix.length);
		}
	}
</script>

<ScrollArea.Root class="docs-note-tab-panel">
  <section class="docs-note-tab-panel__content docs-note-tab-panel--cards">
  {#if previewMode}
    <DocsCardPreviewStack
      items={previewStackItems}
      {sourceReferenceIndex}
      mode="browse"
      initialIndex={previewInitialIndex}
      bind:previewAnswerOpenById
    />
  {:else}
  <div class="docs-card-list">
    {#each draftNote.cards as card, index (card.id)}
      <article
        class="docs-card-editor"
        data-card-type={card.type}
        data-card-status={card.status}
      >
        <FormSectionHeader
          title={card.prompt}
          titleLabel="Card prompt"
          titlePlaceholder="Add Prompt"
          {index}
          total={draftNote.cards.length}
          open={cardOpenById[card.id] !== false}
          editable={cardOpenById[card.id] !== false}
          titleToggleable={cardOpenById[card.id] === false}
          removeLabel={`Remove card ${card.id}`}
          onTitleChange={(prompt) =>
            updateCard(card.id, (item) => ({ ...item, prompt }))}
          onToggle={() =>
            (cardOpenById = {
              ...cardOpenById,
              [card.id]: cardOpenById[card.id] === false,
            })}
          onMove={(direction) => moveCard(card.id, direction)}
          onRemove={() => removeCard(card.id)}
        />
        {#if cardOpenById[card.id] !== false}
          <div class="docs-card-fields">
            <FormField label="Id">
              <input
                value={card.id}
                disabled={card.reviews.length > 0}
                oninput={(event) =>
                  updateCard(card.id, (item) => ({
                    ...item,
                    id: slugifyDocsId(
                      event.currentTarget.value,
                      item.id,
                    ),
                  }))}
              />
            </FormField>
            <FormField label="Type" align="center" as="div">
              <SegmentedControl
                value={card.type}
                options={["basic", "cloze"]}
                labels={{ basic: "Basic", cloze: "Cloze" }}
                ariaLabel="Card type"
                onChange={(value) =>
                  updateCard(card.id, (item) => ({
                    ...item,
                    type: value as DocsCardType,
                  }))}
              />
            </FormField>
            <FormField label="Status" align="center" as="div">
              <SegmentedControl
                value={card.status}
                options={["active", "suspended"]}
                labels={{ active: "Active", suspended: "Suspended" }}
                ariaLabel="Card status"
                onChange={(value) =>
                  updateCard(card.id, (item) => ({
                    ...item,
                    status: value as DocsCardStatus,
                  }))}
              />
            </FormField>
            <DocsMarkdownField
              label="Answer"
              value={card.answer}
              placeholder="Add Answer"
              onChange={(value) =>
                updateCard(card.id, (item) => ({
                  ...item,
                  answer: value,
                }))}
            />
            <FormField label="Tags" as="div">
              <TagEditor
                id={`docs-card-tags-${draftNote.id}-${card.id}`}
                showLabel={false}
                embedded
                value={card.tags}
                suggestions={tagSuggestions}
                placeholder="Add tag..."
                onChange={(tags) =>
                  updateCard(card.id, (item) => ({ ...item, tags }))}
              />
            </FormField>
            <FormField label="Source refs" as="div">
              <p class="docs-card-field-help">
                CV or evidence markers shown as source context on the card back after you reveal the answer.
              </p>
              <ReferencePicker
                refs={card.sourceRefs}
                referenceIndex={sourceReferenceIndex}
                addOpen={cardReferenceAddOpenById[card.id] === true}
                addLabel="Add Reference"
                addHeading="Reference"
                searchPlaceholder="Search CV reference markers..."
                unresolvedLabel="Unresolved marker"
                unresolvedDescription="Keep this reference or remove it after updating CV markers."
                duplicateMessage="Duplicate markers are hidden until each marker id appears only once."
                onAddOpenChange={(open) =>
                  (cardReferenceAddOpenById = {
                    ...cardReferenceAddOpenById,
                    [card.id]: open,
                  })}
                onChange={(sourceRefs) =>
                  updateCard(card.id, (item) => ({
                    ...item,
                    sourceRefs,
                  }))}
              />
            </FormField>
            <FormField label="Block refs" as="div">
              <p class="docs-card-field-help">
                Note blocks rendered on the card back after you reveal the answer.
              </p>
              <ChipAutocomplete
                id={`docs-card-block-refs-${draftNote.id}-${card.id}`}
                showLabel={false}
                embedded
                uppercase={false}
                value={card.blockRefs}
                suggestions={blockSuggestions}
                label="Block refs"
                placeholder="Add block id..."
                onChange={(blockRefs) =>
                  updateCard(card.id, (item) => ({
                    ...item,
                    blockRefs,
                  }))}
              />
            </FormField>
            <FormField label="Due" align="center" as="div">
              <DatePicker
                value={cardDueAt(card)?.slice(0, 10)}
                onValueChange={(date) =>
                  updateCardDue(card.id, date ?? undefined)
                }
              />
            </FormField>
          </div>
        {/if}
      </article>
    {/each}
    <button
      type="button"
      class="docs-cards-add-bottom"
      onclick={addCard}
    >
      <PlusIcon />
      Add Card
    </button>
  </div>
  {/if}
  </section>
</ScrollArea.Root>
