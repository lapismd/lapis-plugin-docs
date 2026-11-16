import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "vitest";
import YAML from "yaml";

const read = (file) => readFileSync(new URL("../" + file, import.meta.url));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

test("the qualified shared runtime guard precedes version writer authority inside the existing main boundary", () => {
  const workflow = YAML.parse(read(".github/workflows/ci.yml").toString());
  const job = workflow.jobs.changesets;
  const steps = job.steps;
  const guard = steps.find((step) =>
    step.uses?.startsWith("lapismd/lapis-ci/actions/guard-version-runtime@"),
  );
  assert(
    guard,
    "writer authority must follow the reviewed source runtime guard",
  );
  assert.equal(
    guard.uses,
    "lapismd/lapis-ci/actions/guard-version-runtime@7242eb3bf246c266ba4a48c50eaaf01c2950a37d",
  );
  assert.deepEqual(guard.with, {
    "qualification-file": ".github/versioning-runtime.json",
  });
  assert.equal(guard.if, undefined);
  assert.equal(guard["continue-on-error"], undefined);
  assert(
    steps.indexOf(guard) >
      steps.findIndex((step) =>
        step.run?.includes(
          "pnpm install --frozen-lockfile --strict-peer-dependencies --ignore-pnpmfile",
        ),
      ),
  );
  assert(steps.indexOf(guard) < steps.findIndex((step) => step.id === "app"));
  assert(
    steps.indexOf(guard) < steps.findIndex((step) => step.id === "changesets"),
  );
  assert.equal(job.needs, "validate");
  assert(job.if.includes("github.ref == 'refs/heads/main'"));
  assert(job.if.includes("needs.validate.result == 'success'"));
  assert.equal(job.permissions.contents, "read");
  assert.equal(
    steps.find((step) => step.uses?.startsWith("actions/checkout@")).with[
      "persist-credentials"
    ],
    false,
  );
  const version = steps.find((step) => step.id === "changesets");
  assert.equal(version.with.version, "pnpm release:version");
  assert.equal(version.with.commitMode, "github-api");
  assert.equal(version.with.createGithubReleases, false);
  assert.equal(version.env.GITHUB_TOKEN, "${{ steps.app.outputs.token }}");
});

test("source-owned guard data binds the actual unchanged CLI3 custom recipe and its complete local inputs", () => {
  const qualification = JSON.parse(read(".github/versioning-runtime.json"));
  const pkg = JSON.parse(read("package.json"));
  assert.equal(qualification.schemaVersion, 1);
  assert.equal(qualification.cliVersion, "3.0.3");
  assert.equal(qualification.packageManager, pkg.packageManager);
  assert.deepEqual(qualification.scripts, {
    "release:version": "node scripts/release.mjs version",
  });
  assert.equal(
    pkg.scripts["release:version"],
    qualification.scripts["release:version"],
  );
  assert.equal(pkg.scripts["prerelease:version"], undefined);
  assert.equal(pkg.scripts["postrelease:version"], undefined);
  assert.equal(
    qualification.configSha256,
    hash(read(".changeset/config.json")),
  );
  assert.deepEqual(Object.keys(qualification.files).sort(), [
    "pnpm-workspace.yaml",
    "scripts/release-install-readiness.mjs",
    "scripts/release.mjs",
  ]);
  for (const [file, expected] of Object.entries(qualification.files))
    assert.equal(hash(read(file)), expected, file);
});
