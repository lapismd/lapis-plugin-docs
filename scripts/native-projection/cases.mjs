const cases = [];
const add = (id, frontmatter, path = "docs/Example note.doc.md") =>
  cases.push({
    id,
    operation: "project",
    path,
    content: `---\n${frontmatter}\n---\nBody.\n`,
  });
const value = JSON.stringify;

for (const [id, root] of [
  ["default", null],
  ["boolean", false],
  ["number", 42],
  ["object", {}],
  ["empty", ""],
  ["whitespace", " \t\r\n "],
  ["slashes", "////"],
  ["trim", " /Library/Docs/ "],
  ["interior", "a//b"],
  ["backslash", "a\\b"],
  ["dot", "../docs"],
  ["unicode-space", "\u00a0/docs/\ufeff"],
  ["nel-is-not-js-whitespace", "\u0085/docs/\u0085"],
])
  cases.push({ id: `registration-${id}`, operation: "registration", root });

for (const [id, path, extension, root] of [
  ["child", "docs/a.doc.md", "doc.md", "docs"],
  ["root", "docs", "doc.md", "docs"],
  ["prefix-sibling", "docs-other/a.doc.md", "doc.md", "docs"],
  ["other-root", "other/a.doc.md", "doc.md", "docs"],
  ["extension-case", "docs/a.DOC.MD", ".DOC.MD", "docs"],
  ["extension-md", "docs/a.doc.md", "md", "docs"],
  ["extension-supplied", "docs/a.txt", "doc.md", "docs"],
  ["double-dot", "docs/a.doc.md", "..doc.md", "docs"],
  ["path-case", "Docs/a.doc.md", "doc.md", "docs"],
  ["backslashes", "docs\\a.doc.md", "doc.md", "docs"],
  ["nested-root", "Library/Docs/a.doc.md", "doc.md", " /Library/Docs/ "],
  ["literal-dot", "../docs/a.doc.md", "doc.md", "../docs"],
])
  cases.push({ id: `match-${id}`, operation: "match", path, extension, root });

for (const [id, content] of [
  ["plain", "# Title\nNo frontmatter."],
  ["empty", ""],
  ["leading-blank", "\n---\nid: ignored\n---\n"],
  ["leading-bom", "\ufeff---\nid: ignored\n---\n"],
  ["crlf", "---\r\nid: crlf\r\ntitle: CRLF\r\n---\r\nbody"],
  ["closing-no-newline", "---\nid: closing\n---"],
  ["unterminated", "---\nid: ignored\n"],
  ["closing-spaces", "---\nid: ignored\n--- \n"],
  ["empty-yaml", "---\n\n---\n"],
  ["scalar-yaml", "---\nhello\n---\n"],
  ["array-yaml", "---\n[one, two]\n---\n"],
  ["null-yaml", "---\nnull\n---\n"],
  ["malformed-yaml", "---\ntitle: [broken\n---\n"],
  ["duplicate-yaml", "---\nid: first\nid: second\n---\n"],
  ["yaml-alias", "---\ntitle: &title Shared title\ntags: [*title]\n---\n"],
  ["unknown-tag", "---\ntitle: !custom retained\n---\n"],
  [
    "yaml-one-two-scalars",
    "---\ntags: [yes, no, on, off, 2026-01-01, 0x10, 0o10, 01, .nan, .inf, -.inf, 1e+21]\n---\n",
  ],
  ["yaml-number-title", "---\ntitle: .inf\n---\n"],
  ["yaml-duplicate-tag", "---\ntags: &tags [one, two]\naliases: *tags\n---\n"],
  ["yaml-multi-document", "---\nid: first\n...\nid: second\n---\n"],
  ["yaml-nel-quoted", '---\ntitle: "before\u0085after"\n---\n'],
  ["yaml-nel-plain", "---\ntitle: before\u0085after\n---\n"],
  ["yaml-nel-block", "---\ntitle: |-\n  before\u0085after\n---\n"],
  ["yaml-nel-json", '---\n{"title":"before\u0085after"}\n---\n'],
])
  cases.push({
    id: `frontmatter-${id}`,
    operation: "project",
    path: "docs/Example.doc.md",
    content,
  });

for (const [id, input] of [
  ["valid", "a-1"],
  ["trimmed", " abc "],
  ["uppercase", "Bad"],
  ["underscore", "bad_id"],
  ["initial-hyphen", "-bad"],
  ["slash", "a/b"],
  ["unicode", "café"],
  ["max", "x".repeat(80)],
  ["overlong", "x".repeat(81)],
  ["number", 42],
  ["zero", 0],
  ["boolean", true],
  ["empty", ""],
  ["null", null],
  ["array", ["id"]],
  ["object", { id: "nested" }],
])
  add(`id-${id}`, `id: ${value(input)}`);

for (const [id, path] of [
  ["markdown", "docs/LOUD.MARKDOWN"],
  ["unicode", "docs/你好.doc.md"],
  ["empty", ""],
  ["trailing-slash", "docs/"],
  ["backslash", "docs\\A.doc.md"],
  ["long", `docs/${"a".repeat(71)}--b.doc.md`],
  ["dotfile", "docs/.md"],
  ["punctuation", "docs/???"],
])
  add(`path-${id}`, "{}", path);

for (const [id, input] of [
  ["trimmed", " A title "],
  ["number", 123],
  ["boolean", false],
  ["array", ["title"]],
  ["empty", ""],
  ["unicode", "文書"],
])
  add(`title-${id}`, `title: ${value(input)}`);

