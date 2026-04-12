import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, ZoomIn, ZoomOut, LocateFixed, SlidersHorizontal } from 'lucide-react';
import { loadAllPosts } from '../utils/blogUtils';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
} from 'd3-force';

// ─── Color palette for clusters ───
const CLUSTER_COLORS = [
  '#3B82F6', '#F59E0B', '#10B981', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
];

// ─── Theme colors ───
function getTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}
const THEMES = {
  dark: {
    bg: '#0F172A',
    edgeDim: '#334155',
    edgeCross: '#475569',
    textShadow: '#0F172A',
    textColor: '#E2E8F0',
    textDimmed: '#64748B',
    nodeBorder: 'rgba(255,255,255,0.5)',
    nodeBorderDim: 'rgba(255,255,255,0.1)',
    nodeBorderActive: '#fff',
  },
  light: {
    bg: '#F8FAFC',
    edgeDim: '#CBD5E1',
    edgeCross: '#94A3B8',
    textShadow: '#F8FAFC',
    textColor: '#1E293B',
    textDimmed: '#94A3B8',
    nodeBorder: 'rgba(0,0,0,0.15)',
    nodeBorderDim: 'rgba(0,0,0,0.05)',
    nodeBorderActive: '#1E293B',
  },
};

// ─── Community detection (Louvain modularity optimization) ───
function detectCommunities(nodes, edges) {
  const adj = {};
  const strength = {}; // weighted degree of each node
  nodes.forEach(n => { adj[n.id] = {}; strength[n.id] = 0; });
  let m = 0; // total edge weight
  edges.forEach(e => {
    adj[e.source][e.target] = e.weight;
    adj[e.target][e.source] = e.weight;
    strength[e.source] += e.weight;
    strength[e.target] += e.weight;
    m += e.weight;
  });
  if (m === 0) {
    const result = {};
    nodes.forEach((n, i) => { result[n.id] = 0; });
    return result;
  }

  // Each node starts in its own community (keyed by node id)
  const community = {};
  nodes.forEach(n => { community[n.id] = n.id; });

  // Resolution > 1 favors smaller, more granular clusters
  const resolution = 1.3;

  for (let iter = 0; iter < 60; iter++) {
    let changed = false;

    // Precompute total strength per community
    const commStrength = {};
    for (const n of nodes) {
      const c = community[n.id];
      commStrength[c] = (commStrength[c] || 0) + strength[n.id];
    }

    // Deterministic order that varies per iteration
    const order = [...nodes];
    order.sort((a, b) => {
      const ha = ((a.id.charCodeAt(0) + a.id.length) * 31 + iter * 7) % 997;
      const hb = ((b.id.charCodeAt(0) + b.id.length) * 31 + iter * 7) % 997;
      return ha - hb;
    });

    for (const node of order) {
      const nid = node.id;
      const ki = strength[nid];
      const currentComm = community[nid];

      // Sum of weights from this node to each neighboring community
      const neighborCommWeights = {};
      for (const [nb, w] of Object.entries(adj[nid])) {
        const c = community[nb];
        neighborCommWeights[c] = (neighborCommWeights[c] || 0) + w;
      }

      // Current community's strength without this node
      const sigmaCurrent = (commStrength[currentComm] || 0) - ki;
      const kiInCurrent = neighborCommWeights[currentComm] || 0;

      let bestComm = currentComm;
      let bestDelta = 0;

      for (const [comm, kiIn] of Object.entries(neighborCommWeights)) {
        if (comm === currentComm) continue;
        const sigmaTot = commStrength[comm] || 0;

        // Modularity gain of moving node from currentComm to comm
        const delta = (kiIn - kiInCurrent) / m
          - resolution * ki * (sigmaTot - sigmaCurrent) / (2 * m * m);

        if (delta > bestDelta) {
          bestDelta = delta;
          bestComm = comm;
        }
      }

      if (bestComm !== currentComm) {
        // Update commStrength incrementally
        commStrength[currentComm] -= ki;
        commStrength[bestComm] = (commStrength[bestComm] || 0) + ki;
        community[nid] = bestComm;
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Remap to 0, 1, 2, … sorted by size (largest first)
  const uniqueComms = [...new Set(Object.values(community))];
  const commSizes = {};
  uniqueComms.forEach(c => { commSizes[c] = 0; });
  Object.values(community).forEach(c => { commSizes[c]++; });
  const sorted = uniqueComms.sort((a, b) => commSizes[b] - commSizes[a]);
  const remap = {};
  sorted.forEach((c, i) => { remap[c] = i; });

  const result = {};
  for (const [id, c] of Object.entries(community)) {
    result[id] = remap[c];
  }
  return result;
}

// ─── Build graph data from posts ───
function buildGraphData(posts, minFreq = 3, minCoOccurrence = 2) {
  const tagCount = {};
  const pairCount = {};
  const tagPosts = {};

  posts.forEach(post => {
    const tags = post.tags || [];
    tags.forEach(t => {
      tagCount[t] = (tagCount[t] || 0) + 1;
      if (!tagPosts[t]) tagPosts[t] = [];
      tagPosts[t].push(post);
    });
    const sorted = [...new Set(tags)].sort();
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const key = `${sorted[i]}|||${sorted[j]}`;
        pairCount[key] = (pairCount[key] || 0) + 1;
      }
    }
  });

  const keepTags = new Set(
    Object.entries(tagCount).filter(([, c]) => c >= minFreq).map(([t]) => t)
  );

  const nodes = [];
  keepTags.forEach(t => {
    nodes.push({ id: t, freq: tagCount[t], posts: tagPosts[t] || [] });
  });

  const edges = [];
  Object.entries(pairCount).forEach(([key, w]) => {
    const [a, b] = key.split('|||');
    if (keepTags.has(a) && keepTags.has(b) && w >= minCoOccurrence) {
      edges.push({ source: a, target: b, weight: w });
    }
  });

  const connected = new Set();
  edges.forEach(e => { connected.add(e.source); connected.add(e.target); });
  const filteredNodes = nodes.filter(n => connected.has(n.id));

  const communities = detectCommunities(filteredNodes, edges);
  filteredNodes.forEach(n => { n.community = communities[n.id] || 0; });

  const clusterLabels = {};
  filteredNodes.forEach(n => {
    if (!clusterLabels[n.community] || n.freq > clusterLabels[n.community].freq) {
      clusterLabels[n.community] = { label: n.id, freq: n.freq };
    }
  });

  return { nodes: filteredNodes, edges, tagCount, tagPosts, clusterLabels };
}

// ─── Main component ───
export default function BlogGraphPage() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const simRef = useRef(null);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedTag, setHighlightedTag] = useState(null);
  const [minFreq, setMinFreq] = useState(3);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [controlsOpen, setControlsOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDark, setIsDark] = useState(getTheme() === 'dark');

  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const dragRef = useRef({ dragging: false, dragNode: null, panStart: null, lastMouse: null });
  // Use a ref to always hold the latest draw function so the simulation tick never goes stale
  const drawRef = useRef(null);

  // Sync dark mode
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(getTheme() === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const theme = isDark ? THEMES.dark : THEMES.light;

  // Hide body overflow while graph is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Load posts
  useEffect(() => {
    loadAllPosts().then(data => { setPosts(data); setLoading(false); });
  }, []);

  // Resize handling — use ResizeObserver so we pick up the container
  // as soon as it mounts (after the loading screen goes away)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading]);

  // Build graph
  const filteredPosts = useMemo(() => {
    if (categoryFilter === 'all') return posts;
    return posts.filter(p => p.category === categoryFilter);
  }, [posts, categoryFilter]);

  const graphData = useMemo(() => {
    if (filteredPosts.length === 0) return null;
    const mf = categoryFilter !== 'all' ? Math.min(minFreq, 2) : minFreq;
    return buildGraphData(filteredPosts, mf);
  }, [filteredPosts, minFreq, categoryFilter]);

  // ─── Drawing ───
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graphData) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    if (!width || !height) return;
    const dpr = window.devicePixelRatio || 1;
    const { nodes, edges } = graphData;
    if (nodes.length === 0) return;
    const maxFreq = Math.max(...nodes.map(n => n.freq)) || 1;
    const maxWeight = edges.length > 0 ? Math.max(...edges.map(e => e.weight)) : 1;
    const th = isDark ? THEMES.dark : THEMES.light;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const t = transformRef.current;
    ctx.clearRect(0, 0, width, height);
    // Background
    ctx.fillStyle = th.bg;
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(t.k, t.k);

    const activeNode = hoveredNode || selectedNode || highlightedTag;
    const activeNeighbors = new Set();
    if (activeNode) {
      edges.forEach(e => {
        const src = typeof e.source === 'object' ? e.source.id : e.source;
        const tgt = typeof e.target === 'object' ? e.target.id : e.target;
        if (src === activeNode) activeNeighbors.add(tgt);
        if (tgt === activeNode) activeNeighbors.add(src);
      });
    }

    // Draw edges
    edges.forEach(e => {
      const src = typeof e.source === 'object' ? e.source : nodes.find(n => n.id === e.source);
      const tgt = typeof e.target === 'object' ? e.target : nodes.find(n => n.id === e.target);
      if (!src || !tgt || !isFinite(src.x) || !isFinite(tgt.x)) return;

      const ratio = e.weight / maxWeight;
      let alpha = 0.06 + ratio * 0.25;
      let lineWidth = 0.5 + ratio * 2.5;

      if (activeNode) {
        const srcId = src.id;
        const tgtId = tgt.id;
        if (srcId === activeNode || tgtId === activeNode) {
          alpha = 0.4 + ratio * 0.5;
          lineWidth *= 1.5;
          ctx.strokeStyle = CLUSTER_COLORS[src.community % CLUSTER_COLORS.length];
        } else {
          alpha = 0.02;
          ctx.strokeStyle = th.edgeDim;
        }
      } else {
        if (src.community === tgt.community) {
          ctx.strokeStyle = CLUSTER_COLORS[src.community % CLUSTER_COLORS.length];
          alpha *= 1.3;
        } else {
          ctx.strokeStyle = th.edgeCross;
          alpha *= (isDark ? 1 : 0.5);
        }
      }

      ctx.globalAlpha = Math.min(alpha, 0.8);
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(n => {
      if (!isFinite(n.x) || !isFinite(n.y)) return;
      const ratio = n.freq / maxFreq;
      const r = 5 + ratio * 28;
      const color = CLUSTER_COLORS[n.community % CLUSTER_COLORS.length];
      const isActive = n.id === activeNode;
      const isNeighbor = activeNeighbors.has(n.id);
      const dimmed = activeNode && !isActive && !isNeighbor;

      // Glow for large nodes
      if (ratio >= 0.35 && !dimmed) {
        const gradient = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, r * 2.5);
        gradient.addColorStop(0, color + (isDark ? '30' : '25'));
        gradient.addColorStop(1, color + '00');
        ctx.globalAlpha = isActive ? 0.6 : 0.3;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node circle
      ctx.globalAlpha = dimmed ? 0.15 : isActive ? 1 : 0.92;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = dimmed ? th.nodeBorderDim : isActive ? th.nodeBorderActive : th.nodeBorder;
      ctx.lineWidth = isActive ? 2.5 : ratio > 0.3 ? 1.2 : 0.5;
      ctx.stroke();

      // Label
      const fontSize = Math.max(9, 8 + ratio * 14);
      ctx.font = `${ratio > 0.25 ? 'bold ' : ''}${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = dimmed ? 0.08 : isActive ? 1 : 0.45 + ratio * 0.55;

      // Text shadow for readability
      const labelY = n.y + r + fontSize * 0.7;
      ctx.fillStyle = th.textShadow;
      const shadowOffsets = isDark ? [-1, 0, 1] : [-1, 0, 1];
      for (const ox of shadowOffsets) {
        for (const oy of shadowOffsets) {
          if (ox === 0 && oy === 0) continue;
          ctx.fillText(n.id, n.x + ox, labelY + oy);
        }
      }
      ctx.fillStyle = dimmed ? th.textDimmed : th.textColor;
      ctx.fillText(n.id, n.x, labelY);
    });

    ctx.restore();
    ctx.globalAlpha = 1;
  }, [graphData, dimensions, hoveredNode, selectedNode, highlightedTag, isDark]);

  // Keep drawRef always up to date
  useEffect(() => { drawRef.current = draw; }, [draw]);

  // Redraw when draw changes (theme, hover, selection, etc.)
  useEffect(() => { draw(); }, [draw]);

  // ─── Run simulation ───
  useEffect(() => {
    if (!graphData || dimensions.width === 0) return;

    const { nodes, edges } = graphData;
    const { width, height } = dimensions;

    // Initialize positions
    nodes.forEach(n => {
      if (n.x === undefined || !isFinite(n.x)) {
        n.x = width / 2 + (Math.random() - 0.5) * width * 0.6;
        n.y = height / 2 + (Math.random() - 0.5) * height * 0.6;
      }
    });

    const maxFreq = Math.max(...nodes.map(n => n.freq)) || 1;

    const sim = forceSimulation(nodes)
      .force('link', forceLink(edges)
        .id(d => d.id)
        .distance(d => 140 - d.weight * 4)
        .strength(d => 0.25 + d.weight * 0.04)
      )
      .force('charge', forceManyBody()
        .strength(d => -200 - d.freq * 20)
        .distanceMax(600)
      )
      .force('center', forceCenter(width / 2, height / 2).strength(0.04))
      .force('collide', forceCollide()
        .radius(d => 16 + (d.freq / maxFreq) * 35)
        .strength(0.8)
      )
      .force('x', forceX(width / 2).strength(0.025))
      .force('y', forceY(height / 2).strength(0.025))
      .alphaDecay(0.012)
      .velocityDecay(0.35)
      .on('tick', () => {
        // Always call the latest draw via ref — no stale closure
        if (drawRef.current) drawRef.current();
      });

    simRef.current = sim;
    return () => sim.stop();
    // eslint-disable-next-line
  }, [graphData, dimensions]);

  // ─── Mouse interaction helpers ───
  const screenToWorld = useCallback((sx, sy) => {
    const t = transformRef.current;
    return { x: (sx - t.x) / t.k, y: (sy - t.y) / t.k };
  }, []);

  const findNodeAt = useCallback((wx, wy) => {
    if (!graphData) return null;
    const maxFreq = Math.max(...graphData.nodes.map(n => n.freq));
    let closest = null;
    let closestDist = Infinity;
    for (const n of graphData.nodes) {
      if (!isFinite(n.x) || !isFinite(n.y)) continue;
      const r = 5 + (n.freq / maxFreq) * 28;
      const dist = Math.sqrt((n.x - wx) ** 2 + (n.y - wy) ** 2);
      if (dist < r + 6 && dist < closestDist) {
        closest = n;
        closestDist = dist;
      }
    }
    return closest;
  }, [graphData]);

  // ─── Mouse events ───
  const handleMouseDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { x: wx, y: wy } = screenToWorld(sx, sy);
    const node = findNodeAt(wx, wy);

    if (node) {
      dragRef.current = { dragging: true, dragNode: node, panStart: null, lastMouse: { x: sx, y: sy } };
      node.fx = node.x;
      node.fy = node.y;
      simRef.current?.alphaTarget(0.1).restart();
    } else {
      dragRef.current = { dragging: true, dragNode: null, panStart: { x: sx, y: sy, tx: transformRef.current.x, ty: transformRef.current.y }, lastMouse: { x: sx, y: sy } };
    }
  }, [screenToWorld, findNodeAt]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (dragRef.current.dragging) {
      if (dragRef.current.dragNode) {
        const { x: wx, y: wy } = screenToWorld(sx, sy);
        dragRef.current.dragNode.fx = wx;
        dragRef.current.dragNode.fy = wy;
      } else if (dragRef.current.panStart) {
        const ps = dragRef.current.panStart;
        transformRef.current.x = ps.tx + (sx - ps.x);
        transformRef.current.y = ps.ty + (sy - ps.y);
        draw();
      }
      canvas.style.cursor = 'grabbing';
      return;
    }

    const { x: wx, y: wy } = screenToWorld(sx, sy);
    const node = findNodeAt(wx, wy);
    setHoveredNode(node ? node.id : null);
    canvas.style.cursor = node ? 'pointer' : 'grab';
  }, [screenToWorld, findNodeAt, draw]);

  const handleMouseUp = useCallback(() => {
    if (dragRef.current.dragNode) {
      dragRef.current.dragNode.fx = null;
      dragRef.current.dragNode.fy = null;
      simRef.current?.alphaTarget(0);
    }
    dragRef.current = { dragging: false, dragNode: null, panStart: null, lastMouse: null };
  }, []);

  const handleClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { x: wx, y: wy } = screenToWorld(sx, sy);
    const node = findNodeAt(wx, wy);
    if (node) {
      setSelectedNode(prev => prev === node.id ? null : node.id);
      setHighlightedTag(null);
    } else {
      setSelectedNode(null);
    }
  }, [screenToWorld, findNodeAt]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
    const t = transformRef.current;
    const newK = Math.max(0.2, Math.min(5, t.k * factor));
    t.x = sx - (sx - t.x) * (newK / t.k);
    t.y = sy - (sy - t.y) * (newK / t.k);
    t.k = newK;
    draw();
  }, [draw]);

  // Attach wheel with passive:false
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Touch support
  const touchRef = useRef({ lastTouch: null, lastDist: null });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouchStart = (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const sx = touch.clientX - rect.left;
        const sy = touch.clientY - rect.top;
        touchRef.current.lastTouch = { x: sx, y: sy };
        touchRef.current.lastDist = null;
        const { x: wx, y: wy } = screenToWorld(sx, sy);
        const node = findNodeAt(wx, wy);
        if (node) {
          dragRef.current = { dragging: true, dragNode: node, panStart: null, lastMouse: null };
          node.fx = node.x; node.fy = node.y;
          simRef.current?.alphaTarget(0.1).restart();
        } else {
          dragRef.current = { dragging: true, dragNode: null, panStart: { x: sx, y: sy, tx: transformRef.current.x, ty: transformRef.current.y }, lastMouse: null };
        }
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchRef.current.lastDist = Math.sqrt(dx * dx + dy * dy);
      }
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && dragRef.current.dragging) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const sx = touch.clientX - rect.left;
        const sy = touch.clientY - rect.top;
        if (dragRef.current.dragNode) {
          const { x: wx, y: wy } = screenToWorld(sx, sy);
          dragRef.current.dragNode.fx = wx;
          dragRef.current.dragNode.fy = wy;
        } else if (dragRef.current.panStart) {
          const ps = dragRef.current.panStart;
          transformRef.current.x = ps.tx + (sx - ps.x);
          transformRef.current.y = ps.ty + (sy - ps.y);
          if (drawRef.current) drawRef.current();
        }
      } else if (e.touches.length === 2 && touchRef.current.lastDist) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const factor = dist / touchRef.current.lastDist;
        const t = transformRef.current;
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect = canvas.getBoundingClientRect();
        const sx = cx - rect.left;
        const sy = cy - rect.top;
        const newK = Math.max(0.2, Math.min(5, t.k * factor));
        t.x = sx - (sx - t.x) * (newK / t.k);
        t.y = sy - (sy - t.y) * (newK / t.k);
        t.k = newK;
        touchRef.current.lastDist = dist;
        if (drawRef.current) drawRef.current();
      }
    };
    const onTouchEnd = (e) => {
      if (dragRef.current.dragNode) {
        dragRef.current.dragNode.fx = null;
        dragRef.current.dragNode.fy = null;
        simRef.current?.alphaTarget(0);
      }
      if (e.changedTouches.length === 1 && !touchRef.current.lastDist) {
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const sx = touch.clientX - rect.left;
        const sy = touch.clientY - rect.top;
        const lt = touchRef.current.lastTouch;
        if (lt && Math.abs(sx - lt.x) < 10 && Math.abs(sy - lt.y) < 10) {
          const { x: wx, y: wy } = screenToWorld(sx, sy);
          const node = findNodeAt(wx, wy);
          setSelectedNode(node ? node.id : null);
        }
      }
      dragRef.current = { dragging: false, dragNode: null, panStart: null, lastMouse: null };
      touchRef.current = { lastTouch: null, lastDist: null };
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line
  }, [screenToWorld, findNodeAt]);

  // ─── Search ───
  useEffect(() => {
    if (!searchTerm || !graphData) { setSearchResults([]); setHighlightedTag(null); return; }
    const term = searchTerm.toLowerCase();
    setSearchResults(
      graphData.nodes.filter(n => n.id.toLowerCase().includes(term)).sort((a, b) => b.freq - a.freq).slice(0, 8)
    );
  }, [searchTerm, graphData]);

  const focusOnTag = useCallback((tagId) => {
    if (!graphData) return;
    const node = graphData.nodes.find(n => n.id === tagId);
    if (!node || !dimensions.width) return;
    setHighlightedTag(tagId);
    setSelectedNode(tagId);
    setSearchTerm('');
    setSearchResults([]);
    const t = transformRef.current;
    t.x = dimensions.width / 2 - node.x * t.k;
    t.y = dimensions.height / 2 - node.y * t.k;
    draw();
  }, [graphData, dimensions, draw]);

  const zoomTo = useCallback((factor) => {
    const t = transformRef.current;
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const newK = Math.max(0.2, Math.min(5, t.k * factor));
    t.x = cx - (cx - t.x) * (newK / t.k);
    t.y = cy - (cy - t.y) * (newK / t.k);
    t.k = newK;
    draw();
  }, [dimensions, draw]);

  const centerView = useCallback(() => {
    if (!graphData || !dimensions.width) return;
    const ns = graphData.nodes.filter(n => isFinite(n.x) && isFinite(n.y));
    if (ns.length === 0) return;
    const minX = Math.min(...ns.map(n => n.x));
    const maxX = Math.max(...ns.map(n => n.x));
    const minY = Math.min(...ns.map(n => n.y));
    const maxY = Math.max(...ns.map(n => n.y));
    const gw = maxX - minX || 1;
    const gh = maxY - minY || 1;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const k = Math.min(dimensions.width / (gw + 120), dimensions.height / (gh + 120), 1.5);
    transformRef.current = {
      x: dimensions.width / 2 - cx * k,
      y: dimensions.height / 2 - cy * k,
      k,
    };
    draw();
  }, [graphData, dimensions, draw]);

  // ─── Selected node info ───
  const selectedNodeData = useMemo(() => {
    if (!selectedNode || !graphData) return null;
    const node = graphData.nodes.find(n => n.id === selectedNode);
    if (!node) return null;
    const connectedTags = [];
    graphData.edges.forEach(e => {
      const src = typeof e.source === 'object' ? e.source.id : e.source;
      const tgt = typeof e.target === 'object' ? e.target.id : e.target;
      if (src === selectedNode) connectedTags.push({ tag: tgt, weight: e.weight });
      if (tgt === selectedNode) connectedTags.push({ tag: src, weight: e.weight });
    });
    connectedTags.sort((a, b) => b.weight - a.weight);
    return { ...node, connectedTags };
  }, [selectedNode, graphData]);

  // ─── Cluster legend ───
  const clusterLegend = useMemo(() => {
    if (!graphData) return [];
    const { clusterLabels, nodes } = graphData;
    return Object.entries(clusterLabels)
      .sort((a, b) => {
        const ca = nodes.filter(n => n.community === Number(a[0])).length;
        const cb = nodes.filter(n => n.community === Number(b[0])).length;
        return cb - ca;
      })
      .map(([id, { label }]) => ({
        id: Number(id),
        label,
        color: CLUSTER_COLORS[Number(id) % CLUSTER_COLORS.length],
        count: nodes.filter(n => n.community === Number(id)).length,
      }));
  }, [graphData]);

  if (loading) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${isDark ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Building knowledge graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDark ? 'bg-[#0F172A]' : 'bg-slate-50'}`} style={{ marginTop: 0, paddingTop: 0 }}>
      {/* Top bar */}
      <div className={`relative z-10 flex items-center justify-between px-4 py-3 backdrop-blur-md border-b ${isDark ? 'bg-[#0F172A]/90 border-slate-800/60' : 'bg-white/90 border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <Link to="/blog" className={`flex items-center gap-2 transition-colors text-sm ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Blog</span>
          </Link>
          <div className={`hidden sm:block h-4 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
          <h1 className={`font-semibold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Knowledge Graph</h1>
          <span className={`text-xs hidden md:inline ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {graphData?.nodes.length} topics · {graphData?.edges.length} connections
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="flex items-center">
            <Search size={14} className={`absolute left-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topics..."
              className={`w-40 sm:w-56 pl-9 pr-8 py-1.5 border rounded-lg text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 ${isDark ? 'bg-slate-800/60 border-slate-700/50 text-slate-200 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'}`}
            />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setSearchResults([]); setHighlightedTag(null); }} className={`absolute right-2 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                <X size={14} />
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className={`absolute right-0 top-full mt-1 w-64 border rounded-lg shadow-2xl overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              {searchResults.map(r => (
                <button key={r.id} onClick={() => focusOnTag(r.id)} className={`w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between ${isDark ? 'hover:bg-slate-700/60' : 'hover:bg-slate-50'}`}>
                  <span className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{r.id}</span>
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{r.freq} posts</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 relative overflow-hidden" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
        />

        {/* Zoom controls — desktop only (mobile uses pinch) */}
        <div className="absolute bottom-6 left-6 hidden sm:flex flex-col gap-2 z-10">
          {[
            { icon: <ZoomIn size={16} />, action: () => zoomTo(1.3) },
            { icon: <ZoomOut size={16} />, action: () => zoomTo(1 / 1.3) },
            { icon: <LocateFixed size={16} />, action: centerView },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} className={`w-9 h-9 border rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm ${isDark ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700/50 text-slate-400 hover:text-white' : 'bg-white/80 hover:bg-white border-slate-300/50 text-slate-500 hover:text-slate-800'}`}>
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Controls: category filter + frequency threshold */}
        {/* Mobile: collapsible toggle button */}
        <button
          onClick={() => setControlsOpen(v => !v)}
          className={`absolute bottom-4 left-4 z-10 sm:hidden w-9 h-9 border rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm ${
            controlsOpen
              ? 'bg-blue-500 text-white border-blue-400'
              : isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700/50 text-slate-400'
                : 'bg-white/80 hover:bg-white border-slate-300/50 text-slate-500'
          }`}
        >
          <SlidersHorizontal size={16} />
        </button>
        {/* Mobile: expanded controls panel */}
        {controlsOpen && (
          <div className={`absolute z-10 flex flex-col gap-2 backdrop-blur-sm border rounded-lg px-3 py-2.5
            bottom-16 left-4 sm:hidden
            ${isDark ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white/90 border-slate-300/50'}`}>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'all', label: 'All' },
                { key: 'curiosities', label: 'Curiosities' },
                { key: 'field-notes', label: 'Field Notes' },
                { key: 'research', label: 'Research' },
              ].map(cat => (
                <button
                  key={cat.key}
                  onClick={() => { setCategoryFilter(cat.key); setSelectedNode(null); setHoveredNode(null); }}
                  className={`text-[10px] px-2 py-0.5 rounded-md transition-colors whitespace-nowrap ${
                    categoryFilter === cat.key
                      ? 'bg-blue-500 text-white'
                      : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Min. freq</span>
              <input type="range" min={1} max={8} value={minFreq} onChange={(e) => setMinFreq(Number(e.target.value))} className="w-20 accent-blue-500" />
              <span className={`text-xs font-mono w-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{minFreq}</span>
            </div>
          </div>
        )}
        {/* Desktop: always visible controls */}
        <div className={`absolute z-10 hidden sm:flex flex-col gap-2 backdrop-blur-sm border rounded-lg px-4 py-2.5
          bottom-6 left-20
          ${isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-300/50'}`}>
          <div className="flex items-center gap-1.5">
            {[
              { key: 'all', label: 'All' },
              { key: 'curiosities', label: 'Curiosities' },
              { key: 'field-notes', label: 'Field Notes' },
              { key: 'research', label: 'Research' },
            ].map(cat => (
              <button
                key={cat.key}
                onClick={() => { setCategoryFilter(cat.key); setSelectedNode(null); setHoveredNode(null); }}
                className={`text-xs px-2 py-0.5 rounded-md transition-colors whitespace-nowrap ${
                  categoryFilter === cat.key
                    ? 'bg-blue-500 text-white'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Min. freq</span>
            <input type="range" min={1} max={8} value={minFreq} onChange={(e) => setMinFreq(Number(e.target.value))} className="w-28 accent-blue-500" />
            <span className={`text-xs font-mono w-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{minFreq}</span>
          </div>
        </div>

        {/* Reset view — mobile only */}
        <button onClick={centerView} className={`absolute bottom-4 right-4 z-10 sm:hidden w-9 h-9 border rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm ${isDark ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700/50 text-slate-400' : 'bg-white/80 hover:bg-white border-slate-300/50 text-slate-500'}`}>
          <LocateFixed size={16} />
        </button>

        {/* Cluster legend — compact on mobile */}
        <div className={`absolute top-4 left-4 z-10 backdrop-blur-sm border rounded-lg p-2 sm:p-3 max-w-[160px] sm:max-w-[200px] ${isDark ? 'bg-slate-800/70 border-slate-700/40' : 'bg-white/80 border-slate-200'}`}>
          <p className={`text-[10px] uppercase tracking-wider mb-1.5 sm:mb-2 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Clusters</p>
          <div className="space-y-1 sm:space-y-1.5">
            {clusterLegend.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className={`text-[11px] sm:text-xs truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{c.label}</span>
                <span className={`text-[10px] ml-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hover tooltip */}
        {hoveredNode && !selectedNode && graphData && (() => {
          const node = graphData.nodes.find(n => n.id === hoveredNode);
          if (!node || !isFinite(node.x)) return null;
          const t = transformRef.current;
          const sx = node.x * t.k + t.x;
          const sy = node.y * t.k + t.y;
          return (
            <div className={`absolute z-20 pointer-events-none backdrop-blur-sm border rounded-lg px-3 py-2 shadow-xl ${isDark ? 'bg-slate-800/95 border-slate-600/50' : 'bg-white/95 border-slate-200'}`} style={{ left: sx + 20, top: sy - 10, maxWidth: 220 }}>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{node.id}</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{node.freq} posts</p>
            </div>
          );
        })()}

        {/* Selected node panel — side panel on desktop, bottom sheet on mobile */}
        {selectedNodeData && (
          <div className={`absolute z-20 backdrop-blur-md border rounded-xl shadow-2xl overflow-hidden flex flex-col
            inset-x-2 bottom-2 max-h-[55vh]
            sm:inset-x-auto sm:bottom-auto sm:top-4 sm:right-4 sm:w-80 sm:max-h-[calc(100%-2rem)]
            ${isDark ? 'bg-slate-800/95 border-slate-700/60' : 'bg-white/95 border-slate-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-slate-700/40' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedNodeData.id}</h3>
                <button onClick={() => setSelectedNode(null)} className={`${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'} transition-colors`}>
                  <X size={16} />
                </button>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {selectedNodeData.freq} posts · {selectedNodeData.connectedTags.length} connected topics
              </p>
            </div>

            {selectedNodeData.connectedTags.length > 0 && (
              <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700/40' : 'border-slate-200'}`}>
                <p className={`text-[10px] uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Related Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNodeData.connectedTags.slice(0, 12).map(({ tag, weight }) => (
                    <button key={tag} onClick={() => { setSelectedNode(tag); focusOnTag(tag); }} className={`px-2 py-0.5 text-xs rounded-md transition-colors ${isDark ? 'bg-slate-700/60 hover:bg-slate-600/60 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                      {tag}
                      <span className={`ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{weight}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-3">
              <p className={`text-[10px] uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Posts</p>
              <div className="space-y-2">
                {selectedNodeData.posts.map(post => (
                  <Link key={post.slug} to={`/blog/${post.category}/${post.slug}`} className={`block p-2.5 rounded-lg transition-colors border border-transparent ${isDark ? 'bg-slate-700/30 hover:bg-slate-700/60 hover:border-slate-600/40' : 'bg-slate-50 hover:bg-slate-100 hover:border-slate-200'}`}>
                    <p className={`text-sm leading-snug font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] capitalize ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{post.category}</span>
                      <span className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>·</span>
                      <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{post.readingTime}m</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className={`p-3 border-t ${isDark ? 'border-slate-700/40' : 'border-slate-200'}`}>
              <button onClick={() => navigate(`/blog/tag/${encodeURIComponent(selectedNodeData.id)}`)} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                Filter blog by "{selectedNodeData.id}"
              </button>
            </div>
          </div>
        )}

        {/* Instructions hint — hidden when a node panel is open */}
        {!selectedNodeData && (
          <div className={`absolute bottom-6 right-6 z-10 text-[11px] text-right hidden sm:block pointer-events-none select-none ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            <p>Scroll to zoom · Drag to pan</p>
            <p>Click a node to explore</p>
          </div>
        )}
      </div>
    </div>
  );
}
