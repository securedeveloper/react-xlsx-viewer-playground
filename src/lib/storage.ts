// localStorage that tolerates being blocked (private windows, disabled site data).

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the playground works without it.
  }
}

export const KEYS = {
  theme: 'rxv-pg:theme',
  history: 'rxv-pg:history',
  pm: 'rxv-pg:pm',
} as const;
