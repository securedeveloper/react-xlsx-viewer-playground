import { version } from 'react-xlsx-viewer';

const ISSUES = 'https://github.com/securedeveloper/react-xlsx-viewer/issues';

export function KnownIssues() {
  return (
    <details className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100">
      <summary className="cursor-pointer font-medium">Known issues in {version}</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          Numbers can show <code>####</code> where Calibri or Carlito isn't installed (<a className="underline" href={`${ISSUES}/16`}>#16</a>).
        </li>
        <li>
          Autofilter buttons aren't shown (<a className="underline" href={`${ISSUES}/19`}>#19</a>).
        </li>
        <li>
          Read-only by design: formulas show the results stored in the file and are not recalculated. Charts, images, comments and
          conditional formatting are listed in the viewer's "not shown" notice.
        </li>
      </ul>
      <p className="mt-2">
        Found something else? <a className="underline" href={`${ISSUES}/new`}>Open an issue</a> with the file (or a minimal copy of it).
      </p>
    </details>
  );
}
