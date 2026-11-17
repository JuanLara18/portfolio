// Cover art for a reading series, drawn from the brand's graph motifs.
//
// A series is a path through posts, so its cover is a path through a graph:
// one node per part, walking real edges of the motif (Hamilton's dodecahedron,
// the Heawood graph or the Paley graph of order 13). The faint graph is the
// field the series moves through; the bright path is the reading order, from
// an open ring (part 1) to a filled node (the last part). The motif, the
// starting node and the angle come from the series id, so every series gets
// its own cover in one shared style. Colours are brand variables, so covers
// follow day and night. No amber: it belongs to the logo node.
import { useMemo } from 'react';
import { getMotif } from '../../../brand/motifs';
import { SERIES } from '../../../data/series';

const MOTIFS = ['icosian', 'heawood', 'paley'];

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

// A simple path of `length` vertices along the graph's edges (depth-first,
// neighbours tried in a seeded order so different series take different walks).
function walk(nodeCount, edges, length, seed) {
  const adj = Array.from({ length: nodeCount }, () => []);
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const order = (v) => [...adj[v]].sort((x, y) => ((x * 7919 + seed) % 97) - ((y * 7919 + seed) % 97));
  const path = [];
  const seen = new Set();
  const dfs = (v) => {
    path.push(v); seen.add(v);
    if (path.length === length) return true;
    for (const u of order(v)) if (!seen.has(u) && dfs(u)) return true;
    path.pop(); seen.delete(v);
    return false;
  };
  for (let k = 0; k < nodeCount; k++) if (dfs((seed + k) % nodeCount)) return path;
  return path;
}

// The motif rotates through the family by the series' place in the registry,
// so neighbouring series never share a graph; the same series always gets the
// same cover wherever it appears.
export function seriesArt(id, parts) {
  const h = hash(id);
  const index = Math.max(0, SERIES.findIndex((s) => s.id === id));
  const fits = MOTIFS.filter((m) => getMotif(m).nodes.length >= parts);
  const motif = getMotif(fits[index % fits.length]);
  const path = walk(motif.nodes.length, motif.edges, Math.max(2, parts), h % 1009);
  const angle = (h % 360) * (Math.PI / 180);
  return { motif, path, angle };
}

export default function SeriesCover({ id, parts, className = '', label = true }) {
  const { motif, path, angle } = useMemo(() => seriesArt(id, parts), [id, parts]);

  // Graph in a 200x200 box, rotated, placed on the right of a 320x180 card.
  // With the part count the graph sits right; without it, centred.
  const cx = label ? 214 : 160; const cy = 90; const k = 1.02;
  const at = ([x, y]) => {
    const dx = (x - 100) * k; const dy = (y - 100) * k;
    return [cx + dx * Math.cos(angle) - dy * Math.sin(angle), cy + dx * Math.sin(angle) + dy * Math.cos(angle)];
  };
  const pts = motif.nodes.map(at);
  const onPath = new Set(path);
  const f = (n) => n.toFixed(1);

  return (
    <svg
      viewBox="0 0 320 180"
      className={`series-cover ${className}`}
      role="img"
      aria-label={`Cover: a path of ${parts} parts through a graph`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="320" height="180" fill="rgb(var(--brand-surface))" />
      <g stroke="rgb(var(--brand-harmonic))" strokeLinecap="round">
        {motif.edges.map(([a, b], i) => (
          <line key={i} x1={f(pts[a][0])} y1={f(pts[a][1])} x2={f(pts[b][0])} y2={f(pts[b][1])} strokeWidth="0.9" opacity="0.3" />
        ))}
      </g>
      <g stroke="rgb(var(--brand-primary))" strokeLinecap="round" strokeLinejoin="round">
        {path.slice(1).map((v, i) => {
          const u = path[i];
          return (
            <line
              key={i}
              x1={f(pts[u][0])} y1={f(pts[u][1])} x2={f(pts[v][0])} y2={f(pts[v][1])}
              strokeWidth="2.2"
              opacity={f(0.45 + (0.55 * (i + 1)) / Math.max(1, path.length - 1))}
            />
          );
        })}
      </g>
      {pts.map(([x, y], i) => (
        onPath.has(i) ? null : <circle key={i} cx={f(x)} cy={f(y)} r="1.6" fill="rgb(var(--brand-muted))" opacity="0.45" />
      ))}
      {path.map((v, i) => {
        const [x, y] = pts[v];
        if (i === 0) return <circle key={`p${i}`} cx={f(x)} cy={f(y)} r="5" fill="rgb(var(--brand-surface))" stroke="rgb(var(--brand-primary))" strokeWidth="2" />;
        if (i === path.length - 1) return <circle key={`p${i}`} cx={f(x)} cy={f(y)} r="5.6" fill="rgb(var(--brand-primary))" />;
        return <circle key={`p${i}`} cx={f(x)} cy={f(y)} r="3" fill="rgb(var(--brand-primary))" />;
      })}
      {label && (
        <g>
          <text x="20" y="106" fontFamily="var(--font-serif)" fontStyle="italic" fontWeight="600" fontSize="66" fill="rgb(var(--brand-text))">{parts}</text>
          <text x="23" y="134" fontFamily="var(--font-mono)" fontSize="15" letterSpacing="3" fill="rgb(var(--brand-muted))">PARTS</text>
        </g>
      )}
    </svg>
  );
}
