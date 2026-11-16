import { useState, useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { TransitionProvider, Navigation as Navbar, Footer } from './components/layout';
import useNavbarHeight from './hooks/useNavbarHeight';
import BRAND_TOKENS from './data/brandTokens.json';

// Lazy-loaded pages: each page bundle is only downloaded when the user navigates to it
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const BlogHomePage = lazy(() => import('./pages/BlogHomePage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const BlogCategoryPage = lazy(() => import('./pages/BlogCategoryPage'));
const BlogGraphPage = lazy(() => import('./pages/BlogGraphPage'));
const BlogSeriesPage = lazy(() => import('./pages/BlogSeriesPage'));
const BlogBooksPage = lazy(() => import('./pages/BlogBooksPage'));
const PostRedirectPage = lazy(() => import('./pages/PostRedirectPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Minimal loading fallback (matches the app background to avoid flash)
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-700 dark:border-brand-accent mx-auto mb-3"></div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Scroll to top on route change.
// useLayoutEffect fires synchronously before paint so the new page never renders
// at the previous scroll position. `behavior: 'instant'` overrides the global
// `scroll-behavior: smooth` in index.css, which would otherwise animate the jump
// and look like "the page didn't load until I scrolled a bit" — especially on mobile.
function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);
  
  // Dynamic navbar height
  const navbarHeight = useNavbarHeight();
  
  // Initialize darkMode based on user preference or localStorage
  useEffect(() => {
    // Check if user has a preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      // Check if user prefers dark mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);
  
  // Toggle dark mode and save preference
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };
  
  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <HelmetProvider>
      <Router
        basename={process.env.PUBLIC_URL || '/'}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ScrollToTop />
        <TransitionProvider>
        <div className="App min-h-screen bg-white dark:bg-brand-bg text-gray-900 dark:text-brand-fg relative overflow-x-hidden">
          {/* Brand duotone for blog photos (class .brand-duotone): shadows -> night bg,
              mid-tones -> cobalt, highlights -> light cyan. Source images stay untouched. */}
          <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
            <filter id="brand-duotone" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values=".3 .59 .11 0 0  .3 .59 .11 0 0  .3 .59 .11 0 0  0 0 0 1 0" />
              <feComponentTransfer>
                <feFuncR type="table" tableValues={BRAND_TOKENS.duotone.r} />
                <feFuncG type="table" tableValues={BRAND_TOKENS.duotone.g} />
                <feFuncB type="table" tableValues={BRAND_TOKENS.duotone.b} />
              </feComponentTransfer>
            </filter>
          </svg>
          <Navbar
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode} 
          />
          
          {/* Main content with dynamic top padding for navbar */}
          <div style={{ paddingTop: `${navbarHeight + 8}px` }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                
                {/* Blog routes */}
                <Route path="/blog" element={<BlogHomePage />} />
                <Route path="/blog/graph" element={<BlogGraphPage />} />
                <Route path="/blog/series" element={<BlogSeriesPage />} />
                <Route path="/blog/books" element={<BlogBooksPage />} />
                <Route path="/blog/category/:category" element={<BlogCategoryPage />} />
                <Route path="/blog/tag/:tag" element={<BlogCategoryPage />} />
                <Route path="/blog/:category/:slug" element={<BlogPostPage />} />
                {/* Short post address /blog/<slug>: the form posts use to link to
                    each other. Static segments above (graph, series, books) win. */}
                <Route path="/blog/:slug" element={<PostRedirectPage />} />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
        </div>
        </TransitionProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;