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
          The manual screen-reader passes (NVDA, VoiceOver, TalkBack, JAWS) were not done for 1.0.0 and are still open. axe and an
          automated check of the browser's accessibility tree run in the library's CI.
        </li>
        <li>
          Changed in this version: the first stable release. It requires javascript-excel <code>^2.0.0</code>, the engine's stable
          release. No API changes since 1.0.0-beta.0.
        </li>
      </ul>
      <p className="mt-2">
        Found something else? <a className="underline" href={`${ISSUES}/new`}>Open an issue</a> with the file (or a minimal copy of it).
      </p>
    </details>
  );
}
