import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { describe, it, expect } from "vitest";
import { parse, stringify } from "yaml";
import {
  docsCoreFacts,
  docsGraphBindings,
  verifyDocsCanonicalIntake,
} from "./check-canonical-intake.mjs";
const fixture = JSON.parse(
  gunzipSync(
    readFileSync(new URL("../fixtures/core-intake.json.gz", import.meta.url)),
  ),
);
const policyBytes = readFileSync(
  new URL(
    "../../.github/dependency-automation/canonical-intake.json",
    import.meta.url,
  ),
  "utf8",
);
const chapters = JSON.parse(policyBytes).chapters;
const document = (facts, path) =>
  "# Docs source contract\n\n<!-- dependency-intake:core-development:start -->\n\n```json\n" +
  JSON.stringify(facts, null, 2) +
  "\n```\n\n<!-- dependency-intake:core-development:end -->\n\n" +
  (path === "spec/src/spec-governance.md"
    ? `Authored Core${facts.version} text.\n`
    : "Authored text.\n");
function supplementary(files) {
  const bindings = docsGraphBindings(files),
    stable = {
      sourceSha: "b9d3dace06f6eab9e72ac265c2b926f9cad9a2cc",
      authority: "explicit-user",
      expiresAt: "2026-11-19T00:00:00.000Z",
    },
    audit =
      JSON.stringify(
        {
          ...stable,
          manifestSha256: bindings.manifestSha256,
          lockSha256: bindings.lockSha256,
          workspaceSha256: bindings.workspaceSha256,
        },
        null,
        2,
      ) + "\n";
  return {
    ".github/development-audit-high-proposal.json": audit,
    ".github/development-audit.json":
      JSON.stringify(
        {
          ...stable,
          manifestSha256: bindings.manifestSha256,
          lockSha256: bindings.lockSha256,
        },
        null,
        2,
      ) + "\n",
    "scripts/fixtures/development-high-blocked-decision.json":
      JSON.stringify(
        {
          sourceSha: stable.sourceSha,
          manifestSha256: bindings.manifestSha256,
          lockSha256: bindings.lockSha256,
        },
        null,
        2,
      ) + "\n",
    "scripts/host-cohort.test.mjs": `Core cohort ${bindings.version}\n`,
    "spec/records/2026-11-18-development-high-proposal.md":
      `Source ${stable.sourceSha}\nManifest ${bindings.manifestSha256}\nLock ${bindings.lockSha256}\nWorkspace ${bindings.workspaceSha256}\n`,
  };
}
function input() {
  const before = structuredClone(fixture.before),
    files = structuredClone(fixture.after),
    baseSupplementaryDocuments = supplementary(before),
    supplementaryDocuments = supplementary(files);
  return {
    before,
    files,
    policyBytes,
    basePolicyBytes: policyBytes,
    changedFiles: [
      ...Object.keys(files),
      ...chapters,
      ...Object.keys(supplementaryDocuments),
    ],
    baseDocuments: Object.fromEntries(
      chapters.map((p) => [
        p,
        document(docsCoreFacts(before, policyBytes), p),
      ]),
    ),
    documents: Object.fromEntries(
      chapters.map((p) => [p, document(docsCoreFacts(files, policyBytes), p)]),
    ),
    baseSupplementaryDocuments,
    supplementaryDocuments,
  };
}
describe("source-owned Core intake verification", () => {
  it("preserves unrelated same-version peer-context dependency edges", () => {
    const data = input();
    const lock = parse(data.files["pnpm-lock.yaml"]);
    const dependencies =
      lock.snapshots["@oxc-parser/binding-wasm32-wasi@0.127.0"].dependencies;
    expect(dependencies["@napi-rs/wasm-runtime"]).toContain(
      "(@emnapi/core@1.9.2)",
    );
    dependencies["@napi-rs/wasm-runtime"] = dependencies[
      "@napi-rs/wasm-runtime"
    ].replace("(@emnapi/core@1.9.2)", "(@emnapi/core@1.11.0)");
    data.files["pnpm-lock.yaml"] = stringify(lock);
    expect(() => verifyDocsCanonicalIntake(data)).toThrow(
      /unexpected public contract or registry catalog change/,
    );
  });
  it("holds ambiguous opaque peer contexts instead of losing their association", () => {
    const data = input();
    for (const files of [data.before, data.files]) {
      const lock = parse(files["pnpm-lock.yaml"]);
      const key = Object.keys(lock.snapshots).find((name) =>
        /^@lapis-notes\/api@[^()]+\([a-f0-9]{32}\)$/.test(name),
      );
      expect(key).toBeTruthy();
      const duplicate = key.replace(/\([a-f0-9]{32}\)$/, `(${"a".repeat(32)})`);
      lock.snapshots[duplicate] = structuredClone(lock.snapshots[key]);
      files["pnpm-lock.yaml"] = stringify(lock);
    }
    expect(() => verifyDocsCanonicalIntake(data)).toThrow(
      /ambiguous opaque peer contexts/,
    );
  });
  it("verifies the actual pnpm Core0.13.4 to0.13.5 candidate independently of shared rendering", () => {
    expect(verifyDocsCanonicalIntake(input()).version).toBe("0.13.5");
  });
  for (const [name, mutate, message] of [
    [
      "audit authority",
      (d) =>
        (d.supplementaryDocuments[
          ".github/development-audit-high-proposal.json"
        ] = d.supplementaryDocuments[
          ".github/development-audit-high-proposal.json"
        ].replace("explicit-user", "dependency-bot")),
      /supplementary evidence is not an exact graph rebinding/,
    ],
    [
      "audit source identity",
      (d) =>
        (d.supplementaryDocuments[".github/development-audit.json"] =
          d.supplementaryDocuments[".github/development-audit.json"].replace(
            "b9d3dace06f6eab9e72ac265c2b926f9cad9a2cc",
            "b".repeat(40),
          )),
      /supplementary evidence is not an exact graph rebinding/,
    ],
    [
      "audit expiry",
      (d) =>
        (d.supplementaryDocuments[
          ".github/development-audit-high-proposal.json"
        ] = d.supplementaryDocuments[
          ".github/development-audit-high-proposal.json"
        ].replace("2026-11-19", "2026-11-20")),
      /supplementary evidence is not an exact graph rebinding/,
    ],
    [
      "proposal prose",
      (d) =>
        (d.supplementaryDocuments[
          "spec/records/2026-11-18-development-high-proposal.md"
        ] += "Renewed.\n"),
      /supplementary evidence is not an exact graph rebinding/,
    ],
    [
      "mapped governance prose",
      (d) => (d.documents["spec/src/spec-governance.md"] += "Renewed.\n"),
      /manual source chapter edits or stale baseline/,
    ],
  ])
    it(`rejects a supplementary ${name} change`, () => {
      const d = input();
      mutate(d);
      expect(() => verifyDocsCanonicalIntake(d)).toThrow(message);
    });
  for (const [name, mutate] of [
    [
      "stale facts",
      (d) => (d.documents[chapters[0]] = d.baseDocuments[chapters[0]]),
    ],
    ["missing facts", (d) => (d.documents[chapters[0]] = "no slot")],
    [
      "ambiguous markers",
      (d) => (d.documents[chapters[0]] += d.documents[chapters[0]]),
    ],
    [
      "manual chapter edits",
      (d) => (d.documents[chapters[0]] += "Manual repair"),
    ],
    ["changed source policy", (d) => (d.basePolicyBytes += " ")],
    [
      "unsupported policy",
      (d) =>
        (d.policyBytes = d.policyBytes.replace(
          "core-development",
          "unreviewed",
        )),
    ],
    [
      "unexpected source scope",
      (d) => d.changedFiles.push("src/lib/product.ts"),
    ],
    [
      "wrong registry package integrity",
      (d) =>
        (d.files["pnpm-lock.yaml"] = d.files["pnpm-lock.yaml"].replace(
          JSON.parse(d.policyBytes).dependency === "@lapismd/design-core"
            ? docsCoreFacts(d.files, d.policyBytes).integrity
            : "unreachable",
          "sha512-" + Buffer.alloc(64, 3).toString("base64"),
        )),
    ],
    [
      "unrelated lock settings",
      (d) => (d.files["pnpm-lock.yaml"] += "\nunknownSetting: changed\n"),
    ],
  ])
    it(`holds ${name} without edits`, () => {
      const d = input();
      mutate(d);
      const saved = structuredClone(d);
      expect(() => verifyDocsCanonicalIntake(d)).toThrow();
      expect(d).toEqual(saved);
    });
  it("rejects a same-version integrity rewrite even with matching forged slots", () => {
    const d = input();
    d.files = structuredClone(d.before);
    d.files["pnpm-lock.yaml"] = d.files["pnpm-lock.yaml"].replace(
      docsCoreFacts(d.before, d.policyBytes).integrity,
      "sha512-" + Buffer.alloc(64, 3).toString("base64"),
    );
    const facts = docsCoreFacts(d.files, policyBytes);
    d.documents = Object.fromEntries(
      chapters.map((p) => [p, document(facts, p)]),
    );
    expect(() => verifyDocsCanonicalIntake(d)).toThrow(
      /immutable Core version integrity changed/,
    );
  });
  it("preserves unrelated prefix-sharing Core package identities", () => {
    const d = input(),
      before = parse(d.before["pnpm-lock.yaml"]),
      after = parse(d.files["pnpm-lock.yaml"]);
    const metadata = {
      resolution: {
        integrity: "sha512-" + Buffer.alloc(64, 2).toString("base64"),
      },
    };
    before.packages["@lapismd/design-core@0.13.30"] = metadata;
    after.packages["@lapismd/design-core@0.13.40"] = metadata;
    d.before["pnpm-lock.yaml"] = stringify(before);
    d.files["pnpm-lock.yaml"] = stringify(after);
    expect(() => verifyDocsCanonicalIntake(d)).toThrow(
      /unexpected public contract or registry catalog change/,
    );
  });
  it("stays outside specification exemptions and has no network/bootstrap", () => {
    const lane = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    );
    expect(lane.scripts.check).toContain("pnpm check:dependency-intake");
    expect(lane.scripts["check:dependency-intake"]).toBe(
      "node scripts/dependency-automation/check-canonical-intake.mjs",
    );
    const source = readFileSync(
      new URL("./check-canonical-intake.mjs", import.meta.url),
      "utf8",
    );
    expect(source).not.toMatch(
      /skipSpecification|fetch\(|https:\/\/|pnpm.*install/,
    );
  });
});
