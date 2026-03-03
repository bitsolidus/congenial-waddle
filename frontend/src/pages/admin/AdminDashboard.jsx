import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  PlusCircle,
  MinusCircle,
  UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatNumber } from '../../utils/helpers';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingKYC: 0,
    pendingWithdrawals: 0,
    totalBalance: 0,
    todayDeposits: 0,
    todayWithdrawals: 0,
    todayTransactions: 0,
  });
  const [dailyStats, setDailyStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await axios.get('/api/admin/dashboard-stats');
      console.log('Dashboard stats:', statsResponse.data);
      setStats(statsResponse.data.stats);
      setRecentActivity(statsResponse.data.recentActivity || []);
      setRecentUsers(statsResponse.data.recentUsers || []);
      
      // Fetch analytics for charts
      const analyticsResponse = await axios.get('/api/admin/analytics?timeframe=7d');
      console.log('Analytics:', analyticsResponse.data);
      setDailyStats(analyticsResponse.data.analytics?.dailyStats || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      change: `${stats.activeUsers} active`, 
      icon: Users,
      color: 'bg-blue-500'
    },
    { 
      title: 'Today\'s Deposits', 
      value: formatCurrency(stats.todayDeposits), 
      change: `${stats.todayTransactions} transactions`, 
      icon: ArrowDownRight,
      color: 'bg-green-500'
    },
    { 
      title: 'Today\'s Withdrawals', 
      value: formatCurrency(stats.todayWithdrawals), 
      change: `${stats.pendingWithdrawals} pending`, 
      icon: ArrowUpRight,
      color: 'bg-red-500'
    },
    { 
      title: 'Total Balance', 
      value: formatCurrency(stats.totalBalance), 
      change: `${stats.pendingKYC} KYC pending`, 
      icon: DollarSign,
      color: 'bg-purple-500'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Last updated: Just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {isLoading ? '-' : stat.value}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`h-12 w-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card min-w-0"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Volume Overview</h3>
          <div className="h-64 w-full min-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card min-w-0"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Daily Deposits vs Withdrawals</h3>
          <div className="h-64 w-full min-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="deposits" fill="#10b981" />
                <Bar dataKey="withdrawals" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            <Link to="/admin/transactions" className="text-sm text-primary-600 hover:text-primary-500">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity) => (
                <div key={activity._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-crypto-bg rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      activity.type === 'deposit' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                      activity.type === 'withdrawal' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                    }`}>
                      {activity.type === 'deposit' ? <ArrowDownRight className="h-5 w-5" /> :
                       activity.type === 'withdrawal' ? <ArrowUpRight className="h-5 w-5" /> :
                       <Activity className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{activity.type}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.userId?.username || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(activity.amount)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
            )}
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Users</h3>
            <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-500">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-crypto-bg rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.kycStatus === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700'
                    }`}>
                      {user.kycStatus}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No recent users</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
