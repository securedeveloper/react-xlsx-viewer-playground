import { VERSION as engineVersion } from 'javascript-excel';
import { version } from 'react-xlsx-viewer';
import { useState } from 'react';
import { PACKAGE_MANAGERS, generateCode, installCommand, type PackageManager } from '../lib/codegen';
import type { StringLabels } from '../lib/labels';
import type { Settings } from '../lib/settings';
import { KEYS, load, save } from '../lib/storage';
import { CopyButton } from './ui';

function Code({ title, code }: { title: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
        <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{title}</span>
        <CopyButton text={code} className="rounded px-2 py-0.5 text-xs font-medium text-brand-700 hover:bg-white dark:text-brand-300 dark:hover:bg-slate-900" />
      </div>
      <pre className="overflow-x-auto bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function CodePanel({ settings, labels }: { settings: Settings; labels: StringLabels }) {
  const [pm, setPm] = useState<PackageManager>(() => {
    const v = load<string>(KEYS.pm, 'npm');
    return (PACKAGE_MANAGERS as readonly string[]).includes(v) ? (v as PackageManager) : 'npm';
  });
  const code = generateCode(settings, labels);
  const install = installCommand(pm, version, code.worker !== null, engineVersion);
  return (
    <div className="space-y-3">
      <div>
        <div role="tablist" aria-label="Package manager" className="mb-2 flex gap-1">
          {PACKAGE_MANAGERS.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={pm === p}
              onClick={() => {
                setPm(p);
                save(KEYS.pm, p);
              }}
              className={`rounded px-2 py-0.5 font-mono text-xs ${pm === p ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            >
              {p}
            </button>
          ))}
        </div>
        <Code title="Install" code={install} />
      </div>
      <Code title="Preview.tsx" code={code.tsx} />
      {code.css && <Code title="viewer.css" code={code.css} />}
      {code.worker && <Code title="excel.worker.ts" code={code.worker} />}
      <p className="text-xs text-slate-600 dark:text-slate-400">
        The playground controls zoom and sheet so it can show them here; the snippet uses <code>defaultZoom</code> and <code>defaultSheet</code>{' '}
        (uncontrolled). Pass <code>zoom</code>/<code>onZoomChange</code> to control them.
      </p>
    </div>
  );
}
