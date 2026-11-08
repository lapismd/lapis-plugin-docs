/// <reference types="node" />
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, resolve } from 'node:path';

import { createClient, type InValue, type Row } from '@libsql/client';
import {
  buildDocsWorkspace,
  createDocsNote,
  slugifyDocsId,
  type CreateDocsNoteInput,
  type DocsCard,
  type DocsNote,
  type DocsWorkspace
} from '../model';
import { unzipSync } from 'fflate';

const ANKI_FIELD_SEPARATOR = '\x1f';
const SUPPORTED_IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif']);
const CLOZE_PATTERN = /\{\{c\d+::[\s\S]*?\}\}/;

export type AnkiImportSummary = {
  deckCount: number;
  cardCount: number;
  mediaCount: number;
};

export type ImportedAnkiNoteSummary = {
  id: string;
  title: string;
  sourcePath: string;
  cardCount: number;
  mediaCount: number;
};

export type AnkiImportResult = {
  summary: AnkiImportSummary;
  warnings: string[];
  importedNotes: ImportedAnkiNoteSummary[];
  workspace?: DocsWorkspace;
};

export type AnkiImportOptions = {
  bytes: Uint8Array;
  filename?: string;
  tags?: string[];
  dryRun?: boolean;
  docsRoot?: string;
  now?: Date;
  existingIds?: Iterable<string>;
  writeNote?: (note: DocsNote) => Promise<void>;
  writeMedia?: (
    note: DocsNote,
    file: { filename: string; bytes: Uint8Array },
  ) => Promise<void>;
};

type AnkiDeck = {
  id: string;
  name: string;
  dyn?: number;
};

type AnkiField = {
  name: string;
  ord?: number;
};

type AnkiTemplate = {
  name: string;
  ord?: number;
  qfmt?: string;
  afmt?: string;
};

type AnkiModel = {
  id: string;
  name: string;
  type?: number;
  flds?: AnkiField[];
  tmpls?: AnkiTemplate[];
};

type AnkiNoteRow = {
  id: number;
  guid: string;
  mid: string;
  tags: string[];
  fields: Record<string, string>;
  fieldSummary: string;
  model?: AnkiModel;
};

type AnkiCardRow = {
  id: number;
  nid: number;
  did: string;
  ord: number;
  queue: number;
};

type PreparedMedia = {
  archiveName: string;
  originalName: string;
  filename: string;
  bytes: Uint8Array;
};

type AnkiCollection = {
  decks: Map<string, AnkiDeck>;
  models: Map<string, AnkiModel>;
  notes: Map<number, AnkiNoteRow>;
  cards: AnkiCardRow[];
};

