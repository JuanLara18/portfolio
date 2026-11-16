// Shared runtime for brand templates. brand/scripts/render.mjs injects
// window.BRAND (tokens.json) and window.LOCKUP (lockup SVG as a data URI)
// before the page loads; every template reads colours and type from here.
(function () {
  const T = window.BRAND;
  if (!T) {
    document.body.innerHTML = '<p style="font:16px sans-serif;padding:24px">Render this template with <code>npm run brand:render</code>.</p>';
    return;
  }
  const n = T.color.night;
  const root = document.documentElement.style;
  Object.entries(n).forEach(([k, v]) => root.setProperty('--' + k, v));
  ['serif', 'sans', 'mono'].forEach((f) => root.setProperty('--' + f, `"${T.font[f].family}", ${T.font[f].fallback}`));

  // Query parameters, for templates that take content (e.g. a post title).
  window.Q = new URLSearchParams(location.search);
  window.esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // The graph motif: the active one in tokens.json (motif.active), or ?motif=<id>
  // for any member of the family. Drawn by the shared library at its still frame.
  window.brandGraph = function (opacity = 1) {
    const id = Q.get('motif') || T.motif.active;
    const pal = { primary: n.primary, harmonic: n.harmonic, contrast: n.contrast, muted: n.muted };
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="overflow:visible"><g opacity="${opacity}">${BrandMotifs.motifSVG(id, pal)}</g></svg>`;
  };
  window.lockupImg = (cls) => `<img class="${cls}" src="${window.LOCKUP}" alt="Juan Lara">`;
  window.tagline = () => `<span class="p">${esc(T.verbal.tagline[0])}</span><span class="dot">.</span><br><span class="l2">${esc(T.verbal.tagline[1])}<span class="dot">.</span></span>`;
})();
