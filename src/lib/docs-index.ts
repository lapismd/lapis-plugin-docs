import type {
  IndexFieldDefinition,
  IndexProjectionRegistration,
} from "@lapis-notes/api/app-database";
import { parseDocsNoteMarkdownFile } from "./model";
import { normalizeDocsRoot } from "./docs-settings";

export const DOCS_NOTE_PROJECTION_ID = "note";
export const DOCS_NOTE_PROJECTION_VERSION = 1;

export const DOCS_NOTE_PROJECTION_FIELDS: Record<string, IndexFieldDefinition> = {
  id: { type: "string", indexed: true },
  title: { type: "string", indexed: true },
  docType: { type: "string", indexed: true },
  path: { type: "path", indexed: true },
  tags: { type: "string", indexed: true, cardinality: "many" },
  cardCount: { type: "number", indexed: false },
  bookId: { type: "string", indexed: true },
};

export function createDocsProjectionRegistration(
  docsRoot: string,
): IndexProjectionRegistration {
  const root = normalizeDocsRoot(docsRoot);
  return {
    id: DOCS_NOTE_PROJECTION_ID,
    version: DOCS_NOTE_PROJECTION_VERSION,
    visibility: "public",
    fields: DOCS_NOTE_PROJECTION_FIELDS,
    source: {
      extensions: ["doc.md"],
      pathPrefix: root,
    },
    project({ file, content }) {
      const note = parseDocsNoteMarkdownFile({ path: file.path, content });
      if (!note) return { rows: [], edges: [] };
      return {
        rows: [
          {
            id: note.id,
            kind: "note",
            data: {
              id: note.id,
              title: note.title,
              docType: note.docType,
              path: note.sourcePath,
              tags: note.tags,
              cardCount: note.cards.length,
              bookId: note.bookId ?? "",
            },
          },
        ],
        edges: [],
      };
    },
  };
}
