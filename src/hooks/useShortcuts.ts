import { useEffect, useRef } from 'react';

export interface Shortcut {
  /** KeyboardEvent.key, matched case-insensitively for letters. */
  key: string;
  keys: string;
  description: string;
  action: () => void;
}

/**
 * Single-key playground shortcuts. They are ignored while typing in a field and
 * inside the viewer, whose grid has its own keyboard map (Shift+? there lists it).
 */
export function useShortcuts(shortcuts: readonly Shortcut[]): void {
  const ref = useRef(shortcuts);
  useEffect(() => {
    ref.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.closest('input, textarea, select, [contenteditable="true"]') || t.closest('.xv-viewer'))) return;
      const hit = ref.current.find((s) => s.key === e.key || (/^[a-z]$/.test(s.key) && s.key === e.key.toLowerCase()));
      if (!hit) return;
      e.preventDefault();
      hit.action();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
}
