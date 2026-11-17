import type { Run } from '../lib/history';
import { formatBytes, formatCount, formatMs, timeAgo } from '../lib/format';

export interface BuildTiming {
  buildMs: number;
  writeMs: number | null;
  bytes: number | null;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
      <div className="text-xs text-slate-600 dark:text-slate-400">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      {hint && <div className="text-xs text-slate-600 dark:text-slate-400">{hint}</div>}
    </div>
  );
}

export function Metrics({ last, build, runs }: { last: Run | null; build: BuildTiming | null; runs: readonly Run[] }) {
  const same = last ? runs.filter((r) => r.name === last.name && r.worker === last.worker).map((r) => r.loadMs) : [];
  const best = same.length ? Math.min(...same) : null;
  return (
    <div className="space-y-3">
      {!last ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">Open a workbook to see timings.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Stat label={last.source === 'large' && last.bytes === null ? 'Build to ready' : 'Read to ready'} value={formatMs(last.loadMs)} hint={last.worker ? 'in a worker' : 'main thread'} />
          <Stat label="Ready to first paint" value={last.paintMs === null ? '–' : formatMs(last.paintMs)} hint="two animation frames" />
          <Stat label="Cells" value={formatCount(last.cells)} hint={`${last.sheets} sheet${last.sheets === 1 ? '' : 's'}`} />
          <Stat label="File size" value={last.bytes === null ? 'no file' : formatBytes(last.bytes)} hint={best !== null && same.length > 1 ? `best of ${same.length}: ${formatMs(best)}` : undefined} />
        </div>
      )}
      {build && (
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Large sheet: built the workbook object in {formatMs(build.buildMs)}
          {build.writeMs !== null && build.bytes !== null && `, wrote ${formatBytes(build.bytes)} of .xlsx in ${formatMs(build.writeMs)} (worker)`}.
        </p>
      )}
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Measured with performance.now() in this tab: from handing the viewer its source to onLoad, then to the second animation frame. Times include
        React rendering and vary with the device. The grid renders only the visible cells, so scrolling cost does not grow with the sheet.
      </p>
      {runs.length > 1 && (
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Recent timings</caption>
          <thead className="text-slate-600 dark:text-slate-400">
            <tr>
              <th className="py-1 font-medium">Workbook</th>
              <th className="py-1 font-medium">Cells</th>
              <th className="py-1 font-medium">Ready</th>
              <th className="py-1 font-medium">Paint</th>
              <th className="py-1 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {runs.slice(0, 8).map((r) => (
              <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="max-w-40 truncate py-1">{r.name}{r.worker ? ' (worker)' : ''}</td>
                <td className="py-1">{formatCount(r.cells)}</td>
                <td className="py-1">{formatMs(r.loadMs)}</td>
                <td className="py-1">{r.paintMs === null ? '–' : formatMs(r.paintMs)}</td>
                <td className="py-1">{timeAgo(r.at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
