import type { DocsCard } from '../model';

export type DocsCardQuestionPart =
	| { kind: 'text'; text: string }
	| { kind: 'cloze'; text: string; hint: string | null };

const CLOZE_PATTERN = /\{\{c\d+::([\s\S]*?)(?:::(.*?))?\}\}/g;

export function docsCardQuestionParts(
	card: Pick<DocsCard, 'id' | 'prompt' | 'type'>
): DocsCardQuestionPart[] {
	const prompt = card.prompt || card.id;
	if (card.type !== 'cloze') return [{ kind: 'text', text: prompt }];

	const parts: DocsCardQuestionPart[] = [];
	let lastIndex = 0;
	for (const match of prompt.matchAll(CLOZE_PATTERN)) {
		const index = match.index ?? 0;
		if (index > lastIndex) parts.push({ kind: 'text', text: prompt.slice(lastIndex, index) });
		parts.push({ kind: 'cloze', text: match[1] ?? '', hint: match[2]?.trim() || null });
		lastIndex = index + match[0].length;
	}
	if (lastIndex < prompt.length) parts.push({ kind: 'text', text: prompt.slice(lastIndex) });
	return parts.length > 0 ? parts : [{ kind: 'text', text: prompt }];
}
