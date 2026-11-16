import { isChunkLoadError, withChunkRetry } from './chunkRetry';

describe('isChunkLoadError', () => {
  it('recognises webpack and browser chunk failures', () => {
    expect(isChunkLoadError(new Error('Loading chunk 7700 failed. (error: https://x/static/js/7700.5a9512aa.chunk.js)'))).toBe(true);
    expect(isChunkLoadError(new Error('Loading CSS chunk 12 failed.'))).toBe(true);
    expect(isChunkLoadError(Object.assign(new Error('x'), { name: 'ChunkLoadError' }))).toBe(true);
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://x/a.js'))).toBe(true);
  });
  it('ignores other errors', () => {
    expect(isChunkLoadError(new Error('Parse error on line 3'))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });
});

describe('withChunkRetry', () => {
  it('retries chunk failures until one succeeds', async () => {
    let calls = 0;
    const fn = async () => { calls += 1; if (calls < 3) throw new Error('Loading chunk 1 failed.'); return 'ok'; };
    await expect(withChunkRetry(fn, { baseDelay: 0 })).resolves.toBe('ok');
    expect(calls).toBe(3);
  });
  it('gives up after the retries', async () => {
    let calls = 0;
    const fn = async () => { calls += 1; throw new Error('Loading chunk 1 failed.'); };
    await expect(withChunkRetry(fn, { retries: 2, baseDelay: 0 })).rejects.toThrow('Loading chunk 1 failed.');
    expect(calls).toBe(3);
  });
  it('does not retry other errors', async () => {
    let calls = 0;
    const fn = async () => { calls += 1; throw new Error('Parse error on line 3'); };
    await expect(withChunkRetry(fn, { baseDelay: 0 })).rejects.toThrow('Parse error');
    expect(calls).toBe(1);
  });
});
