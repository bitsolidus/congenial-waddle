import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

const RegisterSuccess = () => {
  const location = useLocation();
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  // Get email from navigation state or localStorage
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail') || 'your email';
  
  const handleResendEmail = async () => {
    if (!email || email === 'your email') return;
    
    setResending(true);
    setResendMessage('');
    
    try {
      await axios.post('/api/auth/resend-verification', { email });
      setResendMessage('Verification email resent successfully!');
    } catch (error) {
      setResendMessage(error.response?.data?.message || 'Failed to resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-crypto-bg dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-crypto-card p-8 rounded-2xl shadow-xl text-center"
      >
        {/* Success Icon */}
        <div className="mx-auto h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Registration Successful!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome to BitSolidus
          </p>
        </div>

        {/* Email Verification Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Verify Your Email
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            We've sent a verification email to:
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 mb-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {email}
            </p>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Please check your inbox and click the verification link to activate your account. 
            The link will expire in 24 hours.
          </p>
        </div>

        {/* Resend Email */}
        {resendMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`text-sm px-4 py-2 rounded-lg ${
              resendMessage.includes('success') 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}
          >
            {resendMessage}
          </motion.div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
          >
            {resending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {resending ? 'Resending...' : 'Resend Verification Email'}
          </button>

          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg hover:from-primary-600 hover:to-primary-800 transition-all"
          >
            Go to Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Didn't receive the email?</p>
          <ul className="space-y-1">
            <li>• Check your spam/junk folder</li>
            <li>• Make sure your email address is correct</li>
            <li>• Wait a few minutes and try resending</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterSuccess;
