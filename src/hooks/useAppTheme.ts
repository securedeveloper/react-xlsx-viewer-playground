import { useCallback, useEffect, useState } from 'react';
import { KEYS, load, save } from '../lib/storage';

export type AppTheme = 'light' | 'dark' | 'system';

function systemDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

/** The playground's own theme: light, dark or the OS setting. public/theme-init.js applies it before first paint. */
export function useAppTheme(): { theme: AppTheme; dark: boolean; cycle: () => void } {
  const [theme, setTheme] = useState<AppTheme>(() => {
    const t = load<string>(KEYS.theme, 'system');
    return t === 'light' || t === 'dark' ? t : 'system';
  });
  const [osDark, setOsDark] = useState(systemDark);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const on = (e: MediaQueryListEvent) => setOsDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const dark = theme === 'dark' || (theme === 'system' && osDark);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const cycle = useCallback(() => {
    setTheme((t) => {
      const next: AppTheme = t === 'system' ? (osDark ? 'light' : 'dark') : t === 'dark' ? 'light' : 'dark';
      save(KEYS.theme, next);
      return next;
    });
  }, [osDark]);

  return { theme, dark, cycle };
}
