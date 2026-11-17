// Recent runs, kept in localStorage: what was opened, how big it was and how long it took.

import { KEYS, load, save } from './storage';

export interface Run {
  id: string;
  at: number;
  /** A sample id, 'upload' or 'large'. */
  source: string;
  name: string;
  bytes: number | null;
  sheets: number;
  cells: number;
  /** Source chosen to workbook ready (read, or build for a generated workbook). */
  loadMs: number;
  /** Workbook ready to the first painted frame of the grid. */
  paintMs: number | null;
  worker: boolean;
  /** The settings query string, to restore the run. */
  query: string;
}

export const HISTORY_LIMIT = 25;

export function loadHistory(): Run[] {
  const runs = load<unknown>(KEYS.history, []);
  return Array.isArray(runs) ? (runs.filter((r) => r && typeof r === 'object' && typeof (r as Run).id === 'string') as Run[]) : [];
}

export function addRun(runs: readonly Run[], run: Run): Run[] {
  const next = [run, ...runs].slice(0, HISTORY_LIMIT);
  save(KEYS.history, next);
  return next;
}

export function clearHistory(): Run[] {
  save(KEYS.history, []);
  return [];
}
