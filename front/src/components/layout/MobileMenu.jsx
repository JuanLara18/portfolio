import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Linkedin, FileText, ArrowUpRight } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',         label: 'Home' },
  { path: '/about',    label: 'About' },
  { path: '/projects', label: 'Projects' },
  { path: '/blog',     label: 'Blog' },
];

const MobileMenu = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuVariants = {
    closed: { x: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    open:   { x: 0,      transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };
  const overlayVariants = {
    closed: { opacity: 0, transition: { duration: 0.25, when: 'afterChildren' } },
    open:   { opacity: 1, transition: { duration: 0.25, when: 'beforeChildren' } },
  };

  const isActivePath = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={menuVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        className="fixed top-0 right-0 w-[88%] max-w-sm h-full bg-white dark:bg-brand-bg z-[70] transform md:hidden border-l border-gray-200/70 dark:border-white/[0.08] flex flex-col"
      >
        {/* Close button — sits alone at the top right; no header needed */}
        <div className="flex justify-end px-6 pt-5">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 -mr-2 text-gray-500 dark:text-brand-fg-muted hover:text-cyan-700 dark:hover:text-brand-accent transition-colors touch-target"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav — bold sans, single accent dot for active */}
        <nav className="px-6 pt-4 pb-8">
          <ul className="space-y-5">
            {NAV_ITEMS.map(({ path, label }) => {
              const active = isActivePath(path);
              return (
                <li key={path}>
                  <Link
                    to={path}
                    onClick={onClose}
                    className={`group inline-flex items-center font-bold text-2xl tracking-tight transition-colors touch-target ${
                      active
                        ? 'text-cyan-700 dark:text-brand-accent'
                        : 'text-gray-900 dark:text-brand-fg hover:text-cyan-700 dark:hover:text-brand-accent'
                    }`}
                  >
                    <span>{label}</span>
                    {active && (
                      <span className="ml-2 w-2 h-2 rounded-full bg-cyan-700 dark:bg-brand-accent" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* External links — pinned to bottom, hairline rows */}
        <div className="mt-auto px-6 pb-8 pt-6 border-t border-gray-200/60 dark:border-white/[0.08]">
          <a
            href="https://github.com/JuanLara18"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between py-3 border-b border-gray-200/60 dark:border-white/[0.08] hover:border-cyan-700/40 dark:hover:border-brand-accent/40 transition-colors"
          >
            <span className="flex items-center gap-3">
              <Github size={16} className="text-cyan-700 dark:text-brand-accent" />
              <span className="text-base text-gray-900 dark:text-brand-fg group-hover:text-cyan-700 dark:group-hover:text-brand-accent transition-colors">GitHub</span>
            </span>
            <ArrowUpRight size={14} className="text-gray-400 dark:text-brand-fg-muted group-hover:text-cyan-700 dark:group-hover:text-brand-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </a>
          <a
            href="https://www.linkedin.com/in/julara/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between py-3 border-b border-gray-200/60 dark:border-white/[0.08] hover:border-cyan-700/40 dark:hover:border-brand-accent/40 transition-colors"
          >
            <span className="flex items-center gap-3">
              <Linkedin size={16} className="text-cyan-700 dark:text-brand-accent" />
              <span className="text-base text-gray-900 dark:text-brand-fg group-hover:text-cyan-700 dark:group-hover:text-brand-accent transition-colors">LinkedIn</span>
            </span>
            <ArrowUpRight size={14} className="text-gray-400 dark:text-brand-fg-muted group-hover:text-cyan-700 dark:group-hover:text-brand-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </a>
          <a
            href={`${process.env.PUBLIC_URL}/documents/CV___EN.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between py-3 hover:border-cyan-700/40 dark:hover:border-brand-accent/40 transition-colors"
          >
            <span className="flex items-center gap-3">
              <FileText size={16} className="text-cyan-700 dark:text-brand-accent" />
              <span className="text-base text-gray-900 dark:text-brand-fg group-hover:text-cyan-700 dark:group-hover:text-brand-accent transition-colors">Curriculum</span>
            </span>
            <ArrowUpRight size={14} className="text-gray-400 dark:text-brand-fg-muted group-hover:text-cyan-700 dark:group-hover:text-brand-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </a>
        </div>
      </motion.div>
    </>
  );
};

export default MobileMenu;
