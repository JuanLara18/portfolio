/* Copied from brand/motifs/motifs.mjs by brand/scripts/build_tokens.mjs. Edit the original. */
/* eslint-disable */
// Brand motifs: four graphs with a story, each alive in its own way.
//
// Single source for the site hero, the rendered images and the brand book.
// The active motif is chosen in brand/tokens.json (motif.active).
//
// Every motif is a pure function of time: frame(t) returns how each node and
// edge looks at second t. No hidden state, so the same t gives the same picture
// in the browser, in Puppeteer and in the book. Colours are roles
// ('primary' | 'harmonic' | 'contrast' | 'muted'), resolved by the renderer.
//
// Geometry lives in a 200 x 200 box centred at (100, 100).
//
// brand/scripts/build_tokens.mjs copies this file to front/src/brand/motifs.js.

const TAU = Math.PI * 2;
const ring = (n, r, offsetDeg = 0) => Array.from({ length: n }, (_, i) => {
  const a = ((-90 + offsetDeg) / 360 + i / n) * TAU;
  return [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
});
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ease = (x) => { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const lerp = (a, b, t) => a + (b - a) * t;
const rng = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const baseEdge = (o = 0.32) => ({ c: 'harmonic', o, w: 0.85 });
const baseNode = (r = 3, o = 1) => ({ c: 'primary', r, o });

// ---------------------------------------------------------------------------
// Hamilton's Icosian game: a depth-first search for a Hamiltonian cycle on the
// dodecahedron. Finding the tour takes a search; checking it takes one lap.
// ---------------------------------------------------------------------------
function icosian() {
  const nodes = [...ring(5, 86), ...ring(5, 58), ...ring(5, 37, 36), ...ring(5, 19, 36)];
  const edges = [];
  for (let k = 0; k < 5; k++) {
    edges.push([k, (k + 1) % 5], [k, 5 + k], [5 + k, 10 + k], [5 + k, 10 + ((k + 4) % 5)], [10 + k, 15 + k], [15 + k, 15 + ((k + 1) % 5)]);
  }
  const adj = Array.from({ length: 20 }, () => []);
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const index = new Map(edges.map(([a, b], i) => [edgeKey(a, b), i]));

  // Record a DFS step by step: push (extend the path) and pop (dead end, back up).
  function search(start, seed) {
    const r = rng(seed);
    const order = adj.map((l) => [...l].sort(() => r() - 0.5));
    const steps = []; const path = [start]; const seen = new Set([start]);
    const go = (v) => {
      if (path.length === 20) return adj[v].includes(start);
      for (const w of order[v]) {
        if (seen.has(w)) continue;
        path.push(w); seen.add(w); steps.push({ path: [...path] });
        if (go(w)) return true;
        path.pop(); seen.delete(w); steps.push({ path: [...path], dead: index.get(edgeKey(v, w)) });
        if (steps.length > 600) return false;
      }
      return false;
    };
    return go(start) ? steps : null;
  }
  // Keep searches long enough to watch, short enough to finish: 70-320 steps.
  const runs = [];
  for (let seed = 1; runs.length < 6 && seed < 400; seed++) {
    const start = (seed * 7) % 20;
    if (runs.some((x) => x.start === start)) continue;
    const steps = search(start, seed);
    if (steps && steps.length >= 70 && steps.length <= 320) runs.push({ start, steps });
  }

  const RATE = 17;           // search steps per second
  const VERIFY = 1.6;        // one lap around the found cycle
  const HOLD = 2.4;          // the solution rests
  const FADE = 0.9;          // and dissolves before the next search
  const timeline = runs.map((r) => { const search = r.steps.length / RATE; return { ...r, search, total: search + VERIFY + HOLD + FADE }; });
  const cycleLength = timeline.reduce((a, r) => a + r.total, 0);

  function frame(t) {
    let u = ((t % cycleLength) + cycleLength) % cycleLength;
    let run = timeline[0];
    for (const r of timeline) { if (u < r.total) { run = r; break; } u -= r.total; }
    const E = edges.map(() => baseEdge());
    const N = nodes.map(() => baseNode(2.6, 0.55));
    const dots = [];
    const solved = run.steps[run.steps.length - 1].path;
    const tour = (light) => {
      for (let i = 0; i < 20; i++) {
        const e = E[index.get(edgeKey(solved[i], solved[(i + 1) % 20]))];
        e.c = 'primary'; e.o = 0.45 + 0.5 * light; e.w = 1.25 + 0.55 * light;
      }
      N.forEach((n) => { n.r = 3; n.o = 0.9; });
      N[run.start] = { c: 'contrast', r: 4.8, o: 1 };
    };

    if (u < run.search) {
      // Searching: the path so far, the head in amber, dead ends fading out.
      const s = Math.min(run.steps.length - 1, Math.floor(u * RATE));
      const path = run.steps[s].path;
      for (let i = s; i >= 0 && i > s - 24; i--) {
        const st = run.steps[i];
        if (st.dead === undefined) continue;
        const age = u - i / RATE;
        if (age < 1) { const e = E[st.dead]; e.o = Math.max(e.o, 0.32 + 0.5 * (1 - age)); e.w = 0.85 + 0.4 * (1 - age); }
      }
      for (let i = 0; i + 1 < path.length; i++) { const e = E[index.get(edgeKey(path[i], path[i + 1]))]; e.c = 'primary'; e.o = 0.92; e.w = 1.5; }
      path.forEach((v) => { N[v] = baseNode(3.2, 1); });
      N[path[path.length - 1]] = { c: 'contrast', r: 4.8, o: 1 };
      return { edges: E, nodes: N, dots };
    }
    u -= run.search;
    if (u < VERIFY) {
      // Verifying: one light runs the whole tour. Checking is fast.
      tour(0.35);
      const p = ease(u / VERIFY) * 20, i = Math.min(19, Math.floor(p)), f = p - i;
      const [a, b] = [nodes[solved[i]], nodes[solved[(i + 1) % 20]]];
      for (let j = 0; j <= i; j++) { const e = E[index.get(edgeKey(solved[j], solved[(j + 1) % 20]))]; e.o = 1; e.w = 2; }
      dots.push({ x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f), r: 2.6, c: 'primary', o: 1 });
      return { edges: E, nodes: N, dots };
    }
    u -= VERIFY;
    if (u < HOLD) { tour(1 - 0.35 * ease(u / HOLD)); return { edges: E, nodes: N, dots }; }
    u -= HOLD;
    tour(0.65 * (1 - u / FADE));
    const k = ease(u / FADE);
    E.forEach((e) => { if (e.c === 'primary') { e.o = lerp(e.o, 0.32, k); e.w = lerp(e.w, 0.85, k); } });
    return { edges: E, nodes: N, dots };
  }

  // Still: the solved tour, resting.
  const still = timeline[0].search + VERIFY + 0.4;
  return { nodes, edges, frame, still, period: cycleLength };
}

// ---------------------------------------------------------------------------
// Heawood graph: a node fails like a flipped bit, its neighbours restore it,
// then the figure turns one seventh and lands identical.
// ---------------------------------------------------------------------------
function heawood() {
  const nodes = ring(14, 76);
  const edges = [];
  for (let i = 0; i < 14; i++) edges.push([i, (i + 1) % 14]);
  for (let i = 0; i < 14; i += 2) edges.push([i, (i + 5) % 14]);
  const neighbours = (v) => edges.filter((e) => e.includes(v)).map((e) => (e[0] === v ? e[1] : e[0]));
  const CYCLE = 8;
  function frame(t) {
    const k = Math.floor(t / CYCLE), u = t - k * CYCLE;
    const rotate = (k + ease((u - 5.4) / 2.2)) * (360 / 7);
    const v = (k * 5 + 3) % 14, nb = neighbours(v), ph = clamp01((u - 1.2) / 3.2), err = u > 1.2 && u < 4.4;
    const N = nodes.map((_, i) => {
      if (i === 0) return { c: 'contrast', r: 5, o: 1 };
      if (i === v && err && ph < 0.45) return { c: 'muted', r: 3, o: 0.35 };
      return baseNode(nb.includes(i) && err && ph > 0.3 && ph < 0.8 ? 3.8 : 3, 1);
    });
    const E = edges.map(([a, b]) => { const on = err && ph > 0.3 && ph < 0.85 && (a === v || b === v); return { c: 'harmonic', o: on ? 0.95 : 0.55, w: on ? 1.4 : 0.9 }; });
    return { rotate, edges: E, nodes: N, dots: [] };
  }
  return { nodes, edges, frame, still: 0.5, period: CYCLE * 7 };
}

// ---------------------------------------------------------------------------
// Fano plane: two points chosen at random, and the one line through both.
// ---------------------------------------------------------------------------
function fano() {
  const [A, B, C] = ring(3, 82);
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const nodes = [A, B, C, mid(A, B), mid(B, C), mid(C, A), [100, 100]];
  const LINES = [[0, 3, 1], [1, 4, 2], [2, 5, 0], [0, 6, 4], [1, 6, 5], [2, 6, 3]];
  const edges = LINES.map(([a, , b]) => [a, b]);
  const circles = [{ cx: 100, cy: 100, r: Math.hypot(nodes[3][0] - 100, nodes[3][1] - 100), points: [3, 4, 5] }];
  const r = rng(7);
  const pairs = Array.from({ length: 48 }, () => { const a = Math.floor(r() * 7); let b; do { b = Math.floor(r() * 7); } while (b === a); return [a, b]; });
  const CYCLE = 3.4;
  function frame(t) {
    const k = Math.floor(t / CYCLE), u = (t - k * CYCLE) / CYCLE;
    const [a, b] = pairs[((k % pairs.length) + pairs.length) % pairs.length];
    const all = [...LINES, [3, 4, 5]];
    const li = all.findIndex((L) => L.includes(a) && L.includes(b));
    const third = all[li].find((x) => x !== a && x !== b);
    const pick = clamp01(u / 0.2), line = clamp01((u - 0.25) / 0.25), fade = clamp01((u - 0.8) / 0.2);
    const N = nodes.map((_, i) => {
      const sel = i === a || i === b ? pick * (1 - fade) : 0, th = i === third ? line * (1 - fade) : 0;
      return i === 6 ? { c: 'contrast', r: 5.2 + 1.4 * Math.max(sel, th), o: 1 } : baseNode(3.4 + 1.6 * sel + 1.2 * th, 1);
    });
    const on = (i) => (i === li ? line * (1 - fade) : 0);
    const E = edges.map((_, i) => ({ c: 'harmonic', o: 0.32 + 0.63 * on(i), w: 0.9 + 0.9 * on(i) }));
    const Cs = [{ c: 'harmonic', o: 0.32 + 0.63 * on(6), w: 0.9 + 0.9 * on(6) }];
    return { edges: E, circles: Cs, nodes: N, dots: [] };
  }
  return { nodes, edges, circles, frame, still: 1.5, period: CYCLE * pairs.length };
}

// ---------------------------------------------------------------------------
// Paley graph of order 13: from one number, chords to its six squares mod 13,
// drawn one after another; then the next number.
// ---------------------------------------------------------------------------
function paley() {
  const nodes = ring(13, 78);
  const QR = new Set([1, 3, 4, 9, 10, 12]);
  const edges = [];
  for (let i = 0; i < 13; i++) for (let j = i + 1; j < 13; j++) if (QR.has((j - i) % 13)) edges.push([i, j]);
  const CYCLE = 4.6;
  function frame(t) {
    const k = Math.floor(t / CYCLE), u = t - k * CYCLE, c = ((k % 13) + 13) % 13;
    const E = edges.map(() => ({ c: 'harmonic', o: 0.22, w: 0.7 }));
    const N = nodes.map((_, i) => (i === c ? { c: 'contrast', r: 5, o: 1 } : baseNode(3, 1)));
    const lines = [];
    for (let q = 1; q <= 6; q++) {
      const d = (c + q * q) % 13, s = 0.35 + (q - 1) * 0.42, grow = clamp01((u - s) / 0.35), fade = clamp01((u - 3.7) / 0.7);
      if (grow <= 0) continue;
      const [x1, y1] = nodes[c], [x2, y2] = nodes[d], g = ease(grow);
      lines.push({ x1, y1, x2: lerp(x1, x2, g), y2: lerp(y1, y2, g), c: 'harmonic', o: 0.95 * (1 - fade), w: 1.5 });
      if (grow >= 1 && fade < 1) N[d] = baseNode(3 + 1.3 * (1 - fade), 1);
    }
    return { edges: E, nodes: N, lines, dots: [] };
  }
  return { nodes, edges, frame, still: 3.2, period: CYCLE * 13 };
}

const BUILDERS = { icosian, heawood, fano, paley };
const cache = {};
export const MOTIF_IDS = Object.keys(BUILDERS);
export function getMotif(id) {
  if (!BUILDERS[id]) throw new Error(`Unknown motif "${id}". Known: ${MOTIF_IDS.join(', ')}`);
  return (cache[id] ||= { id, ...BUILDERS[id]() });
}

export const MOTIF_STORIES = {
  icosian: {
    name: "Hamilton's Icosian game", field: 'Computational complexity · P vs NP',
    story: 'In 1857 Hamilton sold a wooden puzzle: visit all twenty corners of a dodecahedron once and return home. Checking a tour takes one lap; finding one takes a search. That asymmetry is, underneath, the P vs NP question.',
    motion: 'A depth-first search explores, backs out of dead ends and leaves fading trails. When the cycle closes, one light runs the whole tour: verification is fast.',
    says: 'The hard part is not checking that it works. It is finding the way to make it work.',
  },
  heawood: {
    name: 'Heawood graph', field: 'Finite geometry · error-correcting codes',
    story: 'Fourteen nodes, a ring and seven chords: the Fano plane unfolded, and the structure of the Hamming code, the first code that corrects its own errors.',
    motion: 'A node fails like a flipped bit and its three neighbours restore it; then the figure turns one seventh and lands identical.',
    says: 'Redundancy designed so the system corrects itself.',
  },
  fano: {
    name: 'Fano plane', field: 'Finite geometry · the smallest projective plane',
    story: 'Seven points, seven lines, one of them a circle. Any two points share exactly one line; any two lines meet in exactly one point.',
    motion: 'Two points are chosen and the one line through both lights up.',
    says: 'Any two ideas share exactly one context.',
  },
  paley: {
    name: 'Paley graph of order 13', field: 'Number theory · quadratic residues',
    story: 'Thirteen numbers on a circle, joined when their difference is a square mod 13. The rosette looks random and is pure symmetry: it is identical to its own complement.',
    motion: 'From the amber number, chords to its six squares are drawn one after another.',
    says: 'What looks like noise has structure under the right arithmetic.',
  },
};

// ---------------------------------------------------------------------------
// Renderers. `palette` maps roles to any CSS colour, including
// 'rgb(var(--brand-primary))', so the site follows day and night mode.
// ---------------------------------------------------------------------------
const NS = 'http://www.w3.org/2000/svg';
const f2 = (n) => Math.round(n * 100) / 100;

/** Static SVG markup (inner content of a 0 0 200 200 viewBox) at time t. */
export function motifSVG(id, palette, t) {
  const m = getMotif(id);
  const fr = m.frame(t ?? m.still);
  const col = (c) => palette[c];
  const out = [];
  out.push(`<g${fr.rotate ? ` transform="rotate(${f2(fr.rotate)} 100 100)"` : ''}>`);
  (m.circles || []).forEach((c, i) => { const s = fr.circles[i]; out.push(`<circle cx="${f2(c.cx)}" cy="${f2(c.cy)}" r="${f2(c.r)}" fill="none" stroke="${col(s.c)}" stroke-width="${f2(s.w)}" opacity="${f2(s.o)}"/>`); });
  m.edges.forEach(([a, b], i) => { const s = fr.edges[i]; out.push(`<line x1="${f2(m.nodes[a][0])}" y1="${f2(m.nodes[a][1])}" x2="${f2(m.nodes[b][0])}" y2="${f2(m.nodes[b][1])}" stroke="${col(s.c)}" stroke-width="${f2(s.w)}" stroke-linecap="round" opacity="${f2(s.o)}"/>`); });
  (fr.lines || []).forEach((l) => out.push(`<line x1="${f2(l.x1)}" y1="${f2(l.y1)}" x2="${f2(l.x2)}" y2="${f2(l.y2)}" stroke="${col(l.c)}" stroke-width="${f2(l.w)}" stroke-linecap="round" opacity="${f2(l.o)}"/>`));
  m.nodes.forEach(([x, y], i) => { const s = fr.nodes[i]; out.push(`<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(s.r)}" fill="${col(s.c)}" opacity="${f2(s.o)}"/>`); });
  fr.dots.forEach((d) => out.push(`<circle cx="${f2(d.x)}" cy="${f2(d.y)}" r="${f2(d.r)}" fill="${col(d.c)}" opacity="${f2(d.o)}"/>`));
  out.push('</g>');
  return out.join('');
}

/**
 * Live renderer: builds the elements once inside an <svg>, update(t) restyles them.
 * options.stroke / options.node scale line widths and node radii (large displays
 * want finer lines), options.opacity dims the whole figure.
 */
export function mountMotif(svg, id, palette, options = {}) {
  const ks = options.stroke ?? 1, kn = options.node ?? 1;
  const m = getMotif(id);
  const make = (tag, parent, attrs = {}) => { const e = svg.ownerDocument.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  const g = make('g', svg);
  if (options.opacity !== undefined) g.style.opacity = options.opacity;
  const circles = (m.circles || []).map((c) => make('circle', g, { cx: c.cx, cy: c.cy, r: c.r, fill: 'none' }));
  const edges = m.edges.map(([a, b]) => make('line', g, { x1: m.nodes[a][0], y1: m.nodes[a][1], x2: m.nodes[b][0], y2: m.nodes[b][1], 'stroke-linecap': 'round' }));
  const overlay = make('g', g);
  const nodes = m.nodes.map(([x, y]) => make('circle', g, { cx: x, cy: y }));
  const dotLayer = make('g', g);
  const pool = (layer, tag, list, n) => { while (list.length < n) list.push(make(tag, layer)); list.forEach((e, i) => { e.style.display = i < n ? '' : 'none'; }); return list; };
  const lineEls = [], dotEls = [];
  const paint = (e, s, attr) => { e.style[attr] = palette[s.c]; e.style.opacity = s.o; };
  function update(t) {
    const fr = m.frame(t);
    g.setAttribute('transform', fr.rotate ? `rotate(${fr.rotate} 100 100)` : '');
    circles.forEach((e, i) => { paint(e, fr.circles[i], 'stroke'); e.style.strokeWidth = fr.circles[i].w * ks; });
    edges.forEach((e, i) => { paint(e, fr.edges[i], 'stroke'); e.style.strokeWidth = fr.edges[i].w * ks; });
    nodes.forEach((e, i) => { paint(e, fr.nodes[i], 'fill'); e.setAttribute('r', fr.nodes[i].r * kn); });
    const ls = fr.lines || [];
    pool(overlay, 'line', lineEls, ls.length).forEach((e, i) => { if (i >= ls.length) return; const l = ls[i]; e.setAttribute('x1', l.x1); e.setAttribute('y1', l.y1); e.setAttribute('x2', l.x2); e.setAttribute('y2', l.y2); e.setAttribute('stroke-linecap', 'round'); paint(e, l, 'stroke'); e.style.strokeWidth = l.w * ks; });
    pool(dotLayer, 'circle', dotEls, fr.dots.length).forEach((e, i) => { if (i >= fr.dots.length) return; const d = fr.dots[i]; e.setAttribute('cx', d.x); e.setAttribute('cy', d.y); e.setAttribute('r', d.r * kn); paint(e, d, 'fill'); });
  }
  update(m.still);
  return { update, still: m.still, period: m.period };
}
