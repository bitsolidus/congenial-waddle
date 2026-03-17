import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  MessageSquare,
  Users,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
  Circle,
  User
} from 'lucide-react';
import axios from 'axios';
import { logout } from '../store/authSlice';

const AgentLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);

  // Helper to get full avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    if (avatarPath.startsWith('/')) {
      return `${baseUrl}${avatarPath}`;
    }
    return `${baseUrl}/uploads/${avatarPath}`;
  };
  const [stats, setStats] = useState({ waiting: 0, active: 0, totalHandled: 0 });

  // Fetch stats periodically
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/chat/agent/stats');
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      // Set agent status to offline before logout
      await axios.put('/api/chat/agent/status', { status: 'offline' });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
    
    dispatch(logout());
    navigate('/agent/login');
  };

  const handleStatusChange = async (status) => {
    try {
      await axios.put('/api/chat/agent/status', { status });
      // Update local user state would require a refresh or Redux update
      window.location.reload();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
    setStatusDropdown(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const navItems = [
    { path: '/agent', icon: Headphones, label: 'Dashboard', end: true },
    { path: '/agent/chats', icon: MessageSquare, label: 'Live Chats', badge: stats.waiting + stats.active },
    { path: '/agent/history', icon: Clock, label: 'Chat History' },
    { path: '/agent/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <Headphones className="w-6 h-6 text-purple-600" />
            <span className="font-bold text-gray-900 dark:text-white">Agent Portal</span>
          </div>
          <div className={`w-3 h-3 rounded-full ${getStatusColor(user?.agentStatus)}`} />
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">Agent Portal</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Support Dashboard</p>
              </div>
            </div>
          </div>

          {/* Agent Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <button
                onClick={() => setStatusDropdown(!statusDropdown)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={getAvatarUrl(user.avatar)} 
                      alt={user.username} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <User className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {user?.firstName || user?.username}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(user?.agentStatus)}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user?.agentStatus || 'offline'}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${statusDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Status Dropdown */}
              <AnimatePresence>
                {statusDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden z-50"
                  >
                    {['online', 'busy', 'away', 'offline'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 capitalize"
                      >
                        <Circle className={`w-3 h-3 ${getStatusColor(status)}`} />
                        {status}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-lg font-bold text-orange-600">{stats.waiting}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Waiting</p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-lg font-bold text-green-600">{stats.active}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-lg font-bold text-purple-600">{stats.totalHandled}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Handled</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge > 0 && (
                  <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AgentLayout;
