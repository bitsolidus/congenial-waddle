import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Clock,
  MessageSquare,
  User,
  Search,
  Filter,
  Star,
  ChevronRight,
  Calendar
} from 'lucide-react';

const AgentHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({ total: 0, avgRating: 0 });

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
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/chat/agent/sessions', {
        params: { status: 'closed' }
      });
      setSessions(response.data.sessions.filter(s => s.status === 'closed'));
      
      // Calculate stats
      const closedSessions = response.data.sessions.filter(s => s.status === 'closed' && s.rating);
      const totalRating = closedSessions.reduce((sum, s) => sum + (s.rating || 0), 0);
      setStats({
        total: response.data.sessions.filter(s => s.status === 'closed').length,
        avgRating: closedSessions.length > 0 ? (totalRating / closedSessions.length).toFixed(1) : 0
      });
    } catch (error) {
      console.error('Fetch history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      technical: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      billing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      trading: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      kyc: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      vip: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return colors[dept] || 'bg-gray-100 text-gray-800';
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.guestInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'rated') return matchesSearch && session.rating;
    if (filterStatus === 'unrated') return matchesSearch && !session.rating;
    return matchesSearch;
  });

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat History</h1>
          <p className="text-gray-500 dark:text-gray-400">
            View your past support conversations
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Chats</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.avgRating > 0 ? `${stats.avgRating}/5` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sessions.filter(s => {
                  const sessionDate = new Date(s.createdAt);
                  const now = new Date();
                  return sessionDate.getMonth() === now.getMonth() && 
                         sessionDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Sessions</option>
            <option value="rated">Rated</option>
            <option value="unrated">Unrated</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No chat history found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Your closed conversations will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSessions.map((session) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {session.guestInfo?.isGuest 
                          ? session.guestInfo.name 
                          : session.userId?.username || 'Unknown User'}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDepartmentColor(session.department)}`}>
                        {session.department}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {session.subject || 'No subject'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatDate(session.createdAt)} • {session.closedAt ? `Closed ${formatDate(session.closedAt)}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {session.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {session.rating}
                        </span>
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentHistory;
