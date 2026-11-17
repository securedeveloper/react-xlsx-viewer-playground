import { useState, type RefObject } from 'react';
import type { Selection, XlsxViewerHandle } from 'react-xlsx-viewer';
import { encodeCell, encodeRange } from 'javascript-excel';
import { buttonClass, inputClass } from './ui';

export interface LogEntry {
  id: number;
  at: number;
  type: string;
  detail: string;
}

function rangeText(sel: Selection | null): string {
  if (!sel) return '–';
  return sel.ranges.map((r) => (r.start.row === r.end.row && r.start.col === r.end.col ? encodeCell(r.start) : encodeRange(r))).join(', ');
}

export function Inspector({ viewer, selection, log, onClearLog }: { viewer: RefObject<XlsxViewerHandle | null>; selection: Selection | null; log: readonly LogEntry[]; onClearLog: () => void }) {
  const [target, setTarget] = useState('A1');
  const [message, setMessage] = useState<string | null>(null);
  const cells = selection ? selection.ranges.reduce((n, r) => n + (r.end.row - r.start.row + 1) * (r.end.col - r.start.col + 1), 0) : 0;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-slate-600 dark:text-slate-400">Active cell</dt>
          <dd className="font-mono">{selection ? encodeCell(selection.active) : '–'}</dd>
          <dt className="text-slate-600 dark:text-slate-400">Selection</dt>
          <dd className="font-mono break-all">{rangeText(selection)}</dd>
          <dt className="text-slate-600 dark:text-slate-400">Cells</dt>
          <dd className="font-mono">{cells.toLocaleString('en-US')}</dd>
        </dl>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={buttonClass}
            onClick={async () => {
              try {
                await viewer.current?.copy();
                setMessage('Copied the selection as TSV and HTML. Paste it into a spreadsheet.');
              } catch (e) {
                setMessage(`Copy failed: ${(e as Error).message}`);
              }
            }}
          >
            Copy selection (ref.copy)
          </button>
          <button type="button" className={buttonClass} onClick={() => viewer.current?.focus()}>
            Focus grid (ref.focus)
          </button>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              viewer.current?.scrollTo(target.trim(), { select: true });
              setMessage(null);
            } catch (err) {
              setMessage(`Can't go to ${target}: ${(err as Error).message}`);
            }
          }}
        >
          <label htmlFor="goto" className="sr-only">
            Cell to go to
          </label>
          <input id="goto" className={`${inputClass} font-mono`} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="B12 or 'Sheet 2'!B12" />
          <button type="submit" className={buttonClass}>
            Go (ref.scrollTo)
          </button>
        </form>
        {message && (
          <p role="status" className="text-xs text-slate-700 dark:text-slate-300">
            {message}
          </p>
        )}
        <p className="text-xs text-slate-600 dark:text-slate-400">
          In the grid: click and Shift+click or Shift+arrows to select, Ctrl/Cmd+C to copy, Shift+? for all shortcuts.
        </p>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Events</h3>
          <button type="button" className="text-xs text-brand-700 hover:underline dark:text-brand-300" onClick={onClearLog}>
            Clear
          </button>
        </div>
        <ol className="max-h-56 overflow-y-auto rounded-md border border-slate-200 font-mono text-xs dark:border-slate-800" aria-label="Viewer events">
          {log.length === 0 && <li className="p-2 text-slate-600 dark:text-slate-400">onLoad, onSheetChange, onZoomChange, onHyperlink, onWarning and onError appear here.</li>}
          {log.map((l) => (
            <li key={l.id} className="border-b border-slate-100 px-2 py-1 last:border-0 dark:border-slate-800">
              <span className="text-brand-700 dark:text-brand-300">{l.type}</span> <span className="break-all">{l.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
