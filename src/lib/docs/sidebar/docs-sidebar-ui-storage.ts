import {
  DEFAULT_DOCS_NOTE_SORT,
  isDocsNoteSortMode,
  type DocsNoteSortMode
} from './docs-note-sort';

export const DOCS_SIDEBAR_UI_STORAGE_KEY = 'lapis:docs:sidebar-ui:v1';

export type DocsSidebarView = 'docs' | 'folders' | 'links' | 'tags';
export type DocsTagsViewMode = 'tree' | 'flat';
export type DocsFolderDisplayMode = 'panel' | 'inline';
export type { DocsNoteSortMode };

export type DocsSidebarUiState = {
  sidebarView: DocsSidebarView;
  folderMode: boolean;
  folderFollowActive: boolean;
  folderDisplayMode: DocsFolderDisplayMode;
  sourceFolderFollowActive: boolean;
  sourceFolderOpenNodes: Record<string, boolean>;
  tagsViewMode: DocsTagsViewMode;
  folderOpenNodes: Record<string, boolean>;
  tagsOpenNodes: Record<string, boolean>;
  bookOpenNodes: Record<string, boolean>;
  notesFollowActive: boolean;
  notesFiltersOpen: boolean;
  noteSortMode: DocsNoteSortMode;
};

export const DEFAULT_DOCS_SIDEBAR_UI_STATE: DocsSidebarUiState = {
  sidebarView: 'docs',
  folderMode: false,
  folderFollowActive: true,
  folderDisplayMode: 'panel',
  sourceFolderFollowActive: true,
  sourceFolderOpenNodes: {},
  tagsViewMode: 'tree',
  folderOpenNodes: {},
  tagsOpenNodes: {},
  bookOpenNodes: {},
  notesFollowActive: true,
  notesFiltersOpen: false,
  noteSortMode: DEFAULT_DOCS_NOTE_SORT
};

function isSidebarView(value: unknown): value is DocsSidebarView {
  return value === 'docs' || value === 'folders' || value === 'links' || value === 'tags';
}

function isTagsViewMode(value: unknown): value is DocsTagsViewMode {
  return value === 'tree' || value === 'flat';
}

function isFolderDisplayMode(value: unknown): value is DocsFolderDisplayMode {
  return value === 'panel' || value === 'inline';
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).every((item) => typeof item === 'boolean');
}

export function readDocsSidebarUiState(): DocsSidebarUiState {
  if (typeof localStorage === 'undefined') {
    return {
      ...DEFAULT_DOCS_SIDEBAR_UI_STATE,
      folderOpenNodes: {},
      tagsOpenNodes: {},
      bookOpenNodes: {}
    };
  }
  try {
    const rawValue = localStorage.getItem(DOCS_SIDEBAR_UI_STORAGE_KEY);
    if (!rawValue) {
      return {
        ...DEFAULT_DOCS_SIDEBAR_UI_STATE,
        folderOpenNodes: {},
        tagsOpenNodes: {},
        bookOpenNodes: {}
      };
    }
    const parsed = JSON.parse(rawValue) as Partial<DocsSidebarUiState>;
    return {
      sidebarView: isSidebarView(parsed.sidebarView) ? parsed.sidebarView : 'docs',
      folderMode: parsed.folderMode === true,
      folderFollowActive: parsed.folderFollowActive !== false,
      folderDisplayMode: isFolderDisplayMode(parsed.folderDisplayMode)
        ? parsed.folderDisplayMode
        : 'panel',
      sourceFolderFollowActive: parsed.sourceFolderFollowActive !== false,
      sourceFolderOpenNodes: isBooleanRecord(parsed.sourceFolderOpenNodes)
        ? { ...parsed.sourceFolderOpenNodes }
        : {},
      tagsViewMode: isTagsViewMode(parsed.tagsViewMode) ? parsed.tagsViewMode : 'tree',
      folderOpenNodes: isBooleanRecord(parsed.folderOpenNodes) ? { ...parsed.folderOpenNodes } : {},
      tagsOpenNodes: isBooleanRecord(parsed.tagsOpenNodes) ? { ...parsed.tagsOpenNodes } : {},
      bookOpenNodes: isBooleanRecord(parsed.bookOpenNodes) ? { ...parsed.bookOpenNodes } : {},
      notesFollowActive: parsed.notesFollowActive !== false,
      notesFiltersOpen: parsed.notesFiltersOpen === true,
      noteSortMode: isDocsNoteSortMode(parsed.noteSortMode)
        ? parsed.noteSortMode
        : DEFAULT_DOCS_NOTE_SORT
    };
  } catch {
    return {
      ...DEFAULT_DOCS_SIDEBAR_UI_STATE,
      folderOpenNodes: {},
      tagsOpenNodes: {},
      bookOpenNodes: {}
    };
  }
}

export function writeDocsSidebarUiState(state: DocsSidebarUiState) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DOCS_SIDEBAR_UI_STORAGE_KEY, JSON.stringify(state));
}
