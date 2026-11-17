import { version } from 'react-xlsx-viewer';
import type { AppTheme } from '../hooks/useAppTheme';
import { CopyButton, buttonClass } from './ui';

const REPO = 'https://github.com/securedeveloper/react-xlsx-viewer';

interface Props {
  theme: AppTheme;
  dark: boolean;
  onCycleTheme: () => void;
  onShowShortcuts: () => void;
  shareUrl: () => string;
}

function Sun() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6 16 16M4 16l1.4-1.4M14.6 5.4 16 4" />
    </svg>
  );
}

function Moon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="currentColor">
      <path d="M15.5 12.8A7 7 0 0 1 7.2 4.5a7 7 0 1 0 8.3 8.3Z" />
    </svg>
  );
}

export function Header({ theme, dark, onCycleTheme, onShowShortcuts, shareUrl }: Props) {
  const linkClass = 'rounded px-1 text-sm font-medium text-slate-700 hover:text-brand-600 hover:underline dark:text-slate-300 dark:hover:text-brand-300';
  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <h1 className="text-lg font-semibold">react-xlsx-viewer playground</h1>
          <a
            href={`https://www.npmjs.com/package/react-xlsx-viewer/v/${version}`}
            className="rounded-full bg-brand-50 px-2 py-0.5 font-mono text-xs text-brand-700 hover:underline dark:bg-brand-700/30 dark:text-brand-100"
            title={`Version ${version} on npm`}
          >
            v{version}
          </a>
        </div>
        <nav aria-label="Project links" className="flex items-center gap-3">
          <a className={linkClass} href={REPO}>
            GitHub
          </a>
          <a className={linkClass} href="https://www.npmjs.com/package/react-xlsx-viewer">
            npm
          </a>
          <a className={linkClass} href={`${REPO}/blob/main/docs/api.md`}>
            Docs
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <CopyButton text={shareUrl} label="Copy share link" />
          <button type="button" className={buttonClass} onClick={onShowShortcuts} aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)">
            <kbd className="font-mono text-xs">?</kbd>
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={onCycleTheme}
            aria-label={`Theme: ${theme}. Switch to ${dark ? 'light' : 'dark'}`}
            title="Toggle theme (t)"
          >
            {dark ? <Moon /> : <Sun />}
          </button>
        </div>
      </div>
    </header>
  );
}
