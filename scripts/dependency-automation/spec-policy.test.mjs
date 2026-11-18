import { describe, it, expect } from "vitest";
import {
  botSpecificationExemption,
  skipSpecification,
  runFunctionalCheckLanes,
} from "./spec-policy.mjs";
describe("specification-only bot treatment", () => {
  const bot = {
    CI: "true",
    GITHUB_EVENT_NAME: "pull_request",
    LAPIS_CI_PR_AUTHOR: "lapismd-dependency-bot[bot]",
    LAPIS_CI_PR_AUTHOR_TYPE: "Bot",
    LAPIS_CI_PR_HEAD: "renovate/core",
  };
  it("requires CI, a PR, a bot type and trusted identity", () => {
    expect(botSpecificationExemption(bot)).toBe(true);
    for (const change of [
      { CI: "false" },
      { GITHUB_EVENT_NAME: "push" },
      { LAPIS_CI_PR_AUTHOR_TYPE: "User" },
      { LAPIS_CI_PR_AUTHOR: "outsider[bot]" },
    ])
      expect(botSpecificationExemption({ ...bot, ...change })).toBe(false);
    expect(
      botSpecificationExemption({
        ...bot,
        LAPIS_CI_PR_AUTHOR: "github-actions[bot]",
        LAPIS_CI_PR_HEAD: "changeset-release/main",
      }),
    ).toBe(true);
    expect(
      botSpecificationExemption({
        ...bot,
        LAPIS_CI_PR_AUTHOR: "github-actions[bot]",
      }),
    ).toBe(false);
  });
  it("cannot skip functional, dependency or audit lanes", () => {
    expect(skipSpecification("spec:first", bot)).toBe(true);
    for (const name of [
      "check",
      "test",
      "build",
      "check:dependency-intake",
      "audit",
    ])
      expect(skipSpecification(name, bot)).toBe(false);
  });
  it("retains aggregate functional lanes and their failure", async () => {
    const calls = [];
    const code = await runFunctionalCheckLanes({
      loadConfig: async () => ({
        check: {
          lanes: [
            { command: "node", args: ["guard.mjs"] },
            { command: "node", args: ["later.mjs"] },
          ],
        },
      }),
      run: (command, args) => {
        calls.push([command, args]);
        return { status: 7 };
      },
    });
    expect(code).toBe(7);
    expect(calls).toEqual([["node", ["guard.mjs"]]]);
  });
});
