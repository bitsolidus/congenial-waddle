import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchBalance, fetchTransactions } from '../store/walletSlice';
import { fetchCryptoPrices } from '../store/cryptoSlice';
import { motion } from 'framer-motion';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  Wallet, 
  Clock,
  ChevronRight,
  DollarSign,
  Bitcoin,
  Coins,
  Eye,
  EyeOff,
  Bell,
  AlertCircle,
  Shield,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatPercentage, formatRelativeTime, getStatusColor, formatNumber } from '../utils/helpers';
import { convertFromUSD, formatCurrencyWithSymbol } from '../utils/currency';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import axios from 'axios';

// Crypto icons and colors mapping
const cryptoIcons = {
  BTC: { Icon: Bitcoin, color: '#F7931A', name: 'Bitcoin' },
  ETH: { Icon: Coins, color: '#627EEA', name: 'Ethereum' },
  BNB: { Icon: Wallet, color: '#F3BA2F', name: 'BNB' },
  USDT: { Icon: DollarSign, color: '#26A17B', name: 'Tether' },
  SOL: { Icon: TrendingUp, color: '#00FFA3', name: 'Solana' },
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { balance, portfolio, totalDeposited, totalWithdrawn, transactions, isLoading } = useSelector((state) => state.wallet);
  const { prices } = useSelector((state) => state.crypto);
  
  // Get user's currency preference
  const userCurrency = user?.currency || 'USD';
  
  // View mode toggle (fiat vs crypto)
  const [viewMode, setViewMode] = useState('fiat'); // 'fiat' or 'crypto'
  const [showBalance, setShowBalance] = useState(true);
  
  // New states for enhanced dashboard
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [pendingActions, setPendingActions] = useState({
    kyc: false,
    deposits: 0,
    withdrawals: 0,
    notifications: 0
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchBalance()),
        dispatch(fetchTransactions({ limit: 5 })),
        dispatch(fetchCryptoPrices())
      ]);
      
      // Fetch portfolio history for chart
      try {
        const historyRes = await axios.get('/api/user/portfolio-history');
        setPortfolioHistory(historyRes.data.history || []);
      } catch (err) {
        console.log('Portfolio history not available');
      }
      
      // Fetch pending actions count
      try {
        const pendingRes = await axios.get('/api/user/pending-actions');
        setPendingActions(pendingRes.data.actions || {
          kyc: user?.kycStatus === 'not_submitted',
          deposits: 0,
          withdrawals: 0,
          notifications: 0
        });
      } catch (err) {
        console.log('Pending actions not available');
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, isAuthenticated, user?.kycStatus]);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData, isAuthenticated]);

  const quickActions = [
    { to: '/deposit', icon: ArrowDownLeft, label: 'Deposit', color: 'bg-green-500' },
    { to: '/withdraw', icon: ArrowUpRight, label: 'Withdraw', color: 'bg-red-500' },
    { to: '/trade', icon: TrendingUp, label: 'Trade', color: 'bg-blue-500' },
    { to: '/trade', icon: DollarSign, label: 'Buy Crypto', color: 'bg-purple-500' },
  ];

  // Generate chart data from portfolio history or fallback
  const chartData = portfolioHistory.length > 0 
    ? portfolioHistory.map(h => ({
        time: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: h.value
      }))
    : [
        { time: 'Mon', value: (balance?.total || 0) * 0.95 },
        { time: 'Tue', value: (balance?.total || 0) * 0.98 },
        { time: 'Wed', value: (balance?.total || 0) * 0.96 },
        { time: 'Thu', value: (balance?.total || 0) * 1.02 },
        { time: 'Fri', value: (balance?.total || 0) * 1.05 },
        { time: 'Sat', value: (balance?.total || 0) * 1.03 },
        { time: 'Sun', value: balance?.total || 0 },
      ];

  // Calculate total pending actions
  const totalPending = pendingActions.deposits + pendingActions.withdrawals + pendingActions.notifications;
  
  // Check if KYC is rejected
  const isKycRejected = user?.kycStatus === 'rejected';

  // Show loading skeleton if data is not ready
  const isDataReady = !isLoading && balance && portfolio && !isRefreshing;

  if ((isLoading || isRefreshing) && !balance?.total && balance?.total !== 0) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
          </div>
        </div>
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user?.firstName 
                ? user.firstName 
                : user?.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your portfolio today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Updated {formatRelativeTime(lastUpdated.toISOString())}
          </span>
        </div>
      </div>

      {/* KYC Rejected Alert - High Priority */}
      {isKycRejected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white shadow-lg border-2 border-red-400"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">KYC Verification Rejected</h3>
              <p className="text-white/90 mb-4">
                Your submitted KYC documents were rejected by our verification team.
                {user?.kycData?.rejectionReason && (
                  <span className="block mt-2 px-4 py-2 bg-white/10 rounded-lg">
                    <strong>Reason:</strong> {user.kycData.rejectionReason}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/kyc"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-700 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Resubmit KYC Now
                </Link>
                <a
                  href="/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-800/50 text-white rounded-lg font-medium hover:bg-red-800 transition-colors"
                >
                  Contact Support
                </a>
              </div>
              <p className="text-sm text-white/70 mt-3">
                You must complete KYC verification to access withdrawals and full platform features.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pending Actions Banner */}
      {(totalPending > 0 || pendingActions.kyc) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">You have pending actions</h3>
                <p className="text-sm text-white/80">
                  {pendingActions.kyc && 'Complete your KYC verification. '}
                  {pendingActions.deposits > 0 && `${pendingActions.deposits} pending deposit${pendingActions.deposits > 1 ? 's' : ''}. `}
                  {pendingActions.withdrawals > 0 && `${pendingActions.withdrawals} pending withdrawal${pendingActions.withdrawals > 1 ? 's' : ''}. `}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {pendingActions.kyc && (
                <Link
                  to="/kyc"
                  className="px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Complete KYC
                </Link>
              )}
              <Link
                to="/notifications"
                className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                View All
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {viewMode === 'crypto' ? 'Total Crypto Holdings' : 'Total Balance'}
            </h3>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('fiat')}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'fiat'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {userCurrency}
                </button>
                <button
                  onClick={() => setViewMode('crypto')}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'crypto'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Crypto
                </button>
              </div>
              {/* Hide/Show Toggle */}
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {showBalance ? (
              !isDataReady ? (
                <span className="inline-block w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : viewMode === 'crypto' ? (
                // In crypto view, show breakdown of holdings
                <span className="text-lg">
                  {portfolio && Object.entries(portfolio)
                    .filter(([_, data]) => (data?.amount || 0) > 0)
                    .map(([crypto, data], index, arr) => (
                      <span key={crypto}>
                        {formatNumber(data.amount, crypto === 'USDT' ? 2 : 4)} {crypto}
                        {index < arr.length - 1 ? ' + ' : ''}
                      </span>
                    ))}
                </span>
              ) : userCurrency !== 'USD' ? (
                // In fiat view with non-USD currency
                formatCurrencyWithSymbol(convertFromUSD(balance?.total || 0, userCurrency), userCurrency)
              ) : (
                // Default USD view
                formatCurrency(balance?.total || 0)
              )
            ) : (
              '****'
            )}
          </p>
          {showBalance && viewMode === 'fiat' && userCurrency !== 'USD' && (
            <p className="text-xs text-gray-400 mt-1">≈ {formatCurrency(balance?.total || 0)} USD</p>
          )}
          {showBalance && viewMode === 'crypto' && portfolio && (
            <p className="text-xs text-gray-400 mt-1">
              ≈ {userCurrency !== 'USD' 
                ? formatCurrencyWithSymbol(convertFromUSD(balance?.total || 0, userCurrency), userCurrency)
                : formatCurrency(balance?.total || 0)} total value
              {userCurrency !== 'USD' && (
                <span className="text-gray-500"> ({formatCurrency(balance?.total || 0)} USD)</span>
              )}
            </p>
          )}
          <p className={`text-sm mt-1 ${(balance?.change24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercentage(balance?.change24h || 0)}
          </p>
        </motion.div>

        {/* Total Deposits Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Deposits</h3>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {userCurrency !== 'USD' 
              ? formatCurrencyWithSymbol(convertFromUSD(totalDeposited || 0, userCurrency), userCurrency)
              : formatCurrency(totalDeposited || 0)}
          </p>
          <p className="text-sm text-green-500 mt-1">+0.00%</p>
        </motion.div>

        {/* Total Withdrawals Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Withdrawals</h3>
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {userCurrency !== 'USD' 
              ? formatCurrencyWithSymbol(convertFromUSD(totalWithdrawn || 0, userCurrency), userCurrency)
              : formatCurrency(totalWithdrawn || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Lifetime</p>
        </motion.div>
      </div>

      {/* Portfolio Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Portfolio Performance</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">7-day balance history</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {userCurrency !== 'USD' 
                ? formatCurrencyWithSymbol(convertFromUSD(balance?.total || 0, userCurrency), userCurrency)
                : formatCurrency(balance?.total || 0)}
            </span>
            <span className={`text-sm ${(balance?.change24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(balance?.change24h || 0) >= 0 ? '+' : ''}{(balance?.change24h || 0).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                hide 
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => [
                  userCurrency !== 'USD' 
                    ? formatCurrencyWithSymbol(convertFromUSD(value, userCurrency), userCurrency)
                    : formatCurrency(value), 
                  'Balance'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={action.to}
                className="flex flex-col items-center p-6 bg-white dark:bg-crypto-card rounded-xl border border-gray-200 dark:border-crypto-border hover:border-primary-500 dark:hover:border-primary-500 transition-all group"
              >
                <div className={`h-12 w-12 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Portfolio Overview */}
      {portfolio && typeof portfolio === 'object' && Object.values(portfolio).some(p => p && p.amount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Portfolio Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(portfolio).map(([crypto, data]) => {
              if (!data || data.amount <= 0) return null;
              const icons = { USDT: DollarSign, BTC: Bitcoin, ETH: Coins, BNB: Wallet };
              const colors = {
                USDT: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900',
                BTC: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900',
                ETH: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900',
                BNB: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900',
              };
              const Icon = icons[crypto] || DollarSign;
              return (
                <div key={crypto} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[crypto]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{crypto}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(data.amount || 0).toLocaleString()} {crypto}
                    </p>
                    <p className="text-xs text-gray-400">
                      ≈ {userCurrency !== 'USD' 
                        ? formatCurrencyWithSymbol(convertFromUSD(data.value || 0, userCurrency), userCurrency)
                        : formatCurrency(data.value || 0)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
            <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-500 flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="skeleton h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((tx) => (
                <div 
                  key={tx._id} 
                  onClick={() => navigate(`/transactions/${tx._id}`)}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-crypto-bg rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-green-100 dark:bg-green-900' :
                      tx.type === 'withdrawal' ? 'bg-red-100 dark:bg-red-900' :
                      'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" /> :
                       tx.type === 'withdrawal' ? <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" /> :
                       <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{tx.type}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatRelativeTime(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      tx.type === 'deposit' ? 'text-green-600 dark:text-green-400' :
                      tx.type === 'withdrawal' ? 'text-red-600 dark:text-red-400' :
                      'text-gray-900 dark:text-white'
                    }`}>
                      {tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : ''}
                      {userCurrency !== 'USD' 
                        ? formatCurrencyWithSymbol(convertFromUSD(tx.amount, userCurrency), userCurrency)
                        : formatCurrency(tx.amount)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
              <Link to="/deposit" className="text-primary-600 hover:text-primary-500 text-sm mt-2 inline-block">
                Make your first deposit
              </Link>
            </div>
          )}
        </motion.div>

        {/* Popular Cryptocurrencies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Popular Cryptos</h3>
          <div className="space-y-4">
            {Object.entries(prices || {}).map(([symbol, data]) => {
              const cryptoInfo = cryptoIcons[symbol] || { Icon: TrendingUp, color: '#888888', name: symbol };
              const Icon = cryptoInfo.Icon;
              const change24h = data?.change24h || 0;
              const price = data?.price || 0;
              
              return (
                <div key={symbol} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-crypto-bg rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: cryptoInfo.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{symbol}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{cryptoInfo.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {userCurrency !== 'USD' 
                        ? formatCurrencyWithSymbol(convertFromUSD(price, userCurrency), userCurrency)
                        : formatCurrency(price)}
                    </p>
                    <p className={`text-sm ${change24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <Link to="/portfolio" className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-500">
            View Portfolio
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
