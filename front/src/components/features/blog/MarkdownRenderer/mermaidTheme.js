// Brand theme for Mermaid diagrams.
//
// Built on Mermaid's `base` theme, the only one that honours every theme
// variable. Every diagram type gets a value, so none falls back to Mermaid's
// default pastels. Neutral nodes, slate lines, and the brand cyan reserved for
// emphasis: authors mark a node with `:::accent` (what the paragraph is about)
// or `:::muted` (context), never with hex colours.
//
// The categorical palette is checked for colour-vision deficiency on both
// surfaces. Keep the order: hues are assigned in sequence, never cycled.

const CATEGORICAL = {
  light: ['#0E7FA0', '#E11D48', '#6366F1', '#C27A0E', '#0E9A6E'],
  dark: ['#0E9DBB', '#E8506A', '#7477F0', '#C98410', '#16A37A'],
};

// Soft tints of the categorical hues, for filled regions with text on top.
const TINTS = {
  light: ['#E0F2F7', '#FCE7EC', '#E8E9FD', '#F8EEDB', '#DDF3EA'],
  dark: ['#0F2E3B', '#3A1622', '#1F2147', '#33260E', '#0F2E25'],
};

// One hue that deepens with time, for timeline sections.
const RAMP = {
  light: ['#F0F9FB', '#E0F2F7', '#CDE9F1', '#B8DFEA', '#A3D4E3', '#8FCADC', '#7BBFD5', '#67B5CE'],
  dark: ['#0E1C2C', '#0F2433', '#102C3B', '#113443', '#123C4B', '#134453', '#144C5B', '#155463'],
};

const SURFACE = {
  light: {
    bg: '#FFFFFF', node: '#FFFFFF', border: '#CBD5E1', text: '#0F172A', muted: '#475569',
    line: '#94A3B8', accent: '#0E7490', accentTint: '#ECFEFF', cluster: '#F8FAFC', clusterBorder: '#E2E8F0',
  },
  dark: {
    bg: '#0B1120', node: '#111B2E', border: '#334155', text: '#E2E8F0', muted: '#94A3B8',
    line: '#64748B', accent: '#22D3EE', accentTint: '#0E2A3A', cluster: '#0E1628', clusterBorder: '#1E293B',
  },
};

export const FONT_FAMILY = 'Inter, system-ui, sans-serif';

/** First keyword of a Mermaid source, e.g. `flowchart`, `timeline`, `radar-beta`. */
export const diagramType = (source) => {
  const line = source
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('%%'));
  return line ? line.split(/\s/)[0] : '';
};

const indexed = (prefix, values, count = values.length) =>
  Object.fromEntries(Array.from({ length: count }, (_, i) => [`${prefix}${i}`, values[i % values.length]]));

const themeCss = (s) => `
  .node rect, .node polygon, .node path, .node circle { stroke-width: 1px; }
  .node rect { rx: 8px; ry: 8px; }
  .cluster rect { rx: 12px; ry: 12px; stroke-width: 1px; }
  .cluster-label .nodeLabel, .cluster span { font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: ${s.muted} !important; }
  .edgeLabel, .edgeLabel p, .edgeLabel span { font-size: 12px; color: ${s.muted}; }
  .edgeLabel rect { fill: ${s.bg} !important; opacity: 1 !important; }
  .labelBkg, .edgeLabel p { background-color: ${s.bg} !important; }
  .flowchart-link { stroke-width: 1.25px; }
  .nodeLabel small { font-size: 12px; color: ${s.muted}; }
  .node.accent rect, .node.accent polygon, .node.accent circle, .node.accent path { fill: ${s.accentTint} !important; stroke: ${s.accent} !important; }
  .node.accent .nodeLabel { color: ${s.text} !important; }
  .node.muted rect, .node.muted polygon { fill: ${s.cluster} !important; stroke-dasharray: 4 3; }
  .node.muted .nodeLabel { color: ${s.muted} !important; }
  .actor { stroke-width: 1px; }
  .messageText { fill: ${s.text}; font-size: 13px; }
  .timeline-node .node-bkg { rx: 8px; }
  .nodeLabel > div[style*="flex"] { flex-direction: column; gap: 2px; }
  .nodeLabel .katex-display { margin: 0; }
  .nodeLabel .katex { font-size: 1.05em; }
`;

/**
 * Mermaid config for one colour mode and one diagram type.
 * @param {boolean} isDark
 * @param {string} type  result of diagramType()
 */