for (const type of [
  "revision",
  "coding-drill",
  "system-design",
  "story-bank",
  "index",
  "freeform",
  "unknown",
  "Revision",
  null,
  42,
])
  add(`doc-type-${String(type)}`, `docType: ${value(type)}`);
add("doc-type-snake", "doc_type: freeform");
add("doc-type-camel-wins", "docType: unknown\ndoc_type: freeform");
add("doc-type-nullish", "docType: null\ndoc_type: freeform");

for (const [id, input] of [
  [
    "mixed",
    [" one ", "one", 2, 0, false, true, null, {}, ["nested"], "", "Two"],
  ],
  ["unicode", ["café", "文書", "#tag", "#tag"]],
  ["scalar", "one"],
  ["null", null],
])
  add(`tags-${id}`, `tags: ${value(input)}`);

for (const [id, fields] of [
  ["valid", "bookId: book-1"],
  ["invalid", "bookId: Invalid"],
  ["snake", "book_id: book-2"],
  ["camel-wins", "bookId: Invalid\nbook_id: book-2"],
  ["nullish", "bookId: null\nbook_id: book-2"],
  ["number", "bookId: 12"],
  [
    "valid-chapters",
    "book: {chapters: [{noteId: chapter-1}, {note_id: chapter-2}, {id: chapter-3}, null]}",
  ],
  ["invalid-chapter", 'book: {chapters: [{noteId: "Bad"}]}'],
  [
    "chapter-alias-precedence",
    'book: {chapters: [{noteId: "", note_id: "Bad"}]}',
  ],
])
  add(`book-${id}`, fields);

for (const [id, cards] of [
  ["mixed", [null, "raw", {}, { type: "cloze" }, { type: "coding" }]],
  ["nonarray", {}],
  ["invalid-id", [{ id: "Bad" }]],
  ["duplicate-ids", [{ id: "same" }, { id: "same" }]],
  ["generated-id", [{ prompt: "x".repeat(90) }]],
  [
    "fsrs-metadata",
    [
      {
        fsrs: { due: "invalid", stability: ".inf" },
        reviews: [{ rating: "good", due: "invalid" }],
      },
    ],
  ],
])
  add(`cards-${id}`, `cards: ${value(cards)}`);

const coding = (id, exercise) =>
  add(
    `coding-${id}`,
    `cards: ${value([{ id: "card", type: "coding", exercise }])}`,
  );
coding("empty", {});
coding("invalid-id", { id: "Bad" });
coding("invalid-class", { signature: { className: "bad-name" } });
coding("invalid-method", { signature: { methodName: "bad-name" } });
coding("invalid-parameter", {
  signature: { parameters: [{ name: "bad-name" }] },
});
coding("duplicate-parameter", {
  signature: { parameters: [{ name: "arg" }, { name: "arg" }] },
});
coding("invalid-case-id", { examples: [{ id: "Bad" }] });
coding("argument-count", { examples: [{ arguments: [1], expected: 1 }] });
coding("invalid-expected", { examples: [{ arguments: [], expected: "1" }] });
coding("duplicate-case", {
  examples: [
    { id: "same", expected: 1 },
    { id: "same", expected: 1 },
  ],
});
coding("unsupported-language", { languages: [{ language: "rust" }] });
coding("duplicate-language", {
  languages: [{ language: "java" }, { language: "java" }],
});
coding("invalid-hint-id", { hints: [{ id: "Bad" }] });
coding("duplicate-hint", { hints: [{ id: "same" }, { id: "same" }] });
coding("unsupported-solution", { solutions: [{ language: "rust" }] });
coding("unavailable-solution", {
  languages: [{ language: "java" }],
  solutions: [{ language: "python" }],
});
coding("duplicate-solution", {
  solutions: [{ language: "java" }, { language: "java" }],
});
for (const [type, valid, invalid] of [
  ["int", 1, 1.5],
  ["long", 9007199254740991, 9007199254740992],
  ["boolean", true, "true"],
  ["string", "x", 1],
  ["int[]", [1, 2], [1, "2"]],
  ["long[]", [], 1],
  ["boolean[]", [true], [1]],
  ["string[]", ["x"], [false]],
  ["int[][]", [[1], []], [1]],
  ["long[][]", [[1]], [[1.5]]],
  ["boolean[][]", [[true]], [["true"]]],
  ["string[][]", [["x"]], [[1]]],
]) {
  for (const [status, literal] of [
    ["valid", valid],
    ["invalid", invalid],
  ])
    coding(`${type}-${status}`, {
      signature: { returnType: type, parameters: [{ name: "x", type }] },
      examples: [{ arguments: [literal], expected: literal }],
    });
}

for (const [id, fields] of [
  ["valid", "blocks: [{id: block-1, type: concept}, {type: unknown}, null]"],
  ["invalid", 'blocks: [{id: "Bad"}]'],
  ["sections", 'sections: [{id: "Bad"}]'],
  ["camel-wins", 'blocks: []\nsections: [{id: "Bad"}]'],
  ["nullish", 'blocks: null\nsections: [{id: "Bad"}]'],
  ["duplicates", "blocks: [{id: same}, {id: same}]"],
])
  add(`blocks-${id}`, fields);
add("error-order-note-first", 'id: "Bad"\ncards: [{id: "Bad"}]');
add(
  "error-order-card-first",
  'cards: [{id: "Bad"}]\nbook: {chapters: [{id: "Bad"}]}\nblocks: [{id: "Bad"}]',
);
add(
  "error-order-book-before-block",
  'book: {chapters: [{id: "Bad"}]}\nblocks: [{id: "Bad"}]',
);

export const projectionCases = Object.freeze(cases);
