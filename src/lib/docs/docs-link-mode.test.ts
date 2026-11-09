import { describe, expect, it } from "vitest";

import { docsContentLinkTarget } from "./docs-link-mode";

const notes = new Set(["sample-docs-schema-harness", "sample-docs-coding-drill"]);

describe("docs content links", () => {
  it("opens note targets used by card resource links", () => {
    expect(
      docsContentLinkTarget("cvstudio://docs/sample-docs-schema-harness", notes),
    ).toEqual({ noteId: "sample-docs-schema-harness", open: true });
    expect(
      docsContentLinkTarget("lapis://docs/sample-docs-coding-drill#prompt", notes),
    ).toEqual({ noteId: "sample-docs-coding-drill", open: true });
  });

  it("opens wiki targets and reference workspace links when the note is loaded", () => {
    expect(
      docsContentLinkTarget("sample-docs-schema-harness#Fixture map", notes),
    ).toEqual({ noteId: "sample-docs-schema-harness", open: true });
    expect(
      docsContentLinkTarget(
        "/?workspace=docs&note=sample-docs-coding-drill",
        notes,
      ),
    ).toEqual({ noteId: "sample-docs-coding-drill", open: true });
  });

  it("keeps ordinary links and unknown protocols from opening a note", () => {
    expect(docsContentLinkTarget("https://example.com/docs", notes)).toBeNull();
    expect(docsContentLinkTarget("#index-links", notes)).toBeNull();
    expect(docsContentLinkTarget("cvstudio://docs/missing-note", notes)).toEqual({
      noteId: "missing-note",
      open: false,
    });
    expect(
      docsContentLinkTarget("https://example.com/?workspace=docs&note=sample-docs-schema-harness", notes),
    ).toBeNull();
  });
});
