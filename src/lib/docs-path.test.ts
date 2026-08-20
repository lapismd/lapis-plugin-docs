import { describe, expect, it } from "vitest";
import {
  DOCS_DOCUMENT_VIEW_TYPE,
  DOCS_EXTENSIONS,
  DOCS_FILENAME_PATTERNS,
  isDocsDocumentPath,
} from "./docs-path";

describe("docs-path", () => {
  it("recognizes exclusive *.doc.md paths", () => {
    expect(isDocsDocumentPath("docs/sample/index.doc.md")).toBe(true);
    expect(isDocsDocumentPath("docs/sample/note.md")).toBe(false);
    expect(DOCS_EXTENSIONS).toEqual(["doc.md"]);
    expect(DOCS_FILENAME_PATTERNS).toEqual(["*.doc.md"]);
    expect(DOCS_DOCUMENT_VIEW_TYPE).toBe("docs-document");
  });
});
