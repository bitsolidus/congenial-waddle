import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, Bell, User, Moon, Sun } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../store/notificationSlice';
import { toggleTheme } from '../store/themeSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Layout = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const { config: siteConfig } = useSelector((state) => state.siteConfig);
  const { items: notifications, unreadCount } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);
  const isDarkMode = theme === 'dark';
  const dispatch = useDispatch();

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    return avatar.startsWith('http') ? avatar : `${API_BASE_URL}${avatar}`;
  };

  // Fetch notifications on mount
  useEffect(() => {
    dispatch(fetchNotifications({ unreadOnly: false }));
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotifications({ unreadOnly: false }));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-crypto-bg">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-crypto-card border-b border-gray-200 dark:border-crypto-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/dashboard" className="flex items-center space-x-2">
          {siteConfig?.logo ? (
            <img 
              src={siteConfig.logo.startsWith('http') ? siteConfig.logo : `${API_BASE_URL}${siteConfig.logo}`} 
              alt="Logo" 
              className="h-10 w-auto max-w-[150px] object-contain" 
            />
          ) : (
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              {siteConfig?.siteName || 'BitSolidus'}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2">
            {/* Mobile Notifications */}
          <Link to="/notifications" className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-crypto-bg transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </Link>
          {/* Mobile Avatar */}
          <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={getAvatarUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-medium">{user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 dark:text-gray-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Desktop Header with Notifications & Avatar */}
      <div className="hidden lg:flex fixed top-0 right-0 left-64 z-30 bg-white dark:bg-crypto-card border-b border-gray-200 dark:border-crypto-border px-6 py-3 items-center justify-end gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-crypto-bg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          
          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-crypto-card rounded-lg shadow-lg border border-gray-200 dark:border-crypto-border py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-crypto-border">
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
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-crypto-bg cursor-pointer ${!notification.isRead ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                      onClick={() => {
                        if (!notification.isRead) dispatch(markNotificationRead(notification._id));
                        setShowNotifications(false);
                        navigate(`/notifications?id=${notification._id}`);
                      }}
                    >
                      <p className="text-sm text-gray-900 dark:text-white">{notification.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-gray-200 dark:border-crypto-border px-4 py-2">
                <Link to="/notifications" className="text-sm text-purple-600 hover:text-purple-700">
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <Link to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-crypto-bg transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={getAvatarUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-medium">{user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.firstName 
                  ? user.firstName 
                  : user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
          </div>
        </Link>
      </div>

      <div className="flex">
        <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="flex-1 ml-0 lg:ml-64 pt-0 lg:pt-14 min-h-screen">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default Layout;
