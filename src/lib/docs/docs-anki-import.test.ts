import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createClient } from "@libsql/client";
import { strToU8, zipSync } from "fflate";
import { afterEach, describe, expect, it } from "vitest";

import { docsNoteToMarkdown, type DocsNote } from "../model";
import { importAnkiPackage } from "./docs-anki-import";

const written = new Map<string, DocsNote>();
const media = new Map<string, Uint8Array>();

async function createAnkiCollection(
  collectionName: "collection.anki21" | "collection.anki2" = "collection.anki21",
) {
  const root = await mkdtemp(join(tmpdir(), "docs-anki-fixture-"));
  const dbPath = join(root, collectionName);
  const client = createClient({ url: `file:${dbPath}` });
  try {
    await client.execute("create table col(models text, decks text)");
    await client.execute(
      "create table notes(id integer, guid text, mid integer, tags text, flds text)",
    );
    await client.execute(
      "create table cards(id integer, nid integer, did integer, ord integer, queue integer)",
    );
    const models = {
      100: {
        id: 100,
        name: "Basic",
        type: 0,
        flds: [
          { name: "Front", ord: 0 },
          { name: "Back", ord: 1 },
        ],
        tmpls: [{ name: "Card 1", ord: 0, qfmt: "{{Front}}", afmt: "{{Back}}" }],
      },
      200: {
        id: 200,
        name: "Cloze",
        type: 1,
        flds: [
          { name: "Text", ord: 0 },
          { name: "Extra", ord: 1 },
        ],
        tmpls: [{ name: "Cloze", ord: 0, qfmt: "{{cloze:Text}}", afmt: "{{Extra}}" }],
      },
    };
    const decks = {
      1: { id: 1, name: "Interview::Systems" },
      2: { id: 2, name: "Interview::Behavioral" },
    };
    await client.execute({
      sql: "insert into col(models, decks) values (?, ?)",
      args: [JSON.stringify(models), JSON.stringify(decks)],
    });
    await client.execute({
      sql: "insert into notes(id, guid, mid, tags, flds) values (?, ?, ?, ?, ?)",
      args: [
        10,
        "abc123",
        100,
        " backend systems ",
        ["What does an SLO measure?", 'Service reliability against a target. <img src="slo.png">'].join(
          "\x1f",
        ),
      ],
    });
    await client.execute({
      sql: "insert into notes(id, guid, mid, tags, flds) values (?, ?, ?, ?, ?)",
      args: [
        20,
        "cloze-guid",
        200,
        " memory ",
        [
          "The {{c1::error budget::budget}} is consumed by failed requests.",
          "Explain burn rate.",
        ].join("\x1f"),
      ],
    });
    await client.execute({
      sql: "insert into notes(id, guid, mid, tags, flds) values (?, ?, ?, ?, ?)",
      args: [
        30,
        "behave-guid",
        100,
        " leadership ",
        ["Tell me about a conflict.", "Use STAR."].join("\x1f"),
      ],
    });
    await client.execute({
      sql: "insert into cards(id, nid, did, ord, queue) values (?, ?, ?, ?, ?)",
      args: [1000, 10, 1, 0, 0],
    });
    await client.execute({
      sql: "insert into cards(id, nid, did, ord, queue) values (?, ?, ?, ?, ?)",
      args: [1001, 20, 1, 0, -1],
    });
    await client.execute({
      sql: "insert into cards(id, nid, did, ord, queue) values (?, ?, ?, ?, ?)",
      args: [1002, 30, 2, 0, 2],
    });
  } finally {
    client.close();
  }
  const collectionBytes = await readFile(dbPath);
  await rm(root, { recursive: true, force: true });
  return collectionBytes;
}

async function createApkg(
  collectionName: "collection.anki21" | "collection.anki2" = "collection.anki21",
) {
  const collectionBytes = await createAnkiCollection(collectionName);
  return zipSync({
    [collectionName]: new Uint8Array(collectionBytes),
    media: strToU8(JSON.stringify({ 0: "slo.png", 1: "audio.mp3", 2: "../unsafe.png" })),
    0: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
    1: new Uint8Array([1, 2, 3]),
    2: new Uint8Array([4, 5, 6]),
  });
}

afterEach(() => {
  written.clear();
  media.clear();
});

describe("importAnkiPackage", () => {
  it("dry-runs Anki decks into docs note summaries without writing files", async () => {
    const result = await importAnkiPackage({
      bytes: await createApkg(),
      filename: "interview.apkg",
      tags: ["interview"],
      dryRun: true,
      writeNote: async (note) => {
        written.set(note.id, note);
      },
    });

    expect(result.summary).toEqual({ deckCount: 2, cardCount: 3, mediaCount: 1 });
    expect(result.importedNotes.map((note) => [note.id, note.cardCount])).toEqual([
      ["interview-systems", 2],
      ["interview-behavioral", 1],
    ]);
    expect(result.warnings).toEqual([
      "Skipped unsupported media file: audio.mp3",
      "Skipped unsafe media filename: ../unsafe.png",
    ]);
    expect(written.size).toBe(0);
  });

  it("imports cards, cloze prompts, suspended status, tags, and supported image media", async () => {
    const result = await importAnkiPackage({
      bytes: await createApkg("collection.anki2"),
      filename: "interview.apkg",
      tags: ["imported"],
      writeNote: async (note) => {
        written.set(note.id, note);
      },
      writeMedia: async (note, file) => {
        media.set(`${note.id}/${file.filename}`, file.bytes);
      },
    });

    expect(result.workspace?.notes.map((note) => note.id)).toEqual([
      "interview-behavioral",
      "interview-systems",
    ]);
    const systems = result.workspace?.notes.find((note) => note.id === "interview-systems");
    expect(systems?.sourcePath).toBe("docs/anki/interview-systems.doc.md");
    expect(systems?.cards).toEqual([
      expect.objectContaining({
        id: "card-abc123-1",
        type: "basic",
        status: "active",
        tags: ["anki", "anki/interview-systems", "imported", "backend", "systems"],
      }),
      expect.objectContaining({
        id: "card-cloze-guid-1",
        type: "cloze",
        status: "suspended",
        prompt: "The {{c1::error budget::budget}} is consumed by failed requests.",
      }),
    ]);
    expect(systems?.cards[0]?.answer).toContain("![Image](interview-systems/media/slo.png)");
    expect(media.get("interview-systems/slo.png")).toEqual(
      new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
    );
    const markdown = docsNoteToMarkdown(written.get("interview-systems")!);
    expect(markdown).toContain("Cards imported: 2");
    expect(markdown).toContain("card-cloze-guid-1");
  });

  it("rejects unsupported collection.anki21b packages", async () => {
    const bytes = zipSync({ "collection.anki21b": new Uint8Array([1, 2, 3]) });
    await expect(
      importAnkiPackage({ bytes, filename: "collection.colpkg" }),
    ).rejects.toThrow(".colpkg and collection.anki21b packages are not supported.");
  });
});
