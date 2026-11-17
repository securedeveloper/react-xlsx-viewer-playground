// Playground settings: what the controls hold, and how they map to the query string
// so any view can be shared as a link. Only non-default values are written.

import { DEFAULT_SAMPLE, findSample } from './samples';

export type ChromeTheme = 'app' | 'system' | 'light' | 'dark';
export type Tristate = 'file' | 'on' | 'off';
/** A sample id, 'upload' (a local file; can't be shared) or 'large' (generated in the browser). */
export type SourceKind = string;
export type BigMode = 'model' | 'xlsx';

export interface Settings {
  source: SourceKind;
  /** Percent 10..400, or null for the sheet's zoom from the file. */
  zoom: number | null;
  sheet: number;
  chrome: ChromeTheme;
  /** A #rrggbb accent colour, or null for the stylesheet's. */
  accent: string | null;
  /** A BCP 47 tag, or '' for the browser's locale. */
  locale: string;
  /** A label preset id, or 'custom' (then customLabels holds the JSON). */
  labels: string;
  customLabels: string;
  formulaBar: boolean;
  sheetTabs: boolean;
  statusBar: boolean;
  gridLines: Tristate;
  headers: Tristate;
  hiddenSheets: boolean;
  worker: boolean;
  height: number;
  /** The large-sheet generator: size, and whether the viewer gets the model or an .xlsx written from it. */
  rows: number;
  cols: number;
  bigMode: BigMode;
}

export const DEFAULT_SETTINGS: Readonly<Settings> = Object.freeze({
  source: DEFAULT_SAMPLE,
  zoom: null,
  sheet: 0,
  chrome: 'app',
  accent: null,
  locale: '',
  labels: 'en',
  customLabels: '',
  formulaBar: true,
  sheetTabs: true,
  statusBar: true,
  gridLines: 'file',
  headers: 'file',
  hiddenSheets: false,
  worker: false,
  height: 560,
  rows: 100_000,
  cols: 20,
  bigMode: 'model',
});

export const ZOOM_MIN = 10;
export const ZOOM_MAX = 400;
export const ROW_CHOICES = [1_000, 10_000, 100_000, 200_000] as const;
export const COL_CHOICES = [10, 20, 50] as const;

const CHROMES: readonly ChromeTheme[] = ['app', 'system', 'light', 'dark'];
const TRISTATES: readonly Tristate[] = ['file', 'on', 'off'];

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function int(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  return Number(value);
}

function bool(value: string | null, fallback: boolean): boolean {
  if (value === '1') return true;
  if (value === '0') return false;
  return fallback;
}

function base64UrlEncode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(text: string): string | null {
  try {
    const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

/** Reads settings from a query string; anything invalid falls back to the default. */
export function parseSettings(search: string, labelPresets: readonly string[]): Settings {
  const p = new URLSearchParams(search);
  const s: Settings = { ...DEFAULT_SETTINGS };

  const source = p.get('src');
  // An uploaded file can't travel in a link, so 'upload' opens the default sample.
  if (source === 'large' || (source !== null && findSample(source))) s.source = source;

  const zoom = int(p.get('zoom'));
  if (zoom !== null) s.zoom = clamp(zoom, ZOOM_MIN, ZOOM_MAX);
  const sheet = int(p.get('sheet'));
  if (sheet !== null) s.sheet = sheet;

  const chrome = p.get('chrome');
  if (chrome && (CHROMES as readonly string[]).includes(chrome)) s.chrome = chrome as ChromeTheme;
  const accent = p.get('accent');
  if (accent && /^[0-9a-f]{6}$/i.test(accent)) s.accent = `#${accent.toLowerCase()}`;
  const locale = p.get('locale');
  if (locale && /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(locale)) s.locale = locale;

  const labels = p.get('labels');
  if (labels && labelPresets.includes(labels)) s.labels = labels;
  const custom = p.get('lj');
  if (labels === 'custom' && custom) {
    const json = base64UrlDecode(custom);
    if (json !== null) {
      s.labels = 'custom';
      s.customLabels = json;
    }
  }

  s.formulaBar = bool(p.get('fb'), s.formulaBar);
  s.sheetTabs = bool(p.get('tabs'), s.sheetTabs);
  s.statusBar = bool(p.get('status'), s.statusBar);
  const grid = p.get('grid');
  if (grid && (TRISTATES as readonly string[]).includes(grid)) s.gridLines = grid as Tristate;
  const heads = p.get('heads');
  if (heads && (TRISTATES as readonly string[]).includes(heads)) s.headers = heads as Tristate;
  s.hiddenSheets = bool(p.get('hidden'), s.hiddenSheets);
  s.worker = bool(p.get('worker'), s.worker);

  const height = int(p.get('h'));
  if (height !== null) s.height = clamp(height, 240, 2000);
  const rows = int(p.get('rows'));
  if (rows !== null && (ROW_CHOICES as readonly number[]).includes(rows)) s.rows = rows;
  const cols = int(p.get('cols'));
  if (cols !== null && (COL_CHOICES as readonly number[]).includes(cols)) s.cols = cols;
  if (p.get('bm') === 'xlsx') s.bigMode = 'xlsx';
  return s;
}

/** Writes the non-default settings as a query string (without the leading '?'). */
export function serializeSettings(s: Settings): string {
  const d = DEFAULT_SETTINGS;
  const p = new URLSearchParams();
  if (s.source !== d.source && s.source !== 'upload') p.set('src', s.source);
  if (s.zoom !== null) p.set('zoom', String(s.zoom));
  if (s.sheet !== d.sheet) p.set('sheet', String(s.sheet));
  if (s.chrome !== d.chrome) p.set('chrome', s.chrome);
  if (s.accent !== null) p.set('accent', s.accent.replace(/^#/, ''));
  if (s.locale !== d.locale) p.set('locale', s.locale);
  if (s.labels !== d.labels) p.set('labels', s.labels);
  if (s.labels === 'custom' && s.customLabels.trim()) p.set('lj', base64UrlEncode(s.customLabels));
  if (s.formulaBar !== d.formulaBar) p.set('fb', s.formulaBar ? '1' : '0');
  if (s.sheetTabs !== d.sheetTabs) p.set('tabs', s.sheetTabs ? '1' : '0');
  if (s.statusBar !== d.statusBar) p.set('status', s.statusBar ? '1' : '0');
  if (s.gridLines !== d.gridLines) p.set('grid', s.gridLines);
  if (s.headers !== d.headers) p.set('heads', s.headers);
  if (s.hiddenSheets !== d.hiddenSheets) p.set('hidden', s.hiddenSheets ? '1' : '0');
  if (s.worker !== d.worker) p.set('worker', s.worker ? '1' : '0');
  if (s.height !== d.height) p.set('h', String(s.height));
  if (s.source === 'large') {
    if (s.rows !== d.rows) p.set('rows', String(s.rows));
    if (s.cols !== d.cols) p.set('cols', String(s.cols));
    if (s.bigMode !== d.bigMode) p.set('bm', s.bigMode);
  }
  return p.toString();
}

export function tristate(value: Tristate): boolean | undefined {
  return value === 'file' ? undefined : value === 'on';
}
