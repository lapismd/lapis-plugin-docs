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
    "lapismd/lapis-ci/actions/guard-version-runtime@dd71275c5b2618afceae0b97ee0a071649781971",
  );
  assert.deepEqual(guard.with, {
    "qualification-file": ".github/versioning-runtime.json",
    "detect-release-intent": "true",
  });
  assert.equal(guard.id, "intent");
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
    "scripts/release-install-readiness.mjs",
    "scripts/release.mjs",
  ]);
  for (const [file, expected] of Object.entries(qualification.files))
    assert.equal(hash(read(file)), expected, file);
});

test("the workspace binding admits only the reviewed Core development coordinate", () => {
  const q = JSON.parse(read(".github/versioning-runtime.json"));
  assert.equal(q.nodeMajor, 24);
  assert.equal(q.formatterPolicy, "unconfigured");
  assert.deepEqual(q.workspacePolicy.developmentOverride, {
    dependency: "@lapismd/design-core",
    series: "0.13",
    minimumPatch: 4,
  });
  const source = read("pnpm-workspace.yaml").toString();
  const selected = JSON.parse(read("package.json")).devDependencies[
    "@lapismd/design-core"
  ];
  const needle = '  "@lapismd/design-core": "' + selected + '"';
  assert.equal(source.split(needle).length, 2);
  assert.equal(
    q.workspacePolicy.sha256,
    hash(
      source.replace(
        needle,
        '  "@lapismd/design-core": "<development-override>"',
      ),
    ),
  );
  const workflow = YAML.parse(read(".github/workflows/ci.yml").toString());
  const guard = workflow.jobs.quality.steps.find((s) =>
    s.uses?.startsWith("lapismd/lapis-ci/actions/guard-version-runtime@"),
  );
  assert.equal(
    guard.uses,
    "lapismd/lapis-ci/actions/guard-version-runtime@dd71275c5b2618afceae0b97ee0a071649781971",
  );
  assert.equal(guard.if, undefined);
  assert.equal(guard["continue-on-error"], undefined);
});