function uniqueList(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function inValueString(value: InValue | undefined) {
  if (value === undefined || value === null) return '';
  if (value instanceof Uint8Array) return new TextDecoder().decode(value);
  return String(value);
}

function inValueNumber(value: InValue | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function rowString(row: Row, key: string) {
  return inValueString(row[key] as InValue | undefined);
}

function rowNumber(row: Row, key: string) {
  return inValueNumber(row[key] as InValue | undefined);
}

function parseJsonRecord(value: string, label: string): Record<string, unknown> {
  const parsed = JSON.parse(value || '{}') as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Invalid Anki ${label} metadata.`);
  }
  return parsed as Record<string, unknown>;
}

function ankiObjectId(record: Record<string, unknown>, fallback: string) {
  return String(record.id ?? record.deckId ?? fallback);
}

function parseDecks(value: string) {
  const decks = new Map<string, AnkiDeck>();
  for (const [fallback, raw] of Object.entries(parseJsonRecord(value, 'deck'))) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const record = raw as Record<string, unknown>;
    const id = ankiObjectId(record, fallback);
    const name = String(record.name ?? 'Imported Anki Deck').trim() || 'Imported Anki Deck';
    decks.set(id, {
      id,
      name,
      dyn: typeof record.dyn === 'number' ? record.dyn : undefined
    });
  }
  return decks;
}

function parseModels(value: string) {
  const models = new Map<string, AnkiModel>();
  for (const [fallback, raw] of Object.entries(parseJsonRecord(value, 'model'))) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const record = raw as Record<string, unknown>;
    const id = ankiObjectId(record, fallback);
    models.set(id, {
      id,
      name: String(record.name ?? 'Anki note type').trim() || 'Anki note type',
      type: typeof record.type === 'number' ? record.type : undefined,
      flds: Array.isArray(record.flds) ? (record.flds as AnkiField[]) : [],
      tmpls: Array.isArray(record.tmpls) ? (record.tmpls as AnkiTemplate[]) : []
    });
  }
  return models;
}

function ankiTags(value: string) {
  return uniqueList(value.split(/\s+/));
}

function fieldMap(model: AnkiModel | undefined, rawFields: string) {
  const fields = rawFields.split(ANKI_FIELD_SEPARATOR);
  const names = model?.flds?.length
    ? [...model.flds].sort((left, right) => (left.ord ?? 0) - (right.ord ?? 0))
    : [];
  const entries = fields.map((value, index) => [names[index]?.name ?? `Field ${index + 1}`, value]);
  return Object.fromEntries(entries);
}

function firstNonEmptyField(fields: Record<string, string>) {
  return Object.values(fields).find((value) => stripHtml(value).trim()) ?? '';
}

function summarizeFields(fields: Record<string, string>) {
  return Object.entries(fields)
    .map(([name, value]) => {
      const text = htmlToMarkdown(value, new Map()).replace(/\s+/g, ' ').trim();
      return text ? `**${name}:** ${text}` : '';
    })
    .filter(Boolean)
    .join('\n\n');
}

function safeZipEntries(bytes: Uint8Array) {
  const entries = unzipSync(bytes);
  for (const name of Object.keys(entries)) {
    const normalized = name.replaceAll('\\', '/');
    if (
      !normalized ||
      normalized.startsWith('/') ||
      normalized.includes('\0') ||
      normalized.split('/').some((segment) => segment === '..')
    ) {
      throw new Error(`Unsupported unsafe Anki package entry: ${name}`);
    }
  }
  return entries;
}

function collectionEntry(entries: Record<string, Uint8Array>) {
  if (entries['collection.anki21']) return { name: 'collection.anki21', bytes: entries['collection.anki21'] };
  if (entries['collection.anki2']) return { name: 'collection.anki2', bytes: entries['collection.anki2'] };
  if (entries['collection.anki21b']) {
    throw new Error('.colpkg and collection.anki21b packages are not supported.');
  }
  throw new Error('Anki package is missing collection.anki21 or collection.anki2.');
}

function extensionForMedia(filename: string) {
  const extension = filename.split('.').at(-1)?.toLowerCase() ?? '';
  return SUPPORTED_IMAGE_EXTENSIONS.has(extension) ? extension : null;
}

function safeMediaFilename(filename: string, used: Set<string>) {
  const rawBase = basename(filename.replaceAll('\\', '/'));
  if (!rawBase || rawBase === '.' || rawBase === '..') return null;
  const extension = extensionForMedia(rawBase);
  if (!extension) return null;
  const base =
    rawBase
      .replace(/\.[a-z0-9]+$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'image';
  let candidate = `${base}.${extension === 'jpeg' ? 'jpg' : extension}`;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${suffix++}.${extension === 'jpeg' ? 'jpg' : extension}`;
  }
  used.add(candidate);
  return candidate;
}

function prepareMedia(entries: Record<string, Uint8Array>, warnings: string[]) {
  const rawMedia = entries.media ? new TextDecoder().decode(entries.media) : '{}';
  const parsed = parseJsonRecord(rawMedia, 'media');
  const used = new Set<string>();
  const media: PreparedMedia[] = [];
  for (const [archiveName, originalValue] of Object.entries(parsed)) {
    const originalName = String(originalValue ?? '').trim();
    const bytes = entries[archiveName];
    if (!originalName) continue;
    if (!bytes) {
      warnings.push(`Media entry missing from package: ${originalName}`);
      continue;
    }
    if (originalName.includes('\0') || originalName.split(/[\\/]+/).some((segment) => segment === '..')) {
      warnings.push(`Skipped unsafe media filename: ${originalName}`);
      continue;
    }
    if (!extensionForMedia(originalName)) {
      warnings.push(`Skipped unsupported media file: ${originalName}`);
      continue;
    }
    const filename = safeMediaFilename(originalName, used);
    if (!filename) {
      warnings.push(`Skipped unsafe media filename: ${originalName}`);
      continue;
    }
    media.push({ archiveName, originalName, filename, bytes });
  }
  return media;
}

function mediaReferenceMap(media: PreparedMedia[], noteId: string) {
  const map = new Map<string, string>();
  for (const file of media) {
    const relativePath = `${noteId}/media/${file.filename}`;
    map.set(file.originalName, relativePath);
    map.set(basename(file.originalName.replaceAll('\\', '/')), relativePath);
  }
  return map;
}

function decodeHtmlEntity(entity: string) {
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' '
  };
  if (entity.startsWith('#x')) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
  if (entity.startsWith('#')) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
  return named[entity] ?? `&${entity};`;
}

