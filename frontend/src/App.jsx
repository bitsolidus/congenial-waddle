import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, initializeAuth } from './store/authSlice';
import { setTheme } from './store/themeSlice';
import { fetchSiteConfig } from './store/siteConfigSlice';

// Components
import Favicon from './components/Favicon';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Blog from './pages/Blog';
import News from './pages/News';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterSuccess from './pages/RegisterSuccess';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import WithdrawalStatus from './pages/WithdrawalStatus';
import Receive from './pages/Receive';
import Profile from './pages/Profile';
import KYC from './pages/KYC';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import USDTBalance from './pages/BuyGas';
import TierUpgrade from './pages/TierUpgrade';
import Notifications from './pages/Notifications';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Careers from './pages/Careers';
import Team from './pages/Team';
import CaseStudies from './pages/CaseStudies';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAlerts from './pages/admin/AdminAlerts';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminKYC from './pages/admin/AdminKYC';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminAgents from './pages/admin/AdminAgents';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminWithdrawalManagement from './pages/admin/AdminWithdrawalManagement';
import AgentChat from './pages/admin/AgentChat';

// Agent Pages
import AgentLogin from './pages/agent/AgentLogin';
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentHistory from './pages/agent/AgentHistory';
import AgentProfile from './pages/agent/AgentProfile';

// Components
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import AgentLayout from './components/AgentLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AgentRoute from './components/AgentRoute';
import Toast from './components/Toast';
import ChatWidget from './components/ChatWidget';
import CookieConsent from './components/CookieConsent';
import ScrollProgress from './components/ScrollProgress';
import PageTransition from './components/PageTransition';
import StickyCTA from './components/StickyCTA';

// Root Redirect Component - Now Home is the default landing page
const RootRedirect = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    if (user?.isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    if (user?.isAgent && !user?.isAdmin) {
      return <Navigate to="/agent" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  // If not authenticated, stay on home page (which is now handled by Route path="/")
  return null;
};

// Not Found Component
const NotFound = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">Page not found</p>
        <button
          onClick={() => navigate(user?.isAdmin ? '/admin' : '/dashboard')}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Go to {user?.isAdmin ? 'Admin Dashboard' : 'Dashboard'}
        </button>
      </div>
    </div>
  );
};

// Initialize theme
const ThemeInitializer = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      dispatch(setTheme(savedTheme));
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      dispatch(setTheme('dark'));
    }
  }, [dispatch]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return null;
};

// Initialize site config
const SiteConfigInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch site configuration on app load
    dispatch(fetchSiteConfig());
  }, [dispatch]);

  return null;
};

// Auth initializer
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && !user) {
        await dispatch(initializeAuth());
      }
      // Small delay to ensure state is updated
      setTimeout(() => {
        setIsInitializing(false);
      }, 200);
    };
    
    initAuth();
  }, [dispatch, user]);

  // Show loading spinner only during initial auth check
  // Don't block the app for registration/login operations
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <SiteConfigInitializer />
        <ThemeInitializer />
        <Favicon />
        <Toast />
        <ScrollProgress />
        <StickyCTA />
        <AuthInitializer>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/news" element={<PageTransition><News /></PageTransition>} />
          <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
          <Route path="/team" element={<PageTransition><Team /></PageTransition>} />
          <Route path="/case-studies" element={<PageTransition><CaseStudies /></PageTransition>} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/agent/login" element={<AgentLogin />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>          
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/trade" element={<Trade />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/withdrawal/:transactionId" element={<WithdrawalStatus />} />
              <Route path="/receive" element={<Receive />} />
              <Route path="/usdt-balance" element={<USDTBalance />} />
              <Route path="/tier-upgrade" element={<TierUpgrade />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/:id" element={<TransactionDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/kyc" element={<KYC />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>
          
          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/:userId" element={<AdminUserDetail />} />
              <Route path="/admin/kyc" element={<AdminKYC />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/alerts" element={<AdminAlerts />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/agents" element={<AdminAgents />} />
              <Route path="/admin/transactions" element={<AdminTransactions />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawalManagement />} />
              <Route path="/admin/newsletter" element={<AdminNewsletter />} />
              <Route path="/admin/chat" element={<AgentChat />} />
            </Route>
          </Route>
          
          {/* Agent Routes */}
          <Route element={<AgentRoute />}>
            <Route element={<AgentLayout />}>
              <Route path="/agent" element={<AgentDashboard />} />
              <Route path="/agent/chats" element={<AgentChat />} />
              <Route path="/agent/history" element={<AgentHistory />} />
              <Route path="/agent/profile" element={<AgentProfile />} />
            </Route>
          </Route>
          
          {/* Default redirect - handled by RootRedirect component */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Chat Widget - Available on all pages */}
        <ChatWidget />
        
        {/* Cookie Consent Banner */}
        <CookieConsent />
        </AuthInitializer>
      </Router>
    </Provider>
  );
}

export default App;
