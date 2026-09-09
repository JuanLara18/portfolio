'use strict';

/**
 * layouts.js — page geometries the series builder can render into.
 *
 * The tension this file exists to resolve: comfortable prose wants a 65-75
 * character measure, but the blog's longest code line is 124 characters. The
 * `margin` layout solves it by giving prose a narrow column and letting code
 * and diagrams overhang into a wide outer margin that otherwise holds link
 * URLs as sidenotes. The other layouts trade that off differently, which is
 * exactly what the print comparison is meant to settle.
 *
 * All measurements in mm. `overhang` is how far wide content (code, diagrams)
 * may bleed past the text column toward the outer edge; the builder derives
 * the LaTeX lengths from these numbers so geometry lives in one place.
 */

/** Trim sizes in mm, needed to work out how tall a diagram may be. */
const PAPER = {
  a4paper: { w: 210, h: 297 },
  b5paper: { w: 176, h: 250 },
  a5paper: { w: 148, h: 210 },
};

const LAYOUTS = {
  // A4 with an asymmetric Tufte-style measure: narrow prose, wide outer margin
  // carrying link URLs, code and diagrams overhanging into it.
  'a4-margin': {
    label: 'A4 · asymmetric measure with sidenotes',
    paper: 'a4paper',
    geometry: {
      inner: 20, top: 24, bottom: 28,
      textwidth: 112, marginparsep: 7, marginparwidth: 49,
    },
    body: { size: 11, leading: 15.5 },
    code: { size: 8.6, leading: 10.8 },
    overhang: 56,
    notes: 'margin',
    // One-sided on purpose. A 56mm overhang has to know which side the outer
    // margin is on, and `adjustwidth*` fixes that when the environment opens,
    // not where it lands — so a code block that starts on a recto and breaks
    // onto the next page runs off the edge. One-sided puts the margin column
    // on the same side on every page and the problem disappears; it is also
    // how this gets printed at home.
    twoside: false,
  },

  // Classic technical-book trim. One column, footnotes, no overhang: the
  // most conventional of the four and the easiest to bind.
  'b5-book': {
    label: 'B5 · classic book measure, footnotes',
    paper: 'b5paper',
    geometry: {
      inner: 20, top: 22, bottom: 26,
      textwidth: 124, marginparsep: 5, marginparwidth: 22,
    },
    body: { size: 10.5, leading: 14.5 },
    code: { size: 8.2, leading: 10.2 },
    overhang: 12,
    notes: 'foot',
    twoside: true,
  },

  // A4, wide single column. Closest to the existing PDFKit output: every code
  // line fits without wrapping, at the cost of a long prose measure.
  'a4-classic': {
    label: 'A4 · wide single column, footnotes',
    paper: 'a4paper',
    geometry: {
      inner: 28, top: 25, bottom: 30,
      textwidth: 154, marginparsep: 5, marginparwidth: 22,
    },
    body: { size: 11.5, leading: 16.5 },
    code: { size: 9, leading: 11.2 },
    overhang: 0,
    notes: 'foot',
    twoside: true,
  },

  // A5 — the most portable, the most restrictive. Print two-up on A4, fold,
  // staple. Code and wide diagrams suffer most here.
  'a5-pocket': {
    label: 'A5 · pocket booklet',
    paper: 'a5paper',
    geometry: {
      inner: 15, top: 18, bottom: 22,
      textwidth: 112, marginparsep: 4, marginparwidth: 15,
    },
    body: { size: 9.8, leading: 13.4 },
    code: { size: 7.6, leading: 9.4 },
    overhang: 6,
    notes: 'foot',
    twoside: true,
  },
};

/** Text-column width plus whatever overhang the layout allows. */
function wideWidth(layout) {
  return layout.geometry.textwidth + layout.overhang;
}

/** Height of the type area, in mm — the ceiling for a full-page diagram. */
function textHeight(layout) {
  const paper = PAPER[layout.paper];
  if (!paper) throw new Error(`No trim size recorded for "${layout.paper}"`);
  return paper.h - layout.geometry.top - layout.geometry.bottom;
}

function getLayout(name) {
  const l = LAYOUTS[name];
  if (!l) {
    throw new Error(
      `Unknown layout "${name}". Available: ${Object.keys(LAYOUTS).join(', ')}`,
    );
  }
  return { name, ...l };
}

module.exports = { LAYOUTS, PAPER, getLayout, wideWidth, textHeight };
