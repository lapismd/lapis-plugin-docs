import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { validateCiResults } from "./aggregate-ci.mjs";

const workflow = parse(
  readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"),
);
const pages = parse(
  readFileSync(
    new URL("../.github/workflows/publish-storybook-pages.yml", import.meta.url),
    "utf8",
  ),
);

describe("Docs CI gates", () => {
  it("shares the immutable lapis-ci image used by Tasks and Notebook", () => {
    const pin = JSON.parse(
      readFileSync(new URL("../.ci/images.json", import.meta.url), "utf8"),
    ).base;
    expect(pin.image).toBe("ghcr.io/lapismd/lapis-ci");
    expect(pin.digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(pin.digest).toBe(
      "sha256:91341a81cc9306eed818c4c433cd29ed11d2ea64c703f32685391befe0eca503",
    );
  });

  it("uses the standard public runner CPUs within bounded containers", () => {
    for (const job of Object.values(workflow.jobs)) {
      if (!job.container) continue;
      expect(job["runs-on"]).toBe("ubuntu-latest");
      expect(job.container.options).toContain("--cpus=4");
      expect(job.container.options).toContain("--memory=7g");
      expect(job.container.options).toContain("--shm-size=2g");
      expect(job.container.options).toContain("--cap-drop=ALL");
      expect(job.container.options).toContain("--init");
    }
  });

  it("selects the exact CI revision before quality lanes", () => {
    const steps = workflow.jobs.quality.steps.map((step) => step.run ?? "");
    expect(steps.join("\n")).toContain('jj --ignore-immutable edit "$GITHUB_SHA"');
    expect(steps).toContain("pnpm validation:check");
    expect(steps).toContain("pnpm spec:check");
    expect(steps).toContain("pnpm check");
  });

  it("runs the same blocking lanes as Tasks and Notebook", () => {
    expect(workflow.jobs.unit.steps.at(-1).run).toBe("pnpm test");
    expect(workflow.jobs.package.steps.map((step) => step.run)).toEqual(
      expect.arrayContaining(["pnpm build", "pnpm exec publint"]),
    );
    expect(workflow.jobs["storybook-static"].steps.at(-1).run).toBe(
      "pnpm build-storybook",
    );
    expect(workflow.jobs["build-cache"].steps.at(-1).run).toBe("pnpm build");
    const browser = workflow.jobs["storybook-interaction"];
    expect(browser.strategy["fail-fast"]).toBe(false);
    expect(browser.strategy.matrix.shard).toEqual([1, 2, 3]);
    expect(browser.steps.map((step) => step.run)).toEqual(
      expect.arrayContaining([
        "pnpm validation:smoke",
        "pnpm test:storybook -- --shard=${{ matrix.shard }}/3",
      ]),
    );
  });

  it("aggregates every lane, even when prerequisites fail or cancel", () => {
    expect(workflow.jobs.validate.if).toBe("always()");
    expect([...workflow.jobs.validate.needs].sort()).toEqual(
      Object.keys(workflow.jobs)
        .filter((name) => name !== "validate")
        .sort(),
    );
    expect(workflow.jobs.validate.steps.at(-1).env.CI_JOB_RESULTS).toBe(
      "${{ toJSON(needs) }}",
    );
    expect(() =>
      validateCiResults({
        quality: { result: "success" },
        unit: { result: "success" },
      }),
    ).not.toThrow();
    for (const result of ["failure", "cancelled", "skipped", undefined]) {
      expect(() =>
        validateCiResults({ quality: { result: "success" }, unit: { result } }),
      ).toThrow("unit");
    }
    expect(() => validateCiResults({})).toThrow();
  });

  it("publishes the static Storybook from main the way Notebook does", () => {
    expect(pages.on.push.branches).toEqual(["main"]);
    expect(pages.jobs.build.steps.at(-3).run).toContain(
      "storybook build --config-dir .storybook --output-dir storybook-static",
    );
    expect(pages.jobs.deploy.environment.name).toBe("github-pages");
  });
});
