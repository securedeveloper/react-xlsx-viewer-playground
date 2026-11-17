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
          The first beta: feature-complete for 1.0, fixes only from here. The manual screen-reader passes (NVDA, VoiceOver, TalkBack,
          JAWS) are still open.
        </li>
        <li>
          Changed in this version, for screen readers: grid cells are announced as read-only; an internal link is described with its sheet
          ("Link to Second sheet, A1", and "Go to Second sheet, A1" in the link chip); a link that won't open, such as a{' '}
          <code>javascript:</code> address, is described as "Link not opened: unsupported address". The corner header's name and the
          dark theme's loading and error screens were fixed too. No API changes.
        </li>
      </ul>
      <p className="mt-2">
        Found something else? <a className="underline" href={`${ISSUES}/new`}>Open an issue</a> with the file (or a minimal copy of it).
      </p>
    </details>
  );
}
