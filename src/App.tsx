import { createWorkerClient } from 'javascript-excel/worker';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent } from 'react';
import { XlsxViewer, type Selection, type Workbook, type WorkbookSource, type XlsxViewerHandle } from 'react-xlsx-viewer';
import { CodePanel } from './components/CodePanel';
import { Controls } from './components/Controls';
import { Examples } from './components/Examples';
import { Header } from './components/Header';
import { History } from './components/History';
import { Inspector, type LogEntry } from './components/Inspector';
import { KnownIssues } from './components/KnownIssues';
import { Metrics, type BuildTiming } from './components/Metrics';
import { ShortcutsDialog } from './components/ShortcutsDialog';
import { SourcePanel } from './components/SourcePanel';
import { useAppTheme } from './hooks/useAppTheme';
import { useShortcuts, type Shortcut } from './hooks/useShortcuts';
import { bigWorkbook } from './lib/bigWorkbook';
import { chromeVars } from './lib/chrome';
import { generateCode } from './lib/codegen';
import type { Example } from './lib/examples';
import { addRun, clearHistory, loadHistory, type Run } from './lib/history';
import { LABEL_PRESET_IDS, resolveLabels } from './lib/labels';
import { DEFAULT_SAMPLE, fetchSample, findSample } from './lib/samples';
import { DEFAULT_SETTINGS, ZOOM_MAX, ZOOM_MIN, parseSettings, serializeSettings, tristate, type Settings } from './lib/settings';

const newWorker = () => new Worker(new URL('./excel.worker.ts', import.meta.url), { type: 'module' });

type Tab = 'code' | 'inspect' | 'perf' | 'history';
const TABS: ReadonlyArray<[Tab, string]> = [
  ['code', 'Code'],
  ['inspect', 'Selection & events'],
  ['perf', 'Performance'],
  ['history', 'History'],
];

interface Pending {
  name: string;
  bytes: number | null;
  source: string;
}

function countCells(wb: Workbook): number {
  let n = 0;
  for (const sheet of wb.sheets) {
    for (const row of sheet.rows) {
      if (!row) continue;
      for (const cell of row) if (cell !== null && cell !== undefined) n++;
    }
  }
  return n;
}

