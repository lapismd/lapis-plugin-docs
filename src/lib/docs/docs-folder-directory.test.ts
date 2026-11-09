import { describe, expect, it } from "vitest";

import { docsPanelAfterPreviewToggle } from "./docs-folder-directory";

describe("docs preview toggle", () => {
  it("keeps the cards section while switching between the editor and preview", () => {
    expect(docsPanelAfterPreviewToggle("cards", false)).toBe("cards");
    expect(docsPanelAfterPreviewToggle("cards", true)).toBe("cards");
  });

  it("moves the note section between reading and editing", () => {
    expect(docsPanelAfterPreviewToggle("display", false)).toBe("note");
    expect(docsPanelAfterPreviewToggle("note", true)).toBe("display");
  });
});
