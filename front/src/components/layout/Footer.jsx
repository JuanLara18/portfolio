import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { variants as motionVariants } from '../../utils';

const fadeInUp = motionVariants.fadeInUp();
const staggerContainer = motionVariants.stagger();

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-brand-bg text-gray-900 dark:text-brand-fg border-t border-gray-200/60 dark:border-white/[0.08]" id="contact">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mobile-card-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="py-8 sm:py-10"
        >
          {/* 2-column compact layout: title + contact info on the left, links on the right */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 text-sm"
          >
            {/* Left: title + contact lines */}
            <div>
              <h2 className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-brand-fg tracking-tight mb-5">
                Let's connect<span className="text-cyan-700 dark:text-brand-accent">.</span>
              </h2>
              <div className="space-y-2.5">
                <a
                  href="mailto:larajuand@outlook.com"
                  className="group flex items-center gap-2.5"
                >
                  <Mail size={14} className="text-cyan-700 dark:text-brand-accent flex-shrink-0" />
                  <span className="text-gray-700 dark:text-brand-fg/90 group-hover:text-cyan-700 dark:group-hover:text-brand-accent transition-colors">
                    larajuand@outlook.com
                  </span>
                </a>
                <div className="flex items-center gap-2.5">
                  <MapPin size={14} className="text-cyan-700 dark:text-brand-accent flex-shrink-0" />
                  <span className="text-gray-700 dark:text-brand-fg/90">Bogotá, Colombia</span>
                </div>
              </div>
            </div>

            {/* Right: external links — bottom-aligned to match the contact lines on the left */}
            <div className="flex items-end justify-start sm:justify-end gap-5">
              <a
                href="https://github.com/JuanLara18"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-gray-700 dark:text-brand-fg/90 hover:text-cyan-700 dark:hover:text-brand-accent transition-colors"
              >
                <Github size={14} />
                <span>GitHub</span>
                <ArrowUpRight size={12} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
              <a
                href="https://www.linkedin.com/in/julara/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-gray-700 dark:text-brand-fg/90 hover:text-cyan-700 dark:hover:text-brand-accent transition-colors"
              >
                <Linkedin size={14} />
                <span>LinkedIn</span>
                <ArrowUpRight size={12} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </div>
          </motion.div>

          {/* Copyright */}
          <motion.div
            variants={fadeInUp}
            className="text-center font-mono text-[10px] tracking-[0.15em] uppercase text-gray-500 dark:text-brand-fg-muted mt-8 sm:mt-10 pt-4 border-t border-gray-200/60 dark:border-white/[0.08]"
          >
            © {currentYear} Juan Lara · All rights reserved
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
