import type { Run } from '../lib/history';
import { formatBytes, formatMs, timeAgo } from '../lib/format';
import { buttonClass } from './ui';

export function History({ runs, onRestore, onClear }: { runs: readonly Run[]; onRestore: (r: Run) => void; onClear: () => void }) {
  if (!runs.length) return <p className="text-sm text-slate-600 dark:text-slate-400">Workbooks you open are listed here (kept in this browser only).</p>;
  return (
    <div className="space-y-2">
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {runs.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate font-medium">{r.name}</span>
            <span className="text-xs text-slate-600 tabular-nums dark:text-slate-400">
              {r.bytes !== null ? `${formatBytes(r.bytes)} · ` : ''}
              {formatMs(r.loadMs)}
              {r.worker ? ' · worker' : ''} · {timeAgo(r.at)}
            </span>
            {r.source === 'upload' ? (
              <span className="text-xs text-slate-600 dark:text-slate-400">local file: open it again</span>
            ) : (
              <button type="button" className={`${buttonClass} px-2 py-0.5 text-xs`} onClick={() => onRestore(r)} aria-label={`Open ${r.name} again with its settings`}>
                Restore
              </button>
            )}
          </li>
        ))}
      </ul>
      <button type="button" className={`${buttonClass} text-xs`} onClick={onClear}>
        Clear history
      </button>
    </div>
  );
}
