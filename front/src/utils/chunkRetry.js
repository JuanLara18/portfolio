import { lazy } from 'react';

/**
 * Resilience for code that loads on demand (route pages, Mermaid and its diagram
 * types). A chunk request can fail for reasons that have nothing to do with the
 * code: a deploy swapping the site while a tab is open, a CDN edge still warming
 * up, a dropped connection. The site should recover on its own instead of
 * showing "Loading chunk N failed".
 *
 * 1. Retry with backoff: webpack forgets a failed chunk, so a new import()
 *    requests it again.
 * 2. If it still fails, the build the tab was loaded from is probably gone (a
 *    new version was deployed): reload once to pick up the new build. The
 *    reload is limited to once every few minutes per tab, so it can never loop.
 */
const CHUNK_ERROR = /Loading (CSS )?chunk [\w-]+ failed|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

export const isChunkLoadError = (err) =>
  Boolean(err) && (err.name === 'ChunkLoadError' || CHUNK_ERROR.test(err.message || String(err)));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Run fn, retrying only chunk-load failures: waits 0.6, 1.2, 2.4 and 4.8 s. */
export async function withChunkRetry(fn, { retries = 4, baseDelay = 600 } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      if (!isChunkLoadError(err) || attempt >= retries) throw err;
      await sleep(baseDelay * 2 ** attempt);
    }
  }
}

const RELOAD_KEY = 'jl:chunk-reload-at';
const RELOAD_WINDOW_MS = 5 * 60 * 1000;

/** Reload the page to fetch the current build. Returns false if it already did so recently. */
export function reloadForNewBuild() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < RELOAD_WINDOW_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false; // no storage: never risk a reload loop
  }
  window.location.reload();
  return true;
}

/** React.lazy with retries, and one reload if the chunk is gone for good. */
export const lazyWithRetry = (factory) =>
  lazy(() =>
    withChunkRetry(factory).catch((err) => {
      if (isChunkLoadError(err) && reloadForNewBuild()) return new Promise(() => {});
      throw err;
    })
  );
