import { Helmet } from 'react-helmet-async';

// Canonical site identity. Keep in sync with public/index.html, package.json
// `homepage`, and scripts/build-sitemap.js so crawlers see one consistent URL.
const SITE_URL = 'https://juanlara18.github.io/portfolio';
const SITE_NAME = 'Juan Lara';
const DEFAULT_IMAGE = `${SITE_URL}/portfolio.png`;
const LOGO_URL = `${SITE_URL}/portfolio.png`;

// sameAs links feed Google's Knowledge Graph. Add ORCID/Scholar/X here when
// those profiles exist.
const SAME_AS = [
  'https://github.com/JuanLara18',
  'https://www.linkedin.com/in/julara/',
];

// Person schema reused by every page so author attribution stays coherent.
const PERSON_SCHEMA = {
  '@type': 'Person',
  name: 'Juan Lara',
  url: SITE_URL,
  jobTitle: 'AI Engineer',
  affiliation: {
    '@type': 'Organization',
    name: 'Harvard Business School',
  },
  sameAs: SAME_AS,
};

const PUBLISHER_SCHEMA = {
  '@type': 'Person',
  name: 'Juan Lara',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: LOGO_URL,
  },
  sameAs: SAME_AS,
};

/**
 * SEO component for dynamic meta tags + JSON-LD on each page.
 *
 * Emits three layers of structured data so different crawlers get the
 * redundancy they expect:
 *   1. Open Graph + Twitter meta (social previews)
 *   2. BlogPosting / WebPage JSON-LD (Google rich results, LLM ingestion)
 *   3. BreadcrumbList / WebSite JSON-LD (sitelinks, trail display)
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} [props.canonical] - Absolute canonical URL for the page
 * @param {string} [props.image] - Absolute image URL (OG + schema)
 * @param {'website'|'article'} [props.type='website']
 * @param {Array<string>} [props.keywords]
 * @param {string} [props.author='Juan Lara']
 * @param {Object} [props.article] - Article-specific metadata
 * @param {string} props.article.publishedDate
 * @param {string} [props.article.modifiedDate]
 * @param {Array<string>} [props.article.tags]
 * @param {string} [props.article.category]
 * @param {number} [props.article.wordCount]
 * @param {string} [props.article.audioUrl] - Absolute URL to narrated audio
 * @param {number} [props.article.audioDurationSec]
 * @param {Array<{name: string, url: string}>} [props.breadcrumbs]
 */
export const SEO = ({
  title,
  description,
  canonical,
  image,
  type = 'website',
  keywords = [],
  author = 'Juan Lara',
  article,
  breadcrumbs,
}) => {
  const pageUrl = canonical || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  const ogImage = image || DEFAULT_IMAGE;
  const isArticle = type === 'article';

  // Schema.org ISO 8601 duration string — "PT2250S" for 2250 seconds.
  const toIsoDuration = (seconds) => {
    if (!seconds || Number.isNaN(Number(seconds))) return undefined;
    return `PT${Math.round(Number(seconds))}S`;
  };

  // Main page / article schema.
  const primarySchema = isArticle
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
        headline: title,
        description,
        url: pageUrl,
        image: image ? [ogImage] : [DEFAULT_IMAGE],
        author: PERSON_SCHEMA,
        publisher: PUBLISHER_SCHEMA,
        inLanguage: 'en',
        ...(article && {
          datePublished: article.publishedDate,
          dateModified: article.modifiedDate || article.publishedDate,
          keywords: article.tags?.join(', '),
          articleSection: article.category,
          wordCount: article.wordCount,
          timeRequired: toIsoDuration(article.readingTimeSec),
          ...(article.audioUrl && {
            audio: {
              '@type': 'AudioObject',
              contentUrl: article.audioUrl,
              encodingFormat: 'audio/mpeg',
              ...(article.audioDurationSec && {
                duration: toIsoDuration(article.audioDurationSec),
              }),
              inLanguage: 'en',
            },
          }),
        }),
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description,
        inLanguage: 'en',
        author: PERSON_SCHEMA,
        publisher: PUBLISHER_SCHEMA,
      };

  // BreadcrumbList for rich result trails. Only emitted when the caller
  // provides an explicit list — we don't try to infer from pageUrl.
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: b.url,
        })),
      }
    : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content={author} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@juanlara18" />

      {/* Article-specific meta */}
      {isArticle && article && (
        <>
          <meta property="article:published_time" content={article.publishedDate} />
          {article.modifiedDate && (
            <meta property="article:modified_time" content={article.modifiedDate} />
          )}
          <meta property="article:author" content={author} />
          {article.tags?.map((tag, index) => (
            <meta key={`article-tag-${index}`} property="article:tag" content={tag} />
          ))}
          {article.category && <meta property="article:section" content={article.category} />}
        </>
      )}

      {/* RSS feed discovery (browsers, feed readers, AI agents) */}
      <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} — Writing`} href={`${SITE_URL}/rss.xml`} />

      {/* Structured Data — primary */}
      <script type="application/ld+json">{JSON.stringify(primarySchema)}</script>

      {/* Structured Data — breadcrumbs (only when provided) */}
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}

      {/* Indexing directives */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
    </Helmet>
  );
};

/**
 * Default SEO configuration for the entire site.
 */
export const defaultSEO = {
  title: 'Juan Lara | AI Engineer — Research to Production',
  description:
    'Research-minded AI Engineer specializing in LLM systems, NLP, and taking ML from concept to production. CS + Mathematics foundation, experience spanning Harvard research to enterprise-scale AI.',
  keywords: [
    'Juan Lara',
    'AI Engineer',
    'Machine Learning',
    'LLM Systems',
    'NLP',
    'RAG',
    'AI Agents',
    'Harvard Business School',
    'Computer Science',
    'Applied Mathematics',
    'Deep Learning',
    'Transformers',
    'PyTorch',
    'Python',
  ],
};
