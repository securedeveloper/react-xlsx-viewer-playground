import { version } from 'react-xlsx-viewer';

const ISSUES = 'https://github.com/securedeveloper/react-xlsx-viewer/issues';

export function KnownIssues() {
  return (
    <details className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100">
      <summary className="cursor-pointer font-medium">Known issues in {version}: none open</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          Read-only by design: formulas show the results stored in the file and are not recalculated, and autofilter buttons are shown but
          don't filter. Charts, images, comments and conditional formatting are listed in the viewer's "not shown" notice.
        </li>
        <li>
          Fixed in this version: <code>####</code> is decided with the file font's metrics, with metric-compatible fallbacks{' '}
          (<a className="underline" href={`${ISSUES}/16`}>#16</a>), and autofilter buttons are shown (<a className="underline" href={`${ISSUES}/19`}>#19</a>).
        </li>
      </ul>
      <p className="mt-2">
        Found something else? <a className="underline" href={`${ISSUES}/new`}>Open an issue</a> with the file (or a minimal copy of it).
      </p>
    </details>
  );
}
