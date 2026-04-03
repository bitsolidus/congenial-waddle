import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  User, 
  Settings,
  Shield,
  Users,
  History,
  BarChart3,
  FileCheck,
  Wallet,
  Award,
  LogOut,
  Send,
  DollarSign,
  Mail
} from 'lucide-react';
import { logout } from '../store/authSlice';
import { fetchSiteConfig } from '../store/siteConfigSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Sidebar = ({ mobileOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { config: siteConfig } = useSelector((state) => state.siteConfig);

  // Fetch site config on mount
  useEffect(() => {
    dispatch(fetchSiteConfig());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/portfolio', icon: TrendingUp, label: 'Portfolio' },
    { to: '/trade', icon: TrendingUp, label: 'Trade' },
    { to: '/deposit', icon: ArrowDownLeft, label: 'Deposit' },
    { to: '/withdraw', icon: ArrowUpRight, label: 'Withdraw' },
    { to: '/receive', icon: Send, label: 'Send & Receive' },
    { to: '/transactions', icon: History, label: 'Transactions' },
    { to: '/tier-upgrade', icon: Award, label: 'Tier & Benefits' },
    { to: '/kyc', icon: FileCheck, label: 'KYC Verification' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const adminItems = [
    { to: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/withdrawals', icon: DollarSign, label: 'Withdrawals & Gas' },
    { to: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-crypto-card border-r border-gray-200 dark:border-crypto-border overflow-y-auto z-40 transform transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-crypto-border">
        <Link to="/dashboard" className="flex items-center space-x-3">
          {siteConfig?.logo ? (
            <img 
              src={siteConfig.logo.startsWith('http') ? siteConfig.logo : `${API_BASE_URL}${siteConfig.logo}`} 
              alt="Logo" 
              className="h-12 w-auto max-w-[180px] object-contain" 
            />
          ) : (
            <span className="font-bold text-2xl text-gray-900 dark:text-white">
              {siteConfig?.siteName || 'BitSolidus'}
            </span>
          )}
        </Link>
      </div>
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-crypto-bg'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {user?.isAdmin && (
          <>
            <div className="mt-8 mb-4 px-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Admin Panel
              </h3>
            </div>
            <nav className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={handleLinkClick}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-crypto-bg'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </div>

      {/* Logout */}
      <div className="absolute bottom-16 left-0 right-0 p-4 space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-crypto-bg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* User Tier Badge */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-crypto-border">
        <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-crypto-bg rounded-lg">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            user?.tier === 'vip' ? 'bg-purple-100 dark:bg-purple-900' :
            user?.tier === 'gold' ? 'bg-yellow-100 dark:bg-yellow-900' :
            user?.tier === 'silver' ? 'bg-gray-100 dark:bg-gray-700' :
            'bg-orange-100 dark:bg-orange-900'
          }`}>
            <span className="text-xs font-bold uppercase">{user?.tier?.[0]}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{user?.tier} Tier</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.kycStatus === 'verified' ? 'KYC Verified' : 'KYC Pending'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
