import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  X,
  Send,
  User,
  ArrowLeft,
  MoreVertical,
  Search,
  Inbox,
  ArrowRightLeft,
  Building2
} from 'lucide-react';

const AgentChat = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stats, setStats] = useState({ waiting: 0, active: 0, totalHandled: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [agents, setAgents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSessionForAssign, setSelectedSessionForAssign] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferDepartment, setTransferDepartment] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  const departmentColors = {
    general: 'bg-blue-500',
    technical: 'bg-purple-500',
    billing: 'bg-green-500',
    trading: 'bg-orange-500',
    kyc: 'bg-pink-500',
    vip: 'bg-yellow-500'
  };

  useEffect(() => {
    fetchSessions();
    fetchStats();
    fetchAgents();
    fetchUser();
    fetchDepartments();
    
    // Poll for updates
    const pollInterval = setInterval(() => {
      fetchSessions();
      fetchStats();
      if (activeSession) {
        fetchMessages(activeSession._id);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [activeSession]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/chat/departments');
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Fetch departments error:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/chat/agent/sessions');
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Fetch sessions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/chat/agent/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const response = await axios.get(`/api/chat/messages/${sessionId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get('/api/admin/agents');
      setAgents(response.data.agents.filter(a => a.isActive));
    } catch (error) {
      console.error('Fetch agents error:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      setUser(response.data.user);
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  };

  const assignSession = async (sessionId, agentId = null) => {
    try {
      await axios.put(`/api/chat/agent/session/${sessionId}/assign`, {
        agentId: agentId || user?.id
      });
      fetchSessions();
      const session = sessions.find(s => s._id === sessionId);
      if (session) {
        setActiveSession(session);
        fetchMessages(sessionId);
      }
      setShowAssignModal(false);
    } catch (error) {
      console.error('Assign session error:', error);
    }
  };

  const openAssignModal = (session) => {
    setSelectedSessionForAssign(session);
    setShowAssignModal(true);
  };

  const openTransferModal = () => {
    setTransferDepartment(activeSession?.department || '');
    setTransferReason('');
    setShowTransferModal(true);
  };

  const transferSession = async () => {
    if (!activeSession || !transferDepartment) return;
    try {
      await axios.put(`/api/chat/agent/session/${activeSession._id}/transfer`, {
        department: transferDepartment,
        reason: transferReason
      });
      fetchSessions();
      fetchMessages(activeSession._id);
      // Refresh active session
      const response = await axios.get(`/api/chat/agent/sessions`);
      const updatedSession = response.data.sessions.find(s => s._id === activeSession._id);
      if (updatedSession) {
        setActiveSession(updatedSession);
      }
      setShowTransferModal(false);
    } catch (error) {
      console.error('Transfer session error:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeSession) return;

    try {
      await axios.post('/api/chat/message', {
        sessionId: activeSession._id,
        message: newMessage
      });
      setNewMessage('');
      fetchMessages(activeSession._id);
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const closeSession = async () => {
    if (!activeSession || !window.confirm('Close this chat session?')) return;
    try {
      await axios.put(`/api/chat/session/${activeSession._id}/close`);
      setActiveSession(null);
      setMessages([]);
      fetchSessions();
    } catch (error) {
      console.error('Close session error:', error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get agent avatar URL
  const getAgentAvatar = (agent) => {
    if (!agent) return null;
    // Use avatarUrl virtual field if available
    if (agent.avatarUrl) {
      return agent.avatarUrl;
    }
    if (agent.avatar) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      // Avatar might already be a full path like /uploads/filename
      if (agent.avatar.startsWith('/')) {
        return `${baseUrl}${agent.avatar}`;
      }
      return `${baseUrl}/uploads/${agent.avatar}`;
    }
    return null;
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'waiting') return session.status === 'waiting';
    if (filter === 'active') return session.status === 'active';
    if (filter === 'my-chats') return session.agentId?._id === user?.id;
    // Department filter
    if (selectedDepartment !== 'all' && session.department !== selectedDepartment) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Live Chat Support</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-orange-600">
                <Clock className="w-4 h-4" />
                {stats.waiting} waiting
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                {stats.active} active
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <MessageSquare className="w-4 h-4" />
                {stats.totalHandled} handled
              </span>
            </div>
          </div>
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Department:</span>
            <select
              id="agent-department-filter"
              name="agentDepartmentFilter"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Session List */}
        {!activeSession && (
          <div className="w-full md:w-96 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                {['all', 'waiting', 'active', 'my-chats'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      filter === f
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {f === 'my-chats' ? 'My Chats' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto">
              {filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Inbox className="w-16 h-16 mb-4" />
                  <p>No {filter !== 'all' ? filter : ''} sessions</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => session.status === 'active' && setActiveSession(session)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {session.userId?.avatar ? (
                          <img 
                            src={getAgentAvatar(session.userId)} 
                            alt={session.userId.username || 'User'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-avatar.png';
                            }}
                          />
                        ) : (
                          <User className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {session.guestInfo?.isGuest 
                              ? `${session.guestInfo.name} (Guest)`
                              : session.userId?.username || session.userId?.email || 'Unknown User'
                            }
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                            session.status === 'waiting'
                              ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                              : session.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                          {session.subject}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(session.createdAt)}
                            </span>
                            {session.department && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${departmentColors[session.department] || 'bg-gray-500'} text-white`}>
                                {session.department.charAt(0).toUpperCase() + session.department.slice(1)}
                              </span>
                            )}
                          </div>
                          {session.status === 'waiting' && (
                            <div className="flex gap-2">
                              {user?.isAdmin ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); openAssignModal(session); }}
                                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg whitespace-nowrap"
                                >
                                  Assign Agent
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); assignSession(session._id); }}
                                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg whitespace-nowrap"
                                >
                                  Take Chat
                                </button>
                              )}
                            </div>
                          )}
                          {session.status === 'active' && (
                            <button
                              disabled
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg whitespace-nowrap cursor-default"
                            >
                              Opened
                            </button>
                          )}
                        </div>
                        {session.agentId && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <User className="w-3 h-3" />
                            <span>Agent: {session.agentId.firstName || session.agentId.username}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <AnimatePresence>
          {activeSession && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col bg-white dark:bg-gray-800"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveSession(null);
                      setMessages([]);
                    }}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {activeSession.userId?.avatar ? (
                      <img 
                        src={getAgentAvatar(activeSession.userId)} 
                        alt={activeSession.userId.username || 'User'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    ) : (
                      <User className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {activeSession.guestInfo?.isGuest 
                        ? `${activeSession.guestInfo.name} (Guest)`
                        : activeSession.userId?.username || activeSession.userId?.email
                      }
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activeSession.guestInfo?.isGuest 
                        ? activeSession.guestInfo.email
                        : activeSession.subject
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={openTransferModal}
                    className="px-4 py-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Transfer
                  </button>
                  <button
                    onClick={closeSession}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium"
                  >
                    Close Chat
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={msg._id || index}
                    className={`flex ${
                      msg.senderType === 'user' ? 'justify-start' : 
                      msg.senderType === 'agent' ? 'justify-end' : 'justify-center'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.senderType === 'user'
                          ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-tl-none'
                          : msg.senderType === 'agent'
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-center text-sm italic mx-auto'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    id="agent-chat-message"
                    name="agentChatMessage"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Assign Agent Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Assign to Agent
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select an agent to handle this chat with {selectedSessionForAssign?.userId?.username}
              </p>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {agents.map((agent) => (
                  <button
                    key={agent._id}
                    onClick={() => assignSession(selectedSessionForAssign._id, agent._id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {getAgentAvatar(agent) ? (
                        <img 
                          src={getAgentAvatar(agent)} 
                          alt={agent.username} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                      ) : (
                        <User className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {agent.firstName} {agent.lastName}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{agent.username}
                        </span>
                        {agent.department && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${departmentColors[agent.department] || 'bg-gray-500'} text-white`}>
                            {agent.department.charAt(0).toUpperCase() + agent.department.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`w-2 h-2 rounded-full ${agent.agentStatus === 'online' ? 'bg-green-500' : agent.agentStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {agent.activeChatCount || 0}/{agent.maxConcurrentChats || 5} chats
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Department Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Transfer to Department
                </h2>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Transfer this chat to a different department. An available agent will be automatically assigned.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Department
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'general', name: 'General Support', icon: '💬' },
                      { id: 'technical', name: 'Technical Support', icon: '🔧' },
                      { id: 'billing', name: 'Billing & Payments', icon: '💳' },
                      { id: 'trading', name: 'Trading Support', icon: '📈' },
                      { id: 'kyc', name: 'KYC & Verification', icon: '🆔' },
                      { id: 'vip', name: 'VIP Support', icon: '⭐' }
                    ].map((dept) => (
                      <button
                        key={dept.id}
                        onClick={() => setTransferDepartment(dept.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          transferDepartment === dept.id
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                        }`}
                      >
                        <span className="text-xl">{dept.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{dept.name}</span>
                        {transferDepartment === dept.id && (
                          <CheckCircle className="w-5 h-5 text-purple-600 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transfer Reason (Optional)
                  </label>
                  <textarea
                    id="transfer-reason"
                    name="transferReason"
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder="Why are you transferring this chat?"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={transferSession}
                  disabled={!transferDepartment || transferDepartment === activeSession?.department}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
                >
                  Transfer Chat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentChat;
