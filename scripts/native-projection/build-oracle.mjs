import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";

const argument = (name) => {
  const index = process.argv.indexOf(name);
  if (index < 0 || !process.argv[index + 1]) throw Error(`Missing ${name}`);
  return resolve(process.argv[index + 1]);
};
const host = argument("--host-source");
const output = argument("--output");
const receipt = JSON.parse(
  await readFile("fixtures/native-projection/sources.json", "utf8"),
);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const [path, expected] of Object.entries(receipt.sourceFiles))
  assert.equal(
    hash(await readFile(path)),
    expected,
    `Retained source changed: ${path}`,
  );
assert.equal(
  hash(await readFile(host)),
  receipt.retainedHost.sha256,
  "Retained host matcher changed",
);

await build({
  stdin: {
    contents: [
      'export { createDocsProjectionRegistration } from "./src/lib/docs-index.ts";',
      'export { docsNoteToMarkdown } from "./src/lib/model/markdown.ts";',
      'export { sampleDocsNotes } from "./src/lib/model/sample.ts";',
      `export { matchesProjectionSource } from ${JSON.stringify(host)};`,
    ].join("\n"),
    resolveDir: process.cwd(),
    loader: "ts",
  },
  outfile: output,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
});
console.log(
  `Verified ${Object.keys(receipt.sourceFiles).length} retained Docs sources and host matcher`,
);