function describe(value: unknown): string {
  if (value instanceof Error) {
    const code = (value as { code?: unknown }).code;
    return `${typeof code === 'string' ? `${code}: ` : ''}${value.message}`;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function App() {
  const { theme, dark, cycle } = useAppTheme();
  const [settings, setSettings] = useState<Settings>(() => parseSettings(window.location.search, LABEL_PRESET_IDS));
  const [upload, setUpload] = useState<File | null>(null);
  const [view, setView] = useState<{ source: WorkbookSource; info: Pending | null; rev: number }>({ source: null, info: null, rev: 0 });
  const [nonce, setNonce] = useState(0);
  const [rebuild, setRebuild] = useState(0);
  const [builtKey, setBuiltKey] = useState<string | null>(null);
  const [build, setBuild] = useState<BuildTiming | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [runs, setRuns] = useState<Run[]>(loadHistory);
  const [last, setLast] = useState<Run | null>(null);
  const [fileZoom, setFileZoom] = useState<number | null>(null);
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('code');
  const [showHelp, setShowHelp] = useState(false);
  const viewer = useRef<XlsxViewerHandle>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const startedAt = useRef(0);
  const logId = useRef(0);

  const { labels, error: labelError } = useMemo(() => resolveLabels(settings.labels, settings.customLabels), [settings.labels, settings.customLabels]);
  const query = serializeSettings(settings);

  useEffect(() => {
    const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', url);
  }, [query]);

  const addLog = useCallback((type: string, detail: string) => {
    setLog((l) => [{ id: ++logId.current, at: Date.now(), type, detail }, ...l].slice(0, 100));
  }, []);

  const show = useCallback((source: WorkbookSource, info: Pending) => {
    setView((v) => ({ source, info, rev: v.rev + 1 }));
    setSelection(null);
  }, []);

  // Load whatever the settings point at: a sample, the uploaded file or a generated workbook.
  // A link can't carry a local file, so 'upload' without one shows the default sample.
  const kind = settings.source === 'upload' && !upload ? DEFAULT_SAMPLE : settings.source;
  const { rows, cols, bigMode } = settings;
  const buildKey = kind === 'large' ? `${rows}x${cols}:${bigMode}:${rebuild}` : null;
  const busy = buildKey !== null && builtKey !== buildKey;
  useEffect(() => {
    // An uploaded file is shown by onFile, from the drop or change event.
    if (kind === 'upload') return;
    if (kind === 'large') {
      let cancelled = false;
      // Let the "Building…" state paint before the main thread is busy.
      const timer = window.setTimeout(async () => {
        try {
          const t0 = performance.now();
          const wb = bigWorkbook(rows, cols);
          const buildMs = performance.now() - t0;
          const name = `Generated ${rows.toLocaleString('en-US')} x ${cols}`;
          if (bigMode === 'model') {
            if (cancelled) return;
            setBuild({ buildMs, writeMs: null, bytes: null });
            setSourceError(null);
            show(wb, { name, bytes: null, source: 'large' });
            return;
          }
          const client = createWorkerClient(newWorker());
          try {
            const t1 = performance.now();
            const bytes = await client.write(wb);
            if (cancelled) return;
            setBuild({ buildMs, writeMs: performance.now() - t1, bytes: bytes.byteLength });
            setSourceError(null);
            show(bytes, { name: `${name}.xlsx`, bytes: bytes.byteLength, source: 'large' });
          } finally {
            client.terminate();
          }
        } catch (e) {
          if (!cancelled) setSourceError(`Could not build the workbook: ${describe(e)}`);
        } finally {
          if (!cancelled) setBuiltKey(buildKey);
        }
      }, 30);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }
    const sample = findSample(kind);
    if (!sample) return;
    const ac = new AbortController();
    fetchSample(sample.id, ac.signal).then(
      (file) => {
        setSourceError(null);
        show(file, { name: file.name, bytes: file.size, source: sample.id });
      },
      (e: unknown) => {
        if (!ac.signal.aborted) setSourceError(describe(e));
      },
    );
    return () => ac.abort();
  }, [kind, rows, cols, bigMode, buildKey, show]);

  const viewerKey = `${view.rev}:${settings.worker}:${nonce}`;
  useLayoutEffect(() => {
    startedAt.current = performance.now();
  }, [viewerKey]);

  const onLoad = useCallback(
    ({ workbook, warnings }: { workbook: Workbook; warnings: unknown[] }) => {
      const loadMs = performance.now() - startedAt.current;
      const info = view.info ?? { name: 'workbook', bytes: null, source: 'upload' };
      const run: Run = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        at: Date.now(),
        source: info.source,
        name: info.name,
        bytes: info.bytes,
        sheets: workbook.sheets.length,
        cells: countCells(workbook),
        loadMs,
        paintMs: null,
        worker: settings.worker && workbook !== view.source,
        query,
      };
      setLast(run);
      setRuns((r) => addRun(r, run));
      setFileZoom(workbook.sheets[settings.sheet]?.view?.zoom ?? workbook.sheets[0]?.view?.zoom ?? 100);
      addLog('onLoad', `${workbook.sheets.length} sheet(s), ${run.cells.toLocaleString('en-US')} cells, ${warnings.length} warning(s)`);
      const readyAt = performance.now();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const paintMs = performance.now() - readyAt;
          setLast((l) => (l && l.id === run.id ? { ...l, paintMs } : l));
          setRuns((r) => addRun(r.filter((x) => x.id !== run.id), { ...run, paintMs }));
        }),
      );
    },
    [settings.worker, settings.sheet, view, query, addLog],
  );

  const update = useCallback((patch: Partial<Settings>) => {
    setActiveExample(null);
    setSettings((s) => ({ ...s, ...patch, ...(patch.source !== undefined && patch.source !== s.source ? { sheet: 0 } : {}) }));
  }, []);

  const setZoom = useCallback((z: number) => update({ zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z))) }), [update]);
  const resetZoom = useCallback(() => {
    update({ zoom: null });
    setNonce((n) => n + 1);
  }, [update]);

  const onFile = useCallback(
    (file: File) => {
      setActiveExample(null);
      setUpload(file);
      setSourceError(null);
      setSettings((s) => ({ ...s, source: 'upload', sheet: 0 }));
      show(file, { name: file.name, bytes: file.size, source: 'upload' });
    },
    [show],
  );

  const applyExample = useCallback((e: Example) => {
    setSettings((s) => ({ ...DEFAULT_SETTINGS, height: s.height, ...e.settings }));
    setActiveExample(e.id);
    setNonce((n) => n + 1);
  }, []);

  const shareUrl = useCallback(() => window.location.href, []);
  const currentZoom = settings.zoom ?? fileZoom ?? 100;

  const shortcuts: Shortcut[] = useMemo(
    () => [
      { key: 'o', keys: 'O', description: 'Open a file', action: () => fileInput.current?.click() },
      { key: '+', keys: '+', description: 'Zoom in', action: () => setZoom(currentZoom + 10) },
      { key: '-', keys: '−', description: 'Zoom out', action: () => setZoom(currentZoom - 10) },
      { key: '0', keys: '0', description: "Back to the file's zoom", action: resetZoom },
      { key: 'g', keys: 'G', description: 'Go to a cell', action: () => { setTab('inspect'); requestAnimationFrame(() => document.getElementById('goto')?.focus()); } },
      { key: 'c', keys: 'C', description: 'Copy the generated code', action: () => void navigator.clipboard?.writeText(generateCode(settings, labels).tsx).catch(() => undefined) },
      { key: 's', keys: 'S', description: 'Copy a share link', action: () => void navigator.clipboard?.writeText(window.location.href).catch(() => undefined) },
      { key: 't', keys: 'T', description: 'Toggle light/dark theme', action: cycle },
      { key: 'v', keys: 'V', description: 'Focus the grid', action: () => viewer.current?.focus() },
      { key: '?', keys: '?', description: 'Show this help', action: () => setShowHelp(true) },
    ],
    [currentZoom, setZoom, resetZoom, settings, labels, cycle],
  );
  useShortcuts(shortcuts);

  const viewerStyle = useMemo(() => ({ height: '100%', ...chromeVars(settings.chrome, settings.accent, dark) }) as CSSProperties, [settings.chrome, settings.accent, dark]);

  const onDropViewer = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div className="min-h-screen">
      <a href="#viewer" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900">
        Skip to the viewer
      </a>
      <Header theme={theme} dark={dark} onCycleTheme={cycle} onShowShortcuts={() => setShowHelp(true)} shareUrl={shareUrl} />
      <main className="mx-auto flex max-w-screen-2xl flex-col gap-4 p-4 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <aside className="contents lg:block lg:space-y-4">
          <div className="order-1">
            <SourcePanel
              settings={settings}
              uploadName={upload?.name ?? null}
              onPick={update}
              onFile={onFile}
              onRebuild={() => setRebuild((n) => n + 1)}
              fileInputRef={fileInput}
              busy={busy}
            />
          </div>
          <div className="order-3">
            <Controls settings={settings} fileZoom={fileZoom} labelError={labelError} onChange={update} onResetZoom={resetZoom} onReset={() => { setSettings((s) => ({ ...DEFAULT_SETTINGS, source: s.source, rows: s.rows, cols: s.cols, bigMode: s.bigMode })); setNonce((n) => n + 1); }} />
          </div>
          <div className="order-4">
            <Examples onApply={applyExample} activeId={activeExample} />
          </div>
        </aside>

        <div className="order-2 min-w-0 space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            A read-only, virtualised spreadsheet viewer for React, built on javascript-excel. Pick a sample or drop your own file, change the props on
            the side and copy the code. Everything runs in this tab: no uploads, no tracking, no cookies.
          </p>
          <KnownIssues />
          {sourceError && (
            <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100">
              {sourceError}
            </p>
          )}
          <div id="viewer" className="relative max-h-[85vh]" style={{ height: settings.height }} onDragOver={(e) => e.preventDefault()} onDrop={onDropViewer}>
            <XlsxViewer
              key={viewerKey}
              ref={viewer}
              source={view.source}
              worker={settings.worker ? newWorker : false}
              defaultSheet={settings.sheet}
              zoom={settings.zoom ?? undefined}
              onZoomChange={(z) => {
                addLog('onZoomChange', `${z}%`);
                // Uncontrolled, the viewer applies each sheet's own zoom; only a controlled zoom is kept in the settings.
                if (settings.zoom === null) setFileZoom(z);
                else update({ zoom: z });
              }}
              onSheetChange={(i) => {
                addLog('onSheetChange', String(i));
                setSettings((s) => ({ ...s, sheet: i }));
              }}
              onSelectionChange={setSelection}
              showFormulaBar={settings.formulaBar}
              showSheetTabs={settings.sheetTabs}
              showStatusBar={settings.statusBar}
              showGridLines={tristate(settings.gridLines)}
              showHeaders={tristate(settings.headers)}
              showHiddenSheets={settings.hiddenSheets}
              locale={settings.locale || undefined}
              labels={labels}
              onLoad={onLoad}
              onError={(e) => addLog('onError', describe(e))}
              onWarning={(w) => addLog('onWarning', `${w.code}: ${w.message}`)}
              onHyperlink={(link) => {
                addLog('onHyperlink', link.kind === 'external' ? link.href : `sheet ${link.sheet}, ${link.ref}`);
              }}
              aria-label={view.info ? `Workbook: ${view.info.name}` : undefined}
              style={viewerStyle}
            />
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-medium dark:bg-slate-950/70" role="status">
                Building {(settings.rows * settings.cols).toLocaleString('en-US')} cells…
              </div>
            )}
          </div>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Details">
            <div role="tablist" aria-label="Details" className="flex gap-1 overflow-x-auto border-b border-slate-200 px-2 dark:border-slate-800">
              {TABS.map(([id, name]) => (
                <button
                  key={id}
                  id={`tab-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  aria-controls={`panel-${id}`}
                  tabIndex={tab === id ? 0 : -1}
                  onClick={() => setTab(id)}
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                    const i = TABS.findIndex(([t]) => t === id);
                    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length]![0];
                    setTab(next);
                    document.getElementById(`tab-${next}`)?.focus();
                  }}
                  className={`border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    tab === id ? 'border-brand-600 text-brand-700 dark:border-brand-300 dark:text-brand-300' : 'border-transparent text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="p-4">
              {tab === 'code' && <CodePanel settings={settings} labels={labels} />}
              {tab === 'inspect' && <Inspector viewer={viewer} selection={selection} log={log} onClearLog={() => setLog([])} />}
              {tab === 'perf' && <Metrics last={last} build={settings.source === 'large' ? build : null} runs={runs} />}
              {tab === 'history' && (
                <History
                  runs={runs}
                  onRestore={(r) => {
                    setSettings(parseSettings(r.query, LABEL_PRESET_IDS));
                    setActiveExample(null);
                    setNonce((n) => n + 1);
                  }}
                  onClear={() => setRuns(clearHistory())}
                />
              )}
            </div>
          </section>
        </div>
      </main>
      <footer className="mx-auto max-w-screen-2xl px-4 pb-6 text-xs text-slate-600 dark:text-slate-400">
        MIT licensed. Samples are javascript-excel's conformance corpus. Source on{' '}
        <a className="underline" href="https://github.com/securedeveloper/react-xlsx-viewer-playground">
          GitHub
        </a>
        .
      </footer>
      <ShortcutsDialog open={showHelp} onClose={() => setShowHelp(false)} shortcuts={shortcuts} />
    </div>
  );
}
