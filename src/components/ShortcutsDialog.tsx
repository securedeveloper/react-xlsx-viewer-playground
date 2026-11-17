import { DEFAULT_LABELS } from 'react-xlsx-viewer';
import { useEffect, useRef } from 'react';
import type { Shortcut } from '../hooks/useShortcuts';
import { buttonClass } from './ui';

export function ShortcutsDialog({ open, onClose, shortcuts }: { open: boolean; onClose: () => void; shortcuts: readonly Shortcut[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="shortcuts-title"
      className="m-auto w-[min(40rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="max-h-[80vh] overflow-y-auto p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-lg font-semibold">
            Keyboard shortcuts
          </h2>
          <button type="button" className={buttonClass} onClick={onClose}>
            Close
          </button>
        </div>
        <h3 className="mb-2 text-sm font-semibold">Playground (outside the viewer)</h3>
        <table className="mb-5 w-full text-sm">
          <tbody>
            {shortcuts.map((s) => (
              <tr key={s.key} className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-1.5 pr-4">
                  <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-xs dark:border-slate-600 dark:bg-slate-800">{s.keys}</kbd>
                </td>
                <td className="py-1.5">{s.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="mb-2 text-sm font-semibold">Inside the grid (from react-xlsx-viewer)</h3>
        <table className="w-full text-sm">
          <tbody>
            {DEFAULT_LABELS.shortcutList.map(([keys, action]) => (
              <tr key={keys} className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-1.5 pr-4 font-mono text-xs">{keys}</td>
                <td className="py-1.5">{action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </dialog>
  );
}
