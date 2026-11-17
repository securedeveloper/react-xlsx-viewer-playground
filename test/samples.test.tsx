import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, waitFor } from '@testing-library/react';
import { XlsxViewer } from 'react-xlsx-viewer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/App';
import { bigWorkbook } from '../src/lib/bigWorkbook';
import { SAMPLES } from '../src/lib/samples';

const publicDir = join(__dirname, '../public/');
const sampleBytes = (id: string) => new Uint8Array(readFileSync(`${publicDir}samples/${id}.xlsx`));

describe('samples', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('lists every file in public/samples, with its size', () => {
    const files = readdirSync(`${publicDir}samples`).filter((f) => f.endsWith('.xlsx')).sort();
    expect(SAMPLES.map((s) => `${s.id}.xlsx`).sort()).toEqual(files);
    for (const s of SAMPLES) expect(sampleBytes(s.id).byteLength).toBe(s.bytes);
  });

  it('a corpus sample opens in the viewer', async () => {
    const onLoad = vi.fn();
    render(<XlsxViewer source={sampleBytes('01-values')} onLoad={onLoad} locale="en-US" style={{ height: 400 }} />);
    await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('grid')).toBeTruthy();
    expect(screen.getAllByRole('gridcell').some((c) => c.textContent === 'What')).toBe(true);
  });

  it('the generated large workbook opens', async () => {
    const onLoad = vi.fn();
    render(<XlsxViewer source={bigWorkbook(1000, 10)} onLoad={onLoad} style={{ height: 400 }} />);
    await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('grid', { name: 'Sheet: 1,000 x 10' })).toBeTruthy();
  });

  it('the app fetches the default sample and shows it, and the code tab has the snippet', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const name = String(url).replace(/^.*\/samples\//, '');
      return new Response(readFileSync(`${publicDir}samples/${name}`));
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    await waitFor(() => expect(screen.getByRole('grid')).toBeTruthy(), { timeout: 5000 });
    expect(fetchMock).toHaveBeenCalledWith('/samples/99-kitchen-sink.xlsx', expect.anything());
    expect(screen.getByText(/<XlsxViewer/)).toBeTruthy();
  });
});
