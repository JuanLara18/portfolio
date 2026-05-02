import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sun, Moon, Menu } from 'lucide-react';
import MobileMenu from './MobileMenu';
import { Logo } from '../ui';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();
  
  const backgroundOpacity = useTransform(scrollY, [0, 120], [0.85, 0.98]);
  const backdropBlur = useTransform(scrollY, [0, 120], [8, 16]);
  const shadowOpacity = useTransform(scrollY, [0, 120], [0, 0.15]);
  const navbarPadding = useTransform(scrollY, [0, 120], [16, 12]);
  
  useEffect(() => {
    setMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  }, [location.pathname]);
  
  const toggleMobileMenu = () => {
    const newMenuState = !mobileMenuOpen;
    setMobileMenuOpen(newMenuState);
    
    if (newMenuState) {
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('menu-open');
      document.body.style.overflow = 'auto';
    }
  };
  
  const getLinkClass = (path) => {
    const baseClass = "relative py-2 px-1 font-medium transition-all duration-300";
    const activeClass = "text-cyan-600 dark:text-brand-accent before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-cyan-600 dark:before:bg-brand-accent";
    const inactiveClass = "text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-brand-accent before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:scale-x-0 before:bg-cyan-600 dark:before:bg-brand-accent before:origin-left before:transition-transform hover:before:scale-x-100";

    const isActive = path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };
  
  return (
    <>
      <motion.header 
        className="fixed w-full z-50 transition-all duration-500"
        style={{
          backgroundColor: darkMode
            ? useTransform(backgroundOpacity, (value) => `rgba(11, 17, 32, ${value})`)
            : useTransform(backgroundOpacity, (value) => `rgba(255, 255, 255, ${value})`),
          backdropFilter: useTransform(backdropBlur, (value) => `blur(${value}px)`),
          WebkitBackdropFilter: useTransform(backdropBlur, (value) => `blur(${value}px)`),
          boxShadow: useTransform(shadowOpacity, (value) => 
            `0 10px 25px -5px rgba(0, 0, 0, ${value}), 0 4px 6px -2px rgba(0, 0, 0, ${value * 0.5})`
          ),
          paddingTop: useTransform(navbarPadding, (value) => `${value}px`),
          paddingBottom: useTransform(navbarPadding, (value) => `${value}px`)
        }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 text-slate-900 dark:text-brand-fg"
            >
              <Logo size="md" />
            </motion.div>
            
            <motion.nav 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden md:flex items-center space-x-8"
            >
              <Link to="/" className={getLinkClass('/')}>
                Home
              </Link>
              <Link to="/about" className={getLinkClass('/about')}>
                About
              </Link>
              <Link to="/projects" className={getLinkClass('/projects')}>
                Projects
              </Link>
              <Link to="/blog" className={getLinkClass('/blog')}>
                Blog
              </Link>
              
              <button 
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </motion.nav>
            
            <div className="md:hidden flex items-center gap-4 z-10">
              <button 
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <button
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>
      
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={toggleMobileMenu} 
      />
    </>
  );
};

export default Navbar;