const WRITEFILE_PATTERN = /^%%writefile\s+(.+?)\s*$/i;

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
	py: 'python',
	js: 'javascript',
	jsx: 'jsx',
	ts: 'typescript',
	tsx: 'tsx',
	java: 'java',
	go: 'go',
	rs: 'rust',
	rb: 'ruby',
	c: 'c',
	h: 'c',
	cpp: 'cpp',
	cc: 'cpp',
	cxx: 'cpp',
	cs: 'csharp',
	kt: 'kotlin',
	swift: 'swift',
	sql: 'sql',
	sh: 'bash',
	bash: 'bash',
	zsh: 'zsh',
	ps1: 'powershell',
	html: 'html',
	css: 'css',
	scss: 'scss',
	json: 'json',
	yml: 'yaml',
	yaml: 'yaml',
	md: 'markdown'
};

function fenceLanguageForFilename(filename: string) {
	const extension = filename.split('.').pop()?.toLowerCase() ?? '';
	return LANGUAGE_BY_EXTENSION[extension] ?? '';
}

function inlineCode(value: string) {
	return value.replace(/`/g, '');
}

export function docsCardAnswerMarkdown(answer: string) {
	const lines = answer.replace(/\r\n?/g, '\n').split('\n');
	const output: string[] = [];
	let writefileBlockOpen = false;
	let changed = false;

	for (const line of lines) {
		const match = line.trim().match(WRITEFILE_PATTERN);
		if (!match) {
			output.push(line);
			continue;
		}

		changed = true;
		if (writefileBlockOpen) {
			output.push('```', '');
		}

		const filename = match[1]?.trim() ?? 'output.txt';
		const language = fenceLanguageForFilename(filename);
		output.push(`\`${inlineCode(filename)}\``, '', `\`\`\`${language}`);
		writefileBlockOpen = true;
	}

	if (writefileBlockOpen) output.push('```');
	return changed ? output.join('\n') : answer;
}
