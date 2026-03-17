import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const StickyCTA = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show on dashboard or auth pages
  const shouldHideOnCurrentPage = 
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/portfolio' ||
    location.pathname === '/trade' ||
    location.pathname === '/transactions' ||
    location.pathname === '/profile' ||
    location.pathname === '/kyc' ||
    location.pathname === '/notifications' ||
    location.pathname === '/deposit' ||
    location.pathname === '/withdraw' ||
    location.pathname === '/receive' ||
    location.pathname === '/usdt-balance' ||
    location.pathname === '/tier-upgrade';

  useEffect(() => {
    // Don't show if dismissed or on hidden pages
    if (isDismissed || shouldHideOnCurrentPage) {
      setIsVisible(false);
      return;
    }

    const handleScroll = () => {
      // Show CTA after scrolling 50% of the page
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const scrolled = (scrollPosition / (documentHeight - windowHeight)) * 100;
      
      if (scrolled > 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed, shouldHideOnCurrentPage]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleClick = () => {
    if (isAuthenticated) {
      // Redirect logged-in users to trading page
      navigate('/trade');
    } else {
      // Redirect non-authenticated users to register
      navigate('/register');
    }
  };

  if (isDismissed || shouldHideOnCurrentPage) return null;

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
                {isAuthenticated ? 'Ready to Trade?' : 'Ready to Start Trading?'}
              </h3>
              <p className="text-sm text-purple-100 mb-3">
                {isAuthenticated 
                  ? 'Access your trading dashboard'
                  : 'Join thousands of traders on BitSolidus'
                }
              </p>
              <button
                onClick={handleClick}
                className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                {isAuthenticated ? 'Go to Trading' : 'Get Started Free'}
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
