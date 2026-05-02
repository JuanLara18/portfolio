import { motion } from 'framer-motion';

/**
 * Hero side decoration. A subtle constellation of nodes connected by hairlines.
 * Evokes "knowledge graph / agent network" — on-brand for Production AI.
 *
 * Design choices:
 *   - Nodes pulse on different cycles (3-7s each) so the field feels alive
 *     without being distracting.
 *   - Edges sit at very low opacity so the type stays the hero.
 *   - One small "data pulse" travels a path through the graph on a long
 *     8-second loop, hinting at flow without demanding attention.
 *   - Hidden below lg breakpoint — on mobile the hero is centered text only.
 *   - aria-hidden because it carries no information.
 */

// Asymmetric, organic layout. NOT a regular grid.
const NODES = [
  { id: 'a', cx:  60, cy:  60, r: 4 },
  { id: 'b', cx: 200, cy:  40, r: 6 },
  { id: 'c', cx: 330, cy:  90, r: 4 },
  { id: 'd', cx:  90, cy: 180, r: 5 },
  { id: 'e', cx: 220, cy: 190, r: 7 }, // central, biggest
  { id: 'f', cx: 350, cy: 200, r: 4 },
  { id: 'g', cx:  60, cy: 310, r: 4 },
  { id: 'h', cx: 200, cy: 340, r: 5 },
  { id: 'i', cx: 330, cy: 310, r: 4 },
];

const EDGES = [
  ['a','b'], ['b','c'], ['a','d'], ['b','d'], ['b','e'],
  ['c','e'], ['c','f'], ['d','e'], ['e','f'], ['d','g'],
  ['e','h'], ['f','i'], ['g','h'], ['h','i'],
];

const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

// Path the traveling pulse follows: a → b → e → h → i → f → c → b (loop)
const PULSE_PATH = ['a', 'b', 'e', 'h', 'i', 'f', 'c', 'b'];

export default function HeroVisual() {
  const pulseCx = PULSE_PATH.map(id => nodeMap[id].cx);
  const pulseCy = PULSE_PATH.map(id => nodeMap[id].cy);

  return (
    <div
      className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[420px] xl:w-[480px] aspect-square pointer-events-none"
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
        {/* Edges — sit behind nodes, very low opacity */}
        <g className="text-cyan-700/20 dark:text-brand-accent/20">
          {EDGES.map(([from, to], i) => {
            const a = nodeMap[from];
            const b = nodeMap[to];
            return (
              <motion.line
                key={i}
                x1={a.cx}
                y1={a.cy}
                x2={b.cx}
                y2={b.cy}
                stroke="currentColor"
                strokeWidth="0.8"
                strokeLinecap="round"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{
                  duration: 5 + (i % 3),
                  repeat: Infinity,
                  delay: (i * 0.4) % 4,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </g>

        {/* Nodes — staggered pulse so the constellation breathes */}
        <g className="text-cyan-700/70 dark:text-brand-accent/80">
          {NODES.map((n, i) => (
            <motion.circle
              key={n.id}
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill="currentColor"
              animate={{
                opacity: [0.45, 0.95, 0.45],
                scale: [1, 1.08, 1],
              }}
              style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
              transition={{
                duration: 3 + (i % 4),
                repeat: Infinity,
                delay: (i * 0.35) % 3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </g>

        {/* Halo around the central node — extra visual weight */}
        <motion.circle
          cx={nodeMap.e.cx}
          cy={nodeMap.e.cy}
          r={14}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-cyan-700/30 dark:text-brand-accent/30"
          animate={{ r: [14, 22, 14], opacity: [0.5, 0.1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Traveling data pulse — small bright dot tracing a path */}
        <motion.circle
          r={3}
          fill="currentColor"
          className="text-cyan-700 dark:text-brand-accent"
          animate={{
            cx: pulseCx,
            cy: pulseCy,
            opacity: [0, 1, 1, 1, 1, 1, 1, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.05, 0.2, 0.4, 0.55, 0.7, 0.85, 1],
          }}
        />
      </svg>
    </div>
  );
}