export const getMermaidConfig = (isDark, type = '') => {
  const mode = isDark ? 'dark' : 'light';
  const s = SURFACE[mode];
  const cat = CATEGORICAL[mode];
  const tint = TINTS[mode];
  let sections = tint;
  if (type === 'timeline') sections = RAMP[mode];
  if (type === 'radar-beta') sections = cat;

  const themeVariables = {
    darkMode: isDark,
    background: s.bg,
    fontFamily: FONT_FAMILY,
    fontSize: '14px',
    primaryColor: s.node, primaryTextColor: s.text, primaryBorderColor: s.border,
    secondaryColor: s.cluster, secondaryTextColor: s.text, secondaryBorderColor: s.border,
    tertiaryColor: s.cluster, tertiaryTextColor: s.text, tertiaryBorderColor: s.clusterBorder,
    mainBkg: s.node, nodeBorder: s.border, nodeTextColor: s.text, textColor: s.text,
    lineColor: s.line, defaultLinkColor: s.line, arrowheadColor: s.line,
    clusterBkg: s.cluster, clusterBorder: s.clusterBorder, titleColor: s.muted,
    edgeLabelBackground: s.bg,
    // sequence
    actorBkg: s.node, actorBorder: s.border, actorTextColor: s.text, actorLineColor: s.border,
    signalColor: s.muted, signalTextColor: s.text, labelBoxBkgColor: s.cluster, labelBoxBorderColor: s.border,
    labelTextColor: s.text, loopTextColor: s.muted, noteBkgColor: s.accentTint, noteBorderColor: s.accent,
    noteTextColor: s.text, activationBkgColor: s.accentTint, activationBorderColor: s.accent,
    sequenceNumberColor: s.bg,
    // state, class, er
    labelColor: s.text, altBackground: s.cluster, compositeBackground: s.cluster, compositeTitleBackground: s.cluster,
    specialStateColor: s.muted, innerEndBackground: s.muted,
    classText: s.text, attributeBackgroundColorOdd: s.node, attributeBackgroundColorEven: s.cluster,
    relationColor: s.line, relationLabelColor: s.muted, relationLabelBackground: s.bg,
    // sections: timeline, mindmap, kanban, treemap, radar
    ...indexed('cScale', sections, 12),
    ...indexed('cScaleLabel', [s.text], 12),
    ...indexed('cScalePeer', [s.border], 12),
    // pie
    ...Object.fromEntries(cat.map((c, i) => [`pie${i + 1}`, c])),
    pieStrokeColor: s.bg, pieStrokeWidth: '2px', pieOuterStrokeColor: s.border, pieOuterStrokeWidth: '1px',
    pieTitleTextColor: s.text, pieSectionTextColor: '#FFFFFF', pieLegendTextColor: s.text,
    // git
    ...indexed('git', cat, 8),
    ...indexed('gitBranchLabel', ['#FFFFFF'], 8),
    commitLabelColor: s.text, commitLabelBackground: s.cluster,
    tagLabelColor: s.text, tagLabelBackground: s.cluster, tagLabelBorder: s.border,
    // quadrant: the first quadrant is the one that matters
    quadrant1Fill: tint[0], quadrant2Fill: s.cluster, quadrant3Fill: s.cluster, quadrant4Fill: s.cluster,
    quadrant1TextFill: s.text, quadrant2TextFill: s.muted, quadrant3TextFill: s.muted, quadrant4TextFill: s.muted,
    quadrantPointFill: s.accent, quadrantPointTextFill: s.text,
    quadrantXAxisTextFill: s.muted, quadrantYAxisTextFill: s.muted,
    quadrantInternalBorderStrokeFill: s.border, quadrantExternalBorderStrokeFill: s.border, quadrantTitleFill: s.text,
    // journey
    ...Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`fillType${i}`, tint[i % tint.length]])),
    xyChart: {
      backgroundColor: s.bg, titleColor: s.text,
      xAxisLabelColor: s.muted, xAxisTitleColor: s.muted, xAxisTickColor: s.border, xAxisLineColor: s.border,
      yAxisLabelColor: s.muted, yAxisTitleColor: s.muted, yAxisTickColor: s.border, yAxisLineColor: s.border,
      plotColorPalette: cat.join(','),
    },
    radar: { curveOpacity: 0.12, curveStrokeWidth: 2, graticuleColor: s.border, graticuleOpacity: 0.6, axisColor: s.border, axisStrokeWidth: 1 },
    packet: { startByteColor: s.muted, endByteColor: s.muted, labelColor: s.text, titleColor: s.muted, blockStrokeColor: s.border, blockFillColor: tint[0] },
  };

  return {
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    fontFamily: FONT_FAMILY,
    // KaTeX HTML output, styled by the same katex.css as the post's own math.
    forceLegacyMathML: true,
    themeVariables,
    themeCSS: themeCss(s),
    flowchart: { htmlLabels: true, curve: 'basis', padding: 16, nodeSpacing: 40, rankSpacing: 48, wrappingWidth: 220 },
    sequence: { mirrorActors: false, actorMargin: 60, messageFontSize: 13, noteFontSize: 13, boxMargin: 8 },
    sankey: { showValues: true, linkColor: 'gradient', nodeAlignment: 'justify' },
    xyChart: { width: 720, height: 360 },
    quadrantChart: { chartWidth: 520, chartHeight: 520, pointRadius: 6, pointLabelFontSize: 12, quadrantLabelFontSize: 14 },
  };
};
