import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { formatCurrency, formatNumber } from '../../utils/helpers';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const { prices } = useSelector((state) => state.crypto);

  useEffect(() => {
    fetchAnalytics();
    fetchRecentActivity();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/admin/analytics?timeframe=${timeRange}`);
      setAnalytics(response.data.analytics);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await axios.get('/api/admin/transactions?limit=5');
      setRecentActivity(response.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch recent activity:', err);
    }
  };

  const stats = analytics ? [
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics.totalRevenue || 0),
      change: analytics.revenueChange || '+0%',
      positive: (analytics.revenueChange || '').includes('+'),
      icon: Wallet,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Users',
      value: formatNumber(analytics.activeUsers || 0),
      change: analytics.userChange || '+0%',
      positive: (analytics.userChange || '').includes('+'),
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Trading Volume',
      value: formatCurrency(analytics.tradingVolume || 0),
      change: analytics.volumeChange || '+0%',
      positive: (analytics.volumeChange || '').includes('+'),
      icon: Activity,
      color: 'bg-purple-500'
    },
    {
      title: 'Avg. Transaction',
      value: formatCurrency(analytics.avgTransaction || 0),
      change: analytics.avgChange || '+0%',
      positive: (analytics.avgChange || '').includes('+'),
      icon: BarChart3,
      color: 'bg-orange-500'
    }
  ] : [];

  // Live crypto prices from Redux store
  const topCryptos = prices ? [
    { 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      price: prices.bitcoin?.usd || 0, 
      change: (prices.bitcoin?.usd_24h_change || 0).toFixed(2) + '%', 
      volume: formatCurrency(prices.bitcoin?.usd_24h_vol || 0), 
      positive: (prices.bitcoin?.usd_24h_change || 0) >= 0 
    },
    { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      price: prices.ethereum?.usd || 0, 
      change: (prices.ethereum?.usd_24h_change || 0).toFixed(2) + '%', 
      volume: formatCurrency(prices.ethereum?.usd_24h_vol || 0), 
      positive: (prices.ethereum?.usd_24h_change || 0) >= 0 
    },
    { 
      name: 'BNB', 
      symbol: 'BNB', 
      price: prices.binancecoin?.usd || 0, 
      change: (prices.binancecoin?.usd_24h_change || 0).toFixed(2) + '%', 
      volume: formatCurrency(prices.binancecoin?.usd_24h_vol || 0), 
      positive: (prices.binancecoin?.usd_24h_change || 0) >= 0 
    },
    { 
      name: 'Solana', 
      symbol: 'SOL', 
      price: prices.solana?.usd || 0, 
      change: (prices.solana?.usd_24h_change || 0).toFixed(2) + '%', 
      volume: formatCurrency(prices.solana?.usd_24h_vol || 0), 
      positive: (prices.solana?.usd_24h_change || 0) >= 0 
    },
    { 
      name: 'Cardano', 
      symbol: 'ADA', 
      price: prices.cardano?.usd || 0, 
      change: (prices.cardano?.usd_24h_change || 0).toFixed(2) + '%', 
      volume: formatCurrency(prices.cardano?.usd_24h_vol || 0), 
      positive: (prices.cardano?.usd_24h_change || 0) >= 0 
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor platform performance and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-4 py-12 text-center text-gray-500">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Loading analytics...
          </div>
        ) : stats.length > 0 ? (
          stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-4 py-12 text-center text-gray-500">
            No analytics data available
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart - Live Data */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : analytics?.dailyStats?.length > 0 ? (
            <>
              <div className="h-64 flex items-end justify-between gap-2">
                {(() => {
                  const maxVolume = Math.max(...analytics.dailyStats.map(d => d.volume || 0), 1);
                  return analytics.dailyStats.map((day, i) => {
                    const height = maxVolume > 0 ? ((day.volume || 0) / maxVolume) * 100 : 0;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-purple-500/20 rounded-t-lg relative group cursor-pointer"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${day.date}: ${formatCurrency(day.volume || 0)}`}
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-purple-500 rounded-t-lg transition-all duration-300 group-hover:bg-purple-600"
                          style={{ height: '100%' }}
                        />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {formatCurrency(day.volume || 0)}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="flex justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                {analytics.dailyStats.map((day, i) => (
                  <span key={i} className="text-xs">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available for selected period
            </div>
          )}
        </div>

        {/* User Growth - Live Data */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : analytics?.dailyStats?.length > 0 ? (
            <>
              <div className="h-64 relative">
                {(() => {
                  const maxUsers = Math.max(...analytics.dailyStats.map(d => d.users || 0), 1);
                  const points = analytics.dailyStats.map((day, i) => {
                    const x = (i / (analytics.dailyStats.length - 1 || 1)) * 400;
                    const y = 200 - ((day.users || 0) / maxUsers) * 180 - 10;
                    return `${x},${y}`;
                  }).join(' ');
                  
                  const areaPoints = `0,200 ${points} 400,200`;
                  
                  return (
                    <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points={areaPoints}
                        fill="url(#userGradient)"
                        opacity="0.3"
                      />
                      <polyline
                        points={points}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {analytics.dailyStats.map((day, i) => {
                        const x = (i / (analytics.dailyStats.length - 1 || 1)) * 400;
                        const y = 200 - ((day.users || 0) / maxUsers) * 180 - 10;
                        return (
                          <g key={i}>
                            <circle
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#8b5cf6"
                              className="hover:r-6 transition-all"
                            />
                            <title>{`${day.date}: ${day.users || 0} new users`}</title>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
              <div className="flex justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                {analytics.dailyStats.filter((_, i) => i % Math.ceil(analytics.dailyStats.length / 4) === 0).map((day, i) => (
                  <span key={i} className="text-xs">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available for selected period
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cryptocurrencies */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Cryptocurrencies</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topCryptos.map((crypto, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {crypto.symbol[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{crypto.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{crypto.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(crypto.price)}</p>
                  <p className={`text-sm ${crypto.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {crypto.positive ? '+' : ''}{crypto.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={activity._id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'deposit' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                      activity.type === 'withdrawal' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                    }`}>
                      {activity.type === 'deposit' ? <TrendingDown className="w-5 h-5 rotate-180" /> :
                       activity.type === 'withdrawal' ? <TrendingUp className="w-5 h-5 rotate-180" /> :
                       <Activity className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{activity.type}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.userId?.username || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(activity.amount)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
