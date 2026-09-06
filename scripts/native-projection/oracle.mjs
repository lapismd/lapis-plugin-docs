import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { projectionCases } from "./cases.mjs";

const moduleFlag = process.argv.indexOf("--module");
if (moduleFlag < 0 || !process.argv[moduleFlag + 1])
  throw Error("Supply --module with the frozen unchanged-TypeScript bundle.");
const retained = await import(
  pathToFileURL(resolve(process.argv[moduleFlag + 1]))
);
const output = resolve("fixtures/native-projection/oracle.jsonl");
const records = [];

for (const input of projectionCases) {
  let result;
  try {
    const registration = retained.createDocsProjectionRegistration(
      input.root ?? "docs",
    );
    if (input.operation === "registration") {
      const { project: _callback, ...schema } =
        retained.createDocsProjectionRegistration(input.root);
      result = { ok: schema };
    } else if (input.operation === "match") {
      result = {
        ok: retained.matchesProjectionSource(
          {
            path: input.path,
            name: input.path.split("/").pop() ?? "",
            extension: input.extension,
          },
          undefined,
          registration.source,
        ),
      };
    } else {
      result = {
        ok: await registration.project({
          file: {
            path: input.path,
            name: input.path.split("/").pop() ?? "",
            extension: "doc.md",
          },
          content: input.content,
        }),
      };
    }
  } catch (error) {
    result = {
      error: {
        name: error.name,
        ...(error.code ? { code: error.code } : {}),
        message: error.message,
        string: String(error),
      },
    };
  }
  records.push({ ...input, result });
}

for (const note of retained.sampleDocsNotes()) {
  const input = {
    id: `sample-${note.id}`,
    operation: "project",
    path: note.sourcePath,
    content: retained.docsNoteToMarkdown(note),
  };
  const result = {
    ok: await retained.createDocsProjectionRegistration("docs").project({
      file: {
        path: input.path,
        name: input.path.split("/").pop(),
        extension: "doc.md",
      },
      content: input.content,
    }),
  };
  records.push({ ...input, result });
}

assert.equal(new Set(records.map(({ id }) => id)).size, records.length);
const actual =
  records.map((record) => JSON.stringify(record)).join("\n") + "\n";
if (process.argv.includes("--write")) await writeFile(output, actual);
else
  assert.equal(
    actual,
    await readFile(output, "utf8"),
    "Frozen Docs projection oracle changed",
  );
const failures = records.filter(({ result }) => result.error).length;
console.log(
  JSON.stringify({
    cases: records.length,
    accepted: records.length - failures,
    rejected: failures,
    mode: process.argv.includes("--write") ? "freeze" : "verify",
  }),
);
