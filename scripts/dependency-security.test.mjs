import assert from "node:assert/strict";
import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "vitest";
import YAML from "yaml";

const read = (file) =>
  readFileSync(new URL("../" + file, import.meta.url), "utf8");
const pkg = JSON.parse(read("package.json"));
const lock = YAML.parse(read("pnpm-lock.yaml"));
const semver = createRequire(
  realpathSync(
    new URL("../node_modules/@changesets/cli/package.json", import.meta.url),
  ),
)("semver");

test("supported Node24 Storybook/Vite/Vitest cohorts exclude the audited vulnerable releases", () => {
  const storybook = pkg.devDependencies.storybook;
  assert(semver.satisfies(storybook, ">=10.6.2 <11"));
  for (const name of [
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-themes",
    "@storybook/addon-vitest",
    "@storybook/svelte-vite",
  ])
    assert.equal(pkg.devDependencies[name], storybook, name);
  assert(semver.satisfies(pkg.devDependencies.vite, ">=6.4.4 <7"));
  for (const name of [
    "vitest",
    "@vitest/browser",
    "@vitest/browser-playwright",
  ])
    assert(semver.satisfies(pkg.devDependencies[name], ">=4.1.12 <5"), name);
});

test("locked transitive graph excludes every version in the fixable advisory ranges", () => {
  const ranges = {
    devalue: "<=5.9.2",
    katex: ">=0.11.0 <0.18.2",
    "source-map-js": ">=1.0.0 <1.2.2",
    glob: ">=9.0.0 <=14.0.1",
    minimatch: ">=7.0.0 <11.0.1",
  };
  for (const id of Object.keys(lock.packages))
    for (const [name, range] of Object.entries(ranges)) {
      if (!id.startsWith(name + "@")) continue;
      const version = id.slice(name.length + 1).split("(")[0];
      assert(
        !semver.satisfies(version, range),
        `${id} retains its audited vulnerable range`,
      );
    }
});

test("full and production audits are mandatory source CI gates without suppression", () => {
  const workflow = YAML.parse(read(".github/workflows/ci.yml"));
  for (const [job, command] of [["package", "pnpm audit --prod"]]) {
    const audit = workflow.jobs[job].steps.find((step) => step.run === command);
    assert(audit, `${job} must retain ${command}`);
    assert.equal(audit.if, undefined);
    assert.equal(audit["continue-on-error"], undefined);
    assert.equal(audit.env, undefined);
    assert(workflow.jobs.validate.needs.includes(job));
  }
  const full = workflow.jobs.quality.steps.find(
    (step) =>
      step.uses ===
      "lapismd/lapis-ci/actions/check-development-audit@2c756d802f95777a33980b8b1e74f6986498d86e",
  );
  assert(
    full,
    "the reviewed shared collector preserves unsuppressed full/production audit evidence",
  );
  assert.equal(full.if, undefined);
  assert.equal(full["continue-on-error"], undefined);
  assert(workflow.jobs.validate.needs.includes("quality"));
  const workspace = YAML.parse(read("pnpm-workspace.yaml"));
  assert.equal(workspace.auditConfig, undefined);
  assert.equal(pkg.pnpm?.auditConfig, undefined);
});
