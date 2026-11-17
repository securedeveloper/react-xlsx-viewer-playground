import { DEFAULT_LABELS } from 'react-xlsx-viewer';
import { describe, expect, it } from 'vitest';
import { LABEL_PRESETS, STRING_LABEL_KEYS, parseCustomLabels } from './labels';

describe('labels', () => {
  it('presets only use string labels the viewer knows', () => {
    for (const preset of LABEL_PRESETS) {
      for (const key of Object.keys(preset.labels)) {
        expect(STRING_LABEL_KEYS).toContain(key);
        expect(typeof DEFAULT_LABELS[key as keyof typeof DEFAULT_LABELS]).toBe('string');
      }
    }
  });

  it('parses custom JSON and reports what it ignores', () => {
    expect(parseCustomLabels('{"viewer":"V","sheet":"x","nope":1}')).toEqual({ labels: { viewer: 'V' }, error: 'Ignored (not a string label): sheet, nope' });
    expect(parseCustomLabels('[1]').error).toBe('Expected a JSON object.');
    expect(parseCustomLabels('{').error).toMatch(/^Invalid JSON/);
    expect(parseCustomLabels('  ')).toEqual({ labels: {}, error: null });
  });
});
