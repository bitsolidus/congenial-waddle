import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  Eye,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Shield,
  TrendingUp,
  Bell,
  Sparkles,
  FileText,
  X
} from 'lucide-react';

const AdminNewsletter = () => {
  const { user } = useSelector((state) => state.auth);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipientType, setRecipientType] = useState('all');
  const [specificEmails, setSpecificEmails] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    verified: 0
  });

  useEffect(() => {
    fetchTemplates();
    fetchUserStats();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/admin/newsletter/templates');
      setTemplates(response.data.templates);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setNotification({ message: 'Failed to load templates', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      const users = response.data.users || [];
      setUserStats({
        total: users.length,
        active: users.filter(u => u.isActive).length,
        verified: users.filter(u => u.isEmailVerified).length
      });
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template && templateId !== 'custom') {
      setSubject(template.name);
      setContent(template.preview);
    } else if (templateId === 'custom') {
      setSubject('');
      setContent('');
    }
    setShowTemplates(false);
  };

  const handleSendPreview = async () => {
    if (!subject.trim() || !content.trim()) {
      setNotification({ message: 'Please fill in subject and content', type: 'error' });
      return;
    }
    
    setPreviewing(true);
    try {
      await axios.post('/api/admin/newsletter/preview', {
        subject,
        content,
        template: selectedTemplate
      });
      setNotification({ message: 'Preview sent to your email!', type: 'success' });
    } catch (err) {
      setNotification({ 
        message: err.response?.data?.message || 'Failed to send preview', 
        type: 'error' 
      });
    } finally {
      setPreviewing(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleSendNewsletter = async () => {
    if (!subject.trim() || !content.trim()) {
      setNotification({ message: 'Please fill in subject and content', type: 'error' });
      return;
    }
    
    const recipientCount = getRecipientCount();
    if (recipientCount === 0) {
      setNotification({ message: 'No recipients selected', type: 'error' });
      return;
    }
    
    if (!window.confirm(`Are you sure you want to send this newsletter to ${recipientCount} recipient(s)?`)) {
      return;
    }
    
    setSending(true);
    try {
      const response = await axios.post('/api/admin/newsletter/send', {
        subject,
        content,
        template: selectedTemplate,
        recipientType,
        specificEmails: recipientType === 'specific' 
          ? specificEmails.split(',').map(e => e.trim()).filter(e => e)
          : []
      });
      
      setNotification({ 
        message: `Newsletter sent! ${response.data.stats.successful} successful, ${response.data.stats.failed} failed`, 
        type: response.data.stats.failed > 0 ? 'warning' : 'success' 
      });
      
      if (response.data.stats.failed === 0) {
        setSubject('');
        setContent('');
        setSpecificEmails('');
      }
    } catch (err) {
      setNotification({ 
        message: err.response?.data?.message || 'Failed to send newsletter', 
        type: 'error' 
      });
    } finally {
      setSending(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const getRecipientCount = () => {
    switch (recipientType) {
      case 'active': return userStats.active;
      case 'verified': return userStats.verified;
      case 'specific': return specificEmails.split(',').filter(e => e.trim()).length;
      default: return userStats.total;
    }
  };

  const getSelectedTemplate = () => templates.find(t => t.id === selectedTemplate);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Newsletter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Send professional newsletters and updates to your users
        </p>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                : notification.type === 'warning'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Choose Template
            </label>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getSelectedTemplate() && (
                  <>
                    <span className="text-2xl">{getSelectedTemplate().icon}</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getSelectedTemplate().name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getSelectedTemplate().description}
                      </p>
                    </div>
                  </>
                )}
              </div>
              {showTemplates ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
                          selectedTemplate === template.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="text-2xl">{template.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {template.description}
                          </p>
                        </div>
                        {selectedTemplate === template.id && (
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter newsletter subject..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your message..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {content.length} characters
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Select Recipients
            </label>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="recipientType"
                  value="all"
                  checked={recipientType === 'all'}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-4 h-4 text-purple-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">All Users</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Send to all {userStats.total} registered users
                  </p>
                </div>
                <Users className="w-5 h-5 text-gray-400" />
              </label>
              
              <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="recipientType"
                  value="active"
                  checked={recipientType === 'active'}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-4 h-4 text-purple-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Active Users Only</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Send to {userStats.active} active users
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-gray-400" />
              </label>
              
              <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="recipientType"
                  value="verified"
                  checked={recipientType === 'verified'}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-4 h-4 text-purple-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Verified Users</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Send to {userStats.verified} email-verified users
                  </p>
                </div>
                <Mail className="w-5 h-5 text-gray-400" />
              </label>
              
              <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="recipientType"
                  value="specific"
                  checked={recipientType === 'specific'}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-4 h-4 text-purple-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Specific Emails</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Send to specific email addresses
                  </p>
                </div>
                <FileText className="w-5 h-5 text-gray-400" />
              </label>
              
              {recipientType === 'specific' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3"
                >
                  <textarea
                    value={specificEmails}
                    onChange={(e) => setSpecificEmails(e.target.value)}
                    placeholder="Enter email addresses separated by commas...&#10;e.g., user1@example.com, user2@example.com"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {getRecipientCount()} email(s) will receive this newsletter
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSendPreview}
              disabled={previewing || !subject.trim() || !content.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {previewing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
              {previewing ? 'Sending Preview...' : 'Send Preview to Me'}
            </button>
            
            <button
              onClick={handleSendNewsletter}
              disabled={sending || !subject.trim() || !content.trim() || getRecipientCount() === 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {sending ? 'Sending...' : `Send to ${getRecipientCount()} User(s)`}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              User Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Total Users</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userStats.total}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Active</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userStats.active}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Verified</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userStats.verified}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Newsletter Tips
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Keep subject lines under 50 characters</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Personalize content for better engagement</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Always send a preview before bulk sending</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Use templates for consistent branding</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sending Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Template</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getSelectedTemplate()?.name || 'Custom'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Recipients</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getRecipientCount()} users
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subject Length</span>
                <span className={`font-medium ${
                  subject.length > 50 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {subject.length} chars
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Content Length</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {content.length} chars
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletter;
