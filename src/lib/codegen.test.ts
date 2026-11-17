import { describe, expect, it } from 'vitest';
import { generateCode, installCommand, viewerProps } from './codegen';
import { DEFAULT_SETTINGS, type Settings } from './settings';

const settings = (patch: Partial<Settings> = {}): Settings => ({ ...DEFAULT_SETTINGS, ...patch });

describe('generateCode', () => {
  it('emits only source and height for the default props', () => {
    const { tsx, css, worker } = generateCode(settings({ chrome: 'system' }), {});
    expect(tsx).toContain("import { XlsxViewer } from 'react-xlsx-viewer';");
    expect(tsx).toContain("import 'react-xlsx-viewer/styles.css';");
    expect(viewerProps(settings({ chrome: 'system' }), {})).toEqual(['source={file}', 'style={{ height: 560 }}']);
    expect(css).toBeNull();
    expect(worker).toBeNull();
  });

  it('maps every changed setting to its prop', () => {
    const props = viewerProps(
      settings({
        chrome: 'system',
        zoom: 75,
        sheet: 2,
        formulaBar: false,
        sheetTabs: false,
        statusBar: false,
        gridLines: 'off',
        headers: 'on',
        hiddenSheets: true,
        locale: 'de-DE',
        height: 400,
      }),
      {},
    );
    expect(props).toEqual([
      'source={file}',
      'defaultSheet={2}',
      'defaultZoom={75}',
      'showFormulaBar={false}',
      'showSheetTabs={false}',
      'showStatusBar={false}',
      'showGridLines={false}',
      'showHeaders={true}',
      'showHiddenSheets',
      "locale='de-DE'",
      'style={{ height: 400 }}',
    ]);
  });

  it('writes labels as an object literal with escaped strings', () => {
    const { tsx } = generateCode(settings({ chrome: 'system' }), { viewer: "Ana's viewer", sheets: 'Blätter' });
    expect(tsx).toContain('labels={{');
    expect(tsx).toContain("viewer: 'Ana\\'s viewer',");
    expect(tsx).toContain("sheets: 'Blätter',");
  });

  it('includes labels.filterButton', () => {
    const { tsx } = generateCode(settings({ chrome: 'system' }), { filterButton: 'Filtre (non disponible)' });
    expect(tsx).toContain("filterButton: 'Filtre (non disponible)',");
  });

  it('adds the worker prop and the worker file', () => {
    const { tsx, worker } = generateCode(settings({ chrome: 'system', worker: true }), {});
    expect(tsx).toContain("worker={() => new Worker(new URL('./excel.worker.ts', import.meta.url), { type: 'module' })}");
    expect(worker).toContain("import { exposeWorker } from 'javascript-excel/worker';");
    expect(worker).toContain('exposeWorker();');
  });

  it('themes the chrome with --xv-* custom properties through a class', () => {
    const { tsx, css } = generateCode(settings({ chrome: 'dark', accent: '#e8590c' }), {});
    expect(tsx).toContain("className='xlsx-viewer'");
    expect(tsx).toContain("import './viewer.css';");
    expect(css).toContain('.xlsx-viewer {');
    expect(css).toContain('--xv-chrome-bg: #1c1c20;');
    expect(css).toContain('--xv-accent: #e8590c;');
  });

  it("needs no CSS for the default chrome, only for an accent", () => {
    expect(generateCode(settings({ chrome: 'app' }), {}).css).toBeNull();
    expect(generateCode(settings({ chrome: 'app', accent: '#112233' }), {}).css).toBe('/* viewer.css */\n.xlsx-viewer {\n  --xv-accent: #112233;\n  --xv-selection-line: #112233;\n  --xv-focus: #112233;\n}\n');
  });
});

describe('installCommand', () => {
  it('pins the exact version for each package manager', () => {
    expect(installCommand('npm', '1.0.0-alpha.0', false, '2.0.0')).toBe('npm install react-xlsx-viewer@1.0.0-alpha.0');
    expect(installCommand('pnpm', '1.0.0-alpha.0', false, '2.0.0')).toBe('pnpm add react-xlsx-viewer@1.0.0-alpha.0');
    expect(installCommand('yarn', '1.0.0', true, '2.0.0')).toBe('yarn add react-xlsx-viewer@1.0.0 javascript-excel@2.0.0');
    expect(installCommand('bun', '1.0.0', false, '2.0.0')).toBe('bun add react-xlsx-viewer@1.0.0');
  });
});
