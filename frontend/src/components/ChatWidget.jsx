import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  User,
  Clock,
  Check,
  CheckCheck,
  CheckCircle
} from 'lucide-react';

const ChatWidget = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStartForm, setShowStartForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('general');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [chatSettings, setChatSettings] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch chat settings on mount
  useEffect(() => {
    fetchChatSettings();
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      checkExistingSession();
    } else {
      // Check for guest session in localStorage
      const guestSession = localStorage.getItem('guestChatSession');
      if (guestSession) {
        try {
          const parsed = JSON.parse(guestSession);
          setSession(parsed.session);
          setGuestName(parsed.guestName || '');
          setGuestEmail(parsed.guestEmail || '');
          setIsGuestMode(true);
        } catch (e) {
          console.error('Error parsing guest session:', e);
          localStorage.removeItem('guestChatSession');
        }
      }
    }
  }, [isAuthenticated, user]);

  const fetchChatSettings = async () => {
    try {
      const response = await axios.get('/api/chat/settings');
      if (response.data.settings) {
        setChatSettings(response.data.settings);
      }
      setSettingsLoaded(true);
    } catch (error) {
      console.error('Fetch chat settings error:', error);
      setSettingsLoaded(true);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages and session updates when chat is open
  useEffect(() => {
    if (isOpen && session) {
      intervalRef.current = setInterval(() => {
        fetchMessages();
        // Only refresh session for authenticated users
        if (isAuthenticated) {
          refreshSession();
        }
      }, 3000);
      return () => clearInterval(intervalRef.current);
    }
  }, [isOpen, session, isAuthenticated]);

  const checkExistingSession = async () => {
    try {
      const response = await axios.get('/api/chat/session');
      if (response.data.session) {
        setSession(response.data.session);
        fetchMessages(response.data.session._id);
      }
    } catch (error) {
      // Session not found or not authenticated - this is normal
      console.log('No existing session found');
    }
  };

  const fetchMessages = async (sessionId = session?._id) => {
    if (!sessionId) return;
    try {
      let url = `/api/chat/messages/${sessionId}`;
      // Include guest email as query param if in guest mode
      if (isGuestMode && guestEmail) {
        url += `?guestEmail=${encodeURIComponent(guestEmail)}`;
      }
      const response = await axios.get(url);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const refreshSession = async () => {
    if (!session?._id || !isAuthenticated) return;
    try {
      const response = await axios.get('/api/chat/session');
      if (response.data.session) {
        setSession(response.data.session);
      }
    } catch (error) {
      // Session may have expired or been closed
      console.log('Session refresh failed');
    }
  };

  const startChat = async () => {
    setLoading(true);
    try {
      let response;
      
      if (isGuestMode) {
        // Guest user - include guest info
        response = await axios.post('/api/chat/session', {
          subject: subject || 'General Support',
          department: department,
          guestName: guestName,
          guestEmail: guestEmail,
          isGuest: true
        });
        // Save guest session to localStorage
        localStorage.setItem('guestChatSession', JSON.stringify({
          session: response.data.session,
          guestName: guestName,
          guestEmail: guestEmail
        }));
      } else {
        // Authenticated user
        response = await axios.post('/api/chat/session', {
          subject: subject || 'General Support',
          department: department
        });
      }
      
      setSession(response.data.session);
      setShowStartForm(false);
      setSubject('');
      setDepartment('general');
      fetchMessages(response.data.session._id);
    } catch (error) {
      console.error('Start chat error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !session) return;

    try {
      const payload = {
        sessionId: session._id,
        message: newMessage
      };
      
      // Include guest email if in guest mode
      if (isGuestMode) {
        payload.guestEmail = guestEmail;
      }
      
      await axios.post('/api/chat/message', payload);
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleCloseClick = () => {
    if (session) {
      setShowCloseConfirm(true);
    } else {
      setIsOpen(false);
    }
  };

  const confirmCloseChat = async () => {
    if (!session) return;
    try {
      await axios.put(`/api/chat/session/${session._id}/close`);
      setSession(null);
      setMessages([]);
      setIsOpen(false);
      setShowCloseConfirm(false);
      
      // Clear guest session from localStorage
      if (isGuestMode) {
        localStorage.removeItem('guestChatSession');
        setIsGuestMode(false);
        setGuestName('');
        setGuestEmail('');
      }
    } catch (error) {
      console.error('Close chat error:', error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if chat should be shown on current page
  const shouldShowChat = () => {
    if (!settingsLoaded) return false;
    if (!chatSettings) return true; // Default to showing if settings not loaded
    if (!chatSettings.enabled) return false;
    
    const path = location.pathname;
    const showOnPages = chatSettings.showOnPages || {};
    
    // Map paths to page keys
    const pageKeyMap = {
      '/': 'home',
      '/about': 'about',
      '/services': 'services',
      '/blog': 'blog',
      '/news': 'news',
      '/faq': 'faq',
      '/contact': 'contact',
      '/dashboard': 'dashboard',
      '/login': 'login',
      '/register': 'register'
    };
    
    const pageKey = pageKeyMap[path];
    if (!pageKey) return true; // Show on unknown pages by default
    
    return showOnPages[pageKey] !== false; // Default to true if not explicitly false
  };

  if (!shouldShowChat()) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
          {session && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          )}
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '500px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {session?.agentId ? (
                    <img 
                      src={session.agentId.avatar || '/default-avatar.png'} 
                      alt="Agent"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    {session?.agentId?.username || session?.agentId?.firstName 
                      ? `${session.agentId.firstName || ''} ${session.agentId.lastName || ''}`.trim() || session.agentId.username
                      : 'Support Team'}
                  </h3>
                  <p className="text-xs text-purple-200 flex items-center gap-1">
                    {session?.status === 'active' ? (
                      <>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        {session?.department ? `${session.department.charAt(0).toUpperCase() + session.department.slice(1)} Department` : 'Online'}
                      </>
                    ) : session?.status === 'waiting' ? (
                      <>
                        <Clock className="w-3 h-3" />
                        Waiting for {session?.department ? `${session.department}...` : 'agent...'}
                      </>
                    ) : (
                      'Start a conversation'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCloseClick}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {!session ? (
                  /* Start Chat Form */
                  <div className="overflow-y-auto" style={{ height: 'calc(500px - 64px)' }}>
                    {!showStartForm ? (
                      <div className="p-6 flex flex-col items-center justify-center h-full">
                        <MessageCircle className="w-16 h-16 text-purple-200 mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          How can we help?
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                          Our support team is here to assist you with any questions or issues.
                        </p>
                        <button
                          onClick={() => setShowStartForm(true)}
                          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Start Chat
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 w-full">
                        {/* Guest Info Form (for non-logged in users) */}
                        {!isAuthenticated && !isGuestMode && (
                          <div className="mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-center">
                              Enter Your Details
                            </h4>
                            <div className="space-y-3 mb-4">
                              <div>
                                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Full Name *
                                </label>
                                <input
                                  id="guestName"
                                  name="guestName"
                                  type="text"
                                  value={guestName}
                                  onChange={(e) => setGuestName(e.target.value)}
                                  placeholder="John Doe"
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  required
                                />
                              </div>
                              <div>
                                <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Email Address *
                                </label>
                                <input
                                  id="guestEmail"
                                  name="guestEmail"
                                  type="email"
                                  value={guestEmail}
                                  onChange={(e) => setGuestEmail(e.target.value)}
                                  placeholder="john@example.com"
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 mb-4">
                              <button
                                onClick={() => {
                                  if (guestName && guestEmail) {
                                    setIsGuestMode(true);
                                  }
                                }}
                                disabled={!guestName || !guestEmail}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm"
                              >
                                Continue as Guest
                              </button>
                            </div>
                            <div className="text-center">
                              <span className="text-sm text-gray-500">or</span>
                            </div>
                          </div>
                        )}

                        {/* Show department selection only for authenticated users or after guest info */}
                        {(isAuthenticated || isGuestMode) && (
                          <div className="w-full">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                              Select a Department
                            </h4>
                        
                            {/* Department Selection */}
                            <div className="space-y-2 mb-4">
                              {[
                                { id: 'general', name: 'General Support', icon: '💬', desc: 'General inquiries' },
                                { id: 'technical', name: 'Technical Support', icon: '🔧', desc: 'Technical issues' },
                                { id: 'billing', name: 'Billing & Payments', icon: '💳', desc: 'Payment questions' },
                                { id: 'trading', name: 'Trading Support', icon: '📈', desc: 'Trading help' },
                                { id: 'kyc', name: 'KYC & Verification', icon: '🆔', desc: 'Verification support' },
                                { id: 'vip', name: 'VIP Support', icon: '⭐', desc: 'Priority support' }
                              ].map((dept) => (
                                <button
                                  key={dept.id}
                                  type="button"
                                  onClick={() => setDepartment(dept.id)}
                                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                                    department === dept.id
                                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                                  }`}
                                >
                                  <span className="text-2xl">{dept.icon}</span>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">{dept.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{dept.desc}</p>
                                  </div>
                                  {department === dept.id && (
                                    <CheckCircle className="w-5 h-5 text-purple-600" />
                                  )}
                                </button>
                              ))}
                            </div>

                            {/* Subject Input */}
                            <input
                              id="chatSubject"
                              name="chatSubject"
                              type="text"
                              value={subject}
                              onChange={(e) => setSubject(e.target.value)}
                              placeholder="Briefly describe your issue..."
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 text-sm"
                            />
                        
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => setShowStartForm(false)}
                                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={startChat}
                                disabled={loading || !department}
                                className="flex-1 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
                              >
                                {loading ? 'Starting...' : 'Start Chat'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div className="h-80 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg, index) => (
                        <div
                          key={msg._id || index}
                          className={`flex ${
                            msg.senderType === 'agent' ? 'justify-start' : 
                            msg.senderType === 'user' ? 'justify-end' : 'justify-center'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              msg.senderType === 'agent'
                                ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-tl-none'
                                : msg.senderType === 'user'
                                ? 'bg-purple-600 text-white rounded-br-none'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-center text-sm italic'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <div
                              className={`flex items-center gap-1 mt-1 text-xs ${
                                msg.senderType === 'user' ? 'text-purple-200' : 
                                msg.senderType === 'agent' ? 'text-gray-500 dark:text-gray-400' :
                                'text-gray-400'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {formatTime(msg.createdAt)}
                              {msg.senderType === 'agent' && msg.read && (
                                <CheckCheck className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex gap-2">
                        <input
                          id="chatMessage"
                          name="chatMessage"
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close Chat Confirmation Modal */}
      <AnimatePresence>
        {showCloseConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Close Chat Session?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to close this chat? You won't be able to send or receive messages after closing.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Keep Chat Open
                </button>
                <button
                  onClick={confirmCloseChat}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close Chat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
