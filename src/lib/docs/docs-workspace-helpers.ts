import type {
	DocsCalloutTone,
	DocsDocType,
	DocsNote,
	DocsResourceItem,
	DocsRevisionBlock
} from '../model';

export type DisplayMode = 'document' | 'slides';

export const DOC_TYPE_OPTIONS: DocsDocType[] = [
	'revision',
	'coding-drill',
	'system-design',
	'story-bank',
	'index',
	'freeform'
];

export const DOC_TYPE_LABELS: Record<string, string> = {
	revision: 'Revision',
	'coding-drill': 'Coding drill',
	'system-design': 'System design',
	'story-bank': 'Story bank',
	index: 'Index',
	freeform: 'Freeform'
};

export const BLOCK_TYPE_OPTIONS: DocsRevisionBlock['type'][] = [
	'text',
	'markdown',
	'concept',
	'procedure',
	'prompt',
	'code',
	'table',
	'callout',
	'story',
	'resources'
];

export const BLOCK_TYPE_LABELS: Record<string, string> = {
	text: 'Text',
	markdown: 'Markdown',
	concept: 'Concept',
	procedure: 'Procedure',
	prompt: 'Prompt',
	code: 'Code',
	table: 'Table',
	callout: 'Callout',
	story: 'Story',
	resources: 'Resources'
};

export const CALLOUT_TONE_OPTIONS: DocsCalloutTone[] = ['note', 'tip', 'warning', 'critical'];

export const CALLOUT_TONE_LABELS: Record<string, string> = {
	note: 'Note',
	tip: 'Tip',
	warning: 'Warning',
	critical: 'Critical'
};

export const DISPLAY_MODE_LABELS: Record<string, string> = {
	document: 'Document',
	slides: 'Slides'
};

export function cloneDocsNote(note: DocsNote): DocsNote {
	return JSON.parse(JSON.stringify(note)) as DocsNote;
}

export function createEmptyDocsBlock(
	type: DocsRevisionBlock['type'],
	id: string,
	title = ''
): DocsRevisionBlock {
	const base = title.trim() ? { id, type, title: title.trim() } : { id, type };
	switch (type) {
		case 'concept':
			return { ...base, type, summary: '', keyPoints: [], details: '' };
		case 'procedure':
			return { ...base, type, steps: [], notes: '' };
		case 'prompt':
			return {
				...base,
				type,
				problem: '',
				requirements: [],
				approach: '',
				traps: [],
				tests: [],
				answer: ''
			};
		case 'code':
			return { ...base, type, language: 'ts', code: '', caption: '' };
		case 'table':
			return { ...base, type, columns: [], rows: [] };
		case 'callout':
			return { ...base, type, tone: 'note', body: '' };
		case 'story':
			return {
				...base,
				type,
				useFor: [],
				situation: '',
				task: '',
				action: '',
				result: '',
				metrics: []
			};
		case 'resources':
			return { ...base, type, items: [] };
		case 'markdown':
			return { ...base, type: 'markdown', body: '' };
		case 'text':
		default:
			return { ...base, type: 'text', body: '' };
	}
}

export function docsBlockDisplayTitle(block: DocsRevisionBlock) {
	return block.title?.trim() || BLOCK_TYPE_LABELS[block.type];
}

export function docsBlockPlainText(block: DocsRevisionBlock) {
	switch (block.type) {
		case 'concept':
			return [block.summary, block.details].filter(Boolean).join('\n\n');
		case 'procedure':
			return [block.steps.join('\n'), block.notes].filter(Boolean).join('\n\n');
		case 'prompt':
			return [block.problem, block.approach, block.answer].filter(Boolean).join('\n\n');
		case 'code':
			return block.code;
		case 'table':
			return tableRowsToText(block.rows);
		case 'callout':
			return block.body;
		case 'story':
			return [block.situation, block.task, block.action, block.result].filter(Boolean).join('\n\n');
		case 'resources':
			return resourceItemsToText(block.items);
		case 'markdown':
		case 'text':
		default:
			return block.body;
	}
}

export function createDocsBlockFromType(
	type: DocsRevisionBlock['type'],
	id: string,
	previous?: DocsRevisionBlock
) {
	const block = createEmptyDocsBlock(type, previous?.id ?? id, previous?.title ?? '');
	const body = previous ? docsBlockPlainText(previous) : '';
	if (!body) return block;
	switch (block.type) {
		case 'concept':
			return { ...block, summary: body };
		case 'procedure':
			return { ...block, notes: body };
		case 'prompt':
			return { ...block, problem: body };
		case 'code':
			return { ...block, code: body };
		case 'callout':
			return { ...block, body };
		case 'story':
			return { ...block, situation: body };
		case 'resources':
			return { ...block, items: textToResourceItems(body) };
		case 'table':
			return { ...block, rows: textToTableRows(body) };
		case 'markdown':
		case 'text':
		default:
			return { ...block, body };
	}
}

export function textToLines(value: string) {
	return value
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}

export function linesToText(items: string[]) {
	return items.join('\n');
}

export function tableRowsToText(rows: string[][]) {
	return rows.map((row) => row.join(' | ')).join('\n');
}

export function textToTableRows(value: string) {
	return value
		.split('\n')
		.map((line) => line.split('|').map((cell) => cell.trim()))
		.filter((row) => row.some(Boolean));
}

export function resourceItemsToText(items: DocsResourceItem[]) {
	return items
		.map((item) => {
			const heading = item.title || item.url;
			const details = [item.url && item.title ? item.url : '', item.kind, item.notes].filter(Boolean);
			return [heading, ...details].filter(Boolean).join('\n');
		})
		.filter(Boolean)
		.join('\n\n');
}

export function textToResourceItems(value: string) {
	const lines = textToLines(value);
	if (!lines.length) return [];
	const [title = '', ...notes] = lines;
	return [
		{
			title,
			url: '',
			kind: '',
			notes: notes.join('\n')
		}
	].filter((item) => item.title || item.notes);
}
