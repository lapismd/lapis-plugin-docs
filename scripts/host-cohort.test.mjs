import assert from "node:assert/strict";
import { readFileSync, readdirSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "vitest";
import YAML from "yaml";
const read = (file) =>
  readFileSync(new URL("../" + file, import.meta.url), "utf8");
const pkg = JSON.parse(read("package.json"));
const semver = createRequire(
  realpathSync(
    new URL("../node_modules/@changesets/cli/package.json", import.meta.url),
  ),
)("semver");
const workflow = YAML.parse(read(".github/workflows/ci.yml"));

test("the public host cohort admits the supported registry graph and excludes incompatible legacy peers", () => {
  for (const [name, supported, legacy] of [
    ["@lapis-notes/api", "0.6.6", "0.2.8"],
    ["@lapismd/design-core", "0.13.4", "0.12.1"],
    ["@lapismd/mira", "0.2.0", "0.1.4"],
    ["@lapismd/mira-editor", "0.0.5", "0.0.4"],
  ]) {
    assert(
      semver.satisfies(supported, pkg.peerDependencies[name]),
      `${name}: supported public floor`,
    );
    assert(
      !semver.satisfies(legacy, pkg.peerDependencies[name]),
      `${name}: unsupported legacy floor`,
    );
    assert(
      semver.satisfies(supported, pkg.devDependencies[name]),
      `${name}: development acceptance uses the public cohort`,
    );
  }
  assert(semver.satisfies("24.19.0", pkg.engines.node));
  assert(
    !semver.satisfies("22.11.0", pkg.engines.node),
    "published Mermaid12 requires Node22.12+",
  );
  assert.equal(pkg.peerDependencies.svelte, "5.56.10");
  assert.equal(pkg.pnpm?.overrides?.["@lapismd/design-core"], undefined);
  assert.equal(pkg.pnpm?.peerDependencyRules?.allowedVersions, undefined);
});

test("all source CI dependency installations enforce the strict frozen peer contract", () => {
  const setup = YAML.parse(read(".github/actions/ci-setup/action.yml"));
  const commands = [
    ...setup.runs.steps,
    ...readdirSync(new URL("../.github/workflows/", import.meta.url))
      .filter((file) => /\.ya?ml$/.test(file))
      .flatMap((file) =>
        Object.values(YAML.parse(read(`.github/workflows/${file}`)).jobs),
      )
      .flatMap((job) => job.steps ?? []),
  ]
    .map((step) => step.run ?? "")
    .filter((run) => /pnpm install\b/.test(run));
  assert(commands.length >= 3);
  for (const command of commands) {
    assert(command.includes("--frozen-lockfile"), command);
    assert(command.includes("--strict-peer-dependencies"), command);
    assert(command.includes("--ignore-pnpmfile"), command);
  }
});

test("the pinned full audit runs in the committed Git context and retains raw evidence", () => {
  const steps = workflow.jobs.quality.steps;
  const audit = steps.find((step) =>
    step.uses?.startsWith("lapismd/lapis-ci/actions/check-development-audit@"),
  );
  assert(
    audit,
    "unfixed development findings require the reviewed exact-policy checker",
  );
  assert.equal(
    audit.uses,
    "lapismd/lapis-ci/actions/check-development-audit@2c756d802f95777a33980b8b1e74f6986498d86e",
  );
  assert.deepEqual(audit.with, {
    "policy-file": ".github/development-audit.json",
  });
  assert.equal(audit.if, undefined);
  assert.equal(audit["continue-on-error"], undefined);
  assert(
    steps.indexOf(audit) >
      steps.findIndex((step) => step.uses === "./.github/actions/ci-setup"),
  );
  assert(
    steps.indexOf(audit) <
      steps.findIndex((step) => step.run?.includes("jj git init")),
    "Git HEAD must still be the checked-out source when computing its dependency commit",
  );
  const upload = steps.find(
    (step) => step.with?.path === ".local/dependency-audit/",
  );
  assert.equal(
    upload?.uses,
    "actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9",
  );
  assert.equal(upload.if, "always()");
  assert.equal(upload.with["include-hidden-files"], true);
  assert(workflow.jobs.validate.needs.includes("quality"));
});

test("every catalog path consumes the repaired published Mermaid renderer", () => {
  const lock = YAML.parse(read("pnpm-lock.yaml"));
  let renderers = 0;
  for (const name of Object.keys(lock.packages)) {
    if (name.startsWith("@lapismd/mira-plugin-mermaid@"))
      assert(semver.satisfies(name.split("@").at(-1), ">=0.0.5 <0.1.0"), name);
    if (name.startsWith("mermaid@")) {
      renderers++;
      assert(
        semver.satisfies(name.slice("mermaid@".length), ">=12.3.0 <13"),
        name,
      );
    }
    assert(
      !name.startsWith("@mermaid-js/layout-elk@"),
      "the obsolete Mermaid11 peer must not survive in another catalog path",
    );
  }
  assert(renderers > 0);
});
