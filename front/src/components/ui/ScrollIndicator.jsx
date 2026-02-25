import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const ScrollIndicator = ({ 
  scrollTarget = null, 
  fadeOutStart = 0, 
  fadeOutEnd = 300,
  className = "",
  size = 24,
  color = "text-blue-600 dark:text-blue-400"
}) => {
  const { scrollY } = useScroll();
  const scrollIndicatorOpacity = useTransform(scrollY, [fadeOutStart, fadeOutEnd], [1, 0]);
  
  const handleClick = () => {
    if (scrollTarget) {
      const element = document.querySelector(scrollTarget);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Default behavior: scroll to next section or viewport height
      const targetPosition = window.innerHeight * 0.8;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      style={{ opacity: scrollIndicatorOpacity }}
      className={`flex justify-center items-center cursor-pointer z-40 py-2 ${className}`}
      onClick={handleClick}
    >
      <motion.div
        animate={{
          y: [0, 5, 0],
          transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop'
          }
        }}
        className="flex flex-col items-center"
      >
        <ChevronDown size={size} className={color} />
      </motion.div>
    </motion.div>
  );
};

export default ScrollIndicator;