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

  // The graph motif: harmonic edges, primary nodes, exactly one contrast node.
  const N = [[18, 30], [92, 14], [140, 52], [36, 92], [104, 98], [146, 140], [24, 150], [92, 168]];
  const E = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 5], [3, 6], [6, 7], [4, 7], [5, 7]];
  window.brandGraph = function (opacity = 0.8) {
    return '<svg viewBox="0 0 170 190" xmlns="http://www.w3.org/2000/svg">'
      + E.map(([a, b]) => `<line x1="${N[a][0]}" y1="${N[a][1]}" x2="${N[b][0]}" y2="${N[b][1]}" stroke="${n.harmonic}" stroke-width="1" opacity="${opacity * 0.6}"/>`).join('')
      + N.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 4 ? 5.4 : 3.2}" fill="${i === 4 ? n.contrast : n.primary}" opacity="${i === 4 ? 1 : opacity}"/>`).join('')
      + '</svg>';
  };
  window.lockupImg = (cls) => `<img class="${cls}" src="${window.LOCKUP}" alt="Juan Lara">`;
  window.tagline = () => `<span class="p">${esc(T.verbal.tagline[0])}</span><span class="dot">.</span><br><span class="l2">${esc(T.verbal.tagline[1])}<span class="dot">.</span></span>`;
})();
