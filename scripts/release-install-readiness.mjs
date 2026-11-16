import { isAbsolute, basename } from "node:path";
import { pathToFileURL } from "node:url";

export const DOCS_READINESS_BUDGET_MS = 60000;
export const DOCS_NPM_VERSION = "12.0.2";
export async function loadDocsReadiness(
  modulePath = process.env.LAPIS_REGISTRY_READINESS_MODULE,
) {
  if (
    !modulePath ||
    !isAbsolute(modulePath) ||
    basename(modulePath) !== "registry-readiness.mjs"
  )
    throw Error(
      "Docs verification requires the source-pinned shared registry readiness setup",
    );
  const api = await import(pathToFileURL(modulePath).href);
  if (
    typeof api.installPublishedConsumer !== "function" ||
    typeof api.registryInstaller !== "function"
  )
    throw Error("Shared registry readiness contract is unavailable");
  return api;
}
export async function installDocsConsumer(
  { cwd, candidate, metadata, published, budgetMs = DOCS_READINESS_BUDGET_MS },
  readiness,
) {
  if (
    candidate.name !== "@lapis-notes/lapis-plugin-docs" ||
    metadata.name !== candidate.name ||
    metadata.version !== candidate.version ||
    !/^sha512-[A-Za-z0-9+/]{86}==$/.test(published?.integrity ?? "") ||
    metadata.dist?.integrity !== published.integrity
  )
    throw Error(
      "Installation readiness requires the independently verified published Docs identity",
    );
  if (
    !Number.isSafeInteger(budgetMs) ||
    budgetMs < 1 ||
    budgetMs > DOCS_READINESS_BUDGET_MS
  )
    throw Error("Docs registry readiness budget is exhausted or invalid");
  readiness ??= await loadDocsReadiness();
  await readiness.installPublishedConsumer({
    cwd,
    entries: [
      {
        name: metadata.name,
        version: metadata.version,
        integrity: published.integrity,
      },
    ],
    registry: "https://registry.npmjs.org",
    policy: {
      budgetMs,
      delaysMs: Array(11)
        .fill(5000)
        .filter((delay) => delay < budgetMs),
    },
    installer: readiness.registryInstaller(
      "npm12-strict-peers",
      DOCS_NPM_VERSION,
    ),
  });
}
