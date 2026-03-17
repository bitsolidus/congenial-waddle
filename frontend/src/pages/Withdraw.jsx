import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  ArrowRight, 
  Fuel, 
  Info, 
  Loader2,
  CheckCircle,
  XCircle,
  Wallet,
  Clock,
  History,
  Bookmark,
  Trash2,
  ChevronDown,
  Calculator
} from 'lucide-react';
import { fetchBalance } from '../store/walletSlice';
import { fetchCryptoPrices } from '../store/cryptoSlice';
import { formatCurrency, formatNumber, truncateAddress } from '../utils/helpers';
import { NETWORKS, CRYPTOCURRENCIES } from '../utils/constants';
import axios from 'axios';

const Withdraw = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { balance, portfolio, prices: walletPrices } = useSelector((state) => state.wallet);
  const { prices: cryptoPrices } = useSelector((state) => state.crypto);
  
  // Use crypto prices (real-time from CoinGecko) as priority, fallback to wallet prices
  const prices = cryptoPrices || walletPrices;
  
  // Get user's preferred currency
  const userCurrency = user?.settings?.currency || 'USD';
  
  // Currency symbol helper
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NZD': 'NZ$'
    };
    return symbols[currency] || currency + ' ';
  };
  
  const currencySymbol = getCurrencySymbol(userCurrency);
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [gasInfo, setGasInfo] = useState(null);
  const [withdrawalResult, setWithdrawalResult] = useState(null);
  const [showGasModal, setShowGasModal] = useState(false);
  const [gasBalance, setGasBalance] = useState(0);
  const [gasFeeSettings, setGasFeeSettings] = useState({
    enabled: true, // Default to enabled
    percentage: 2.5,
    minFee: 5,
    maxFee: 500
  });
  const [requiredGasFee, setRequiredGasFee] = useState(0);
  const [tierLimits, setTierLimits] = useState({
    min: 10,
    max: 10000,
    dailyLimit: 50000
  });
  const [dailyWithdrawn, setDailyWithdrawn] = useState(0);
  
  // Recent addresses state
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [showRecentAddresses, setShowRecentAddresses] = useState(false);
  
  // Fee estimation state
  const [feeEstimate, setFeeEstimate] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'BTC',
    network: 'bitcoin',
    toAddress: '',
    fromCrypto: 'BTC', // Which crypto balance to withdraw from
  });
  const [walletError, setWalletError] = useState('');

  // Available cryptocurrencies for withdrawal source (only BTC and ETH)
  const availableCryptos = [
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  ];

  // Available networks (only ETH and BTC)
  const availableNetworks = [
    { id: 'ethereum', name: 'Ethereum (ERC-20)', symbol: 'ETH', color: '#627EEA' },
    { id: 'bitcoin', name: 'Bitcoin Network', symbol: 'BTC', color: '#F7931A' },
  ];

  // Wallet validation patterns
  const walletPatterns = {
    ethereum: /^(0x)[0-9a-fA-F]{40}$/,
    bitcoin: /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchBalance());
      dispatch(fetchCryptoPrices()); // Fetch real-time prices from CoinGecko
      fetchGasBalance();
      fetchTierLimits();
      loadRecentAddresses();
      
      // Refresh prices every 30 seconds for real-time updates
      const priceInterval = setInterval(() => {
        dispatch(fetchBalance());
        dispatch(fetchCryptoPrices());
      }, 30000);
      
      return () => clearInterval(priceInterval);
    }
  }, [dispatch, isAuthenticated]);

  // Re-fetch tier limits when user's tier changes
  useEffect(() => {
    if (isAuthenticated && user?.tier) {
      fetchTierLimits();
    }
  }, [user?.tier, isAuthenticated]);

  useEffect(() => {
    if (formData.amount && formData.network) {
      calculateGas();
      calculateRequiredGasFee();
      estimateTransactionFee();
    }
  }, [formData.amount, formData.network, gasFeeSettings]);

  // Load recent withdrawal addresses from localStorage
  const loadRecentAddresses = () => {
    try {
      const saved = localStorage.getItem('recentWithdrawalAddresses');
      if (saved) {
        const addresses = JSON.parse(saved);
        // Filter addresses by current network
        const filtered = addresses.filter(addr => addr.network === formData.network);
        setRecentAddresses(filtered.slice(0, 5)); // Keep only last 5
      }
    } catch (err) {
      console.error('Failed to load recent addresses:', err);
    }
  };

  // Save address to recent addresses
  const saveRecentAddress = useCallback((address, network, label = '') => {
    try {
      const saved = localStorage.getItem('recentWithdrawalAddresses');
      let addresses = saved ? JSON.parse(saved) : [];
      
      // Remove duplicate if exists
      addresses = addresses.filter(addr => addr.address !== address);
      
      // Add new address at the beginning
      addresses.unshift({
        address,
        network,
        label: label || `Withdrawal ${new Date().toLocaleDateString()}`,
        timestamp: Date.now()
      });
      
      // Keep only last 10 addresses
      addresses = addresses.slice(0, 10);
      
      localStorage.setItem('recentWithdrawalAddresses', JSON.stringify(addresses));
      loadRecentAddresses();
    } catch (err) {
      console.error('Failed to save recent address:', err);
    }
  }, [formData.network]);

  // Remove address from recent
  const removeRecentAddress = (addressToRemove) => {
    try {
      const saved = localStorage.getItem('recentWithdrawalAddresses');
      if (saved) {
        let addresses = JSON.parse(saved);
        addresses = addresses.filter(addr => addr.address !== addressToRemove);
        localStorage.setItem('recentWithdrawalAddresses', JSON.stringify(addresses));
        loadRecentAddresses();
      }
    } catch (err) {
      console.error('Failed to remove recent address:', err);
    }
  };

  // Select recent address
  const selectRecentAddress = (address) => {
    setFormData({ ...formData, toAddress: address });
    validateWalletAddress(address, formData.network);
    setShowRecentAddresses(false);
  };

  // Estimate transaction fee from API
  const estimateTransactionFee = useCallback(async () => {
    if (!formData.amount || !formData.network) {
      setFeeEstimate(null);
      return;
    }
    
    setIsEstimating(true);
    try {
      const response = await axios.get('/api/withdrawal/estimate-fee', {
        params: {
          amount: formData.amount,
          currency: formData.fromCrypto,
          network: formData.network
        }
      });
      
      setFeeEstimate(response.data.estimate);
    } catch (err) {
      console.error('Failed to estimate fee:', err);
      setFeeEstimate(null);
    } finally {
      setIsEstimating(false);
    }
  }, [formData.amount, formData.fromCrypto, formData.network]);

  const fetchGasBalance = async () => {
    try {
      const response = await axios.get('/api/user/gas-balance');
      console.log('Gas balance response:', response.data);
      setGasBalance(response.data.gasBalance || 0);
      
      // Ensure gas fee settings are properly set with defaults
      const settings = response.data.gasFeeSettings || {};
      setGasFeeSettings({
        enabled: settings.enabled !== undefined ? settings.enabled : true, // Default to true
        percentage: settings.percentage || 2.5,
        minFee: settings.minFee || 5,
        maxFee: settings.maxFee || 500
      });
    } catch (err) {
      console.error('Failed to fetch gas balance:', err);
      // Use default settings if API fails
      setGasFeeSettings({
        enabled: true,
        percentage: 2.5,
        minFee: 5,
        maxFee: 500
      });
    }
  };

  const fetchTierLimits = async () => {
    try {
      const [tierRes, dailyRes] = await Promise.all([
        axios.get('/api/user/tier-limits'),
        axios.get('/api/user/daily-withdrawals')
      ]);
      
      console.log('Tier limits response:', tierRes.data);
      console.log('User tier:', user?.tier);
      
      const userTier = user?.tier || 'bronze';
      console.log('Using tier:', userTier);
      console.log('Available tiers:', Object.keys(tierRes.data.tierLimits || {}));
      
      const limits = tierRes.data.tierLimits?.[userTier] || {
        min: 10,
        max: 10000,
        dailyLimit: 50000
      };
      
      console.log('Setting tier limits:', limits);
      setTierLimits(limits);
      setDailyWithdrawn(dailyRes.data.total || 0);
      
      // Also update gas fee settings from admin settings
      if (tierRes.data.withdrawalGasFee) {
        setGasFeeSettings(tierRes.data.withdrawalGasFee);
      }
    } catch (err) {
      console.error('Failed to fetch tier limits:', err);
    }
  };

  const calculateRequiredGasFee = () => {
    if (!gasFeeSettings.enabled || !formData.amount) {
      setRequiredGasFee(0);
      return;
    }
    // Gas fee is calculated based on the USD value of the withdrawal amount
    // Get the real-time price of the selected crypto
    const portfolioData = portfolio?.[formData.fromCrypto];
    // Handle both cryptoSlice format ({price, change24h}) and walletSlice format (number)
    const priceObj = prices?.[formData.fromCrypto];
    const cryptoPrice = typeof priceObj === 'object' ? priceObj?.price : priceObj || portfolioData?.price || 0;
    const cryptoAmount = parseFloat(formData.amount) || 0;
    
    // Calculate USD value of the withdrawal
    const usdValue = cryptoAmount * cryptoPrice;
    
    // Calculate gas fee as percentage of USD value (in USDT)
    const calculatedFee = Math.min(
      Math.max(usdValue * (gasFeeSettings.percentage / 100), gasFeeSettings.minFee),
      gasFeeSettings.maxFee
    );
    setRequiredGasFee(calculatedFee);
  };

  // Validate wallet address
  const validateWalletAddress = (address, network) => {
    if (!address) {
      setWalletError('');
      return false;
    }
    const pattern = walletPatterns[network];
    if (!pattern) {
      setWalletError('Invalid network selected');
      return false;
    }
    if (!pattern.test(address)) {
      if (network === 'ethereum') {
        setWalletError('Invalid Ethereum address. Must start with 0x followed by 40 hexadecimal characters.');
      } else if (network === 'bitcoin') {
        setWalletError('Invalid Bitcoin address. Must start with 1, 3, or bc1.');
      }
      return false;
    }
    setWalletError('');
    return true;
  };

  const calculateGas = async () => {
    try {
      const response = await axios.get('/api/withdrawal/calculate-gas', {
        params: {
          amount: formData.amount || 0,
          currency: formData.currency,
          network: formData.network,
        }
      });
      setGasInfo(response.data.gasInfo);
    } catch (err) {
      console.error('Gas calculation error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate tier limits before submitting
      const portfolioData = portfolio?.[formData.fromCrypto];
      // Handle both cryptoSlice format ({price, change24h}) and walletSlice format (number)
      const priceObj = prices?.[formData.fromCrypto];
      const cryptoPrice = typeof priceObj === 'object' ? priceObj?.price : priceObj || portfolioData?.price || 0;
      const cryptoAmount = parseFloat(formData.amount) || 0;
      const usdValue = cryptoAmount * cryptoPrice;
      
      // Check minimum withdrawal
      if (usdValue < tierLimits.min) {
        throw new Error(`Minimum withdrawal is ${currencySymbol}${tierLimits.min} ${userCurrency}. Your withdrawal is worth ${currencySymbol}${usdValue.toFixed(2)} ${userCurrency}.`);
      }
      
      // Check maximum per transaction
      if (usdValue > tierLimits.max) {
        throw new Error(`Maximum withdrawal per transaction is ${currencySymbol}${tierLimits.max.toLocaleString()} ${userCurrency} for your ${user?.tier || 'bronze'} tier. Upgrade your tier for higher limits.`);
      }
      
      // Check daily limit
      const remainingDaily = tierLimits.dailyLimit - dailyWithdrawn;
      if (usdValue > remainingDaily) {
        throw new Error(`Daily withdrawal limit exceeded. You have ${currencySymbol}${remainingDaily.toLocaleString()} ${userCurrency} remaining today. Your tier (${user?.tier || 'bronze'}) allows ${currencySymbol}${tierLimits.dailyLimit.toLocaleString()} ${userCurrency} per day.`);
      }
      
      const response = await axios.post('/api/withdrawal/request', formData);
      setWithdrawalResult(response.data.transaction);
      
      // Save the address to recent addresses
      saveRecentAddress(formData.toAddress, formData.network);
      
      setStep(3);
      dispatch(fetchBalance());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Withdrawal request failed');
      if (err.response?.data?.details?.gasSufficient === false) {
        setStep(2); // Show gas warning
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedNetwork = NETWORKS.find(n => n.id === formData.network);
  const selectedCrypto = CRYPTOCURRENCIES.find(c => c.symbol === formData.currency);

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Withdraw Crypto</h2>
      
      <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
        {/* Withdraw From - Crypto Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Withdraw From
          </label>
          <div className="grid grid-cols-2 gap-3">
            {availableCryptos.map((crypto) => {
              // Get balance from portfolio (same as Portfolio page)
              const portfolioData = portfolio?.[crypto.symbol];
              const cryptoBalance = portfolioData?.amount || 0;
              // Handle both cryptoSlice format ({price, change24h}) and walletSlice format (number)
              const priceObj = prices?.[crypto.symbol];
              const cryptoPrice = typeof priceObj === 'object' ? priceObj?.price : priceObj || portfolioData?.price || 0;
              const usdValue = cryptoBalance * cryptoPrice;
              
              const isSelected = formData.fromCrypto === crypto.symbol;
              const hasBalance = cryptoBalance > 0;
              
              return (
                <button
                  key={crypto.symbol}
                  type="button"
                  onClick={() => setFormData({ ...formData, fromCrypto: crypto.symbol })}
                  disabled={!hasBalance}
                  className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : hasBalance
                        ? 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{crypto.icon}</span>
                    <div className="flex-1">
                      <p className={`font-semibold ${isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                        {crypto.symbol}
                      </p>
                      <p className={`text-sm ${hasBalance ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {hasBalance ? `${cryptoBalance.toFixed(6)} ${crypto.symbol}` : 'No balance'}
                      </p>
                      {hasBalance && cryptoPrice > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ≈ {formatCurrency(usdValue, userCurrency)}
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-5 h-5 text-primary-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Select a cryptocurrency with available balance to withdraw from
          </p>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount ({formData.fromCrypto})
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.000001"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0.00"
              required
            />
            <button
              type="button"
              onClick={() => {
                // Calculate max based on tier limit and balance
                const portfolioData = portfolio?.[formData.fromCrypto];
                const cryptoBalance = portfolioData?.amount || 0;
                // Handle both cryptoSlice format ({price, change24h}) and walletSlice format (number)
                const priceObj = prices?.[formData.fromCrypto];
                const cryptoPrice = typeof priceObj === 'object' ? priceObj?.price : priceObj || portfolioData?.price || 0;
                
                // Tier max in USD converted to crypto amount
                const tierMaxUsd = tierLimits.max;
                const tierMaxCrypto = cryptoPrice > 0 ? tierMaxUsd / cryptoPrice : 0;
                
                // Also consider daily limit remaining
                const remainingDailyUsd = tierLimits.dailyLimit - dailyWithdrawn;
                const dailyMaxCrypto = cryptoPrice > 0 ? remainingDailyUsd / cryptoPrice : 0;
                
                // Use the most restrictive limit (tier max, daily remaining, or balance)
                const maxAmount = Math.min(cryptoBalance, tierMaxCrypto, dailyMaxCrypto);
                
                setFormData({ ...formData, amount: Math.max(0, maxAmount).toFixed(6) });
              }}
              className="absolute right-3 top-3 text-primary-600 dark:text-primary-400 text-sm font-medium hover:text-primary-700"
            >
              MAX
            </button>
          </div>
          {(() => {
            // Get balance from portfolio (same as Portfolio page)
            const portfolioData = portfolio?.[formData.fromCrypto];
            const cryptoBalance = portfolioData?.amount || 0;
            
            // Prioritize real-time prices from Redux store, fallback to portfolio price
            // cryptoSlice prices: { BTC: { price: xxx, change24h: yyy } }
            // walletSlice prices: { BTC: xxx }
            const realTimePriceObj = prices?.[formData.fromCrypto];
            const realTimePrice = typeof realTimePriceObj === 'object' ? realTimePriceObj?.price : realTimePriceObj;
            const portfolioPrice = portfolioData?.price;
            const cryptoPrice = realTimePrice || portfolioPrice || 0;
            
            const enteredAmount = parseFloat(formData.amount) || 0;
            const usdValue = enteredAmount * cryptoPrice;
            
            console.log('Price debug:', { 
              fromCrypto: formData.fromCrypto, 
              realTimePrice,
              portfolioPrice,
              cryptoPrice,
              tierLimits,
              userTier: user?.tier
            });
            
            return (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <p>
                  Available: <span className="font-medium text-gray-700 dark:text-gray-300">{cryptoBalance.toFixed(6)} {formData.fromCrypto}</span>
                  <span className="mx-2">|</span>
                  <span className="text-xs">MAX uses your tier limit ({currencySymbol}{tierLimits.max.toLocaleString()} {userCurrency})</span>
                </p>
                {cryptoPrice > 0 && (
                  <p className="text-xs mt-1">
                    Current Price: <span className="font-medium">{formatCurrency(cryptoPrice, userCurrency)}/{formData.fromCrypto}</span>
                    {enteredAmount > 0 && (
                      <span className="ml-2">
                        | You will receive: <span className="font-medium text-primary-600">{formatCurrency(usdValue, userCurrency)}</span>
                      </span>
                    )}
                  </p>
                )}
              </div>
            );
          })()}
        </div>

        {/* Tier Limits Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Withdrawal Limits
            </label>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              user?.tier === 'vip' || user?.tier === 'platinum' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              user?.tier === 'gold' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              user?.tier === 'silver' ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300' :
              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            }`}>
              {(user?.tier || 'bronze').toUpperCase()} TIER
            </span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Min</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{currencySymbol}{tierLimits.min}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Max/Tx</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{currencySymbol}{tierLimits.max.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Daily</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{currencySymbol}{tierLimits.dailyLimit.toLocaleString()}</p>
              </div>
            </div>
            {dailyWithdrawn > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Withdrawn today:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{currencySymbol}{dailyWithdrawn.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500 dark:text-gray-400">Remaining today:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {currencySymbol}{Math.max(0, tierLimits.dailyLimit - dailyWithdrawn).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            <a href="/tier-upgrade" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Upgrade your tier →
            </a> for higher withdrawal limits
          </p>
        </div>

        {/* Transaction Fee - Calculated from Withdrawal Amount */}
        {gasFeeSettings.enabled && formData.amount && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Fee Calculation
            </label>
            <div className={`border p-4 rounded-lg ${
              gasBalance < requiredGasFee 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              {/* Show the calculation */}
              {(() => {
                const portfolioData = portfolio?.[formData.fromCrypto];
                // Handle both cryptoSlice format ({price, change24h}) and walletSlice format (number)
                const priceObj = prices?.[formData.fromCrypto];
                const cryptoPrice = typeof priceObj === 'object' ? priceObj?.price : priceObj || portfolioData?.price || 0;
                const cryptoAmount = parseFloat(formData.amount) || 0;
                const usdValue = cryptoAmount * cryptoPrice;
                
                return (
                  <>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{cryptoAmount.toFixed(6)} {formData.fromCrypto}</span>
                      <span className="mx-1">×</span>
                      <span className="font-medium text-gray-600">{formatCurrency(cryptoPrice, userCurrency)}</span>
                      <span className="mx-1">=</span>
                      <span className="font-medium text-primary-600">{formatCurrency(usdValue, userCurrency)}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="font-medium text-primary-600">{formatCurrency(usdValue, userCurrency)}</span>
                      <span className="mx-1">×</span>
                      <span className="font-medium text-primary-600">{gasFeeSettings.percentage}%</span>
                      <span className="mx-1">=</span>
                      <span className={`font-bold ${
                        gasBalance < requiredGasFee 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-primary-600 dark:text-primary-400'
                      }`}>
                        {formatCurrency(requiredGasFee, userCurrency)} Transaction Fee
                      </span>
                    </div>
                  </>
                );
              })()}
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Transaction fee is calculated from the {userCurrency} value of your withdrawal and deducted from your USDT balance.
              </p>
              
              {/* Min/Max info */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                (Min: {formatCurrency(gasFeeSettings.minFee, userCurrency)} | Max: {formatCurrency(gasFeeSettings.maxFee, userCurrency)})
              </p>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Your USDT Balance:</span>
                  <span className={`font-medium ${
                    gasBalance < requiredGasFee 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {formatCurrency(gasBalance, userCurrency)}
                  </span>
                </div>
              </div>

              {gasBalance < requiredGasFee && (
                <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                    <span className="font-bold">Insufficient USDT balance!</span><br />
                    You need {formatCurrency(requiredGasFee - gasBalance, userCurrency)} more USDT to process this withdrawal.
                  </p>
                  <button 
                    type="button"
                    onClick={() => navigate('/deposit')}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Fuel className="w-4 h-4" />
                    Deposit USDT
                  </button>
                </div>
              )}

              {gasBalance >= requiredGasFee && (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    <span className="font-bold">✓ Sufficient USDT balance</span><br />
                    {formatCurrency(requiredGasFee, userCurrency)} will be deducted from your USDT balance.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transaction Fee Estimation */}
        {formData.amount && (
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Transaction Fee Estimate
              </span>
              {isEstimating && (
                <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
              )}
            </div>
            
            {feeEstimate ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Network Fee:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {feeEstimate.networkFee} {feeEstimate.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {feeEstimate.platformFee} {feeEstimate.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-blue-200 dark:border-blue-800">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Fee:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">
                    {feeEstimate.totalFee} {feeEstimate.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">You Receive:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {feeEstimate.receiveAmount} {feeEstimate.currency}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Estimated confirmation: {feeEstimate.estimatedTime || '10-30 minutes'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEstimating ? 'Calculating fees...' : 'Enter amount to see fee estimate'}
              </p>
            )}
          </div>
        )}

        {/* Network Selection - Only ETH and BTC */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Network
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableNetworks.map((network) => {
              const isSelected = formData.network === network.id;
              return (
                <button
                  key={network.id}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, network: network.id, toAddress: '' });
                    setWalletError('');
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-center">
                    <p className={`font-medium ${isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                      {network.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Destination Address */}
        <div className="mb-4 relative">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Destination Address ({formData.network === 'ethereum' ? 'ERC-20' : 'BTC'})
            </label>
            {recentAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowRecentAddresses(!showRecentAddresses)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
              >
                <History className="w-4 h-4" />
                Recent
                <ChevronDown className={`w-4 h-4 transition-transform ${showRecentAddresses ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          
          {/* Recent Addresses Dropdown */}
          <AnimatePresence>
            {showRecentAddresses && recentAddresses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mb-2"
                style={{ bottom: '100%' }}
              >
                <div className="p-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">Recent Addresses</p>
                  {recentAddresses.map((addr, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer group"
                    >
                      <div 
                        className="flex-1 min-w-0"
                        onClick={() => selectRecentAddress(addr.address)}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {addr.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {truncateAddress(addr.address)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentAddress(addr.address);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <input
            type="text"
            value={formData.toAddress}
            onChange={(e) => {
              const address = e.target.value;
              setFormData({ ...formData, toAddress: address });
              validateWalletAddress(address, formData.network);
            }}
            className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              walletError 
                ? 'border-red-500 dark:border-red-500' 
                : formData.toAddress && !walletError 
                  ? 'border-green-500 dark:border-green-500' 
                  : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder={formData.network === 'ethereum' 
              ? '0x... (42 characters)' 
              : '1... or 3... or bc1...'
            }
            required
          />
          {walletError && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {walletError}
            </p>
          )}
          {formData.toAddress && !walletError && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Valid {formData.network === 'ethereum' ? 'Ethereum' : 'Bitcoin'} address
            </p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={
            (gasFeeSettings.enabled && gasBalance < requiredGasFee) || 
            walletError || 
            !formData.toAddress
          }
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
        >
          {gasFeeSettings.enabled && gasBalance < requiredGasFee 
            ? 'Insufficient USDT Balance' 
            : walletError 
              ? 'Invalid Wallet Address'
              : 'Withdraw'
          }
        </button>
      </form>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Review Details */}
      <div className="bg-gray-50 dark:bg-crypto-bg rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Review Withdrawal</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Withdraw From</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.fromCrypto} Balance
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Amount</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.amount} {formData.fromCrypto}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Network</span>
            <span className="font-medium text-gray-900 dark:text-white">{selectedNetwork?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">To Address</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {truncateAddress(formData.toAddress)}
            </span>
          </div>
          {gasFeeSettings.enabled && (
            <div className="flex justify-between items-start">
              <span className="text-gray-600 dark:text-gray-400">
                Transaction Fee<br />
                <span className="text-xs text-gray-500">
                  ({formatCurrency(parseFloat(formData.amount) || 0, userCurrency)} {formData.fromCrypto} × {gasFeeSettings.percentage}%)
                </span>
              </span>
              <span className={`font-medium text-right ${
                gasBalance < requiredGasFee 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {formatCurrency(requiredGasFee)} USDT
                {gasBalance < requiredGasFee && (
                  <span className="text-red-500 text-xs block">(Insufficient Gas)</span>
                )}
              </span>
            </div>
          )}
          <div className="border-t border-gray-200 dark:border-crypto-border pt-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-900 dark:text-white">Total Deduction</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(parseFloat(formData.amount) + (gasInfo?.userPays || 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gas Warning */}
      {gasFeeSettings.enabled && gasBalance < requiredGasFee && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Fuel className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Insufficient USDT Balance
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                You need {formatCurrency(requiredGasFee - gasBalance, userCurrency)} more USDT to cover the transaction fee.
              </p>
              <button 
                onClick={() => navigate('/deposit')}
                className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Deposit USDT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Percentage Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Withdrawal Limit
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Your current withdrawal limit is 75% of your balance. 
              Contact support to increase your limit.
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 btn-secondary py-3"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || (gasFeeSettings.enabled && gasBalance < requiredGasFee)}
          className="flex-1 btn-primary py-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : gasFeeSettings.enabled && gasBalance < requiredGasFee ? (
            'Insufficient Gas'
          ) : (
            'Confirm Withdrawal'
          )}
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Withdrawal Submitted!
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Your withdrawal request has been submitted and is pending BitSolidus Team approval.
      </p>
      
      {withdrawalResult && (
        <div className="bg-gray-50 dark:bg-crypto-bg rounded-lg p-4 mb-6 text-left max-w-sm mx-auto">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Amount</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(withdrawalResult.amount, userCurrency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className="capitalize text-yellow-600 dark:text-yellow-400">{withdrawalResult.status}</span>
            </div>
            {withdrawalResult.blockedAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Blocked (75% limit)</span>
                <span className="text-red-600 dark:text-red-400">{formatCurrency(withdrawalResult.blockedAmount, userCurrency)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setStep(1);
          setFormData({ amount: '', currency: 'BTC', network: 'ethereum', toAddress: '' });
          setWithdrawalResult(null);
        }}
        className="btn-primary px-8 py-3"
      >
        New Withdrawal
      </button>
    </motion.div>
  );

  // Insufficient USDT Modal
  const renderGasModal = () => {
    if (!showGasModal) return null;
    
    const deficit = Math.max(0, requiredGasFee - gasBalance);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Fuel className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Insufficient USDT Balance
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need additional USDT to complete this withdrawal
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Transaction Fee Calculation:
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {formatCurrency(parseFloat(formData.amount) || 0, userCurrency)} {formData.fromCrypto} × {gasFeeSettings.percentage}% = {formatCurrency(requiredGasFee, userCurrency)}
              </p>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Required Transaction Fee:</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(requiredGasFee, userCurrency)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Your USDT Balance:</span>
                <span className={`font-bold ${gasBalance < requiredGasFee ? 'text-red-500' : 'text-green-500'}`}>
                  {formatCurrency(gasBalance, userCurrency)}
                </span>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">USDT Needed:</span>
                  <span className="font-bold text-red-500">{formatCurrency(deficit, userCurrency)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowGasModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowGasModal(false);
                  navigate('/deposit');
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Deposit USDT
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Withdraw</h1>
      
      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {s}
            </div>
            {i < 2 && (
              <div className={`w-16 h-1 mx-2 ${
                step > s ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <AnimatePresence mode="wait">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </AnimatePresence>
      </div>

      {/* Gas Modal */}
      {renderGasModal()}
    </div>
  );
};

export default Withdraw;
