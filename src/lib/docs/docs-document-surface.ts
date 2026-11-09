import {
  resolveDocsSidebarPanelSelection,
} from "./docs-folder-directory";
import type { DocsNotePanel, DocsReviewScope } from "../model";

export type DocsDocumentSurface = {
  panel: DocsNotePanel;
  reviewScope?: DocsReviewScope;
};

const pending = new Map<string, DocsDocumentSurface>();
const listeners = new Map<string, Set<(surface: DocsDocumentSurface) => void>>();

export function requestDocsDocumentSurface(
  path: string,
  surface: DocsDocumentSurface,
): void {
  const next: DocsDocumentSurface = {
    panel: resolveDocsSidebarPanelSelection(surface.panel),
    ...(surface.reviewScope ? { reviewScope: surface.reviewScope } : {}),
  };
  pending.set(path, next);
  for (const listener of listeners.get(path) ?? []) listener(next);
}

export function subscribeDocsDocumentSurface(
  path: string,
  listener: (surface: DocsDocumentSurface) => void,
): () => void {
  const group = listeners.get(path) ?? new Set();
  group.add(listener);
  listeners.set(path, group);
  const current = pending.get(path);
  if (current) listener(current);
  return () => {
    group.delete(listener);
    if (group.size === 0) listeners.delete(path);
  };
}
