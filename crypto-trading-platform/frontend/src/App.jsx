import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, initializeAuth } from './store/authSlice';
import { setTheme } from './store/themeSlice';

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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Receive from './pages/Receive';
import Profile from './pages/Profile';
import KYC from './pages/KYC';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import BuyGas from './pages/BuyGas';
import TierUpgrade from './pages/TierUpgrade';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAlerts from './pages/admin/AdminAlerts';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminKYC from './pages/admin/AdminKYC';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminAgents from './pages/admin/AdminAgents';
import AgentChat from './pages/admin/AgentChat';

// Components
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Toast from './components/Toast';
import ChatWidget from './components/ChatWidget';

// Root Redirect Component - Now Home is the default landing page
const RootRedirect = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    if (user?.isAdmin) {
      return <Navigate to="/admin" replace />;
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

// Auth initializer
const AuthInitializer = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
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

  // Show loading spinner while checking auth
  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <ThemeInitializer />
        <AuthInitializer />
        <Toast />
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/news" element={<News />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>          
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/trade" element={<Trade />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/receive" element={<Receive />} />
              <Route path="/buy-gas" element={<BuyGas />} />
              <Route path="/tier-upgrade" element={<TierUpgrade />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/:id" element={<TransactionDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/kyc" element={<KYC />} />
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
              <Route path="/admin/transactions" element={<AdminTransactions />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/alerts" element={<AdminAlerts />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/agents" element={<AdminAgents />} />
              <Route path="/admin/chat" element={<AgentChat />} />
            </Route>
          </Route>
          
          {/* Default redirect - handled by RootRedirect component */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Chat Widget - Available on all pages */}
        <ChatWidget />
      </Router>
    </Provider>
  );
}

export default App;
