import {
  docsNoteMatchesTagFolder,
  docsTagMatchesFolder,
  normalizeDocsTag,
  type DocsNoteSummary,
  type DocsTagSummary
} from '../../model';

export type DocsTagSortMode = 'count' | 'name';

export type DocsTagTreeNode = {
  name: string;
  tag: string;
  count: number;
  exactCount: number;
  summary: DocsTagSummary | null;
  children: DocsTagTreeNode[];
};

export { docsNoteMatchesTagFolder, docsTagMatchesFolder, normalizeDocsTag };

/** Folder badges count notes/files, not notes+cards. */
export function docsTagCount(tag: DocsTagSummary) {
  return tag.noteCount;
}

export function sortDocsTagSummaries(tags: DocsTagSummary[], sortMode: DocsTagSortMode) {
  return [...tags].sort((left, right) => {
    if (sortMode === 'name') return left.tag.localeCompare(right.tag);
    return docsTagCount(right) - docsTagCount(left) || left.tag.localeCompare(right.tag);
  });
}

export function filterDocsTagsByPathMatch(tags: DocsTagSummary[], query: string) {
  const needle = normalizeDocsTag(query).toLowerCase();
  if (!needle) return tags;
  return tags.filter((tag) => {
    const path = normalizeDocsTag(tag.tag).toLowerCase();
    return (
      path === needle ||
      path.startsWith(`${needle}/`) ||
      path.includes(`/${needle}/`) ||
      path.endsWith(`/${needle}`) ||
      path.includes(needle)
    );
  });
}

export function createDocsTagTree(
  tagSummaries: DocsTagSummary[],
  sortMode: DocsTagSortMode = 'count'
) {
  const nodeByPath = new Map<string, DocsTagTreeNode>();
  const roots: DocsTagTreeNode[] = [];

  for (const summary of tagSummaries) {
    const parts = summary.tag
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean);
    if (!parts.length) continue;

    let parent: DocsTagTreeNode | null = null;
    for (let index = 0; index < parts.length; index += 1) {
      const path = parts.slice(0, index + 1).join('/');
      let node = nodeByPath.get(path);
      if (!node) {
        node = {
          name: parts[index],
          tag: path,
          count: 0,
          exactCount: 0,
          summary: null,
          children: []
        };
        nodeByPath.set(path, node);
        if (parent) parent.children.push(node);
        else roots.push(node);
      }
      if (index === parts.length - 1) {
        node.summary = summary;
        node.exactCount = docsTagCount(summary);
      }
      parent = node;
    }
  }

  function assignCounts(node: DocsTagTreeNode): number {
    const childrenCount = node.children.reduce((total, child) => total + assignCounts(child), 0);
    node.count = node.summary ? node.exactCount : childrenCount;
    return node.count;
  }

  function sortNodes(nodes: DocsTagTreeNode[]) {
    nodes.sort((left, right) => {
      if (sortMode === 'name') return left.name.localeCompare(right.name);
      return right.count - left.count || left.name.localeCompare(right.name);
    });
    for (const node of nodes) sortNodes(node.children);
    return nodes;
  }

  for (const node of roots) assignCounts(node);
  return sortNodes(roots);
}

export function filterDocsNotesByTagFolder(notes: DocsNoteSummary[], folder: string) {
  return notes.filter((note) => docsNoteMatchesTagFolder(note, folder));
}
