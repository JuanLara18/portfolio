import { Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { SEO } from '../components/common/SEO';

// Shown for any URL that matches no route. It used to fall through to the
// landing page, which hid broken links: a reader clicking a dead reference
// silently ended up on the home page with no hint that anything went wrong.
export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <>
      <SEO
        title="Page not found · Juan Lara"
        description="This page does not exist or has moved."
        noindex
      />
      <div className="min-h-[70vh] bg-white dark:bg-brand-bg flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Compass className="mx-auto h-12 w-12 text-gray-400 dark:text-brand-fg-muted mb-4" />
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-gray-500 dark:text-brand-fg-muted mb-2">
            404
          </p>
          <h1 className="type-section text-2xl text-gray-900 dark:text-brand-fg mb-2">
            Page not found.
          </h1>
          <p className="text-gray-600 dark:text-brand-fg-muted mb-6 break-words">
            Nothing lives at <code className="font-mono text-sm">{pathname}</code>. It may have moved, or the link may be mistyped.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link
              to="/blog"
              className="font-mono text-[11px] tracking-[0.12em] uppercase text-cyan-700 dark:text-brand-accent hover:underline underline-offset-4 transition-colors"
            >
              Browse all posts
            </Link>
            <Link
              to="/"
              className="font-mono text-[11px] tracking-[0.12em] uppercase text-gray-700 dark:text-brand-fg/80 hover:text-cyan-700 dark:hover:text-brand-accent transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
