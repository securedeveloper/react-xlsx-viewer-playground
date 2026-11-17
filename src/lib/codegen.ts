// Generates the code that reproduces the playground's current settings:
// the component, the CSS for the chrome theme (if any) and the worker file (if used).

import { DARK_VARS, LIGHT_VARS, type CssVars } from './chrome';
import type { StringLabels } from './labels';
import { DEFAULT_SETTINGS, type Settings, type Tristate } from './settings';

export interface GeneratedCode {
  tsx: string;
  css: string | null;
  worker: string | null;
}

export const VIEWER_CLASS = 'xlsx-viewer';
export const WORKER_FILE = 'excel.worker.ts';

function jsString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
}

function propKey(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : jsString(key);
}

function cssBlock(selector: string, vars: CssVars): string {
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `${selector} {\n${body}\n}`;
}

function tristateProp(name: string, value: Tristate): string | null {
  return value === 'file' ? null : `${name}={${value === 'on'}}`;
}

function accentVars(accent: string | null): CssVars {
  return accent ? { '--xv-accent': accent, '--xv-selection-line': accent, '--xv-focus': accent } : {};
}

function themeCss(s: Settings): string | null {
  const sel = `.${VIEWER_CLASS}`;
  const accent = accentVars(s.accent);
  switch (s.chrome) {
    case 'light':
      return cssBlock(sel, { ...LIGHT_VARS, ...accent });
    case 'dark':
      return cssBlock(sel, { ...DARK_VARS, ...accent });
    // 'app' is the playground following its own theme toggle; in an app the stylesheet's
    // default (prefers-color-scheme) is the equivalent, so only an accent needs CSS.
    case 'app':
    case 'system':
      return s.accent ? cssBlock(sel, accent) : null;
  }
}

/** The JSX props for the current settings, one per line, in a stable order. */
export function viewerProps(s: Settings, labels: StringLabels): string[] {
  const d = DEFAULT_SETTINGS;
  const props: string[] = ['source={file}'];
  if (s.worker) props.push(`worker={() => new Worker(new URL('./${WORKER_FILE}', import.meta.url), { type: 'module' })}`);
  if (s.sheet !== d.sheet) props.push(`defaultSheet={${s.sheet}}`);
  if (s.zoom !== null) props.push(`defaultZoom={${s.zoom}}`);
  if (!s.formulaBar) props.push('showFormulaBar={false}');
  if (!s.sheetTabs) props.push('showSheetTabs={false}');
  if (!s.statusBar) props.push('showStatusBar={false}');
  const grid = tristateProp('showGridLines', s.gridLines);
  if (grid) props.push(grid);
  const heads = tristateProp('showHeaders', s.headers);
  if (heads) props.push(heads);
  if (s.hiddenSheets) props.push('showHiddenSheets');
  if (s.locale) props.push(`locale=${jsString(s.locale)}`);
  const entries = Object.entries(labels);
  if (entries.length) {
    const body = entries.map(([k, v]) => `      ${propKey(k)}: ${jsString(v)},`).join('\n');
    props.push(`labels={{\n${body}\n    }}`);
  }
  if (themeCss(s)) props.push(`className=${jsString(VIEWER_CLASS)}`);
  props.push(`style={{ height: ${s.height} }}`);
  return props;
}

export function generateCode(s: Settings, labels: StringLabels): GeneratedCode {
  const css = themeCss(s);
  const props = viewerProps(s, labels);
  const lines = [
    "import { XlsxViewer } from 'react-xlsx-viewer';",
    "import 'react-xlsx-viewer/styles.css';",
    ...(css ? ["import './viewer.css';"] : []),
    '',
    'export function Preview({ file }: { file: File }) {',
    '  return (',
    '    <XlsxViewer',
    ...props.map((p) => `      ${p.replace(/\n/g, '\n  ')}`),
    '    />',
    '  );',
    '}',
    '',
  ];
  const worker = s.worker
    ? `// ${WORKER_FILE}: reads the file off the main thread.\nimport { exposeWorker } from 'javascript-excel/worker';\n\nexposeWorker();\n`
    : null;
  return { tsx: lines.join('\n'), css: css ? `/* viewer.css */\n${css}\n` : null, worker };
}

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
export const PACKAGE_MANAGERS: readonly PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];

/** The install command. The worker file imports javascript-excel directly, so it's listed then. */
export function installCommand(pm: PackageManager, version: string, withEngine: boolean, engineVersion: string): string {
  const pkgs = [`react-xlsx-viewer@${version}`, ...(withEngine ? [`javascript-excel@${engineVersion}`] : [])].join(' ');
  return pm === 'npm' ? `npm install ${pkgs}` : pm === 'pnpm' ? `pnpm add ${pkgs}` : pm === 'yarn' ? `yarn add ${pkgs}` : `bun add ${pkgs}`;
}
