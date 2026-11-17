import { useRef, useState, type DragEvent } from 'react';
import { formatBytes, formatCount } from '../lib/format';
import { SAMPLES, findSample } from '../lib/samples';
import { COL_CHOICES, ROW_CHOICES, type Settings } from '../lib/settings';
import { Field, Section, buttonClass, inputClass, primaryButtonClass } from './ui';

export const ACCEPT = '.xlsx,.xlsm,.xltx,.xltm,.csv,.tsv,.txt';

interface Props {
  settings: Settings;
  uploadName: string | null;
  onPick: (patch: Partial<Settings>) => void;
  onFile: (file: File) => void;
  onRebuild: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  busy: boolean;
}

export function SourcePanel({ settings, uploadName, onPick, onFile, onRebuild, fileInputRef, busy }: Props) {
  const [over, setOver] = useState(false);
  const depth = useRef(0);
  const current = findSample(settings.source);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    depth.current = 0;
    setOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <Section title="Workbook">
      <div className="space-y-3">
        <Field label="Sample (javascript-excel conformance corpus)" htmlFor="sample">
          <select
            id="sample"
            className={inputClass}
            value={current ? current.id : settings.source === 'large' ? 'large' : 'upload'}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'upload') fileInputRef.current?.click();
              else onPick({ source: v, sheet: 0 });
            }}
          >
            {SAMPLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({formatBytes(s.bytes)})
              </option>
            ))}
            <option value="large">Large sheet (generated)</option>
            <option value="upload">{uploadName ? `Your file: ${uploadName}` : 'Your own file…'}</option>
          </select>
        </Field>
        {current && <p className="text-xs text-slate-600 dark:text-slate-400">{current.covers}.</p>}

        <div
          onDragEnter={(e) => {
            e.preventDefault();
            depth.current++;
            setOver(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => {
            depth.current = Math.max(0, depth.current - 1);
            if (depth.current === 0) setOver(false);
          }}
          onDrop={onDrop}
          className={`rounded-md border-2 border-dashed p-3 text-center text-sm transition-colors ${
            over ? 'border-brand-600 bg-brand-50 dark:bg-brand-700/20' : 'border-slate-300 dark:border-slate-700'
          }`}
        >
          <p className="mb-2 text-slate-700 dark:text-slate-300">Drop an .xlsx or .csv here</p>
          <button type="button" className={buttonClass} onClick={() => fileInputRef.current?.click()}>
            Choose a file…
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-label="Open a workbook"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
              e.target.value = '';
            }}
          />
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Files are read in your browser and never uploaded.</p>
        </div>

        {settings.source === 'large' && (
          <fieldset className="space-y-2 rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <legend className="px-1 text-xs font-medium text-slate-700 dark:text-slate-300">Large sheet</legend>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Rows" htmlFor="rows">
                <select id="rows" className={inputClass} value={settings.rows} onChange={(e) => onPick({ rows: Number(e.target.value) })}>
                  {ROW_CHOICES.map((n) => (
                    <option key={n} value={n}>
                      {formatCount(n)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Columns" htmlFor="cols">
                <select id="cols" className={inputClass} value={settings.cols} onChange={(e) => onPick({ cols: Number(e.target.value) })}>
                  {COL_CHOICES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div role="radiogroup" aria-label="What the viewer gets" className="space-y-1 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="bigMode" className="accent-brand-600" checked={settings.bigMode === 'model'} onChange={() => onPick({ bigMode: 'model' })} />
                The workbook object (no file)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="bigMode" className="accent-brand-600" checked={settings.bigMode === 'xlsx'} onChange={() => onPick({ bigMode: 'xlsx' })} />
                An .xlsx written from it, then read
              </label>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {formatCount(settings.rows * settings.cols)} cells. The .xlsx is written by javascript-excel in a Web Worker.
            </p>
            <button type="button" className={primaryButtonClass} disabled={busy} onClick={onRebuild}>
              {busy ? 'Building…' : 'Rebuild'}
            </button>
          </fieldset>
        )}
      </div>
    </Section>
  );
}
