import { LABEL_PRESETS, STRING_LABEL_KEYS } from '../lib/labels';
import { ZOOM_MAX, ZOOM_MIN, type ChromeTheme, type Settings, type Tristate } from '../lib/settings';
import { Field, Section, Toggle, buttonClass, inputClass } from './ui';

const LOCALES = [
  ['', 'Browser default'],
  ['en-US', 'English (US)'],
  ['en-GB', 'English (UK)'],
  ['de-DE', 'Deutsch'],
  ['fr-FR', 'Français'],
  ['ja-JP', '日本語'],
  ['ar-EG', 'العربية'],
] as const;

interface Props {
  settings: Settings;
  fileZoom: number | null;
  labelError: string | null;
  onChange: (patch: Partial<Settings>) => void;
  onResetZoom: () => void;
  onReset: () => void;
}

function TriSelect({ id, label, value, onChange }: { id: string; label: string; value: Tristate; onChange: (v: Tristate) => void }) {
  return (
    <Field label={label} htmlFor={id}>
      <select id={id} className={inputClass} value={value} onChange={(e) => onChange(e.target.value as Tristate)}>
        <option value="file">As the file says</option>
        <option value="on">On</option>
        <option value="off">Off</option>
      </select>
    </Field>
  );
}

export function Controls({ settings: s, fileZoom, labelError, onChange, onResetZoom, onReset }: Props) {
  const zoom = s.zoom ?? fileZoom ?? 100;
  return (
    <Section
      title="Props"
      aside={
        <button type="button" className="text-xs text-brand-700 hover:underline dark:text-brand-300" onClick={onReset}>
          Reset all
        </button>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="zoom" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              zoom: {zoom}%{s.zoom === null ? ' (uncontrolled)' : ''}
            </label>
            <button type="button" className="text-xs text-brand-700 hover:underline disabled:opacity-50 dark:text-brand-300" disabled={s.zoom === null} onClick={onResetZoom}>
              File zoom
            </button>
          </div>
          <input
            id="zoom"
            type="range"
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={5}
            value={zoom}
            onChange={(e) => onChange({ zoom: Number(e.target.value) })}
            className="w-full accent-brand-600"
          />
          <div className="flex gap-1">
            {[50, 75, 100, 150, 200].map((z) => (
              <button key={z} type="button" className={`${buttonClass} flex-1 px-1 py-0.5 text-xs`} onClick={() => onChange({ zoom: z })}>
                {z}%
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Chrome theme" htmlFor="chrome">
            <select id="chrome" className={inputClass} value={s.chrome} onChange={(e) => onChange({ chrome: e.target.value as ChromeTheme })}>
              <option value="app">Playground</option>
              <option value="system">OS setting</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Field>
          <Field label="Accent (--xv-accent)" htmlFor="accent">
            <div className="flex gap-1">
              <input
                id="accent"
                type="color"
                className="h-8 w-10 cursor-pointer rounded border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
                value={s.accent ?? '#4f4fb3'}
                onChange={(e) => onChange({ accent: e.target.value })}
              />
              <button type="button" className={`${buttonClass} px-2 text-xs`} disabled={s.accent === null} onClick={() => onChange({ accent: null })}>
                Default
              </button>
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="locale" htmlFor="locale">
            <select id="locale" className={inputClass} value={s.locale} onChange={(e) => onChange({ locale: e.target.value })}>
              {LOCALES.map(([v, name]) => (
                <option key={v} value={v}>
                  {name}
                  {v ? ` (${v})` : ''}
                </option>
              ))}
            </select>
          </Field>
          <Field label="labels" htmlFor="labels">
            <select
              id="labels"
              className={inputClass}
              value={s.labels}
              onChange={(e) => {
                const id = e.target.value;
                if (id === 'custom') {
                  const from = LABEL_PRESETS.find((p) => p.id === s.labels)?.labels ?? {};
                  onChange({ labels: 'custom', customLabels: JSON.stringify(Object.keys(from).length ? from : { viewer: 'My viewer', sheets: 'Tabs', filterButton: 'Filter (read-only)' }, null, 2) });
                } else onChange({ labels: id });
              }}
            >
              {LABEL_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="custom">Custom (JSON)</option>
            </select>
          </Field>
        </div>
        {s.labels === 'custom' && (
          <div className="space-y-1">
            <label htmlFor="custom-labels" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Custom labels (string labels only)
            </label>
            <textarea
              id="custom-labels"
              rows={6}
              spellCheck={false}
              className={`${inputClass} font-mono text-xs`}
              value={s.customLabels}
              onChange={(e) => onChange({ customLabels: e.target.value })}
              aria-describedby="custom-labels-help"
            />
            <p id="custom-labels-help" className={`text-xs ${labelError ? 'text-red-700 dark:text-red-300' : 'text-slate-600 dark:text-slate-400'}`}>
              {labelError ?? `Keys: ${STRING_LABEL_KEYS.join(', ')}`}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <TriSelect id="grid" label="showGridLines" value={s.gridLines} onChange={(gridLines) => onChange({ gridLines })} />
          <TriSelect id="heads" label="showHeaders" value={s.headers} onChange={(headers) => onChange({ headers })} />
        </div>

        <div>
          <Toggle label="showFormulaBar" checked={s.formulaBar} onChange={(formulaBar) => onChange({ formulaBar })} />
          <Toggle label="showSheetTabs" checked={s.sheetTabs} onChange={(sheetTabs) => onChange({ sheetTabs })} />
          <Toggle label="showStatusBar" checked={s.statusBar} onChange={(statusBar) => onChange({ statusBar })} />
          <Toggle label="showHiddenSheets" hint="'hidden' sheets only; 'veryHidden' never" checked={s.hiddenSheets} onChange={(hiddenSheets) => onChange({ hiddenSheets })} />
          <Toggle label="worker" hint="Read files in a Web Worker (javascript-excel/worker)" checked={s.worker} onChange={(worker) => onChange({ worker })} />
        </div>

        <div className="space-y-1">
          <label htmlFor="height" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Height: {s.height}px
          </label>
          <input id="height" type="range" min={240} max={1200} step={20} value={s.height} onChange={(e) => onChange({ height: Number(e.target.value) })} className="w-full accent-brand-600" />
        </div>
      </div>
    </Section>
  );
}
