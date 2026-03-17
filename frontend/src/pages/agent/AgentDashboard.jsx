import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  Headphones,
  ArrowRight,
  RefreshCw,
  Circle,
  User,
  Building2
} from 'lucide-react';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [stats, setStats] = useState({ waiting: 0, active: 0, totalHandled: 0 });
  const [sessions, setSessions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, sessionsRes, deptsRes] = await Promise.all([
        axios.get('/api/chat/agent/stats'),
        axios.get('/api/chat/agent/sessions'),
        axios.get('/api/chat/departments')
      ]);
      
      setStats(statsRes.data.stats);
      setSessions(sessionsRes.data.sessions);
      setDepartments(deptsRes.data.departments);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      general: 'bg-blue-500',
      technical: 'bg-purple-500',
      billing: 'bg-green-500',
      trading: 'bg-orange-500',
      kyc: 'bg-pink-500',
      vip: 'bg-yellow-500'
    };
    return colors[dept] || 'bg-gray-500';
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const waitingSessions = sessions.filter(s => s.status === 'waiting');
  const myActiveSessions = sessions.filter(s => s.status === 'active' && s.agentId?._id === user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName || user?.username}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Here's what's happening with your support queue
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Circle className={`w-3 h-3 ${getStatusColor(user?.agentStatus)}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {user?.agentStatus || 'offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Waiting in Queue</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.waiting}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          {stats.waiting > 0 && (
            <Link 
              to="/agent/chats"
              className="mt-4 flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
            >
              View queue <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your Active Chats</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Capacity: {stats.active}/{user?.maxConcurrentChats || 5}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Handled</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalHandled}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>All time chats resolved</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting Queue */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Waiting Queue
            </h2>
            {waitingSessions.length > 0 && (
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-xs px-2 py-1 rounded-full">
                {waitingSessions.length} waiting
              </span>
            )}
          </div>
          <div className="p-4">
            {waitingSessions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No chats waiting in queue</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Great job! You're all caught up.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {waitingSessions.slice(0, 5).map((session) => (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      {session.userId?.avatar ? (
                        <img 
                          src={getAvatarUrl(session.userId.avatar)} 
                          alt="" 
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <User className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {session.guestInfo?.isGuest 
                          ? session.guestInfo.name 
                          : session.userId?.username || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getDepartmentColor(session.department)}`}>
                          {session.department}
                        </span>
                        <span>{formatTime(session.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/agent/chats')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg whitespace-nowrap"
                    >
                      Take Chat
                    </button>
                  </motion.div>
                ))}
                {waitingSessions.length > 5 && (
                  <Link
                    to="/agent/chats"
                    className="block text-center text-purple-600 hover:text-purple-700 text-sm py-2"
                  >
                    View all {waitingSessions.length} waiting chats
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Department Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              Departments
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${getDepartmentColor(dept.id)}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{dept.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-orange-600">{dept.waitingCount}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-green-600">{dept.agentCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Your Active Chats */}
      {myActiveSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Your Active Chats
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myActiveSessions.map((session) => (
                <Link
                  key={session._id}
                  to={`/agent/chats?session=${session._id}`}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                        {session.guestInfo?.isGuest 
                          ? session.guestInfo.name 
                          : session.userId?.username || 'Unknown'}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getDepartmentColor(session.department)}`}>
                      {session.department}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {session.subject || 'No subject'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Started {formatTime(session.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Need Help?</h2>
            <p className="text-white/80 mt-1">Access resources and guides for support agents</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/agent/chats"
              className="px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Open Live Chats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
