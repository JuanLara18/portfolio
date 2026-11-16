// The motif library as a classic browser script (window.BrandMotifs), for pages
// rendered from file:// where ES module imports are blocked: templates and the book.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'motifs', 'motifs.mjs');

export function motifBrowserScript() {
  const code = fs.readFileSync(SRC, 'utf8').replace(/^export (const|function) /gm, '$1 ');
  return `(function(){\n${code}\nwindow.BrandMotifs = { getMotif, motifSVG, mountMotif, MOTIF_IDS, MOTIF_STORIES };\n})();`;
}
