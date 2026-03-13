import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Check, X, Settings, Shield, BarChart3 } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (!cookieConsent) {
      // Show banner after 2 seconds
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const consent = {
      essential: true, // Essential cookies cannot be rejected
      analytics: false,
      marketing: false,
      functional: false
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowPreferences(false);
    setShowBanner(false);
  };

  const togglePreference = (type) => {
    if (type === 'essential') return; // Cannot toggle essential
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner && !showPreferences) return null;

  return (
    <>
      {/* Main Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                {/* Content */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        We Value Your Privacy
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. Visit{' '}
                        <button 
                          onClick={() => setShowPreferences(true)}
                          className="text-purple-600 hover:underline font-medium"
                        >
                          Cookie Preferences
                        </button>{' '}
                        to customize or reject non-essential cookies.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          GDPR Compliant
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          CCPA Compliant
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Customize
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreferences(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Cookie className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Cookie Preferences
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Customize your cookie settings
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Essential Cookies */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          Essential Cookies
                        </h3>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                          Required
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Necessary for basic website functionality and security. These cookies cannot be disabled.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-not-allowed">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
                    </label>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          Analytics Cookies
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Help us understand how visitors interact with our website by collecting anonymous usage data.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={() => togglePreference('analytics')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:bg-gray-700 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Cookie className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          Marketing Cookies
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Used to deliver personalized advertisements and track marketing campaign effectiveness.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={() => togglePreference('marketing')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:bg-gray-700 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="w-5 h-5 text-gray-600" />
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          Functional Cookies
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Remember your preferences and settings to provide enhanced, personalized features.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={() => togglePreference('functional')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:bg-gray-700 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-between">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleSavePreferences}
                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CookieConsent;
