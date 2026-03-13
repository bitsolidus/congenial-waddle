import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling 50% of the page
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const scrolled = (scrollPosition / (documentHeight - windowHeight)) * 100;
      
      if (scrolled > 50 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleClick = () => {
    window.location.href = '/register';
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md px-4"
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-4 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="text-white text-center">
              <h3 className="font-bold text-lg mb-1">
                Ready to Start Trading?
              </h3>
              <p className="text-sm text-purple-100 mb-3">
                Join thousands of traders on BitSolidus
              </p>
              <button
                onClick={handleClick}
                className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyCTA;
