import type { DocsCodingLanguage } from "./types";

/** Parse-time defaults for coding-drill metadata. Practice UI is out of Core Docs scope. */
export const CODING_RUNTIME_VERSIONS: Record<DocsCodingLanguage, string> = {
  python: "3.14.6",
  java: "25.0.3",
  kotlin: "2.4.0",
};

export function codingRuntimeVersion(language: DocsCodingLanguage) {
  return CODING_RUNTIME_VERSIONS[language];
}
