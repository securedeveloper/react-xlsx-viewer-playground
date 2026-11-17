import { EXAMPLES, type Example } from '../lib/examples';
import { Section } from './ui';

export function Examples({ onApply, activeId }: { onApply: (e: Example) => void; activeId: string | null }) {
  return (
    <Section title="Examples">
      <ul className="space-y-1">
        {EXAMPLES.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onApply(e)}
              aria-pressed={activeId === e.id}
              className={`w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none dark:hover:bg-slate-800 ${
                activeId === e.id ? 'bg-brand-50 dark:bg-brand-700/25' : ''
              }`}
            >
              <span className="block font-medium">{e.title}</span>
              <span className="block text-xs text-slate-600 dark:text-slate-400">{e.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}
