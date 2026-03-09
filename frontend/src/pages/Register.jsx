import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/authSlice';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Check, X, Globe, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '../utils/helpers';
import { getCurrencyByCountry } from '../utils/currency';
import axios from 'axios';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, error, registrationSuccess } = useSelector((state) => state.auth);
  
  const referralCode = searchParams.get('ref');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    agreeTerms: false,
    referralCode: referralCode || '',
  });
  const [selectedCurrency, setSelectedCurrency] = useState({ code: 'USD', symbol: '$', name: 'US Dollar' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState(null);
  const [validatingReferral, setValidatingReferral] = useState(false);

  // Validate referral code on load
  useEffect(() => {
    if (referralCode) {
      validateReferralCode(referralCode);
    }
  }, [referralCode]);

  const validateReferralCode = async (code) => {
    setValidatingReferral(true);
    try {
      const response = await axios.post('/api/user/referral/validate', { code });
      if (response.data.valid) {
        setReferrerInfo(response.data.referrer);
      }
    } catch (err) {
      console.error('Invalid referral code');
    }
    setValidatingReferral(false);
  };

  useEffect(() => {
    if (registrationSuccess) {
      // Clear any existing token from previous sessions
      localStorage.removeItem('token');
      // Navigate to success page with email
      navigate('/register-success', { state: { email: formData.email } });
    }
  }, [registrationSuccess, navigate, formData.email]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Auto-detect currency when country changes
    if (name === 'country') {
      const currency = getCurrencyByCountry(value);
      setSelectedCurrency(currency);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    if (!formData.agreeTerms) {
      return;
    }

    dispatch(register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      country: formData.country,
      currency: selectedCurrency.code,
      referralCode: formData.referralCode || referralCode || null,
    }));
  };

  const passwordRequirements = [
    { label: 'At least 6 characters', met: formData.password.length >= 6 },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'Contains number', met: /[0-9]/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-crypto-bg dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-6 bg-white dark:bg-crypto-card p-8 rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join BitSolidus today
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Referral Info Banner */}
        {referrerInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center gap-3"
          >
            <Gift className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium">You've been referred!</p>
              <p className="text-sm">Invited by <span className="font-semibold">@{referrerInfo.username}</span></p>
            </div>
          </motion.div>
        )}

        {validatingReferral && (
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Validating referral code...</p>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Choose a username"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="country"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="input-field pl-10 appearance-none"
              >
                <option value="">Select your country</option>
                <optgroup label="North America">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                </optgroup>
                <optgroup label="Europe">
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                  <option value="NL">Netherlands</option>
                  <option value="BE">Belgium</option>
                  <option value="CH">Switzerland</option>
                  <option value="AT">Austria</option>
                  <option value="PT">Portugal</option>
                  <option value="IE">Ireland</option>
                  <option value="SE">Sweden</option>
                  <option value="NO">Norway</option>
                  <option value="DK">Denmark</option>
                  <option value="FI">Finland</option>
                  <option value="PL">Poland</option>
                  <option value="CZ">Czech Republic</option>
                  <option value="HU">Hungary</option>
                  <option value="RO">Romania</option>
                  <option value="BG">Bulgaria</option>
                  <option value="HR">Croatia</option>
                  <option value="SI">Slovenia</option>
                  <option value="SK">Slovakia</option>
                  <option value="LT">Lithuania</option>
                  <option value="LV">Latvia</option>
                  <option value="EE">Estonia</option>
                  <option value="LU">Luxembourg</option>
                  <option value="MT">Malta</option>
                  <option value="CY">Cyprus</option>
                  <option value="GR">Greece</option>
                </optgroup>
                <optgroup label="Asia">
                  <option value="JP">Japan</option>
                  <option value="CN">China</option>
                  <option value="IN">India</option>
                  <option value="KR">South Korea</option>
                  <option value="SG">Singapore</option>
                  <option value="TH">Thailand</option>
                  <option value="MY">Malaysia</option>
                  <option value="ID">Indonesia</option>
                  <option value="PH">Philippines</option>
                  <option value="VN">Vietnam</option>
                  <option value="HK">Hong Kong</option>
                  <option value="TW">Taiwan</option>
                  <option value="AE">United Arab Emirates</option>
                  <option value="SA">Saudi Arabia</option>
                  <option value="IL">Israel</option>
                  <option value="TR">Turkey</option>
                </optgroup>
                <optgroup label="Oceania">
                  <option value="AU">Australia</option>
                  <option value="NZ">New Zealand</option>
                </optgroup>
                <optgroup label="Africa">
                  <option value="ZA">South Africa</option>
                  <option value="NG">Nigeria</option>
                  <option value="EG">Egypt</option>
                  <option value="KE">Kenya</option>
                  <option value="GH">Ghana</option>
                </optgroup>
                <optgroup label="South America">
                  <option value="BR">Brazil</option>
                  <option value="AR">Argentina</option>
                  <option value="CL">Chile</option>
                  <option value="CO">Colombia</option>
                  <option value="PE">Peru</option>
                </optgroup>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {formData.country && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Your currency will be: {selectedCurrency.symbol} {selectedCurrency.code} ({selectedCurrency.name})
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-10 pr-10"
                placeholder="Create a password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Strength: {getPasswordStrengthLabel(passwordStrength)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                    className={`h-full ${getPasswordStrengthColor(passwordStrength)}`}
                  />
                </div>
                <ul className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <li key={index} className="flex items-center text-xs">
                      {req.met ? (
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-gray-400 mr-1" />
                      )}
                      <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field pl-10 pr-10 ${formData.confirmPassword && !passwordsMatch ? 'border-red-500' : ''}`}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <div className="flex items-start">
            <input
              id="agreeTerms"
              name="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Privacy Policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !passwordsMatch || !formData.agreeTerms}
            className="w-full btn-primary py-3 flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
