const { mathjax } = require('mathjax-full/js/mathjax.js');
const { TeX } = require('mathjax-full/js/input/tex.js');
const { SVG } = require('mathjax-full/js/output/svg.js');
const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({ packages: ['base', 'ams'] });
const svg = new SVG({ fontCache: 'local' });
const html = mathjax.document('', { InputJax: tex, OutputJax: svg });

const mathStr = 'E = mc^2 \\int_0^\\infty x^2 dx';
const node = html.convert(mathStr, { display: true });

const svgString = adaptor.innerHTML(node);
console.log(svgString);
