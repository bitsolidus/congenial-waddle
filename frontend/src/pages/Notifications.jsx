import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import { 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  deleteNotification 
} from '../store/notificationSlice';

const Notifications = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get('id');
  const { items: notifications, unreadCount, loading, pagination } = useSelector((state) => state.notifications);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [expandedId, setExpandedId] = useState(highlightedId);

  useEffect(() => {
    dispatch(fetchNotifications({ unreadOnly: filter === 'unread' }));
  }, [dispatch, filter]);

  // Expand highlighted notification when page loads
  useEffect(() => {
    if (highlightedId) {
      setExpandedId(highlightedId);
      // Scroll to the notification after a short delay
      setTimeout(() => {
        const element = document.getElementById(`notification-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightedId]);

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleRefresh = () => {
    dispatch(fetchNotifications({ unreadOnly: filter === 'unread' }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'trade':
        return '📈';
      case 'kyc':
        return '✅';
      case 'security':
        return '🔒';
      case 'promo':
        return '🎁';
      case 'email_verified':
        return '✉️';
      default:
        return '📢';
    }
  };

  // Format notification data into a professional display
  const formatNotificationData = (type, data) => {
    if (!data) return null;

    switch (type) {
      case 'deposit':
        return (
          <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💰</span>
              <span className="font-semibold text-green-800 dark:text-green-200">Deposit Details</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {data.amount} {data.crypto || data.cryptocurrency}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-xs">
                  Completed
                </span>
              </div>
              {data.transactionId && (
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                  <span className="ml-2 font-mono text-xs text-gray-600 dark:text-gray-400">
                    {data.transactionId}
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 'withdrawal':
        return (
          <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💸</span>
              <span className="font-semibold text-blue-800 dark:text-blue-200">Withdrawal Details</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {data.amount} {data.crypto}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  data.status === 'completed' 
                    ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                    : data.status === 'pending'
                    ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                }`}>
                  {data.status || 'Processing'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'trade':
        return (
          <div className="mt-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📈</span>
              <span className="font-semibold text-purple-800 dark:text-purple-200">Trade Details</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className={`ml-2 font-medium ${
                  data.type === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {data.type?.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {data.amount} {data.crypto}
                </span>
              </div>
            </div>
          </div>
        );

      case 'kyc':
        return (
          <div className="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <span className="font-semibold text-yellow-800 dark:text-yellow-200">KYC Status Update</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                data.status === 'approved' || data.status === 'verified'
                  ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                  : data.status === 'rejected'
                  ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                  : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
              }`}>
                {data.status}
              </span>
            </div>
          </div>
        );

      case 'email_verified':
        return (
          <div className="mt-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✉️</span>
              <span className="font-semibold text-indigo-800 dark:text-indigo-200">Email Verification</span>
            </div>
            <div className="text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                User <span className="font-medium text-gray-900 dark:text-white">{data.username}</span> ({data.email}) has verified their email.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Verified at: {new Date(data.verifiedAt).toLocaleString()}
              </p>
            </div>
          </div>
        );

      default:
        // For unknown types, show a cleaner generic view
        return (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Additional Information:</p>
            <div className="space-y-1">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex text-sm">
                  <span className="text-gray-500 dark:text-gray-400 capitalize w-32 flex-shrink-0">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            id="notification-filter"
            name="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>
          
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Mark All Read */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No notifications</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <motion.div
                key={notification._id}
                id={`notification-${notification._id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  !notification.isRead ? 'bg-purple-50 dark:bg-purple-900/10' : ''
                } ${highlightedId === notification._id ? 'ring-2 ring-purple-500 ring-inset' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${expandedId === notification._id ? '' : 'line-clamp-2'}`}>
                          {notification.message}
                        </p>
                        {notification.data && expandedId === notification._id && (
                          formatNotificationData(notification.type, notification.data)
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setExpandedId(expandedId === notification._id ? null : notification._id)}
                          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs text-purple-600 dark:text-purple-400"
                          title={expandedId === notification._id ? 'Collapse' : 'Expand'}
                        >
                          {expandedId === notification._id ? 'Less' : 'More'}
                        </button>
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkRead(notification._id)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={pagination.page === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
