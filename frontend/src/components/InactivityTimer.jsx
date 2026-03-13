import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { AlertTriangle, LogOut, Play } from 'lucide-react';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const WARNING_BEFORE_TIMEOUT = 30 * 1000; // 30 seconds before timeout

const InactivityTimer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_BEFORE_TIMEOUT / 1000);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Track user activity events
  const trackActivity = () => {
    setLastActivity(Date.now());
    setShowWarning(false);
    setCountdown(WARNING_BEFORE_TIMEOUT / 1000);
  };

  useEffect(() => {
    // Events to track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners
    const handleEvent = () => trackActivity();
    events.forEach(event => window.addEventListener(event, handleEvent));

    // Check for inactivity
    const checkInactivity = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT) {
        setShowWarning(true);
      }
    }, 1000);

    return () => {
      // Cleanup event listeners
      events.forEach(event => window.removeEventListener(event, handleEvent));
      clearInterval(checkInactivity);
    };
  }, [lastActivity]);

  // Countdown timer when warning is shown
  useEffect(() => {
    let countdownInterval;
    
    if (showWarning) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Time's up - logout user
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showWarning]);

  const handleContinue = () => {
    setShowWarning(false);
    setCountdown(WARNING_BEFORE_TIMEOUT / 1000);
    trackActivity();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { 
      state: { 
        message: 'You have been logged out due to inactivity.',
        type: 'info'
      } 
    });
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-crypto-card rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-red-200 dark:border-red-800 overflow-hidden animate-pulse-slow">
        {/* Warning Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Inactivity Warning</h2>
          </div>
          <p className="text-red-100">Your session is about to expire</p>
        </div>

        {/* Warning Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              You've been inactive for too long. For security reasons, you will be automatically logged out soon.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                Auto-logout in:
              </span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                {countdown}s
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click "Continue Session" to stay logged in, or you will be logged out automatically.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleContinue}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Continue Session
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InactivityTimer;
