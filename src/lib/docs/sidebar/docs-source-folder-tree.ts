import type { DocsNoteSummary } from '../../model';

import {
  DEFAULT_DOCS_NOTE_SORT,
  sortDocsNotes,
  type DocsNoteSortMode
} from './docs-note-sort';

export const DOCS_SOURCE_ROOT_ID = '__docs-root__';

export type DocsSourceFolderTreeNode = {
  id: string;
  path: string;
  label: string;
  count: number;
  isBook: boolean;
  notes: DocsNoteSummary[];
  children: DocsSourceFolderTreeNode[];
};

function sourceRelativePath(note: Pick<DocsNoteSummary, 'id' | 'sourcePath'>) {
  const sourcePath = note.sourcePath?.replace(/^\/+/, '').replaceAll('\\', '/') ?? '';
  for (const prefix of ['data/docs/', 'docs/']) {
    if (sourcePath.startsWith(prefix)) return sourcePath.slice(prefix.length);
  }
  return sourcePath || `${note.id}.doc.md`;
}

function sourceFolderPath(note: Pick<DocsNoteSummary, 'id' | 'sourcePath'>) {
  const segments = sourceRelativePath(note).split('/').filter(Boolean);
  segments.pop();
  return segments.join('/');
}

function folderId(path: string) {
  return path || DOCS_SOURCE_ROOT_ID;
}

function ensureChild(parent: DocsSourceFolderTreeNode, path: string, label: string) {
  let child = parent.children.find((item) => item.path === path);
  if (!child) {
    child = {
      id: folderId(path),
      path,
      label,
      count: 0,
      isBook: false,
      notes: [],
      children: []
    };
    parent.children.push(child);
  }
  return child;
}

function bookIndexNote(notes: DocsNoteSummary[]) {
  const bookNotes = notes.filter((note) => (note.book?.chapters?.length ?? 0) > 0);
  if (!bookNotes.length) return null;
  return (
    bookNotes.find((note) => {
      const file = sourceRelativePath(note).split('/').at(-1);
      return file === 'index.md' || file === 'index.doc.md';
    }) ??
    bookNotes[0] ??
    null
  );
}

function applyBookFolderLabel(node: DocsSourceFolderTreeNode) {
  if (node.id === DOCS_SOURCE_ROOT_ID) {
    node.isBook = false;
    return;
  }
  const indexNote = bookIndexNote(node.notes);
  if (!indexNote) {
    node.isBook = false;
    return;
  }
  const title = indexNote.title.trim();
  node.label = title || node.label;
  node.isBook = true;
}

function finalizeNode(
  node: DocsSourceFolderTreeNode,
  sortMode: DocsNoteSortMode
): DocsSourceFolderTreeNode {
  node.notes = sortDocsNotes(node.notes, sortMode);
  applyBookFolderLabel(node);
  node.children = node.children
    .map((child) => finalizeNode(child, sortMode))
    .sort((left, right) => left.label.localeCompare(right.label));
  node.count = node.notes.length + node.children.reduce((total, child) => total + child.count, 0);
  return node;
}

export function createDocsSourceFolderTree(
  notes: DocsNoteSummary[],
  sortMode: DocsNoteSortMode = DEFAULT_DOCS_NOTE_SORT
): DocsSourceFolderTreeNode {
  const root: DocsSourceFolderTreeNode = {
    id: DOCS_SOURCE_ROOT_ID,
    path: '',
    label: 'Docs',
    count: 0,
    isBook: false,
    notes: [],
    children: []
  };

  for (const note of notes) {
    const segments = sourceFolderPath(note).split('/').filter(Boolean);
    let current = root;
    for (let index = 0; index < segments.length; index += 1) {
      const path = segments.slice(0, index + 1).join('/');
      current = ensureChild(current, path, segments[index]);
    }
    current.notes.push(note);
  }

  return finalizeNode(root, sortMode);
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

function noteMatchesQuery(note: DocsNoteSummary, query: string) {
  const haystack = [note.title, note.id, note.sourcePath].join(' ').toLowerCase();
  return haystack.includes(query);
}

function cloneNode(node: DocsSourceFolderTreeNode): DocsSourceFolderTreeNode {
  return {
    ...node,
    notes: [...node.notes],
    children: node.children.map(cloneNode)
  };
}

function filterNode(
  node: DocsSourceFolderTreeNode,
  query: string,
  sortMode: DocsNoteSortMode
): DocsSourceFolderTreeNode | null {
  const folderHaystack = [node.label, node.path || 'Docs', node.isBook ? 'book' : '']
    .join(' ')
    .toLowerCase();
  if (folderHaystack.includes(query)) return finalizeNode(cloneNode(node), sortMode);

  const notes = sortDocsNotes(
    node.notes.filter((note) => noteMatchesQuery(note, query)),
    sortMode
  );
  const children = node.children
    .map((child) => filterNode(child, query, sortMode))
    .filter((child): child is DocsSourceFolderTreeNode => child !== null)
    .sort((left, right) => left.label.localeCompare(right.label));
  const count = notes.length + children.reduce((total, child) => total + child.count, 0);
  if (count === 0) return null;
  const next = { ...node, notes, children, count };
  applyBookFolderLabel(next);
  return next;
}

export function filterDocsSourceFolderTree(
  tree: DocsSourceFolderTreeNode,
  query: string,
  sortMode: DocsNoteSortMode = DEFAULT_DOCS_NOTE_SORT
): DocsSourceFolderTreeNode | null {
  const normalized = normalizeQuery(query);
  if (!normalized) return finalizeNode(cloneNode(tree), sortMode);
  return filterNode(tree, normalized, sortMode);
}

export function collectExpandableSourceFolderIds(node: DocsSourceFolderTreeNode): string[] {
  const ids: string[] = [];
  if (node.notes.length || node.children.length) ids.push(node.id);
  for (const child of node.children) ids.push(...collectExpandableSourceFolderIds(child));
  return ids;
}

export function sourceFolderAncestorIds(note: Pick<DocsNoteSummary, 'id' | 'sourcePath'>) {
  const segments = sourceFolderPath(note).split('/').filter(Boolean);
  const ids = [DOCS_SOURCE_ROOT_ID];
  for (let index = 0; index < segments.length; index += 1) {
    ids.push(segments.slice(0, index + 1).join('/'));
  }
  return ids;
}
