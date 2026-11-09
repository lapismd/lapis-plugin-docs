import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  integrity,
  packageName,
  provenanceStatement,
  publicationDecision,
  repositoryId,
  repositoryOwnerId,
  validateCandidate,
  validateExistingRelease,
  validateIdentity,
  verifyPublishedArtifact,
} from "./release.mjs";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const manifest = JSON.parse(
  readFileSync(new URL("../manifest.json", import.meta.url), "utf8"),
);
const source = "a".repeat(40);
const bytes = Buffer.from("docs-release");
const candidate = {
  schema: 1,
  installation: "frozen-registry",
  name: packageName,
  version: "0.1.0",
  source,
  tarball: "lapis-notes-lapis-plugin-docs-0.1.0.tgz",
  integrity: integrity(bytes),
  size: bytes.length,
};

describe("Docs npm release", () => {
  it("accepts the public package and runtime manifest", () => {
    expect(() => validateIdentity(pkg, manifest)).not.toThrow();
    expect(pkg.publishConfig.access).toBe("public");
    expect(pkg.files).toContain("manifest.json");
  });

  it("rejects a non-registry dependency or a different runtime id", () => {
    expect(() =>
      validateIdentity(
        { ...pkg, dependencies: { local: "link:../docs" } },
        manifest,
      ),
    ).toThrow("Non-registry dependency");
    expect(() =>
      validateIdentity(pkg, { ...manifest, id: "tasks" }),
    ).toThrow("identity mismatch");
  });

  it("publishes only a new version and refuses to replace different bytes", () => {
    expect(publicationDecision(null, candidate)).toBe("publish");
    expect(
      publicationDecision(
        { dist: { integrity: candidate.integrity } },
        candidate,
      ),
    ).toBe("skip-same");
    expect(
      publicationDecision({ dist: { integrity: "sha512-other" } }, candidate),
    ).toBe("skip-different");
    expect(() =>
      validateExistingRelease(
        candidate,
        { dist: { integrity: "sha512-other" } },
        null,
      ),
    ).toThrow("immutable version");
  });

  it("binds provenance to the Docs main workflow and repository", () => {
    const env = {
      GITHUB_REPOSITORY: "lapismd/lapis-plugin-docs",
      GITHUB_REF: "refs/heads/main",
      GITHUB_SHA: source,
      GITHUB_WORKFLOW_REF:
        "lapismd/lapis-plugin-docs/.github/workflows/ci.yml@refs/heads/main",
      GITHUB_RUN_ID: "42",
      GITHUB_RUN_ATTEMPT: "1",
      GITHUB_REPOSITORY_ID: repositoryId,
      GITHUB_REPOSITORY_OWNER_ID: repositoryOwnerId,
      GITHUB_EVENT_NAME: "push",
    };
    const statement = provenanceStatement(candidate, env);
    expect(statement.predicate.buildDefinition.externalParameters.workflow).toEqual({
      repository: "https://github.com/lapismd/lapis-plugin-docs",
      ref: "refs/heads/main",
      path: ".github/workflows/ci.yml",
    });
    expect(() =>
      provenanceStatement(candidate, {
        ...env,
        GITHUB_REPOSITORY: "lapismd/lapis-plugin-tasks",
      }),
    ).toThrow("exact qualified main workflow");
    expect(() => validateCandidate(candidate, source, bytes)).not.toThrow();
    expect(() => validateCandidate(candidate, "b".repeat(40), bytes)).toThrow(
      "checksum mismatch",
    );
  });

  it("requires a provenance attestation on the published registry artifact", () => {
    const metadata = {
      dist: {
        integrity: integrity(bytes),
        attestations: { provenance: { predicateType: "https://slsa.dev/provenance/v1" } },
      },
    };
    expect(verifyPublishedArtifact(metadata, bytes).integrity).toBe(
      metadata.dist.integrity,
    );
    expect(() =>
      verifyPublishedArtifact({ dist: { integrity: integrity(bytes) } }, bytes),
    ).toThrow("no provenance");
  });
});
