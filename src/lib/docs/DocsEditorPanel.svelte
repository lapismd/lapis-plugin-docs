<script lang="ts">
	import './DocsEditorPanel.css';
	import ChipAutocomplete from "@lapismd/design-core/forms/ChipAutocomplete.svelte";
	import TagEditor from "./candidates/TagEditor.svelte";
	import {
		AddSectionChooser,
		CodeEditor,
		CODE_LANGUAGE_OPTIONS,
		EntryActions,
		FormField,
		FormSectionHeader,
		normalizeCodeLanguage,
		type SearchableChoiceOption,
		autosizeTextarea
	} from "@lapismd/design-core/forms";
	import ChoiceMenu from "./candidates/ChoiceMenu.svelte";
	import SearchableChoicePicker from "./candidates/SearchableChoicePicker.svelte";
	import StructuredTableEditor from "./candidates/StructuredTableEditor.svelte";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import DocsBookEditor from "./DocsBookEditor.svelte";
	import DocsBlockMarkdownEditor from "./DocsBlockMarkdownEditor.svelte";
	import type {
		DocsCalloutTone,
		DocsDocType,
		DocsNote,
		DocsResourceItem,
		DocsRevisionBlock
	} from '../model';
	import {
		BLOCK_TYPE_LABELS,
		BLOCK_TYPE_OPTIONS,
		CALLOUT_TONE_LABELS,
		CALLOUT_TONE_OPTIONS,
		DOC_TYPE_LABELS,
		DOC_TYPE_OPTIONS,
		docsBlockDisplayTitle,
		linesToText,
		textToLines
	} from "./docs-workspace-helpers";

	let {
		draftNote,
		propertiesOpen = $bindable(false),
		blockOpenById = $bindable({}),
		tagSuggestions,
		aliasSuggestions,
		bookChapterOptions = [],
		setDraftField,
		patchBlock,
		updateBlockTitle,
		updateBlockId,
		moveBlock,
		removeBlock,
		addBlock,
		onUploadAttachment
	}: {
		draftNote: DocsNote;
		propertiesOpen: boolean;
		blockOpenById: Record<string, boolean>;
		tagSuggestions: string[];
		aliasSuggestions: string[];
		bookChapterOptions?: SearchableChoiceOption[];
		setDraftField: <K extends keyof DocsNote>(key: K, value: DocsNote[K]) => void;
		patchBlock: (blockId: string, patch: Record<string, unknown>) => void;
		updateBlockTitle: (blockId: string, title: string) => void;
		updateBlockId: (blockId: string, rawValue: string) => void;
		moveBlock: (blockId: string, direction: -1 | 1) => void;
		removeBlock: (blockId: string) => void;
		addBlock: (type?: DocsRevisionBlock["type"], title?: string) => void;
		onUploadAttachment?: (noteId: string, file: File) => Promise<string | null>;
	} = $props();

	const blockTypeOptions = BLOCK_TYPE_OPTIONS.map((type) => ({
		value: type,
		label: BLOCK_TYPE_LABELS[type]
	}));

	let pendingBlockTitle = $state<string | null>(null);

	function blockDisplayTitle(block: DocsRevisionBlock) {
		return docsBlockDisplayTitle(block);
	}

	function showPendingBlock() {
		pendingBlockTitle ??= "New Section";
	}

	function cancelPendingBlock() {
		pendingBlockTitle = null;
	}

	function commitPendingBlock(type: string) {
		const title = pendingBlockTitle?.trim() || "New Section";
		addBlock(type as DocsRevisionBlock["type"], title);
		pendingBlockTitle = null;
	}

	function emptyResourceItem(): DocsResourceItem {
		return { title: "", url: "", kind: "", notes: "" };
	}

	function patchResourceItem(
		blockId: string,
		items: DocsResourceItem[],
		itemIndex: number,
		patch: Partial<DocsResourceItem>
	) {
		patchBlock(blockId, {
			items: items.map((item, index) => (index === itemIndex ? { ...item, ...patch } : item))
		});
	}

	function addResourceItem(blockId: string, items: DocsResourceItem[]) {
		patchBlock(blockId, { items: [...items, emptyResourceItem()] });
	}

	function removeResourceItem(blockId: string, items: DocsResourceItem[], itemIndex: number) {
		patchBlock(blockId, { items: items.filter((_, index) => index !== itemIndex) });
	}

	function moveResourceItem(
		blockId: string,
		items: DocsResourceItem[],
		itemIndex: number,
		direction: -1 | 1
	) {
		const targetIndex = itemIndex + direction;
		if (targetIndex < 0 || targetIndex >= items.length) return;
		const nextItems = [...items];
		const [item] = nextItems.splice(itemIndex, 1);
		nextItems.splice(targetIndex, 0, item);
		patchBlock(blockId, { items: nextItems });
	}
