import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  Bell,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  ArrowUpRight,
  MessageSquare,
  Headphones,
  Moon,
  Sun,
  Mail
} from 'lucide-react';
import { logout } from '../store/authSlice';
import { fetchSiteConfig } from '../store/siteConfigSlice';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../store/notificationSlice';
import { toggleTheme } from '../store/themeSlice';
import axios from 'axios';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '-', change: '-', positive: true },
    { label: 'Active Now', value: '-', change: '-', positive: true },
    { label: 'Pending KYC', value: '-', change: '-', positive: true },
    { label: 'System Health', value: '99.9%', change: 'Operational', positive: true },
  ]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { config: siteConfig } = useSelector((state) => state.siteConfig);
  const { items: notifications, unreadCount } = useSelector((state) => state.notifications);
  const { theme } = useSelector((state) => state.theme);
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    fetchStats();
    dispatch(fetchSiteConfig());
    dispatch(fetchNotifications({ unreadOnly: false }));
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotifications({ unreadOnly: false }));
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard-stats');
      const data = response.data.stats;
      setStats([
        { label: 'Total Users', value: data.totalUsers.toString(), change: '+12%', positive: true },
        { label: 'Active Now', value: data.activeUsers.toString(), change: '+5%', positive: true },
        { label: 'Pending KYC', value: data.pendingKYC.toString(), change: '-3', positive: true },
        { label: 'System Health', value: '99.9%', change: 'Operational', positive: true },
      ]);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/kyc', icon: FileCheck, label: 'KYC Verification' },
    { path: '/admin/withdrawals', icon: ArrowUpRight, label: 'Withdrawals' },
    { path: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
    { path: '/admin/chat', icon: MessageSquare, label: 'Live Chat' },
    { path: '/admin/agents', icon: Headphones, label: 'Support Agents' },
    { path: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/admin/alerts', icon: AlertTriangle, label: 'Alerts & Logs' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 shadow-xl z-20 flex flex-col"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              {siteConfig?.logo ? (
                <img src={siteConfig.logo} alt="Logo" className="h-6 w-6 object-contain" />
              ) : (
                <Shield className="w-6 h-6 text-white" />
              )}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="overflow-hidden"
                >
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {siteConfig?.siteName || 'Admin Portal'}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Control Center</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-full p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          {/* Search */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, transactions, or settings..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => dispatch(markAllNotificationsRead())}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-gray-500 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div 
                          key={notification._id}
                          className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.isRead ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                          onClick={() => !notification.isRead && dispatch(markNotificationRead(notification._id))}
                        >
                          <p className="text-sm text-gray-900 dark:text-white">{notification.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                    <Link to="/admin/alerts" className="text-sm text-purple-600 hover:text-purple-700">
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.username || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
                  >
                    <NavLink
                      to="/admin/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </NavLink>
                    <button
                      onClick={() => {
                        dispatch(toggleTheme());
                        setProfileDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Quick Stats Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.positive 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
