import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TypingTerminal = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      // Variable typing speed for more realistic effect
      const timeout = setTimeout(() => {
        // Occasionally make "typing mistakes" with backspaces for realism
        if (Math.random() > 0.96 && currentIndex > 2) {
          // Simulate a mistake by deleting a few characters
          setDisplayText(prev => prev.slice(0, -2));
          setCurrentIndex(prev => prev - 2);
        } else {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }
      }, 40 + Math.random() * 85); // More varied typing speed
      
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      setIsComplete(true);
      // Blinking cursor after typing is complete
      const blinkInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 530);
      
      return () => clearInterval(blinkInterval);
    }
  }, [currentIndex, text]);

  return (
    <motion.div 
      className="font-mono p-4 bg-gray-900 text-green-400 rounded-md overflow-hidden shadow-xl border border-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-gray-400 text-sm">juan@lara ~ terminal</span>
      </div>
      <div className="flex h-full">
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-blue-400 mr-2"
        >$</motion.span>
        <div className="min-h-[150px] font-mono text-xs sm:text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
          <div>
            {displayText}
            {showCursor && (
              <motion.span 
                initial={{ opacity: 1 }}
                animate={{ opacity: showCursor ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block w-2 h-4 bg-green-400 ml-1"
              />
            )}
          </div>
          
          {/* Terminal reflection effect */}
          {isComplete && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="w-full h-8 bg-gradient-to-b from-transparent to-green-900/10 mt-4"
            />
          )}
        </div>
      </div>
      
      {/* Subtle scan lines for CRT effect */}
      <div className="absolute inset-0 bg-scan-lines opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(0deg, transparent 0%, rgba(32, 128, 32, 0.2) 2%, transparent 5%)',
          backgroundSize: '100% 4px'
        }}
      />
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-green-500/5 blur-md pointer-events-none" />
    </motion.div>
  );
};

export default TypingTerminal;