function decodeHtml(value: string) {
  return value.replace(/&([a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/g, (_match, entity: string) => {
    try {
      return decodeHtmlEntity(entity);
    } catch {
      return _match;
    }
  });
}

function stripHtml(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, ' '));
}

function rewriteMediaSrc(src: string, mediaMap: Map<string, string>) {
  const trimmed = decodeHtml(src.trim());
  if (!trimmed || /^(https?:|data:|\/)/i.test(trimmed)) return trimmed;
  const decoded = (() => {
    try {
      return decodeURIComponent(trimmed);
    } catch {
      return trimmed;
    }
  })();
  return mediaMap.get(decoded) ?? mediaMap.get(basename(decoded.replaceAll('\\', '/'))) ?? trimmed;
}

function htmlToMarkdown(value: string, mediaMap: Map<string, string>) {
  let markdown = value.replace(/<img\b[^>]*\bsrc=(["']?)([^"'\s>]+)\1[^>]*>/gi, (_match, _q, src) => {
    const rewritten = rewriteMediaSrc(src, mediaMap);
    return rewritten ? `![Image](${rewritten})` : '';
  });
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  markdown = markdown.replace(/<\/(?:p|div|h[1-6]|li|tr)>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>/gi, '- ');
  markdown = markdown.replace(/<hr\b[^>]*>/gi, '\n\n---\n\n');
  markdown = markdown.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
  markdown = markdown.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');
  markdown = markdown.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  markdown = markdown.replace(/<[^>]*>/g, '');
  return decodeHtml(markdown)
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function labeledFields(note: AnkiNoteRow, mediaMap: Map<string, string>) {
  const rendered = Object.entries(note.fields)
    .map(([name, value]) => {
      const markdown = htmlToMarkdown(value, mediaMap);
      return markdown ? `**${name}**\n\n${markdown}` : '';
    })
    .filter(Boolean)
    .join('\n\n');
  return rendered || note.fieldSummary || firstNonEmptyField(note.fields) || note.guid;
}

function templateForCard(model: AnkiModel | undefined, ord: number) {
  const templates = [...(model?.tmpls ?? [])].sort((left, right) => (left.ord ?? 0) - (right.ord ?? 0));
  return templates[ord] ?? templates.find((template) => (template.ord ?? 0) === ord) ?? templates[0];
}

function fieldText(fields: Record<string, string>, name: string, mediaMap: Map<string, string>) {
  return htmlToMarkdown(fields[name] ?? '', mediaMap);
}

function renderConditionals(template: string, fields: Record<string, string>) {
  let rendered = template;
  for (let pass = 0; pass < 4; pass += 1) {
    rendered = rendered.replace(
      /\{\{([#^])([^}]+)\}\}([\s\S]*?)\{\{\/\2\}\}/g,
      (_match, mode: string, rawName: string, body: string) => {
        const name = rawName.trim();
        const filled = Boolean(stripHtml(fields[name] ?? '').trim());
        return mode === '#' ? (filled ? body : '') : filled ? '' : body;
      }
    );
  }
  return rendered;
}

function renderTemplate(input: {
  template: string;
  note: AnkiNoteRow;
  deck: AnkiDeck;
  templateName: string;
  mediaMap: Map<string, string>;
  frontSide?: string;
}) {
  const { note, deck, mediaMap } = input;
  let rendered = renderConditionals(input.template, note.fields);
  rendered = rendered.replace(/\{\{FrontSide\}\}/g, input.frontSide ?? '');
  rendered = rendered.replace(/\{\{Tags\}\}/g, note.tags.join(' '));
  rendered = rendered.replace(/\{\{Deck\}\}/g, deck.name);
  rendered = rendered.replace(/\{\{Card\}\}/g, input.templateName);
  rendered = rendered.replace(/\{\{(?:type:|text:|cloze:)?([^}]+)\}\}/g, (_match, rawName: string) =>
    fieldText(note.fields, rawName.trim(), mediaMap)
  );
  rendered = rendered.replace(/\{\{(?!c\d+::)[^}]+\}\}/g, '');
  return htmlToMarkdown(rendered, mediaMap);
}

function ankiCardStatus(card: AnkiCardRow) {
  return card.queue < 0 ? 'suspended' : 'active';
}

function uniqueCardId(existing: Set<string>, note: AnkiNoteRow, card: AnkiCardRow) {
  const base = `card-${slugifyDocsId(`${note.guid || note.id}-${card.ord + 1}`, 'anki-card')}`;
  let id = base;
  let suffix = 2;
  while (existing.has(id)) id = `${base}-${suffix++}`;
  existing.add(id);
  return id;
}

function docsCardFromAnki(input: {
  note: AnkiNoteRow;
  card: AnkiCardRow;
  deck: AnkiDeck;
  deckTag: string;
  importTags: string[];
  mediaMap: Map<string, string>;
  existingCardIds: Set<string>;
}): DocsCard {
  const template = templateForCard(input.note.model, input.card.ord);
  const prompt =
    (template?.qfmt
      ? renderTemplate({
          template: template.qfmt,
          note: input.note,
          deck: input.deck,
          templateName: template.name,
          mediaMap: input.mediaMap
        })
      : '') || labeledFields(input.note, input.mediaMap);
  const answer =
    (template?.afmt
      ? renderTemplate({
          template: template.afmt,
          note: input.note,
          deck: input.deck,
          templateName: template.name,
          mediaMap: input.mediaMap,
          frontSide: ''
        })
      : '') || labeledFields(input.note, input.mediaMap);
  return {
    id: uniqueCardId(input.existingCardIds, input.note, input.card),
    type: CLOZE_PATTERN.test(prompt) ? 'cloze' : 'basic',
    status: ankiCardStatus(input.card),
    prompt,
    answer,
    tags: uniqueList(['anki', input.deckTag, ...input.importTags, ...input.note.tags]),
    sourceRefs: [],
    blockRefs: [],
    reviews: []
  };
}

function uniqueDocsId(existingIds: Set<string>, seed: string) {
  const base = slugifyDocsId(seed, 'anki-deck');
  let id = base;
  let suffix = 2;
  while (existingIds.has(id)) id = `${base}-${suffix++}`;
  existingIds.add(id);
  return id;
}

function deckTitle(deck: AnkiDeck) {
  return deck.name.replace(/::/g, ' / ');
}

function modelNames(cards: AnkiCardRow[], notes: Map<number, AnkiNoteRow>) {
  return uniqueList(cards.map((card) => notes.get(card.nid)?.model?.name ?? '').filter(Boolean));
}

function createImportedNote(input: {
  deck: AnkiDeck;
  noteId: string;
  cards: DocsCard[];
  importTags: string[];
  modelNames: string[];
  mediaCount: number;
  docsRoot: string;
  now?: Date;
}) {
  const deckTag = `anki/${slugifyDocsId(input.deck.name.replace(/::/g, '-'), 'deck')}`;
  const body = [
    `Imported from Anki deck **${deckTitle(input.deck)}**.`,
    `- Cards imported: ${input.cards.length}`,
    input.modelNames.length ? `- Note types: ${input.modelNames.join(', ')}` : undefined,
    `- Media copied: ${input.mediaCount}`,
    '- Anki scheduling and review history were not imported.'
  ]
    .filter(Boolean)
    .join('\n');
  const noteInput: CreateDocsNoteInput = {
    id: input.noteId,
    title: deckTitle(input.deck),
    docType: 'revision',
    summary: `Imported Anki deck with ${input.cards.length} cards.`,
    learningGoal: 'Review imported Anki cards in Docs.',
    aliases: [input.deck.name],
    tags: uniqueList(['anki', deckTag, ...input.importTags]),
    body,
    cards: input.cards
  };
  return {
    ...createDocsNote(noteInput, input.now),
    sourcePath: `${input.docsRoot}/anki/${input.noteId}.doc.md`
  } satisfies DocsNote;
}

async function readCollection(dbPath: string): Promise<AnkiCollection> {
  const client = createClient({ url: `file:${dbPath}` });
  try {
    const col = await client.execute('select models, decks from col limit 1');
    const colRow = col.rows[0];
    if (!colRow) throw new Error('Anki collection metadata is missing.');
    const decks = parseDecks(rowString(colRow, 'decks'));
    const models = parseModels(rowString(colRow, 'models'));
    const notesResult = await client.execute('select id, guid, mid, tags, flds from notes');
    const notes = new Map<number, AnkiNoteRow>();
    for (const row of notesResult.rows) {
      const id = rowNumber(row, 'id');
      const mid = rowString(row, 'mid');
      const model = models.get(mid);
      const fields = fieldMap(model, rowString(row, 'flds'));
      notes.set(id, {
        id,
        guid: rowString(row, 'guid'),
        mid,
        tags: ankiTags(rowString(row, 'tags')),
        fields,
        fieldSummary: summarizeFields(fields),
        model
      });
    }
    const cardsResult = await client.execute('select id, nid, did, ord, queue from cards order by id');
    const cards = cardsResult.rows.map((row) => ({
      id: rowNumber(row, 'id'),
      nid: rowNumber(row, 'nid'),
      did: rowString(row, 'did'),
      ord: rowNumber(row, 'ord'),
      queue: rowNumber(row, 'queue')
    }));
    return { decks, models, notes, cards };
  } finally {
    client.close();
  }
}

async function collectionFromPackage(bytes: Uint8Array, filename: string | undefined, warnings: string[]) {
  if (filename?.toLowerCase().endsWith('.colpkg')) {
    throw new Error('.colpkg and collection.anki21b packages are not supported.');
  }
  const entries = safeZipEntries(bytes);
  const collection = collectionEntry(entries);
  const media = prepareMedia(entries, warnings);
  const tempRoot = await mkdtemp(resolve(tmpdir(), 'cvstudio-anki-'));
  const dbPath = resolve(tempRoot, collection.name);
  try {
    await writeFile(dbPath, collection.bytes);
    return { collection: await readCollection(dbPath), media };
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

function planImportedNotes(input: {
  collection: AnkiCollection;
  media: PreparedMedia[];
  existingIds: Set<string>;
  importTags: string[];
  docsRoot: string;
  now?: Date;
}) {
  const byDeck = new Map<string, AnkiCardRow[]>();
  for (const card of input.collection.cards) {
    if (!input.collection.notes.has(card.nid)) continue;
    byDeck.set(card.did, [...(byDeck.get(card.did) ?? []), card]);
  }
  const notes: DocsNote[] = [];
  for (const [deckId, cards] of [...byDeck.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const deck = input.collection.decks.get(deckId) ?? { id: deckId, name: `Anki Deck ${deckId}` };
    if (deck.dyn) continue;
    const noteId = uniqueDocsId(input.existingIds, deck.name);
    const deckTag = `anki/${slugifyDocsId(deck.name.replace(/::/g, '-'), 'deck')}`;
    const mediaMap = mediaReferenceMap(input.media, noteId);
    const existingCardIds = new Set<string>();
    const docsCards = cards.map((card) =>
      docsCardFromAnki({
        note: input.collection.notes.get(card.nid)!,
        card,
        deck,
        deckTag,
        importTags: input.importTags,
        mediaMap,
        existingCardIds
      })
    );
    notes.push(
      createImportedNote({
        deck,
        noteId,
        cards: docsCards,
        importTags: input.importTags,
        modelNames: modelNames(cards, input.collection.notes),
        mediaCount: input.media.length,
        docsRoot: input.docsRoot,
        now: input.now
      })
    );
  }
  return notes;
}



function importedNoteSummary(note: DocsNote, mediaCount: number): ImportedAnkiNoteSummary {
  return {
    id: note.id,
    title: note.title,
    sourcePath: note.sourcePath,
    cardCount: note.cards.length,
    mediaCount
  };
}

export async function importAnkiPackage(options: AnkiImportOptions): Promise<AnkiImportResult> {
  const warnings: string[] = [];
  const docsRoot = (options.docsRoot ?? 'docs').replace(/^\/+|\/+$/g, '') || 'docs';
  const importTags = uniqueList(options.tags ?? []);
  const { collection, media } = await collectionFromPackage(options.bytes, options.filename, warnings);
  const notes = planImportedNotes({
    collection,
    media,
    existingIds: new Set(options.existingIds ?? []),
    importTags,
    docsRoot,
    now: options.now
  });
  const summary = {
    deckCount: notes.length,
    cardCount: notes.reduce((count, note) => count + note.cards.length, 0),
    mediaCount: media.length
  };
  if (summary.deckCount === 0) warnings.push('No concrete Anki decks with cards were found.');
  const importedNotes = notes.map((note) => importedNoteSummary(note, media.length));
  if (options.dryRun || !options.writeNote) return { summary, warnings, importedNotes };
  for (const note of notes) {
    await options.writeNote(note);
    if (options.writeMedia) {
      for (const file of media) {
        await options.writeMedia(note, { filename: file.filename, bytes: file.bytes });
      }
    }
  }
  return {
    summary,
    warnings,
    importedNotes,
    workspace: buildDocsWorkspace(notes, options.now ?? new Date())
  };
}
