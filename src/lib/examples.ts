// One-click scenarios: a source plus the props that show a feature off.

import type { Settings } from './settings';

export interface Example {
  id: string;
  title: string;
  description: string;
  settings: Partial<Settings>;
}

export const EXAMPLES: readonly Example[] = [
  {
    id: 'kitchen-sink',
    title: 'Everything at once',
    description: 'The kitchen-sink workbook with the default props.',
    settings: { source: '99-kitchen-sink' },
  },
  {
    id: 'frozen-rtl',
    title: 'Frozen panes, RTL and tab colours',
    description: 'Views from the file: frozen rows and columns, a right-to-left sheet, coloured tabs.',
    settings: { source: '14-merges-views' },
  },
  {
    id: 'hidden-sheets',
    title: 'Reveal hidden sheets',
    description: "showHiddenSheets lists 'hidden' sheets in the tabs; 'veryHidden' ones stay hidden.",
    settings: { source: '14-merges-views', hiddenSheets: true },
  },
  {
    id: 'locale',
    title: 'German number formats',
    description: 'locale="de-DE" formats numbers and dates the German way.',
    settings: { source: '10-number-formats', locale: 'de-DE' },
  },
  {
    id: 'translated',
    title: 'Translated UI',
    description: 'labels in German, with the locale to match.',
    settings: { source: '99-kitchen-sink', labels: 'de', locale: 'de-DE' },
  },
  {
    id: 'minimal',
    title: 'Minimal chrome',
    description: 'No formula bar, status bar or headers: a plain embedded table.',
    settings: { source: '19-builders', formulaBar: false, statusBar: false, headers: 'off' },
  },
  {
    id: 'zoomed',
    title: 'Zoomed out, no grid lines',
    description: 'defaultZoom={60} and showGridLines={false}.',
    settings: { source: '07-fills', zoom: 60, gridLines: 'off' },
  },
  {
    id: 'brand',
    title: 'Dark chrome, custom accent',
    description: 'The chrome themed with --xv-* custom properties.',
    settings: { source: '12-colours', chrome: 'dark', accent: '#e8590c' },
  },
  {
    id: 'links',
    title: 'Hyperlinks',
    description: 'External, mailto and internal links; clicks appear in the event log.',
    settings: { source: '15-hyperlinks-names' },
  },
  {
    id: 'worker',
    title: 'Read in a Web Worker',
    description: 'The worker prop moves reading off the main thread.',
    settings: { source: '99-kitchen-sink', worker: true },
  },
  {
    id: 'large',
    title: '2,000,000 cells',
    description: 'A 100,000 × 20 workbook built in the browser; the grid stays virtualised.',
    settings: { source: 'large', rows: 100_000, cols: 20, bigMode: 'model' },
  },
  {
    id: 'large-xlsx',
    title: 'Write and read a big .xlsx',
    description: 'Writes 200,000 × 10 cells to .xlsx in a worker, then opens the file.',
    settings: { source: 'large', rows: 200_000, cols: 10, bigMode: 'xlsx', worker: true },
  },
];
