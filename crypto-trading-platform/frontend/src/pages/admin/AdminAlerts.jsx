import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  Bell,
  Shield,
  Activity,
  Clock,
  Filter,
  Search,
  Trash2,
  CheckSquare,
  MoreVertical,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminAlerts = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [alertCounts, setAlertCounts] = useState({
    total: 0,
    unread: 0,
    security: 0,
    transaction: 0,
    system: 0
  });

  // Fetch alerts and logs on mount
  useEffect(() => {
    fetchAlerts();
    fetchSystemLogs();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/admin/alerts?limit=50');
      setAlerts(response.data.alerts || []);
      setAlertCounts(response.data.counts || {
        total: 0,
        unread: 0,
        security: 0,
        transaction: 0,
        system: 0
      });
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSystemLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await axios.get('/api/admin/system-logs?limit=100');
      setSystemLogs(response.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch system logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const markAsRead = async (ids) => {
    try {
      // Mark each alert as read
      await Promise.all(ids.map(id => 
        axios.put(`/api/admin/alerts/${id}/read`)
      ));
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        ids.includes(alert.id) ? { ...alert, status: 'read' } : alert
      ));
      setSelectedAlerts([]);
    } catch (err) {
      console.error('Failed to mark alerts as read:', err);
    }
  };

  const deleteAlerts = async (ids) => {
    try {
      // Delete each alert
      await Promise.all(ids.map(id => 
        axios.delete(`/api/admin/alerts/${id}`)
      ));
      
      // Update local state
      setAlerts(prev => prev.filter(alert => !ids.includes(alert.id)));
      setSelectedAlerts([]);
    } catch (err) {
      console.error('Failed to delete alerts:', err);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Alerts', count: alertCounts.total },
    { id: 'unread', label: 'Unread', count: alertCounts.unread },
    { id: 'security', label: 'Security', count: alertCounts.security },
    { id: 'transaction', label: 'Transactions', count: alertCounts.transaction },
    { id: 'system', label: 'System', count: alertCounts.system }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'security': return Shield;
      case 'transaction': return Activity;
      case 'system': return AlertCircle;
      default: return Bell;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesTab = selectedTab === 'all' || selectedTab === 'unread' 
      ? selectedTab === 'all' || alert.status === 'unread'
      : alert.type === selectedTab;
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleAlertSelection = (id) => {
    setSelectedAlerts(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts & Logs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor system alerts and activity logs</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedAlerts.length > 0 && (
            <>
              <button
                onClick={() => markAsRead(selectedAlerts)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                Mark Read
              </button>
              <button
                onClick={() => deleteAlerts(selectedAlerts)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
          <button 
            onClick={() => { fetchAlerts(); fetchSystemLogs(); }}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Bell className="w-4 h-4" />
            Configure Alerts
          </button>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                selectedTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No alerts found</p>
          </div>
        ) : (
        <AnimatePresence>
          {filteredAlerts.map((alert) => {
            const TypeIcon = getTypeIcon(alert.type);
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${
                  alert.status === 'unread' 
                    ? 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10' 
                    : 'border-gray-200 dark:border-gray-700'
                } p-4`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedAlerts.includes(alert.id)}
                    onChange={() => toggleAlertSelection(alert.id)}
                    className="mt-1 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getSeverityColor(alert.severity)}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`font-semibold ${alert.status === 'unread' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {alert.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{alert.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      <span>Source: {alert.source}</span>
                      {alert.username && (
                        <span>User: {alert.username}</span>
                      )}
                      {alert.status === 'unread' && (
                        <span className="text-purple-600 dark:text-purple-400 font-medium">New</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markAsRead([alert.id])}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteAlerts([alert.id])}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        )}
      </div>

      {/* System Logs Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">System Logs</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoadingLogs ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Loading logs...</p>
                    </td>
                  </tr>
                ) : systemLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No system logs found
                    </td>
                  </tr>
                ) : (
                  systemLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.level === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          log.level === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{log.message}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{log.service}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAlerts;
