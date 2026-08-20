/**
 * DESIGN_CORE_CANDIDATE: shared reference-index helpers (ported from CV Studio
 * `@cvstudio/ui/reference-utils`). Prefer migrating to design-core when a
 * cross-plugin reference catalog lands.
 */

export type ReferenceTarget = {
  id: string;
  ref: string;
  marker: string;
  path: string;
  type: string;
  label: string;
  excerpt: string;
  duplicate: boolean;
  kind?: string;
  selectable?: boolean;
  href?: string;
};

export type ReferenceIndex<T extends ReferenceTarget = ReferenceTarget> = {
  references: T[];
  duplicates: Record<string, T[]>;
};

const REFERENCE_MARKER = /^\[\^([A-Za-z0-9_/-]+)\]$/;

export function normalizeReferenceRef(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return REFERENCE_MARKER.test(trimmed) ? trimmed : null;
}

export function normalizeReferenceList(value: unknown) {
  const rawValues = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.values(value).flatMap((item) => (Array.isArray(item) ? item : []))
      : [];
  const refs = rawValues
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return Array.from(new Set(refs));
}

export function duplicateReferenceCount(index: ReferenceIndex, value: string) {
  const ref = normalizeReferenceRef(value);
  return ref ? (index.duplicates[ref]?.length ?? 0) : 0;
}

export function resolveReferenceTarget<T extends ReferenceTarget>(
  index: ReferenceIndex<T>,
  value: string,
) {
  const ref = normalizeReferenceRef(value);
  if (!ref) return null;
  const matches = index.references.filter((reference) => reference.ref === ref);
  return matches.length === 1 ? matches[0] : null;
}
