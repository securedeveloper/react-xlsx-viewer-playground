// A large workbook built in the browser for the performance demo: a report-like
// sheet with a frozen header row and first column, a few shared styles and a merge.
// Styles are shared objects, as an app building data would do.

import type { CellInput, Style, Workbook } from 'javascript-excel';

const HEAD: Style = { font: { bold: true, color: 'FFFFFF' }, fill: '4F4FB3', alignment: { horizontal: 'center' } };
const MONEY: Style = { numFmt: '#,##0.00;[Red]-#,##0.00' };
const PCT: Style = { numFmt: '0.0%', font: { color: '2E7D32' } };
const DATE: Style = { numFmt: 'yyyy-mm-dd' };
const BAND: Style = { fill: 'EEF0FA' };
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];

export function bigWorkbook(rows: number, cols: number): Workbook<CellInput> {
  const header: CellInput[] = [{ value: 'ID', style: HEAD }];
  for (let c = 1; c < cols; c++) header.push({ value: `Column ${c}`, style: HEAD });
  const data: CellInput[][] = [header];
  for (let r = 1; r < rows; r++) {
    const row: CellInput[] = new Array(cols);
    row[0] = { value: r, style: r % 2 === 0 ? BAND : undefined };
    for (let c = 1; c < cols; c++) {
      const k = (r + c) % 5;
      row[c] =
        k === 0
          ? REGIONS[(r * 7 + c) % REGIONS.length]!
          : k === 1
            ? { value: ((r * 37 + c * 11) % 100_000) / 4 - 5_000, style: MONEY }
            : k === 2
              ? { value: ((r * 13 + c) % 1000) / 1000, style: PCT }
              : k === 3
                ? { value: 45_000 + ((r + c * 3) % 1_500), style: DATE }
                : (r * c) % 9_973;
    }
    data.push(row);
  }
  return {
    sheets: [
      {
        name: `${rows.toLocaleString('en-US')} x ${cols}`,
        rows: data,
        colProps: [{ width: 10 }, ...Array.from({ length: cols - 1 }, () => ({ width: 13 }))],
        view: { freeze: { rows: 1, cols: 1 } },
        merges: rows > 12 && cols > 4 ? ['B6:D7'] : [],
      },
    ],
  };
}
