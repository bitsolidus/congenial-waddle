import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBalance } from '../store/walletSlice';
import { fetchCryptoPrices } from '../store/cryptoSlice';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Bitcoin,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  RefreshCw,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { convertFromUSD, formatCurrencyWithSymbol } from '../utils/currency';

const cryptoIcons = {
  USDT: DollarSign,
  BTC: Bitcoin,
  ETH: Coins,
  BNB: Wallet,
};

const cryptoColors = {
  USDT: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  BTC: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  ETH: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  BNB: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
};

const cryptoNames = {
  USDT: 'Tether',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  BNB: 'BNB',
};

const Portfolio = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { balance, portfolio, totalDeposited, totalWithdrawn, isLoading } = useSelector((state) => state.wallet);
  const { prices } = useSelector((state) => state.crypto);
  
  // Toggle states
  const [showBalance, setShowBalance] = useState(true);
  const [viewMode, setViewMode] = useState('fiat'); // 'fiat' or 'crypto'
  
  // Get user's currency preference
  const userCurrency = user?.currency || 'USD';

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchBalance());
      dispatch(fetchCryptoPrices());
      
      // Auto-refresh prices every 30 seconds for real-time updates
      const interval = setInterval(() => {
        dispatch(fetchBalance());
        dispatch(fetchCryptoPrices());
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [dispatch, isAuthenticated]);

  // Calculate portfolio stats from backend data
  // Backend returns: amount = crypto amount, value = USD value
  const portfolioItems = Object.entries(portfolio || {})
    .filter(([_, data]) => (data?.amount || 0) > 0)
    .map(([crypto, data]) => {
      return {
        crypto,
        amount: data.amount,           // Actual crypto amount from backend
        usdValue: data.value || 0,     // USD value from backend
        price: data.price || prices?.[crypto]?.price || 0,
        change24h: prices?.[crypto]?.change24h || 0,
      };
    });

  // Calculate total portfolio value in USD (from backend values)
  const totalValue = portfolioItems.reduce((sum, item) => sum + item.usdValue, 0);
  const netDeposit = (totalDeposited || 0) - (totalWithdrawn || 0);

  // Show loading skeleton if data is not ready
  const isDataReady = !isLoading && balance && portfolio;

  if (isLoading && !balance?.total) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
          </div>
        </div>
        {/* Balance Card Skeleton */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8">
          <div className="h-4 w-32 bg-white/20 rounded animate-pulse mb-2" />
          <div className="h-12 w-64 bg-white/20 rounded animate-pulse" />
        </div>
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
          <p className="text-gray-500 dark:text-gray-400">View your cryptocurrency holdings and performance</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('fiat')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'fiat'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {userCurrency}
            </button>
            <button
              onClick={() => setViewMode('crypto')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'crypto'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Crypto
            </button>
          </div>
          
          {/* Hide/Show Balance Toggle */}
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => dispatch(fetchCryptoPrices())}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm mb-1">
              {viewMode === 'crypto' ? 'Total Crypto Holdings' : 'Total Portfolio Value'}
            </p>
            <h2 className="text-4xl font-bold">
              {showBalance ? (
                !isDataReady ? (
                  <span className="inline-block w-48 h-12 bg-white/20 rounded animate-pulse" />
                ) : viewMode === 'crypto' ? (
                  // In crypto view, show breakdown of holdings like Dashboard
                  <span className="text-2xl">
                    {portfolioItems.map((item, index) => (
                      <span key={item.crypto}>
                        {formatNumber(item.amount, item.crypto === 'USDT' ? 2 : 4)} {item.crypto}
                        {index < portfolioItems.length - 1 ? ' + ' : ''}
                      </span>
                    ))}
                  </span>
                ) : viewMode === 'fiat' && userCurrency !== 'USD' ? (
                  // In fiat view with non-USD currency
                  formatCurrencyWithSymbol(convertFromUSD(totalValue, userCurrency), userCurrency)
                ) : (
                  // Default USD view
                  formatCurrency(totalValue)
                )
              ) : (
                '****'
              )}
            </h2>
            {showBalance && viewMode === 'fiat' && userCurrency !== 'USD' && (
              <p className="text-purple-200 text-sm mt-1">
                ≈ {formatCurrency(totalValue)} USD
              </p>
            )}
            {showBalance && viewMode === 'crypto' && (
              <>
                <p className="text-purple-200 text-sm mt-1">
                  ≈ {userCurrency !== 'USD' 
                    ? formatCurrencyWithSymbol(convertFromUSD(totalValue, userCurrency), userCurrency)
                    : formatCurrency(totalValue)} total value
                  {userCurrency !== 'USD' && (
                    <span className="text-purple-300"> ({formatCurrency(totalValue)} USD)</span>
                  )}
                </p>
                <p className="text-purple-200 text-sm">
                  Across {portfolioItems.length} cryptocurrency{portfolioItems.length !== 1 ? 'ies' : 'y'}
                </p>
              </>
            )}
            <div className="flex items-center gap-2 mt-2">
              {balance?.change24h >= 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-300" />
                  <span className="text-green-300 text-sm">+{balance?.change24h}% ({showBalance ? `$${balance?.change24hValue}` : '****'})</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-300" />
                  <span className="text-red-300 text-sm">{balance?.change24h}% ({showBalance ? `$${balance?.change24hValue}` : '****'})</span>
                </>
              )}
              <span className="text-purple-200 text-sm">24h</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <PieChart className="w-8 h-8 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Deposited</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {showBalance ? (
              !isDataReady ? (
                <span className="inline-block w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : userCurrency !== 'USD' 
                ? formatCurrencyWithSymbol(convertFromUSD(totalDeposited || 0, userCurrency), userCurrency)
                : formatCurrency(totalDeposited)
            ) : '****'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Withdrawn</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {showBalance ? (
              !isDataReady ? (
                <span className="inline-block w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : userCurrency !== 'USD' 
                ? formatCurrencyWithSymbol(convertFromUSD(totalWithdrawn || 0, userCurrency), userCurrency)
                : formatCurrency(totalWithdrawn)
            ) : '****'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Net Deposit</span>
          </div>
          <p className={`text-2xl font-bold ${netDeposit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {showBalance ? (
              !isDataReady ? (
                <span className="inline-block w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : userCurrency !== 'USD' 
                ? formatCurrencyWithSymbol(convertFromUSD(netDeposit, userCurrency), userCurrency)
                : formatCurrency(netDeposit)
            ) : '****'}
          </p>
        </motion.div>
      </div>

      {/* Portfolio Holdings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Assets</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {portfolioItems.length} cryptocurrency{portfolioItems.length !== 1 ? 'ies' : 'y'} in your portfolio
          </p>
        </div>

        {portfolioItems.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assets yet</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Start building your portfolio by making a deposit</p>
            <a
              href="/deposit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Make Deposit
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {portfolioItems.map((item, index) => {
              const Icon = cryptoIcons[item.crypto] || DollarSign;
              const percentage = totalValue > 0 ? ((item.usdValue / totalValue) * 100).toFixed(1) : 0;
              
              return (
                <motion.div
                  key={item.crypto}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cryptoColors[item.crypto]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.crypto}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{cryptoNames[item.crypto]}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        @ {formatCurrency(item.price)} per {item.crypto}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {showBalance ? (
                        viewMode === 'crypto' ? (
                          // In crypto view, show crypto amount as main value
                          item.crypto === 'USDT' 
                            ? `${formatNumber(item.amount, 2)} USDT`
                            : `${formatNumber(item.amount, 8)} ${item.crypto}`
                        ) : viewMode === 'fiat' && userCurrency !== 'USD' ? (
                          // In fiat view with non-USD currency
                          formatCurrencyWithSymbol(convertFromUSD(item.usdValue, userCurrency), userCurrency)
                        ) : (
                          // Default USD view
                          formatCurrency(item.usdValue)
                        )
                      ) : '****'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {viewMode === 'crypto' ? (
                        // In crypto view, show USD value as secondary
                        `≈ ${formatCurrency(item.usdValue)}`
                      ) : (
                        // In fiat view, show crypto amount as secondary
                        item.crypto === 'USDT' 
                          ? `${formatNumber(item.amount, 2)} USDT`
                          : `${formatNumber(item.amount, 8)} ${item.crypto}`
                      )}
                    </p>
                    <p className={`text-xs ${item.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}% (24h)
                    </p>
                  </div>

                  <div className="hidden sm:block w-32">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { to: '/deposit', icon: ArrowDownLeft, label: 'Deposit', color: 'bg-green-500' },
          { to: '/withdraw', icon: ArrowUpRight, label: 'Withdraw', color: 'bg-red-500' },
          { to: '/trade', icon: TrendingUp, label: 'Trade', color: 'bg-blue-500' },
          { to: '/transactions', icon: Wallet, label: 'History', color: 'bg-purple-500' },
        ].map((action, index) => (
          <a
            key={action.label}
            href={action.to}
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
          </a>
        ))}
      </motion.div>
    </div>
  );
};

export default Portfolio;
