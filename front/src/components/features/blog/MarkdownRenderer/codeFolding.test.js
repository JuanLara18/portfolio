import { findFoldRegions, visibleLines, initialFolds } from './codeFolding';

const py = [
  'import os',                 // 0
  '',                          // 1
  'class Store:',              // 2
  '    def get(self, key):',   // 3
  '        value = self.db[key]',
  '        log(value)',
  '        return value',      // 6
  '',                          // 7
  '    def put(',              // 8
  '        self,',
  '        key,',
  '    ) -> None:',            // 11
  '        self.db[key] = 1',
  '        self.flush()',      // 13
  '',
  'def tiny():',               // 15
  '    return 1',              // 16
  '',
  'print(Store())',            // 18
].join('\n');

describe('findFoldRegions', () => {
  it('finds classes and functions, with multi-line signatures', () => {
    const r = findFoldRegions(py, 'python');
    expect(r.map(({ start, headerEnd, end, leaf }) => [start, headerEnd, end, leaf])).toEqual([
      [2, 2, 13, false],
      [3, 3, 6, true],
      [8, 11, 13, true],
    ]);
  });

  it('skips bodies too short to be worth folding', () => {
    expect(findFoldRegions(py, 'python').some((r) => r.start === 15)).toBe(false);
  });

  it('keeps the closing brace visible in brace languages', () => {
    const tf = [
      'resource "google_bigquery_dataset" "raw" {',
      '  dataset_id = "raw"',
      '  location   = "US"',
      '  labels = { env = "prod" }',
      '}',
    ].join('\n');
    const [r] = findFoldRegions(tf, 'hcl');
    expect([r.start, r.headerEnd, r.end]).toEqual([0, 0, 3]);
  });

  it('returns nothing for languages without definitions', () => {
    expect(findFoldRegions('a: 1\nb:\n  c: 2\n  d: 3\n  e: 4', 'yaml')).toEqual([]);
  });
});

describe('visibleLines', () => {
  it('replaces a folded body with one placeholder', () => {
    const regions = findFoldRegions(py, 'python');
    const lines = visibleLines(19, regions, new Set([3]));
    const fold = lines.find((l) => l.type === 'fold');
    expect(fold.hidden).toBe(3);
    expect(lines.filter((l) => l.type === 'line').map((l) => l.index)).not.toContain(4);
    expect(lines.filter((l) => l.type === 'line').map((l) => l.index)).toContain(7);
  });

  it('folding the outer region hides the inner ones', () => {
    const regions = findFoldRegions(py, 'python');
    const lines = visibleLines(19, regions, new Set([2, 3]));
    expect(lines.filter((l) => l.type === 'fold')).toHaveLength(1);
  });
});

describe('initialFolds', () => {
  it('opens short blocks in full and long ones as an outline', () => {
    const regions = findFoldRegions(py, 'python');
    expect(initialFolds(19, regions).size).toBe(0);
    expect([...initialFolds(40, regions)].sort()).toEqual([3, 8]);
  });
});
