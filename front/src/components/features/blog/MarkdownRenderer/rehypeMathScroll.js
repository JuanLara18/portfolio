// Runs after rehype-katex. Wraps every display equation in
// <div class="math-display-scroll"> so the renderer can give it a sideways
// scroller (ReadingSurfaces.jsx): a long equation on a phone scrolls inside
// its own box instead of being cut off at the screen edge.

const hasClass = (node, name) => {
  const c = node.properties && node.properties.className;
  return Array.isArray(c) ? c.includes(name) : typeof c === 'string' && c.split(/\s+/).includes(name);
};

function wrap(node) {
  if (!node.children) return;
  node.children = node.children.map((child) => {
    if (child.type === 'element' && hasClass(child, 'katex-display')) {
      return {
        type: 'element',
        tagName: 'div',
        properties: { className: ['math-display-scroll'] },
        children: [child],
      };
    }
    wrap(child);
    return child;
  });
}

export default function rehypeMathScroll() {
  return (tree) => { wrap(tree); };
}
