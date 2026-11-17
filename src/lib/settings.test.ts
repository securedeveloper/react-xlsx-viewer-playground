import { describe, expect, it } from 'vitest';
import { LABEL_PRESET_IDS } from './labels';
import { DEFAULT_SETTINGS, parseSettings, serializeSettings, type Settings } from './settings';

const parse = (q: string) => parseSettings(q, LABEL_PRESET_IDS);

describe('URL state', () => {
  it('writes nothing for the defaults', () => {
    expect(serializeSettings({ ...DEFAULT_SETTINGS })).toBe('');
    expect(parse('')).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips every setting', () => {
    const s: Settings = {
      ...DEFAULT_SETTINGS,
      source: 'large',
      zoom: 150,
      sheet: 3,
      chrome: 'dark',
      accent: '#e8590c',
      locale: 'de-DE',
      labels: 'custom',
      customLabels: '{"viewer":"Ansicht ü"}',
      formulaBar: false,
      sheetTabs: false,
      statusBar: false,
      gridLines: 'off',
      headers: 'on',
      hiddenSheets: true,
      worker: true,
      height: 700,
      rows: 200_000,
      cols: 10,
      bigMode: 'xlsx',
    };
    expect(parse(serializeSettings(s))).toEqual(s);
  });

  it('ignores invalid values and never shares an uploaded file', () => {
    const s = parse('src=nope&zoom=9999&chrome=neon&accent=red&locale=<script>&labels=xx&rows=7&grid=maybe');
    expect(s).toEqual({ ...DEFAULT_SETTINGS, zoom: 400 });
    expect(serializeSettings({ ...DEFAULT_SETTINGS, source: 'upload' })).toBe('');
  });
});
