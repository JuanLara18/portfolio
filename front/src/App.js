import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { TransitionProvider, Navigation as Navbar } from './components/layout';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import BlogHomePage from './pages/BlogHomePage';
import BlogPostPage from './pages/BlogPostPage';
import BlogCategoryPage from './pages/BlogCategoryPage';
import useNavbarHeight from './hooks/useNavbarHeight';

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
        <TransitionProvider>
        <div className="App min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative overflow-x-hidden">
          <Navbar 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode} 
          />
          
          {/* Main content with dynamic top padding for navbar */}
          <div style={{ paddingTop: `${navbarHeight + 8}px` }}>
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
          </div>
          {/* Footer intentionally omitted for now */}
        </div>
        </TransitionProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;