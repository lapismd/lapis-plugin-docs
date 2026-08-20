import { describe, expect, it } from "vitest";

import {
  decodeDocsMediaSentinel,
  encodeDocsMediaSentinel,
  resolveDocsMediaRelativePath,
  rewriteDocsRelativeMediaSrc,
  serverDocsMediaUrl,
} from "./docs-relative-media";

const chapterNote =
  "data/docs/grokking-modern-system-design/07-load-balancer/index.md";
const indexNote = "data/docs/grokking-modern-system-design/index.md";

describe("resolveDocsMediaRelativePath", () => {
  it("resolves ../media paths from nested category notes", () => {
    const note =
      "data/docs/system-design-101/real-world-case-studies/airbnb-artchitectural-evolution.md";
    expect(
      resolveDocsMediaRelativePath(
        "../media/diagrams/0427-zero-to-1-5-billion-guests-airbnb-s-architectural-evolution.png",
        note,
      ),
    ).toBe(
      "system-design-101/media/diagrams/0427-zero-to-1-5-billion-guests-airbnb-s-architectural-evolution.png",
    );
  });

  it("resolves ./media paths against the note directory", () => {
    expect(
      resolveDocsMediaRelativePath("./media/lbsimplified.jpg", chapterNote),
    ).toBe(
      "grokking-modern-system-design/07-load-balancer/media/lbsimplified.jpg",
    );
  });

  it("resolves media paths without a leading ./", () => {
    expect(resolveDocsMediaRelativePath("media/a.jpg", chapterNote)).toBe(
      "grokking-modern-system-design/07-load-balancer/media/a.jpg",
    );
  });

  it("resolves nested gallery paths", () => {
    expect(
      resolveDocsMediaRelativePath(
        "./media/advanced-details-of-load-balancers/stateful.jpg",
        chapterNote,
      ),
    ).toBe(
      "grokking-modern-system-design/07-load-balancer/media/advanced-details-of-load-balancers/stateful.jpg",
    );
  });

  it("resolves course media from the book index", () => {
    expect(
      resolveDocsMediaRelativePath("./media/course/system-design-course.jpg", indexNote),
    ).toBe("grokking-modern-system-design/media/course/system-design-course.jpg");
  });

  it("returns null for http(s), data, absolute, and escaping paths", () => {
    expect(
      resolveDocsMediaRelativePath("https://example.com/a.jpg", chapterNote),
    ).toBeNull();
    expect(
      resolveDocsMediaRelativePath("data:image/png;base64,abc", chapterNote),
    ).toBeNull();
    expect(resolveDocsMediaRelativePath("/images/a.jpg", chapterNote)).toBeNull();
    expect(
      resolveDocsMediaRelativePath("../../../outside.jpg", chapterNote),
    ).toBeNull();
    expect(
      resolveDocsMediaRelativePath("./media/a.jpg", "notes/foo.md"),
    ).toBeNull();
  });

  it("resolves relative paths that stay under data/docs", () => {
    expect(resolveDocsMediaRelativePath("../shared.jpg", chapterNote)).toBe(
      "grokking-modern-system-design/shared.jpg",
    );
  });
});

describe("docs media sentinels", () => {
  it("round-trips encoded relative paths", () => {
    const relative =
      "system-design-101/media/diagrams/0427-zero-to-1-5-billion-guests-airbnb-s-architectural-evolution.png";
    const sentinel = encodeDocsMediaSentinel(relative);
    expect(sentinel.startsWith("/__cvstudio-docs-media__/")).toBe(true);
    expect(decodeDocsMediaSentinel(sentinel)).toBe(relative);
  });
});

describe("rewriteDocsRelativeMediaSrc", () => {
  it("rewrites to the server API URL by default", () => {
    expect(
      rewriteDocsRelativeMediaSrc("./media/lbsimplified.jpg", chapterNote),
    ).toBe(
      "/api/docs/media/grokking-modern-system-design/07-load-balancer/media/lbsimplified.jpg",
    );
  });

  it("rewrites with a custom resolver", () => {
    expect(
      rewriteDocsRelativeMediaSrc(
        "./media/lbsimplified.jpg",
        chapterNote,
        encodeDocsMediaSentinel,
      ),
    ).toBe(
      encodeDocsMediaSentinel(
        "grokking-modern-system-design/07-load-balancer/media/lbsimplified.jpg",
      ),
    );
  });

  it("leaves http(s) and data URLs unchanged", () => {
    expect(
      rewriteDocsRelativeMediaSrc("https://example.com/a.jpg", chapterNote),
    ).toBe("https://example.com/a.jpg");
    expect(
      rewriteDocsRelativeMediaSrc("data:image/png;base64,abc", chapterNote),
    ).toBe("data:image/png;base64,abc");
  });

  it("leaves root-absolute paths unchanged", () => {
    expect(
      rewriteDocsRelativeMediaSrc(
        "/api/docs/media/grokking-modern-system-design/media/a.jpg",
        chapterNote,
      ),
    ).toBe("/api/docs/media/grokking-modern-system-design/media/a.jpg");
    expect(rewriteDocsRelativeMediaSrc("/images/a.jpg", chapterNote)).toBe(
      "/images/a.jpg",
    );
  });

  it("does not rewrite paths that escape data/docs", () => {
    expect(
      rewriteDocsRelativeMediaSrc("../../../outside.jpg", chapterNote),
    ).toBe("../../../outside.jpg");
  });

  it("returns the original src when sourcePath is not under data/docs", () => {
    expect(rewriteDocsRelativeMediaSrc("./media/a.jpg", "notes/foo.md")).toBe(
      "./media/a.jpg",
    );
  });

  it("uses serverDocsMediaUrl helper", () => {
    expect(serverDocsMediaUrl("book/media/a.jpg")).toBe(
      "/api/docs/media/book/media/a.jpg",
    );
  });
});
