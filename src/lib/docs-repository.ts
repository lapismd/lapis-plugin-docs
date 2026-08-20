import type { App } from "@lapis-notes/api";
import { isDocsDocumentPath } from "./docs-path";
import {
  docsNoteToMarkdown,
  parseDocsNoteMarkdownFile,
  type DocsNote,
} from "./model";

export type DocsFileStore = {
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  listMarkdown(root: string): Promise<string[]>;
};

function parentFolder(path: string): string | null {
  const index = path.lastIndexOf("/");
  return index > 0 ? path.slice(0, index) : null;
}

export function createVaultDocsFileStore(app: App): DocsFileStore {
  return {
    async read(path) {
      const file = app.vault.getFileByPath(path);
      if (!file) throw new Error(`Missing docs file: ${path}`);
      return app.vault.cachedRead(file);
    },
    async write(path, content) {
      const file = app.vault.getFileByPath(path);
      if (file) {
        await app.vault.modify(file, content);
        return;
      }
      const folder = parentFolder(path);
      if (folder) await app.vault.mkpath(folder);
      await app.vault.create(path, content);
    },
    async listMarkdown(root) {
      const prefix = root.replace(/^\/+|\/+$/g, "");
      return app.vault
        .getFiles()
        .map((file) => file.path)
        .filter((path) => {
          if (!isDocsDocumentPath(path)) return false;
          return (
            path === `${prefix}.doc.md` ||
            path.startsWith(`${prefix}/`) ||
            !prefix
          );
        })
        .sort();
    },
  };
}

export class DocsRepository {
  constructor(private readonly store: DocsFileStore) {}

  async listNotes(docsRoot: string): Promise<DocsNote[]> {
    const paths = await this.store.listMarkdown(docsRoot);
    const notes: DocsNote[] = [];
    for (const path of paths) {
      try {
        const content = await this.store.read(path);
        const parsed = parseDocsNoteMarkdownFile({ path, content });
        if (parsed) notes.push(parsed);
      } catch {
        // Skip unreadable or non-docs markdown.
      }
    }
    return notes;
  }

  async readNote(path: string): Promise<DocsNote | null> {
    try {
      const content = await this.store.read(path);
      return parseDocsNoteMarkdownFile({ path, content });
    } catch {
      return null;
    }
  }

  async writeNote(note: DocsNote): Promise<void> {
    await this.store.write(note.sourcePath, docsNoteToMarkdown(note));
  }
}
