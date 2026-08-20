<script lang="ts">
	import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
	import Code2Icon from '@lucide/svelte/icons/code-2';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import LightbulbIcon from '@lucide/svelte/icons/lightbulb';
	import ListChecksIcon from '@lucide/svelte/icons/list-checks';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import NotebookPenIcon from '@lucide/svelte/icons/notebook-pen';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import Table2Icon from '@lucide/svelte/icons/table-2';
	import TrophyIcon from '@lucide/svelte/icons/trophy';
	import StructuredTable from './candidates/StructuredTable.svelte';
	import type { DocsCalloutTone, DocsRevisionBlock } from '../model';
	import DocsMarkdownPreview from './DocsMarkdownPreview.svelte';
	import { BLOCK_TYPE_LABELS } from './docs-workspace-helpers';

	let {
		block,
		index,
		sectionId,
		headingIdPrefix = 'docs-heading',
		extraClass = '',
		dataDisplaySlideIndex = undefined,
		sourcePath = ''
	}: {
		block: DocsRevisionBlock;
		index: number;
		sectionId?: string;
		headingIdPrefix?: string;
		extraClass?: string;
		dataDisplaySlideIndex?: number;
		sourcePath?: string;
	} = $props();

	const resolvedSectionId = $derived(sectionId ?? block.id);
	const resolvedHeadingId = $derived(`${headingIdPrefix}-${block.id}`);
	const markdownHeadingIdPrefix = $derived(`docs-md-${block.id}`);
	const sectionClass = $derived(
		[blockClass(block), extraClass].filter(Boolean).join(' ')
	);
	const renderedCodeMarkdown = $derived(
		block.type === 'code' ? codeBlockMarkdown(block.language, block.code) : ''
	);
	const showHeader = $derived(!(block.type === 'markdown' && !block.title?.trim()));

	function blockTitle(value: DocsRevisionBlock) {
		return value.title?.trim() || BLOCK_TYPE_LABELS[value.type] || value.type;
	}

	function blockClass(value: DocsRevisionBlock) {
		return `docs-rich-block docs-rich-block--${value.type}`;
	}

	function calloutLabel(tone: DocsCalloutTone) {
		if (tone === 'critical') return 'Critical';
		return tone[0].toUpperCase() + tone.slice(1);
	}

	function codeBlockMarkdown(language: string, code: string) {
		const info = language.trim().split(/\s+/)[0]?.replace(/[^\w#+.-]/g, '') ?? '';
		const fence = code.includes('```') ? '````' : '```';
		return `${fence}${info ? info : ''}\n${code}\n${fence}`;
	}
</script>

<section
	class={sectionClass}
	id={resolvedSectionId}
	data-display-slide-index={dataDisplaySlideIndex}
>
	{#if showHeader}
		<div class="docs-rich-block__header">
			<div class="docs-rich-block__icon">
				{#if block.type === 'concept'}
					<LightbulbIcon aria-hidden="true" />
				{:else if block.type === 'procedure'}
					<ListChecksIcon aria-hidden="true" />
				{:else if block.type === 'prompt'}
					<MessageSquareIcon aria-hidden="true" />
				{:else if block.type === 'code'}
					<Code2Icon aria-hidden="true" />
				{:else if block.type === 'table'}
					<Table2Icon aria-hidden="true" />
				{:else if block.type === 'callout'}
					<AlertTriangleIcon aria-hidden="true" />
				{:else if block.type === 'story'}
					<TrophyIcon aria-hidden="true" />
				{:else if block.type === 'resources'}
					<BookOpenIcon aria-hidden="true" />
				{:else if block.type === 'markdown'}
					<NotebookPenIcon aria-hidden="true" />
				{:else}
					<FileTextIcon aria-hidden="true" />
				{/if}
			</div>
			<div>
				<p>{String(index + 1).padStart(2, '0')} / {BLOCK_TYPE_LABELS[block.type]}</p>
				<h2
					id={resolvedHeadingId}
					data-cv-heading="true"
					data-cv-heading-level="2"
					data-cv-heading-title={blockTitle(block)}
				>
					{blockTitle(block)}
				</h2>
			</div>
		</div>
	{/if}

	{#if block.type === 'concept'}
		<div class="docs-rich-flow">
			{#if block.summary}
				<p class="docs-rich-lede">{block.summary}</p>
			{/if}
			{#if block.keyPoints.length}
				<ul class="docs-rich-point-list">
					{#each block.keyPoints as point (point)}
						<li><CheckCircle2Icon aria-hidden="true" /> {point}</li>
					{/each}
				</ul>
			{/if}
			{#if block.details}
				<DocsMarkdownPreview
					{sourcePath}
					value={block.details}
					compact
					headingIdPrefix={`${markdownHeadingIdPrefix}-details`}
				/>
			{/if}
		</div>
	{:else if block.type === 'procedure'}
		<div class="docs-rich-steps">
			{#each block.steps as step, stepIndex (step)}
				<div class="docs-rich-step">
					<span>{stepIndex + 1}</span>
					<p>{step}</p>
				</div>
			{/each}
		</div>
		{#if block.notes}
			<div class="docs-rich-note">
				<SparklesIcon aria-hidden="true" />
				<DocsMarkdownPreview
					{sourcePath}
					value={block.notes}
					compact
					headingIdPrefix={`${markdownHeadingIdPrefix}-notes`}
				/>
			</div>
		{/if}
	{:else if block.type === 'prompt'}
		<div class="docs-rich-flow">
			{#if block.problem}
				<DocsMarkdownPreview
					{sourcePath}
					value={block.problem}
					compact
					headingIdPrefix={`${markdownHeadingIdPrefix}-problem`}
				/>
			{/if}
			<div class="docs-rich-grid">
				{#if block.requirements.length}
					<div>
						<h3>Requirements</h3>
						<ul>{#each block.requirements as item (item)}<li>{item}</li>{/each}</ul>
					</div>
				{/if}
				{#if block.traps.length}
					<div>
						<h3>Traps</h3>
						<ul>{#each block.traps as item (item)}<li>{item}</li>{/each}</ul>
					</div>
				{/if}
				{#if block.tests.length}
					<div>
						<h3>Good Tests</h3>
						<ul>{#each block.tests as item (item)}<li>{item}</li>{/each}</ul>
					</div>
				{/if}
			</div>
			{#if block.approach}
				<div class="docs-rich-panel">
					<h3>Approach</h3>
					<DocsMarkdownPreview
						{sourcePath}
						value={block.approach}
						compact
						headingIdPrefix={`${markdownHeadingIdPrefix}-approach`}
					/>
				</div>
			{/if}
			{#if block.answer}
				<div class="docs-rich-panel docs-rich-panel--answer">
					<h3>Answer</h3>
					<DocsMarkdownPreview
						{sourcePath}
						value={block.answer}
						compact
						headingIdPrefix={`${markdownHeadingIdPrefix}-answer`}
					/>
				</div>
			{/if}
		</div>
	{:else if block.type === 'code'}
		{#if block.caption}
			<p class="docs-rich-lede">{block.caption}</p>
		{/if}
		{#if block.code}
			<DocsMarkdownPreview
				{sourcePath}
				value={renderedCodeMarkdown}
				compact
				floatingToc="off"
				headingIdPrefix={`${markdownHeadingIdPrefix}-code`}
			/>
		{/if}
	{:else if block.type === 'table'}
		<StructuredTable columns={block.columns} rows={block.rows} />
	{:else if block.type === 'callout'}
		<div class={`docs-rich-callout docs-rich-callout--${block.tone}`}>
			<strong>{calloutLabel(block.tone)}</strong>
			<DocsMarkdownPreview
				{sourcePath}
				value={block.body}
				compact
				headingIdPrefix={`${markdownHeadingIdPrefix}-body`}
			/>
		</div>
	{:else if block.type === 'story'}
		<div class="docs-rich-story-grid">
			{#each ['situation', 'task', 'action', 'result'] as field (field)}
				{@const value = block[field as keyof typeof block] as string}
				{#if value}
					<div>
						<h3>{field[0].toUpperCase() + field.slice(1)}</h3>
						<p>{value}</p>
					</div>
				{/if}
			{/each}
		</div>
		{#if block.useFor.length || block.metrics.length}
			<div class="docs-rich-meta-grid">
				{#if block.useFor.length}
					<div><h3>Use For</h3><p>{block.useFor.join(', ')}</p></div>
				{/if}
				{#if block.metrics.length}
					<div><h3>Metrics</h3><ul>{#each block.metrics as metric (metric)}<li>{metric}</li>{/each}</ul></div>
				{/if}
			</div>
		{/if}
	{:else if block.type === 'resources'}
		<div class="docs-rich-resource-grid">
			{#each block.items as item, itemIndex (itemIndex)}
				<div class="docs-rich-resource">
					<GraduationCapIcon aria-hidden="true" />
					<div>
						{#if item.url}
							<a href={item.url}>{item.title || item.url}</a>
						{:else}
							<strong>{item.title}</strong>
						{/if}
						{#if item.kind || item.notes}
							<p>{[item.kind, item.notes].filter(Boolean).join(' - ')}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else if block.type === 'markdown'}
		{#if block.body}
			<DocsMarkdownPreview
				{sourcePath}
				value={block.body}
				compact
				headingIdPrefix={`${markdownHeadingIdPrefix}-body`}
			/>
		{/if}
	{:else}
		{#if block.body}
			<DocsMarkdownPreview
				{sourcePath}
				value={block.body}
				compact
				headingIdPrefix={`${markdownHeadingIdPrefix}-body`}
			/>
		{/if}
	{/if}
</section>
