import { resolveInternalHref, postPath } from './postLinks';

const cats = new Map([
  ['double-descent', 'research'],
  ['model-context-protocol', 'field-notes'],
]);
const r = (href) => resolveInternalHref(href, cats);

describe('postPath', () => {
  it('builds the canonical path for a known slug', () => {
    expect(postPath('double-descent', cats)).toBe('/blog/research/double-descent');
  });
  it('returns null for an unknown slug', () => {
    expect(postPath('nope', cats)).toBeNull();
  });
});

describe('resolveInternalHref', () => {
  it('resolves the authoring form /blog/<slug>', () => {
    expect(r('/blog/double-descent')).toBe('/blog/research/double-descent');
  });
  it('keeps a #fragment', () => {
    expect(r('/blog/double-descent#the-peak')).toBe('/blog/research/double-descent#the-peak');
  });
  it('resolves legacy absolute hash-router links', () => {
    expect(r('https://juanlara18.github.io/portfolio/#/blog/model-context-protocol'))
      .toBe('/blog/field-notes/model-context-protocol');
  });
  it('resolves absolute clean links, with or without trailing slash', () => {
    expect(r('https://juanlara18.github.io/portfolio/blog/research/double-descent/'))
      .toBe('/blog/research/double-descent');
  });
  it('corrects a stale category', () => {
    expect(r('/blog/field-notes/double-descent')).toBe('/blog/research/double-descent');
  });
  it('resolves a bare #/blog link', () => {
    expect(r('#/blog/double-descent')).toBe('/blog/research/double-descent');
  });
  it('leaves blog pages alone', () => {
    expect(r('/blog/category/research')).toBe('/blog/category/research');
    expect(r('/blog/series')).toBe('/blog/series');
  });
  it('passes unknown slugs through so the router can show not-found', () => {
    expect(r('/blog/missing-post')).toBe('/blog/missing-post');
  });
  it('maps the site root', () => {
    expect(r('https://juanlara18.github.io/portfolio/')).toBe('/');
    expect(r('https://juanlara18.github.io/portfolio')).toBe('/');
  });
  it('ignores external links, in-page anchors and protocol-relative URLs', () => {
    expect(r('https://arxiv.org/abs/1706.03762')).toBeNull();
    expect(r('#section')).toBeNull();
    expect(r('//cdn.example.com/x')).toBeNull();
    expect(r('mailto:a@b.c')).toBeNull();
    expect(r('https://juanlara18.github.io/other-repo')).toBeNull();
  });
});
