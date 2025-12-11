import { Helmet } from 'react-helmet-async';

/**
 * SEO component for dynamic meta tags on each page.
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} [props.canonical] - Canonical URL
 * @param {string} [props.image] - Open Graph image URL
 * @param {string} [props.type='website'] - Open Graph type
 * @param {Array<string>} [props.keywords] - SEO keywords
 * @param {string} [props.author='Juan Lara'] - Content author
 * @param {Object} [props.article] - Article-specific metadata
 */
export const SEO = ({
  title,
  description,
  canonical,
  image,
  type = 'website',
  keywords = [],
  author = 'Juan Lara',
  article
}) => {
  const siteUrl = 'https://juanlara18.github.io/Portfolio';
  const defaultImage = `${siteUrl}/portfolio.png`;
  const pageUrl = canonical || window.location.href;
  const ogImage = image || defaultImage;

  // Generate structured data for rich snippets
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'BlogPosting' : 'WebPage',
    headline: title,
    description: description,
    url: pageUrl,
    author: {
      '@type': 'Person',
      name: author,
      url: siteUrl,
      jobTitle: 'Research Assistant',
      affiliation: {
        '@type': 'Organization',
        name: 'Harvard Business School'
      }
    },
    publisher: {
      '@type': 'Person',
      name: author
    },
    ...(article && {
      datePublished: article.publishedDate,
      dateModified: article.modifiedDate || article.publishedDate,
      keywords: article.tags?.join(', '),
      articleSection: article.category,
      wordCount: article.wordCount
    })
  };

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
      <meta property="og:site_name" content="Juan Lara Portfolio" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@juanlara" />

      {/* Article specific */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedDate} />
          {article.modifiedDate && (
            <meta property="article:modified_time" content={article.modifiedDate} />
          )}
          <meta property="article:author" content={author} />
          {article.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
          <meta property="article:section" content={article.category} />
        </>
      )}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
    </Helmet>
  );
};

/**
 * Default SEO configuration for the entire site
 */
export const defaultSEO = {
  title: 'Juan Lara | ML Engineer & Research Assistant',
  description: 'Research Assistant at Harvard Business School specializing in Machine Learning, AI Agents, and NLP. Explore my portfolio of projects, research, and technical blog.',
  keywords: [
    'Juan Lara',
    'Machine Learning',
    'Artificial Intelligence',
    'NLP',
    'AI Agents',
    'Research Assistant',
    'Harvard Business School',
    'Computer Science',
    'Applied Mathematics',
    'Deep Learning',
    'Transformers',
    'PyTorch',
    'Python'
  ]
};
