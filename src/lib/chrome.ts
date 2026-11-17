// The viewer's chrome (formula bar, headers, tabs, status bar) is themed with the
// --xv-* custom properties from react-xlsx-viewer/styles.css. By default it follows
// prefers-color-scheme; these sets pin it to light or dark. The sheet itself keeps the
// file's colours, like paper.

import type { ChromeTheme } from './settings';

export type CssVars = Record<`--xv-${string}`, string>;

export const LIGHT_VARS: CssVars = {
  '--xv-accent': '#4f4fb3',
  '--xv-chrome-bg': '#f6f6f8',
  '--xv-chrome-fg': '#1d1d1f',
  '--xv-muted': '#5c5c66',
  '--xv-border': '#c9c9d1',
  '--xv-header-bg': '#ececf0',
  '--xv-header-fg': '#44444d',
  '--xv-header-selected': '#dcdcf2',
  '--xv-selection-line': '#4f4fb3',
  '--xv-focus': '#4f4fb3',
  '--xv-error': '#b3261e',
};

export const DARK_VARS: CssVars = {
  '--xv-accent': '#a8a8ff',
  '--xv-chrome-bg': '#1c1c20',
  '--xv-chrome-fg': '#f2f2f4',
  '--xv-muted': '#b0b0ba',
  '--xv-border': '#4a4a52',
  '--xv-header-bg': '#2a2a30',
  '--xv-header-fg': '#d8d8de',
  '--xv-header-selected': '#3a3a6a',
  '--xv-selection-line': '#6f6fd6',
  '--xv-focus': '#a8a8ff',
  '--xv-error': '#ffb4ab',
};

/** The custom properties to set for a chrome choice; appDark is the playground's own theme. */
export function chromeVars(chrome: ChromeTheme, accent: string | null, appDark: boolean): CssVars {
  const base = chrome === 'light' ? LIGHT_VARS : chrome === 'dark' ? DARK_VARS : chrome === 'app' ? (appDark ? DARK_VARS : LIGHT_VARS) : {};
  const vars: CssVars = { ...base };
  if (accent) {
    vars['--xv-accent'] = accent;
    vars['--xv-selection-line'] = accent;
    vars['--xv-focus'] = accent;
  }
  return vars;
}
