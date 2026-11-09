import type { App } from "@lapis-notes/api";
import type { DocsRepository } from "../docs-repository";
import type { AnkiImportResult } from "./docs-anki-import";

function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

export async function importAnkiPackageFile(input: {
  app: App;
  repository: DocsRepository;
  docsRoot: string;
  file: File;
  now?: Date;
}): Promise<AnkiImportResult> {
  const { importAnkiPackage } = await import("./docs-anki-import");
  const existing = await input.repository.listNotes(input.docsRoot);
  return importAnkiPackage({
    bytes: new Uint8Array(await input.file.arrayBuffer()),
    filename: input.file.name,
    docsRoot: input.docsRoot,
    now: input.now,
    existingIds: existing.map((note) => note.id),
    writeNote: (note) => input.repository.writeNote(note),
    writeMedia: async (note, file) => {
      const path = `${input.docsRoot}/anki/${note.id}/media/${file.filename}`;
      const folder = path.slice(0, path.lastIndexOf("/"));
      if (folder) await input.app.vault.mkpath(folder);
      const data = arrayBuffer(file.bytes);
      const current = input.app.vault.getFileByPath(path);
      if (current) {
        await input.app.vault.modifyBinary(current, data);
        return;
      }
      await input.app.vault.createBinary(path, data);
    },
  });
}
