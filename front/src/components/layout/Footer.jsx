import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Terminal } from 'lucide-react';
import { HoverMotion } from './TransitionProvider/TransitionProvider';
import { variants as motionVariants } from '../../utils';

const fadeInUp = motionVariants.fadeInUp();
const staggerContainer = motionVariants.stagger();
const scaleUp = motionVariants.scaleUp();

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 sm:py-10 bg-gray-900 dark:bg-gray-950 text-white border-t border-gray-800 dark:border-gray-900" id="contact">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mobile-card-container">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          <motion.h2 
            variants={fadeInUp} 
            className="text-xl sm:text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400"
          >
            Let's Connect
          </motion.h2>
          
          <HoverMotion as={motion.div}
            className="bg-gray-800 dark:bg-gray-900 p-5 sm:p-6 rounded-2xl shadow-xl border border-gray-700 dark:border-gray-800 mb-6 mobile-smooth-transition"
            y={-5}
            duration={0.3}
            variants={scaleUp}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-center">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Let's Work Together</h3>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                  Open to research collaborations, technical challenges, and building enterprise-grade AI systems.
                </p>
                <div className="flex items-center mb-3">
                  <Mail className="text-blue-400 mr-3" size={16} />
                  <a href="mailto:larajuand@outlook.com" className="text-gray-300 hover:text-white transition-colors text-sm">larajuand@outlook.com</a>
                </div>
                <div className="flex items-center">
                  <Terminal className="text-blue-400 mr-3" size={16} />
                  <span className="text-gray-300 text-sm">Bogotá, Colombia</span>
                </div>
              </div>
              
              <div>
                <div className="flex flex-col space-y-2.5 sm:space-y-3">
                  <HoverMotion as={motion.a}
                    href="https://github.com/JuanLara18" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-150 relative overflow-hidden group touch-target mobile-smooth-transition"
                    y={-2}
                    duration={0.2}
                  >
                    <Github className="mr-3 text-white group-hover:scale-110 transition-transform duration-300" size={18} />
                    <span className="font-medium text-sm">GitHub</span>
                    <motion.div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white dark:via-gray-200 to-transparent skew-x-20"
                      animate={{ 
                        x: ["200%", "-200%"],
                        transition: { repeat: Infinity, repeatType: "loop", duration: 2, ease: "easeInOut", repeatDelay: 1.5 } 
                      }}
                    />
                  </HoverMotion>
                  
                  <HoverMotion as={motion.a}
                    href="https://www.linkedin.com/in/julara/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-150 relative overflow-hidden group touch-target mobile-smooth-transition"
                    y={-2}
                    duration={0.2}
                  >
                    <Linkedin className="mr-3 text-white group-hover:scale-110 transition-transform duration-300" size={18} />
                    <span className="font-medium text-sm">LinkedIn</span>
                    <motion.div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white dark:via-gray-200 to-transparent skew-x-20"
                      animate={{ 
                        x: ["200%", "-200%"],
                        transition: { repeat: Infinity, repeatType: "loop", duration: 2, ease: "easeInOut", repeatDelay: 1.5 } 
                      }}
                    />
                  </HoverMotion>
                  
                  <HoverMotion as={motion.a}
                    href="mailto:larajuand@outlook.com" 
                    className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-150 relative overflow-hidden group touch-target mobile-smooth-transition shadow-md"
                    y={-2}
                    duration={0.2}
                  >
                    <Mail className="mr-3 text-white group-hover:scale-110 transition-transform duration-300" size={18} />
                    <span className="font-medium text-white text-sm">Email</span>
                    <motion.div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent skew-x-20"
                      animate={{ 
                        x: ["200%", "-200%"],
                        transition: { repeat: Infinity, repeatType: "loop", duration: 2, ease: "easeInOut", repeatDelay: 1.5 } 
                      }}
                    />
                  </HoverMotion>
                </div>
              </div>
            </div>
          </HoverMotion>
          
          <motion.div 
            variants={fadeInUp}
            className="text-center text-gray-400 text-sm mt-6 border-t border-gray-800 dark:border-gray-800/60 pt-5"
          >
            <p>
              © {currentYear} Juan Lara. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;