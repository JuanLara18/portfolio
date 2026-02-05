import { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { TransitionProvider, Navigation as Navbar } from './components/layout';
import useNavbarHeight from './hooks/useNavbarHeight';

// Lazy-loaded pages: each page bundle is only downloaded when the user navigates to it
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const BlogHomePage = lazy(() => import('./pages/BlogHomePage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const BlogCategoryPage = lazy(() => import('./pages/BlogCategoryPage'));

// Minimal loading fallback (matches the app background to avoid flash)
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-3"></div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
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
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ScrollToTop />
        <TransitionProvider>
        <div className="App min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative overflow-x-hidden">
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
                <Route path="/blog/category/:category" element={<BlogCategoryPage />} />
                <Route path="/blog/tag/:tag" element={<BlogCategoryPage />} />
                <Route path="/blog/:category/:slug" element={<BlogPostPage />} />
                
                {/* Fallback route redirects to home */}
                <Route path="*" element={<LandingPage />} />
              </Routes>
            </Suspense>
          </div>
          {/* Footer intentionally omitted for now */}
        </div>
        </TransitionProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;