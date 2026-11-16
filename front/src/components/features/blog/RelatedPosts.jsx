// "Keep reading": the box at the end of a post.
//
// If the post belongs to a reading series, its neighbours in the series come
// first. Then the posts closest to this one: tags shared with it, with rare
// tags counting more than common ones (a shared "Mamba" says more than a
// shared "Deep Learning"), and a small bonus for the same category.
import { Link } from 'react-router-dom';
import blogData from '../../../data/blogData.json';
import { SERIES } from '../../../data/series';
import { BLOG_CONFIG, categoryToneClass } from '../../../utils/blogUtils';

const POSTS = blogData.posts || [];

// How informative each tag is: log(N / posts with the tag).
const TAG_WEIGHT = (() => {
  const counts = new Map();
  POSTS.forEach((p) => (p.tags || []).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
  const n = POSTS.length || 1;
  const w = new Map();
  counts.forEach((c, t) => w.set(t, Math.log(n / c)));
  return w;
})();

export function relatedPosts(post, limit = 3, exclude = new Set()) {
  const mine = new Set(post.tags || []);
  return POSTS
    .filter((p) => p.slug !== post.slug && !exclude.has(p.slug))
    .map((p) => {
      let score = 0;
      (p.tags || []).forEach((t) => { if (mine.has(t)) score += TAG_WEIGHT.get(t) || 0; });
      if (p.category === post.category) score += 0.5;
      return { p, score };
    })
    .filter((x) => x.score > 1)
    .sort((a, b) => b.score - a.score || (b.p.date || '').localeCompare(a.p.date || ''))
    .slice(0, limit)
    .map((x) => x.p);
}

export function seriesNeighbours(post) {
  const bySlug = new Map(POSTS.map((p) => [p.slug, p]));
  for (const s of SERIES) {
    const slugs = (s.posts || []).filter((slug) => bySlug.has(slug));
    const i = slugs.indexOf(post.slug);
    if (i >= 0 && slugs.length > 1) {
      return {
        series: s,
        part: i + 1,
        total: slugs.length,
        prev: i > 0 ? bySlug.get(slugs[i - 1]) : null,
        next: i < slugs.length - 1 ? bySlug.get(slugs[i + 1]) : null,
      };
    }
  }
  return null;
}

const PostLink = ({ p, kicker }) => (
  <Link to={`/blog/${p.category}/${p.slug}`} className="related-item group">
    <span className={`related-kicker ${kicker ? '' : categoryToneClass(p.category)}`}>
      {kicker || BLOG_CONFIG.categories[p.category]?.name || p.category}
    </span>
    <span className="related-title">{p.title}</span>
    <span className="related-meta">{p.readingTime} min read</span>
  </Link>
);

export default function RelatedPosts({ post }) {
  const inSeries = seriesNeighbours(post);
  const skip = new Set([inSeries?.prev?.slug, inSeries?.next?.slug].filter(Boolean));
  const related = relatedPosts(post, 3, skip);
  if (!inSeries && related.length === 0) return null;

  return (
    <section className="related" aria-label="Keep reading">
      <h2 className="related-heading">Keep reading</h2>

      {inSeries && (
        <div className="related-series">
          <Link to="/blog/series" className="related-series-name">
            {`Part ${inSeries.part} of ${inSeries.total} · ${inSeries.series.title}`}
          </Link>
          <div className="related-grid related-grid-2">
            {inSeries.prev && <PostLink p={inSeries.prev} kicker="Previous in the series" />}
            {inSeries.next && <PostLink p={inSeries.next} kicker="Next in the series" />}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="related-grid">
          {related.map((p) => <PostLink key={p.slug} p={p} />)}
        </div>
      )}
    </section>
  );
}
