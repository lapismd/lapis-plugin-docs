import codingDrill from "../../fixtures/sample-docs/sample-docs-coding-drill.md?raw";
import freeform from "../../fixtures/sample-docs/sample-docs-freeform.md?raw";
import indexNote from "../../fixtures/sample-docs/index.md?raw";
import schemaHarness from "../../fixtures/sample-docs/sample-docs-schema-harness.md?raw";
import storyBank from "../../fixtures/sample-docs/sample-docs-story-bank.md?raw";
import systemDesign from "../../fixtures/sample-docs/sample-docs-system-design.md?raw";

/** CV comparison: http://localhost:5173/?workspace=docs&note=sample-docs-index&preview=1 */
export const SAMPLE_DOCS_COMPARISON_URL =
  "http://localhost:5173/?workspace=docs&note=sample-docs-index&preview=1";

export const SAMPLE_DOCS_INDEX_PATH = "docs/sample-docs/index.doc.md";

const fixtureFiles = {
  "index.md": indexNote,
  "sample-docs-coding-drill.md": codingDrill,
  "sample-docs-freeform.md": freeform,
  "sample-docs-schema-harness.md": schemaHarness,
  "sample-docs-story-bank.md": storyBank,
  "sample-docs-system-design.md": systemDesign,
} as const;

export function sampleDocsFixtureVault(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fixtureFiles).map(([name, markdown]) => [
      `docs/sample-docs/${name.replace(/\.md$/, ".doc.md")}`,
      markdown,
    ]),
  );
}