</script>

<section class="docs-editor">
  <div class="docs-form">
    <section class="docs-properties" aria-label="Note properties">
      <div class="docs-properties-header">
        <FormSectionHeader
          title={draftNote.title}
          index={0}
          total={1}
          open={propertiesOpen}
          editable
          movable={false}
          removable={false}
          titleLabel="Note title"
          titlePlaceholder="Untitled note"
          titleClass="docs-properties-title"
          onTitleChange={(title) => setDraftField("title", title)}
          onToggle={() => (propertiesOpen = !propertiesOpen)}
        />
      </div>
      {#if propertiesOpen}
        <div class="docs-properties-fields">
          <FormField label="Type" align="center" as="div">
            <ChoiceMenu
              value={draftNote.docType}
              options={DOC_TYPE_OPTIONS}
              labels={DOC_TYPE_LABELS}
              ariaLabel="Document type"
              onChange={(value) =>
                setDraftField("docType", value as DocsDocType)}
            />
          </FormField>
          <FormField label="Summary">
            <textarea
              rows="1"
              value={draftNote.summary}
              placeholder="Add Summary"
              use:autosizeTextarea={draftNote.summary}
              oninput={(event) =>
                setDraftField("summary", event.currentTarget.value)}
            ></textarea>
          </FormField>
          <FormField label="Learning goal">
            <textarea
              rows="1"
              value={draftNote.learningGoal}
              placeholder="Add Learning Goal"
              use:autosizeTextarea={draftNote.learningGoal}
              oninput={(event) =>
                setDraftField(
                  "learningGoal",
                  event.currentTarget.value,
                )}></textarea>
          </FormField>
          <FormField label="Aliases" as="div">
            <ChipAutocomplete
              id={`docs-note-aliases-${draftNote.id}`}
              showLabel={false}
              embedded
              uppercase={false}
              value={draftNote.aliases}
              suggestions={aliasSuggestions}
              label="Aliases"
              placeholder="Add alias..."
              onChange={(aliases) =>
                setDraftField("aliases", aliases)}
            />
          </FormField>
          <FormField label="Tags" as="div">
            <TagEditor
              id={`docs-note-tags-${draftNote.id}`}
              showLabel={false}
              embedded
              value={draftNote.tags}
              suggestions={tagSuggestions}
              placeholder="Add tag..."
              onChange={(tags) => setDraftField("tags", tags)}
            />
          </FormField>
          {#if draftNote.docType === "index" || draftNote.book}
            <FormField label="Book TOC" as="div">
              <DocsBookEditor
                book={draftNote.book ?? { chapters: [] }}
                noteOptions={bookChapterOptions}
                onChange={(book) => setDraftField("book", book)}
              />
            </FormField>
          {/if}
        </div>
      {/if}
    </section>
    <section class="docs-blocks" aria-label="Structured revision blocks">
      {#each draftNote.blocks as block, index (block.id)}
        <article class="docs-block-editor">
          <FormSectionHeader
            title={blockDisplayTitle(block)}
            titleLabel="Block title"
            titlePlaceholder={BLOCK_TYPE_LABELS[block.type]}
            {index}
            total={draftNote.blocks.length}
            open={blockOpenById[block.id] !== false}
            removeLabel={`Remove block ${block.id}`}
            onTitleChange={(title) => updateBlockTitle(block.id, title)}
            onToggle={() =>
              (blockOpenById = {
                ...blockOpenById,
                [block.id]: blockOpenById[block.id] === false
              })}
            onMove={(direction) => moveBlock(block.id, direction)}
            onRemove={() => removeBlock(block.id)}
          >
            {#snippet actions()}
              <span class="docs-block-type-badge">{BLOCK_TYPE_LABELS[block.type]}</span>
            {/snippet}
          </FormSectionHeader>
          {#if blockOpenById[block.id] !== false}
            <div class="docs-block-fields">
              <FormField label="Id">
                <input
                  value={block.id}
                  spellcheck={false}
                  oninput={(event) => updateBlockId(block.id, event.currentTarget.value)}
                />
              </FormField>
              {#if block.type === "text"}
                <FormField label="Body">
                  <textarea
                    rows="1"
                    value={block.body}
                    placeholder="Add Body"
                    use:autosizeTextarea={block.body}
                    oninput={(event) => patchBlock(block.id, { body: event.currentTarget.value })}
                  ></textarea>
                </FormField>
              {:else if block.type === "markdown"}
                <FormField label="Body">
                  <DocsBlockMarkdownEditor
                    bind:value={
                      () => block.body,
                      (next) => patchBlock(block.id, { body: next })
                    }
                    ariaLabel={`${docsBlockDisplayTitle(block)} markdown`}
                    placeholder="Write section Markdown..."
                    minRows={8}
                    attachmentUpload={
                      onUploadAttachment
                        ? (file: File) => onUploadAttachment(draftNote.id, file)
                        : undefined
                    }
                    sourcePath={draftNote.sourcePath}
                  />
                </FormField>
              {:else if block.type === "concept"}
                <FormField label="Summary">
                  <textarea
                    rows="1"
                    value={block.summary}
                    placeholder="Add Summary"
                    use:autosizeTextarea={block.summary}
                    oninput={(event) => patchBlock(block.id, { summary: event.currentTarget.value })}
                  ></textarea>
                </FormField>
                <FormField label="Key points">
                  <textarea
                    rows="1"
                    value={linesToText(block.keyPoints)}
                    placeholder="Add each key point on a new line"
                    use:autosizeTextarea={linesToText(block.keyPoints)}
                    oninput={(event) =>
                      patchBlock(block.id, { keyPoints: textToLines(event.currentTarget.value) })}
                  ></textarea>
                </FormField>
                <FormField label="Details">
                  <textarea
                    rows="1"
                    value={block.details}
                    placeholder="Add Details"
                    use:autosizeTextarea={block.details}
                    oninput={(event) => patchBlock(block.id, { details: event.currentTarget.value })}
                  ></textarea>
                </FormField>
              {:else if block.type === "procedure"}
                <FormField label="Steps">
                  <textarea
                    rows="1"
                    value={linesToText(block.steps)}
                    placeholder="Add each step on a new line"
                    use:autosizeTextarea={linesToText(block.steps)}
                    oninput={(event) =>
                      patchBlock(block.id, { steps: textToLines(event.currentTarget.value) })}
                  ></textarea>
                </FormField>
                <FormField label="Notes">
                  <textarea
                    rows="1"
                    value={block.notes}
                    placeholder="Add Notes"
                    use:autosizeTextarea={block.notes}
                    oninput={(event) => patchBlock(block.id, { notes: event.currentTarget.value })}
                  ></textarea>
                </FormField>
              {:else if block.type === "prompt"}
                <FormField label="Problem">
                  <textarea
                    rows="1"
                    value={block.problem}
                    placeholder="Add Problem"
                    use:autosizeTextarea={block.problem}
                    oninput={(event) => patchBlock(block.id, { problem: event.currentTarget.value })}
                  ></textarea>
                </FormField>
                <FormField label="Requirements">
                  <textarea
                    rows="1"
                    value={linesToText(block.requirements)}
                    placeholder="Add each requirement on a new line"
                    use:autosizeTextarea={linesToText(block.requirements)}
                    oninput={(event) =>
                      patchBlock(block.id, { requirements: textToLines(event.currentTarget.value) })}
                  ></textarea>
                </FormField>
                <FormField label="Approach">
                  <textarea
                    rows="1"
                    value={block.approach}
                    placeholder="Add Approach"
                    use:autosizeTextarea={block.approach}
                    oninput={(event) => patchBlock(block.id, { approach: event.currentTarget.value })}
                  ></textarea>
                </FormField>
                <FormField label="Traps">
                  <textarea
                    rows="1"
                    value={linesToText(block.traps)}
                    placeholder="Add each trap on a new line"
                    use:autosizeTextarea={linesToText(block.traps)}
                    oninput={(event) =>
                      patchBlock(block.id, { traps: textToLines(event.currentTarget.value) })}
                  ></textarea>
                </FormField>
                <FormField label="Tests">
                  <textarea
                    rows="1"
                    value={linesToText(block.tests)}
                    placeholder="Add each test on a new line"
                    use:autosizeTextarea={linesToText(block.tests)}
                    oninput={(event) =>
                      patchBlock(block.id, { tests: textToLines(event.currentTarget.value) })}
                  ></textarea>
                </FormField>
                <FormField label="Answer">
                  <textarea
                    rows="1"
                    value={block.answer}
                    placeholder="Add Answer"
                    use:autosizeTextarea={block.answer}
                    oninput={(event) => patchBlock(block.id, { answer: event.currentTarget.value })}
                  ></textarea>
                </FormField>
              {:else if block.type === "code"}
                <FormField label="Language" align="center" as="div">
                  <SearchableChoicePicker
                    value={block.language}
                    options={CODE_LANGUAGE_OPTIONS}
                    ariaLabel={`${blockDisplayTitle(block)} language`}
                    placeholder="Select language"
                    searchPlaceholder="Search languages..."
                    normalize={normalizeCodeLanguage}
                    onChange={(language) => patchBlock(block.id, { language })}
                  />
                </FormField>
                <FormField label="Caption">
                  <textarea
                    rows="1"
                    value={block.caption}
                    placeholder="Add Caption"
                    use:autosizeTextarea={block.caption}
                    oninput={(event) => patchBlock(block.id, { caption: event.currentTarget.value })}
                  ></textarea>
                </FormField>
                <FormField label="Code" as="div">
                  <CodeEditor
                    value={block.code}
                    language={block.language}
                    ariaLabel={`${blockDisplayTitle(block)} code`}
                    onChange={(code) => patchBlock(block.id, { code })}
                  />
                </FormField>
              {:else if block.type === "table"}
                <FormField label="Table" as="div">
                  <StructuredTableEditor
                    columns={block.columns}
                    rows={block.rows}
                    onChange={(table) => patchBlock(block.id, table)}
                  />
                </FormField>
              {:else if block.type === "callout"}
                <FormField label="Tone" align="center" as="div">
                  <ChoiceMenu
                    value={block.tone}
                    options={CALLOUT_TONE_OPTIONS}
                    labels={CALLOUT_TONE_LABELS}
                    ariaLabel="Callout tone"
                    onChange={(value) => patchBlock(block.id, { tone: value as DocsCalloutTone })}
                  />
                </FormField>
                <FormField label="Body">
                  <textarea
                    rows="1"
                    value={block.body}
                    placeholder="Add Body"
                    use:autosizeTextarea={block.body}
                    oninput={(event) => patchBlock(block.id, { body: event.currentTarget.value })}
                  ></textarea>
                </FormField>
              {:else if block.type === "story"}
                <FormField label="Use for">
                  <textarea
                    rows="1"
                    value={linesToText(block.useFor)}
                    placeholder="Add each use on a new line"
                    use:autosizeTextarea={linesToText(block.useFor)}
                    oninput={(event) =>
                      patchBlock(block.id, { useFor: textToLines(event.currentTarget.value) })}
                  ></textarea>
                </FormField>
                <FormField label="Situation">
                  <textarea
                    rows="1"
                    value={block.situation}
                    placeholder="Add Situation"
                    use:autosizeTextarea={block.situation}
                    oninput={(event) => patchBlock(block.id, { situation: event.currentTarget.value })}
                  ></textarea>
                </FormField>
                <FormField label="Task">
                  <textarea
                    rows="1"
                    value={block.task}
                    placeholder="Add Task"
                    use:autosizeTextarea={block.task}
                    oninput={(event) => patchBlock(block.id, { task: event.currentTarget.value })}
                  ></textarea>
                </FormField>
                <FormField label="Action">
                  <textarea
                    rows="1"
                    value={block.action}
                    placeholder="Add Action"
                    use:autosizeTextarea={block.action}
                    oninput={(event) => patchBlock(block.id, { action: event.currentTarget.value })}
                  ></textarea>
                </FormField>
                <FormField label="Result">
                  <textarea
                    rows="1"
                    value={block.result}
                    placeholder="Add Result"
                    use:autosizeTextarea={block.result}
                    oninput={(event) => patchBlock(block.id, { result: event.currentTarget.value })}
                  ></textarea>
                </FormField>
                <FormField label="Metrics">
                  <textarea
                    rows="1"
                    value={linesToText(block.metrics)}
                    placeholder="Add each metric on a new line"
                    use:autosizeTextarea={linesToText(block.metrics)}
                    oninput={(event) =>
                      patchBlock(block.id, { metrics: textToLines(event.currentTarget.value) })}
                  ></textarea>
                </FormField>
              {:else if block.type === "resources"}
                <FormField label="Items" as="div">
                  <div class="docs-resource-items">
                    {#each block.items as item, itemIndex (itemIndex)}
                      <EntryActions
                        index={itemIndex}
                        total={block.items.length}
                        removeLabel={`Remove resource ${item.title || item.url || itemIndex + 1}`}
                        onMove={(direction) =>
                          moveResourceItem(block.id, block.items, itemIndex, direction)}
                        onRemove={() => removeResourceItem(block.id, block.items, itemIndex)}
                      >
                        <div class="docs-resource-item-fields">
                          <label class="docs-resource-item-field">
                            <span>Title</span>
                            <input
                              value={item.title}
                              placeholder="Add title"
                              oninput={(event) =>
                                patchResourceItem(block.id, block.items, itemIndex, {
                                  title: event.currentTarget.value
                                })}
                            />
                          </label>
                          <label class="docs-resource-item-field">
                            <span>URL</span>
                            <input
                              value={item.url}
                              placeholder="Add URL"
                              spellcheck={false}
                              oninput={(event) =>
                                patchResourceItem(block.id, block.items, itemIndex, {
                                  url: event.currentTarget.value
                                })}
                            />
                          </label>
                          <label class="docs-resource-item-field">
                            <span>Kind</span>
                            <input
                              value={item.kind}
                              placeholder="Add kind"
                              oninput={(event) =>
                                patchResourceItem(block.id, block.items, itemIndex, {
                                  kind: event.currentTarget.value
                                })}
                            />
                          </label>
                          <label class="docs-resource-item-field docs-resource-item-field--notes">
                            <span>Notes</span>
                            <textarea
                              rows="1"
                              value={item.notes}
                              placeholder="Add notes"
                              use:autosizeTextarea={item.notes}
                              oninput={(event) =>
                                patchResourceItem(block.id, block.items, itemIndex, {
                                  notes: event.currentTarget.value
                                })}
                            ></textarea>
                          </label>
                        </div>
                      </EntryActions>
                    {/each}
                    <button
                      type="button"
                      class="docs-resource-add"
                      onclick={() => addResourceItem(block.id, block.items)}
                    >
                      <PlusIcon aria-hidden="true" />
                      <span>Add resource</span>
                    </button>
                  </div>
                </FormField>
              {/if}
            </div>
          {/if}
        </article>
      {/each}
      <AddSectionChooser
        open={pendingBlockTitle !== null}
        title={pendingBlockTitle ?? ""}
        options={blockTypeOptions}
        addLabel="Add section"
        optionLabel="Block Type"
        onOpen={showPendingBlock}
        onCancel={cancelPendingBlock}
        onTitleChange={(value) => (pendingBlockTitle = value)}
        onChoose={commitPendingBlock}
      />
    </section>
    <div class="docs-markdown-editor">
      <DocsBlockMarkdownEditor
        bind:value={draftNote.body}
        ariaLabel="Docs note markdown"
        minRows={14}
        compact={false}
        floatingToc="auto"
        placeholder="Write revision notes with Markdown..."
        sourcePath={draftNote.sourcePath}
        attachmentUpload={
          onUploadAttachment
            ? (file: File) => onUploadAttachment(draftNote.id, file)
            : undefined
        }
      />
    </div>
  </div>
</section>
