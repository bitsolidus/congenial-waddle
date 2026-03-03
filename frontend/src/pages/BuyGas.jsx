import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Fuel, 
  Wallet, 
  ArrowRight, 
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowDownLeft,
  Bitcoin,
  Coins,
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '../utils/helpers';

const BuyGas = () => {
  const { user } = useSelector((state) => state.auth);
  const [amount, setAmount] = useState('');
  const [gasBalance, setGasBalance] = useState(0);
  const [gasFeeSettings, setGasFeeSettings] = useState({
    enabled: false,
    percentage: 2.5,
    minFee: 5,
    maxFee: 500
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchGasBalance();
  }, []);

  const fetchGasBalance = async () => {
    try {
      const response = await axios.get('/api/user/gas-balance');
      setGasBalance(response.data.gasBalance || 0);
      setGasFeeSettings(response.data.gasFeeSettings || {
        enabled: false,
        percentage: 2.5,
        minFee: 5,
        maxFee: 500
      });
    } catch (err) {
      console.error('Failed to fetch gas balance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyGas = async () => {
    const buyAmount = parseFloat(amount);
    if (!buyAmount || buyAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    const usdtBalance = user?.balance?.USDT || 0;
    if (buyAmount > usdtBalance) {
      setMessage({ type: 'error', text: 'Insufficient USDT balance' });
      return;
    }

    setIsProcessing(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/user/buy-gas', { amount: buyAmount });
      setGasBalance(response.data.gasBalance);
      if (response.data.status === 'pending') {
        setMessage({ 
          type: 'success', 
          text: 'Gas purchase submitted! It will be available after BitSolidus Team approval.' 
        });
      } else {
        setMessage({ type: 'success', text: 'Gas purchased successfully!' });
      }
      setAmount('');
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to purchase gas' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const usdtBalance = user?.balance?.USDT || 0;
  const calculatedGasFee = gasFeeSettings.enabled ? 
    Math.min(Math.max(1000 * (gasFeeSettings.percentage / 100), gasFeeSettings.minFee), gasFeeSettings.maxFee) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy Gas</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Deposit USDT to cover withdrawal gas fees
        </p>
      </div>

      {/* Gas Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">Your Gas Balance</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(gasBalance)}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Fuel className="w-8 h-8" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-sm text-primary-100">
            Gas fees are deducted from this balance when you make withdrawals
          </p>
        </div>
        
        {/* Quick Deposit Button for low balance */}
        {usdtBalance < 10 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <Link
              to="/deposit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Deposit Funds First
            </Link>
          </div>
        )}
      </motion.div>

      {/* Gas Fee Info */}
      {gasFeeSettings.enabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Current Gas Fee Rate
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Withdrawal gas fee: <strong>{gasFeeSettings.percentage}%</strong> of withdrawal amount
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Minimum: {formatCurrency(gasFeeSettings.minFee)} | Maximum: {formatCurrency(gasFeeSettings.maxFee)}
              </p>
              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Example: For a $1,000 withdrawal, gas fee = {formatCurrency(calculatedGasFee)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Buy Gas Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Purchase Gas
        </h2>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (USDT)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                className="input-field w-full pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                USDT
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Available USDT Balance: {formatCurrency(usdtBalance)}
            </p>
            
            {/* Low Balance Warning & Deposit Options */}
            {usdtBalance < 10 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-2">
                      Low USDT Balance
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                      You need USDT to buy gas. Deposit USDT or other cryptocurrencies to your account.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Link
                        to="/deposit"
                        className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-colors"
                      >
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">Deposit USDT</p>
                          <p className="text-xs text-gray-500">Direct gas funding</p>
                        </div>
                      </Link>
                      
                      <Link
                        to="/deposit"
                        className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-colors"
                      >
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                          <Bitcoin className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">Deposit BTC</p>
                          <p className="text-xs text-gray-500">Trade for USDT</p>
                        </div>
                      </Link>
                      
                      <Link
                        to="/deposit"
                        className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <Coins className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">Deposit ETH</p>
                          <p className="text-xs text-gray-500">Trade for USDT</p>
                        </div>
                      </Link>
                    </div>
                    
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
                      <Link to="/deposit" className="underline hover:text-amber-700">
                        Go to Deposit Page →
                      </Link>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2">
            {[10, 25, 50, 100, 250].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                disabled={quickAmount > usdtBalance}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ${quickAmount}
              </button>
            ))}
          </div>

          {/* Summary */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">You pay</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(parseFloat(amount))} USDT
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Gas balance after</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(gasBalance + parseFloat(amount))}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Remaining USDT</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(usdtBalance - parseFloat(amount))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleBuyGas}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > usdtBalance}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Buy Gas
                {amount && parseFloat(amount) > 0 && (
                  <span className="ml-1">({formatCurrency(parseFloat(amount))})</span>
                )}
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            What is Gas?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gas is a fee required to process transactions on the blockchain. 
            We use your gas balance to cover these fees when you make withdrawals.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            How it Works
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            1. Deposit USDT to your gas balance<br />
            2. Gas fees are automatically deducted during withdrawals<br />
            3. No gas = No withdrawal processing
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BuyGas;
