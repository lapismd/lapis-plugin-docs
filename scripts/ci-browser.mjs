import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// Resolve through the actual browser provider, never a globally installed CLI.
const require = createRequire(
  import.meta.resolve("@vitest/browser-playwright/package.json"),
);
const cli = join(dirname(require.resolve("playwright/package.json")), "cli.js");
const child = spawn(process.execPath, [cli, "install", "chromium"], {
  stdio: "inherit",
});
const code = await new Promise((resolve, reject) => {
  child.once("error", reject);
  child.once("exit", (status) => resolve(status ?? 1));
});
if (code !== 0) process.exit(code);
