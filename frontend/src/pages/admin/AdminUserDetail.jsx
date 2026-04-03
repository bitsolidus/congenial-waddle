import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCryptoPrices } from '../../store/cryptoSlice';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { convertFromUSD, formatCurrencyWithSymbol } from '../../utils/currency';

// Helper function to parse user agent and extract browser/device info
const parseUserAgent = (userAgent) => {
  if (!userAgent) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };
  
  // Detect browser
  let browser = 'Unknown';
  if (userAgent.includes('Firefox/')) browser = 'Firefox';
  else if (userAgent.includes('Edg/')) browser = 'Edge';
  else if (userAgent.includes('Chrome/')) browser = 'Chrome';
  else if (userAgent.includes('Safari/')) browser = 'Safari';
  else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) browser = 'Internet Explorer';
  
  // Detect OS
  let os = 'Unknown';
  if (userAgent.includes('Win')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  
  // Detect device type
  let device = 'Desktop';
  if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) device = 'Mobile';
  if (/Tablet|iPad/i.test(userAgent)) device = 'Tablet';
  
  return { browser, os, device };
};
import {
  ArrowLeft,
  User,
  Wallet,
  Copy,
  Check,
  Edit3,
  Save,
  X,
  QrCode,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Bitcoin,
  DollarSign,
  Shield,
  Mail,
  Calendar,
  Activity,
  Coins,
  Send,
  Edit2,
  Eye,
  EyeOff,
  FileCheck,
  MapPin,
  Phone,
  Loader2,
  Award,
  TrendingUp,
  Users,
  Clock,
  Trash2
} from 'lucide-react';

const AdminUserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { prices } = useSelector((state) => state.crypto);
  
  // Helper to safely format dates
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not set';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingWallet, setEditingWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [savingWallet, setSavingWallet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState(null);

  // Fetch crypto prices on mount
  useEffect(() => {
    dispatch(fetchCryptoPrices());
  }, [dispatch]);
  
  // Email editing state
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [showVerificationLink, setShowVerificationLink] = useState(false);
  const [verificationLink, setVerificationLink] = useState('');
  
  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    currency: 'USD',
    createdAt: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Delete user state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  
  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordResetLink, setPasswordResetLink] = useState('');
  const [showPasswordResetLink, setShowPasswordResetLink] = useState(false);
  
  // Account activation state
  const [togglingAccount, setTogglingAccount] = useState(false);
  
  // Transaction generation state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    startDate: '',
    endDate: '',
    transactionCount: 10,
    types: ['deposit', 'withdrawal', 'trade'],
    cryptocurrencies: ['USDT', 'BTC', 'ETH']
  });
  
  // Fund management state
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAction, setFundAction] = useState('deposit'); // 'deposit' or 'deduct'
  const [fundForm, setFundForm] = useState({
    amount: '',
    crypto: 'USDT',
    reason: '',
    transactionDate: '' // Custom date for the transaction
  });
  const [processingFund, setProcessingFund] = useState(false);

  // Tier management state
  const [showTierModal, setShowTierModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [tierReason, setTierReason] = useState('');
  const [updatingTier, setUpdatingTier] = useState(false);

  // User transactions state
  const [userTransactions, setUserTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // User activity log state
  const [userActivities, setUserActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');

  // Fetch user data from API
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/user/${userId}`);
      const userData = response.data.user;
      
      setUser({
        ...userData,
        name: userData.name || userData.username,
        balance: typeof userData.balance === 'object' && userData.balance !== null 
          ? userData.balance 
          : { USDT: userData.balance || 0, BTC: 0, ETH: 0 },
        depositAddresses: userData.depositAddresses || {
          BTC: '',
          ETH: userData.walletAddress || '',
          USDT: userData.walletAddress || ''
        },
        totalDeposited: userData.totalDeposited || 0,
        totalWithdrawn: userData.totalWithdrawn || 0,
        totalTraded: userData.totalTraded || 0
      });
      setWalletAddress(userData.walletAddress || '');
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setNotification({ message: 'Failed to load user data', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setNotification({ message: 'Address copied to clipboard', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveWallet = async () => {
    setSavingWallet(true);
    try {
      await axios.put(`/api/admin/user/${userId}`, {
        walletAddress
      });
      setUser({ ...user, walletAddress });
      setEditingWallet(false);
      setNotification({ message: 'Wallet address updated successfully', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to update wallet:', err);
      setNotification({ message: 'Failed to update wallet address', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSavingWallet(false);
    }
  };

  const [savingDepositAddresses, setSavingDepositAddresses] = useState(false);

  const handleSaveDepositAddresses = async () => {
    setSavingDepositAddresses(true);
    try {
      await axios.put(`/api/admin/user/${userId}`, {
        depositAddresses: user.depositAddresses
      });
      setNotification({ message: 'Deposit addresses updated successfully', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to update deposit addresses:', err);
      setNotification({ message: 'Failed to update deposit addresses', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSavingDepositAddresses(false);
    }
  };

  const generateNewAddress = (crypto) => {
    const addresses = {
      BTC: 'bc1q' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      ETH: '0x' + Math.random().toString(16).substring(2, 42),
      USDT: '0x' + Math.random().toString(16).substring(2, 42)
    };
    
    setUser({
      ...user,
      depositAddresses: {
        ...user.depositAddresses,
        [crypto]: addresses[crypto]
      }
    });
    setNotification({ message: `New ${crypto} address generated`, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Email management functions
  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === user.email) {
      setEditingEmail(false);
      return;
    }
    
    setSavingEmail(true);
    try {
      const response = await axios.put(`/api/admin/user/${userId}/email`, { email: newEmail });
      setUser(prev => ({ ...prev, email: response.data.user.email, isEmailVerified: false }));
      setNotification({ message: 'Email updated successfully', type: 'success' });
      setEditingEmail(false);
    } catch (err) {
      setNotification({ message: err.response?.data?.message || 'Failed to update email', type: 'error' });
    } finally {
      setSavingEmail(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await axios.post(`/api/admin/user/${userId}/resend-verification`);
      if (response.data.verificationLink) {
        setVerificationLink(response.data.verificationLink);
        setShowVerificationLink(true);
      }
      setNotification({ 
        message: response.data.message || 'Verification email sent successfully', 
        type: response.data.emailSent === false ? 'warning' : 'success' 
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({ message: err.response?.data?.message || 'Failed to send verification email', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleManualVerify = async () => {
    try {
      const response = await axios.put(`/api/admin/user/${userId}/verify-email`);
      setUser(prev => ({ ...prev, isEmailVerified: true }));
      setNotification({ message: 'Email verified successfully', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({ message: err.response?.data?.message || 'Failed to verify email', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Quick Actions functions
  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    try {
      const updateData = {
        username: profileData.username,
        name: profileData.name,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        gender: profileData.gender,
        dateOfBirth: profileData.dateOfBirth,
        address: profileData.address,
        city: profileData.city,
        country: profileData.country,
        currency: profileData.currency
      };
      
      // Only include createdAt if it was changed
      if (profileData.createdAt) {
        updateData.createdAt = new Date(profileData.createdAt).toISOString();
      }
      
      const response = await axios.put(`/api/admin/user/${userId}/profile`, updateData);
      
      // Update user state with new data
      setUser(prev => ({ 
        ...prev, 
        username: response.data.user.username,
        name: response.data.user.name || response.data.user.username,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        email: response.data.user.email,
        phone: response.data.user.phone,
        gender: response.data.user.gender,
        dateOfBirth: response.data.user.dateOfBirth,
        address: response.data.user.address,
        city: response.data.user.city,
        country: response.data.user.country,
        settings: { ...prev.settings, currency: response.data.user.currency },
        createdAt: response.data.user.createdAt
      }));
      
      setNotification({ message: 'Profile updated successfully', type: 'success' });
      setEditingProfile(false);
      
      // Also refresh user data from server to ensure consistency
      fetchUserData();
    } catch (err) {
      setNotification({ message: err.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleResetPassword = async () => {
    setResettingPassword(true);
    try {
      const response = await axios.post(`/api/admin/user/${userId}/reset-password`);
      setPasswordResetLink(response.data.resetLink);
      setShowPasswordResetLink(true);
      setNotification({ message: 'Password reset email sent successfully', type: 'success' });
      setShowPasswordReset(false);
    } catch (err) {
      setNotification({ message: err.response?.data?.message || 'Failed to send password reset email', type: 'error' });
    } finally {
      setResettingPassword(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleToggleAccount = async () => {
    setTogglingAccount(true);
    try {
      const endpoint = user.isActive ? 'freeze' : 'unfreeze';
      await axios.post(`/api/admin/user/${userId}/${endpoint}`);
      setUser(prev => ({ ...prev, isActive: !prev.isActive }));
      setNotification({ 
        message: user.isActive ? 'Account deactivated successfully' : 'Account activated successfully', 
        type: 'success' 
      });
    } catch (err) {
      setNotification({ message: err.response?.data?.message || 'Failed to update account status', type: 'error' });
    } finally {
      setTogglingAccount(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteUser = async () => {
    setDeletingUser(true);
    try {
      await axios.delete(`/api/admin/user/${userId}`);
      setNotification({ 
        message: 'User account permanently deleted', 
        type: 'success' 
      });
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
    } catch (err) {
      setNotification({ 
        message: err.response?.data?.message || 'Failed to delete user account', 
        type: 'error' 
      });
      setDeletingUser(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const [generatedTransactions, setGeneratedTransactions] = useState([]);
  const [showGeneratedList, setShowGeneratedList] = useState(false);

  const handleGenerateTransactions = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`/api/admin/user/${userId}/generate-transactions`, generateForm);
      setGeneratedTransactions(response.data.transactions || []);
      setShowGeneratedList(true);
      setNotification({ 
        message: response.data.message, 
        type: 'success' 
      });
      setShowGenerateModal(false);
      setGenerateForm({
        startDate: '',
        endDate: '',
        transactionCount: 10,
        types: ['deposit', 'withdrawal', 'trade'],
        cryptocurrencies: ['USDT', 'BTC', 'ETH']
      });
      // Refresh transactions list
      fetchUserTransactions();
    } catch (err) {
      setNotification({ 
        message: err.response?.data?.message || 'Failed to generate transactions', 
        type: 'error' 
      });
    } finally {
      setGenerating(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Fetch user transactions
  const fetchUserTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response = await axios.get(`/api/admin/user/${userId}/transactions`);
      setUserTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch user transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Fetch transactions when tab changes to transactions
  useEffect(() => {
    if (activeTab === 'transactions' && userId) {
      fetchUserTransactions();
    }
  }, [activeTab, userId]);

  // Fetch user activities
  const fetchUserActivities = async () => {
    setLoadingActivities(true);
    try {
      const params = activityFilter !== 'all' ? `?type=${activityFilter}` : '';
      const response = await axios.get(`/api/admin/user/${userId}/activity${params}`);
      console.log('Activities fetched:', response.data);
      setUserActivities(response.data.activities || []);
    } catch (err) {
      console.error('Failed to fetch user activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Fetch activities when tab changes to activity
  useEffect(() => {
    if (activeTab === 'activity' && userId) {
      fetchUserActivities();
    }
  }, [activeTab, userId, activityFilter]);

  const handleFundAction = async () => {
    const amount = parseFloat(fundForm.amount);
    if (!amount || amount <= 0) {
      setNotification({ message: 'Please enter a valid amount', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    if (fundAction === 'deduct' && !fundForm.reason.trim()) {
      setNotification({ message: 'Reason is required for deduction', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Check if user has sufficient balance for deduction
    if (fundAction === 'deduct') {
      const currentBalance = user?.balance?.[fundForm.crypto] || 0;
      if (amount > currentBalance) {
        setNotification({ 
          message: `Insufficient ${fundForm.crypto} balance. User has ${currentBalance.toFixed(6)} ${fundForm.crypto}`, 
          type: 'error' 
        });
        setTimeout(() => setNotification(null), 3000);
        return;
      }
    }

    setProcessingFund(true);
    try {
      const endpoint = fundAction === 'deposit' ? 'deposit' : 'deduct';
      const response = await axios.post(`/api/admin/user/${userId}/${endpoint}`, {
        amount: amount,
        crypto: fundForm.crypto,
        description: fundAction === 'deposit' ? 'Admin deposit' : 'Admin deduction',
        reason: fundForm.reason,
        transactionDate: fundForm.transactionDate || undefined
      });
      
      // Ensure balance is properly formatted
      const responseBalance = response.data.user?.balance;
      const newBalance = typeof responseBalance === 'object' && responseBalance !== null
        ? responseBalance
        : { USDT: responseBalance || 0, BTC: 0, ETH: 0, BNB: 0 };
      
      console.log('Deposit/Deduct response:', response.data);
      console.log('New balance:', newBalance);
      
      setUser(prev => ({
        ...prev,
        balance: newBalance,
        totalDeposited: response.data.user?.totalDeposited || 0,
        totalWithdrawn: response.data.user?.totalWithdrawn || 0
      }));
      
      setShowFundModal(false);
      setFundForm({ amount: '', crypto: 'USDT', reason: '', transactionDate: '' });
      
      setNotification({ 
        message: response.data.message || `${fundAction === 'deposit' ? 'Deposit' : 'Deduction'} successful`, 
        type: 'success' 
      });
    } catch (err) {
      setNotification({ 
        message: err.response?.data?.message || `Failed to ${fundAction} funds`, 
        type: 'error' 
      });
    } finally {
      setProcessingFund(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle tier update
  const handleUpdateTier = async () => {
    if (!selectedTier || selectedTier === user.tier) {
      setNotification({ message: 'Please select a different tier', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setUpdatingTier(true);
    try {
      const response = await axios.post(`/api/admin/user/${userId}/tier`, {
        tier: selectedTier,
        reason: tierReason
      });

      setUser(prev => ({ ...prev, tier: selectedTier }));
      setShowTierModal(false);
      setTierReason('');
      setSelectedTier('');

      setNotification({
        message: response.data.message || `Tier updated to ${selectedTier.toUpperCase()}`,
        type: 'success'
      });
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || 'Failed to update tier',
        type: 'error'
      });
    } finally {
      setUpdatingTier(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle recalculate totals
  const handleRecalculateTotals = async () => {
    try {
      const response = await axios.post(`/api/admin/user/${userId}/recalculate-totals`);
      
      // Update user state with new values
      setUser(prev => ({
        ...prev,
        totalDeposited: response.data.user.totalDeposited,
        totalWithdrawn: response.data.user.totalWithdrawn
      }));
      
      setNotification({
        message: `Totals recalculated: Deposited $${response.data.user.totalDeposited.toFixed(2)}, Withdrawn $${response.data.user.totalWithdrawn.toFixed(2)}`,
        type: 'success'
      });
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || 'Failed to recalculate totals',
        type: 'error'
      });
    } finally {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The user you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-20 right-6 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {notification.message}
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage user profile and wallet addresses</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            user.isActive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            user.kycStatus === 'verified' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            KYC: {user.kycStatus}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {['overview', 'wallet', 'transactions', 'activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-medium capitalize">
                    {user.tier} Tier
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {/* Email with verification status */}
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    {editingEmail ? (
                      <div className="space-y-2">
                        <input
                          id="admin-edit-email"
                          name="adminEditEmail"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter new email"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateEmail}
                            disabled={savingEmail}
                            className="flex-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                          >
                            {savingEmail ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingEmail(false);
                              setNewEmail(user.email);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                        <button
                          onClick={() => {
                            setNewEmail(user.email);
                            setEditingEmail(true);
                          }}
                          className="p-1 text-gray-400 hover:text-purple-600 rounded"
                          title="Edit email"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {/* Email Verification Status */}
                    <div className="flex items-center gap-2 mt-1">
                      {user.isEmailVerified ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Email Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                          <AlertCircle className="w-3 h-3" />
                          Email Not Verified
                        </span>
                      )}
                    </div>
                    {/* Verification Actions */}
                    {!user.isEmailVerified && !editingEmail && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleResendVerification}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200"
                        >
                          <Send className="w-3 h-3" />
                          Resend Verification
                        </button>
                        <button
                          onClick={handleManualVerify}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Verify Manually
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Link Display */}
                <AnimatePresence>
                  {showVerificationLink && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Verification Link:</span>
                        <button
                          onClick={() => setShowVerificationLink(false)}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          id="admin-verification-link"
                          name="verificationLink"
                          type="text"
                          value={verificationLink}
                          readOnly
                          className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded text-gray-600 dark:text-gray-400"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(verificationLink);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        Share this link with the user to verify their email
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Last login {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {/* Edit Profile Button */}
                  <button 
                    onClick={() => {
                      setProfileData({ 
                        username: user.username, 
                        name: user.name || '',
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        gender: user.gender || '',
                        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                        address: user.address || '',
                        city: user.city || '',
                        country: user.country || '',
                        currency: user.settings?.currency || user.currency || 'USD',
                        createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : ''
                      });
                      setEditingProfile(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  
                  {/* Reset Password Button */}
                  <button 
                    onClick={() => setShowPasswordReset(true)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Reset Password
                  </button>
                  
                  {/* Deposit Funds Button */}
                  <button 
                    onClick={() => {
                      setFundAction('deposit');
                      setShowFundModal(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Deposit Funds
                  </button>
                  
                  {/* Deduct Funds Button */}
                  <button 
                    onClick={() => {
                      setFundAction('deduct');
                      setShowFundModal(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Deduct Funds
                  </button>
                  
                  {/* Generate Transactions Button */}
                  <button 
                    onClick={() => setShowGenerateModal(true)}
                    className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate History
                  </button>
                  
                  {/* Activate/Deactivate Button */}
                  <button 
                    onClick={handleToggleAccount}
                    disabled={togglingAccount}
                    className={`w-full px-4 py-2 text-left text-sm rounded-lg transition-colors flex items-center gap-2 ${
                      user.isActive 
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                  >
                    {togglingAccount ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : user.isActive ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {user.isActive ? 'Deactivate Account' : 'Activate Account'}
                  </button>
                  
                  {/* Change Tier Button */}
                  <button 
                    onClick={() => setShowTierModal(true)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    Change Account Tier
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                      user.tier === 'vip' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      user.tier === 'premium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      user.tier === 'verified' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {user.tier?.toUpperCase() || 'STANDARD'}
                    </span>
                  </button>
                  
                  {/* Delete Account Button */}
                  {!user.isAdmin && (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Profile Modal */}
              <AnimatePresence>
                {editingProfile && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
                    onClick={() => setEditingProfile(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 my-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Edit Profile</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Username */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                          <input
                            type="text"
                            value={profileData.username}
                            onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        {/* First Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                          <input
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        {/* Last Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        {/* Gender */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                          <select
                            value={profileData.gender}
                            onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        {/* Date of Birth */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={profileData.dateOfBirth}
                            onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        {/* Currency */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                          <select
                            value={profileData.currency}
                            onChange={(e) => setProfileData(prev => ({ ...prev, currency: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="JPY">JPY</option>
                            <option value="CAD">CAD</option>
                            <option value="AUD">AUD</option>
                            <option value="CHF">CHF</option>
                            <option value="CNY">CNY</option>
                            <option value="INR">INR</option>
                            <option value="BRL">BRL</option>
                          </select>
                        </div>
                        {/* Address */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                          <input
                            type="text"
                            value={profileData.address}
                            onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        {/* City */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                          <input
                            type="text"
                            value={profileData.city}
                            onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        {/* Country */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                          <input
                            type="text"
                            value={profileData.country}
                            onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        {/* Joined Date */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Joined Date
                          </label>
                          <input
                            type="date"
                            value={profileData.createdAt}
                            onChange={(e) => setProfileData(prev => ({ ...prev, createdAt: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Current: {formatDate(user?.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setEditingProfile(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateProfile}
                          disabled={savingProfile}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                          {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reset Password Modal */}
              <AnimatePresence>
                {showPasswordReset && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowPasswordReset(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Reset Password</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Send a password reset email to <strong>{user.email}</strong>. The user will receive a secure link to set their own password.
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>Secure Link-Based Reset</strong>
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                              A secure reset link will be sent to the user's email. The link expires in 1 hour.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setShowPasswordReset(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleResetPassword}
                          disabled={resettingPassword}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                          {resettingPassword ? 'Sending...' : 'Send Reset Email'}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password Reset Link Modal */}
              <AnimatePresence>
                {showPasswordResetLink && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowPasswordResetLink(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reset Email Sent</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Password reset email sent successfully</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          The reset link has been sent to <strong>{user.email}</strong>. You can also copy the link below to share directly with the user:
                        </p>
                        <div className="flex gap-2">
                          <input
                            id="password-reset-link"
                            name="passwordResetLink"
                            type="text"
                            value={passwordResetLink}
                            readOnly
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(passwordResetLink);
                              setNotification({ message: 'Link copied to clipboard', type: 'success' });
                              setTimeout(() => setNotification(null), 2000);
                            }}
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowPasswordResetLink(false)}
                          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Delete User Confirmation Modal */}
              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete User Account</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>Warning:</strong> You are about to permanently delete <strong>{user.username}'s</strong> account. 
                          All associated data including transactions, notifications, and activity logs will be permanently removed.
                        </p>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deletingUser}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteUser}
                          disabled={deletingUser}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {deletingUser ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Delete Permanently
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Balance & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Balance ({user.settings?.currency || 'USD'})
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(() => {
                    const totalUSD = (user.balance?.USDT || 0) + 
                      ((user.balance?.BTC || 0) * (prices?.BTC?.price || 0)) + 
                      ((user.balance?.ETH || 0) * (prices?.ETH?.price || 0)) + 
                      ((user.balance?.BNB || 0) * (prices?.BNB?.price || 0));
                    const userCurrency = user.settings?.currency || 'USD';
                    return userCurrency !== 'USD' 
                      ? formatCurrencyWithSymbol(convertFromUSD(totalUSD, userCurrency), userCurrency)
                      : formatCurrency(totalUSD);
                  })()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Live prices • Updates every 30s
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">USDT Balance</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(user.balance?.USDT || 0).toLocaleString()} USDT
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(() => {
                    const userCurrency = user.settings?.currency || 'USD';
                    return userCurrency !== 'USD' 
                      ? `≈ ${formatCurrencyWithSymbol(convertFromUSD(user.balance?.USDT || 0, userCurrency), userCurrency)}`
                      : `≈ ${formatCurrency(user.balance?.USDT || 0)} USD`;
                  })()}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Bitcoin className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">BTC Balance</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(user.balance?.BTC || 0).toFixed(6)} BTC
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(() => {
                    const btcValueUSD = (user.balance?.BTC || 0) * (prices?.BTC?.price || 0);
                    const userCurrency = user.settings?.currency || 'USD';
                    return userCurrency !== 'USD' 
                      ? `≈ ${formatCurrencyWithSymbol(convertFromUSD(btcValueUSD, userCurrency), userCurrency)}`
                      : `≈ ${formatCurrency(btcValueUSD)} USD`;
                  })()}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Coins className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">ETH Balance</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(user.balance?.ETH || 0).toFixed(6)} ETH
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(() => {
                    const ethValueUSD = (user.balance?.ETH || 0) * (prices?.ETH?.price || 0);
                    const userCurrency = user.settings?.currency || 'USD';
                    return userCurrency !== 'USD' 
                      ? `≈ ${formatCurrencyWithSymbol(convertFromUSD(ethValueUSD, userCurrency), userCurrency)}`
                      : `≈ ${formatCurrency(ethValueUSD)} USD`;
                  })()}
                </p>
              </div>
            </div>

            {/* Transaction Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Summary</h3>
                <button
                  onClick={handleRecalculateTotals}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recalculate
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${(user.totalDeposited || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Deposited</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    ${(user.totalWithdrawn || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Withdrawn</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    ${user.totalTraded.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Traded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Primary Wallet Address */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Primary Wallet Address</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Main deposit address for this user</p>
              </div>
              {!editingWallet ? (
                <button
                  onClick={() => setEditingWallet(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Address
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveWallet}
                    disabled={savingWallet}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {savingWallet ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingWallet(false);
                      setWalletAddress(user.walletAddress);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingWallet ? (
                    <input
                      id="wallet-address"
                      name="walletAddress"
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                      placeholder="Enter wallet address..."
                    />
                  ) : (
                    <p className="font-mono text-sm text-gray-900 dark:text-white truncate">
                      {user.walletAddress}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ethereum (ERC-20) Address</p>
                </div>
                {!editingWallet && (
                  <button
                    onClick={() => handleCopyAddress(user.walletAddress)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Crypto-Specific Deposit Addresses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cryptocurrency Deposit Addresses</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set unique addresses for each cryptocurrency. Users will see QR codes generated from these addresses.</p>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(user.depositAddresses).map(([crypto, address]) => (
                <div key={crypto} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        crypto === 'BTC' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        crypto === 'ETH' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        {crypto === 'BTC' ? <Bitcoin className="w-5 h-5 text-orange-600" /> :
                         crypto === 'ETH' ? <Coins className="w-5 h-5 text-blue-600" /> :
                         <DollarSign className="w-5 h-5 text-green-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{crypto}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {crypto === 'BTC' ? 'Bitcoin Network' :
                           crypto === 'ETH' ? 'Ethereum (ERC-20)' :
                           'Tron (TRC-20) / Ethereum (ERC-20)'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {address && (
                        <>
                          <button
                            onClick={() => handleCopyAddress(address)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title="Copy address"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => generateNewAddress(crypto)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title="Generate random address"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Address Input */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Deposit Address (Manual Input or Auto-Generate)
                    </label>
                    <input
                      id="user-address"
                      name="userAddress"
                      type="text"
                      value={address || ''}
                      onChange={(e) => {
                        setUser({
                          ...user,
                          depositAddresses: {
                            ...user.depositAddresses,
                            [crypto]: e.target.value
                          }
                        });
                      }}
                      placeholder={`Enter ${crypto} deposit address...`}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* QR Code Preview */}
                  {address && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="bg-white p-2 rounded-lg">
                        <QRCodeSVG 
                          value={address} 
                          size={100}
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">QR Code Preview</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          This QR code will be displayed on the user's deposit page for {crypto}.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Address: {address.substring(0, 20)}...{address.substring(address.length - 8)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveDepositAddresses}
                disabled={savingDepositAddresses}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {savingDepositAddresses ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Deposit Addresses
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Important Note</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                    Each user should have unique deposit addresses. The QR codes shown above will be displayed on the user's deposit page. 
                    Make sure to save after making changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View all deposits, withdrawals, and trades for this user.</p>
            </div>
            <button 
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Generate Transactions
            </button>
          </div>
          
          {loadingTransactions ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : userTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No transactions found for this user.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Crypto</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {userTransactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="px-4 py-3">
                        <span className={`capitalize ${
                          tx.type === 'deposit' ? 'text-green-600' :
                          tx.type === 'withdrawal' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {(() => {
                          const userCurrency = user.settings?.currency || 'USD';
                          return userCurrency !== 'USD' 
                            ? formatCurrencyWithSymbol(convertFromUSD(tx.amount, userCurrency), userCurrency)
                            : formatCurrency(tx.amount);
                        })()}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {tx.cryptoCurrency || tx.crypto || 'USDT'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          tx.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                          tx.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                          'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs max-w-xs truncate">
                        {tx.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Log</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track user login history and account activities.</p>
            </div>
            <select
              id="activity-filter"
              name="activityFilter"
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Activities</option>
              <option value="login">Logins</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="transfer_sent">Transfers Sent</option>
              <option value="transfer_received">Transfers Received</option>
              <option value="trade">Trades</option>
              <option value="kyc_submitted">KYC Submissions</option>
              <option value="kyc_approved">KYC Approvals</option>
              <option value="kyc_rejected">KYC Rejections</option>
              <option value="profile_update">Profile Updates</option>
              <option value="security_alert">Security Alerts</option>
            </select>
          </div>
          
          {loadingActivities ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : userActivities.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No activity recorded for this user yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userActivities.map((activity) => {
                const { browser, os, device } = parseUserAgent(activity.userAgent);
                
                return (
                  <div 
                    key={activity._id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      activity.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                      activity.severity === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                      'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            activity.type === 'login' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                            activity.type === 'deposit' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                            activity.type === 'withdrawal' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                            activity.type === 'transfer_sent' ? 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200' :
                            activity.type === 'transfer_received' ? 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200' :
                            activity.type === 'trade' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                            activity.type?.includes('kyc') ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {activity.type?.replace(/_/g, ' ')?.toUpperCase()}
                          </span>
                          {activity.severity !== 'info' && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              activity.severity === 'critical' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                              'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            }`}>
                              {activity.severity?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white mt-2">{activity.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                        
                        {/* Device & IP Information */}
                        {(activity.ipAddress || activity.userAgent) && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              {/* IP Address */}
                              {activity.ipAddress && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-500 dark:text-gray-400">IP Address:</span>
                                  <span className="font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                    {activity.ipAddress}
                                  </span>
                                </div>
                              )}
                              
                              {/* Browser */}
                              {browser && (
                                <div className="flex items-center gap-2">
                                  <Activity className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-500 dark:text-gray-400">Browser:</span>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {browser}
                                  </span>
                                </div>
                              )}
                              
                              {/* Operating System */}
                              {os && (
                                <div className="flex items-center gap-2">
                                  <Shield className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-500 dark:text-gray-400">OS:</span>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {os}
                                  </span>
                                </div>
                              )}
                              
                              {/* Device Type */}
                              {device && (
                                <div className="flex items-center gap-2">
                                  <Award className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-500 dark:text-gray-400">Device:</span>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {device}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(activity.createdAt)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(activity.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Generate Transactions Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Generate Transaction History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Generate realistic transactions for {user?.username} between selected dates.
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                    <input
                      id="generate-start-date"
                      name="generateStartDate"
                      type="date"
                      value={generateForm.startDate}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <input
                      id="generate-end-date"
                      name="generateEndDate"
                      type="date"
                      value={generateForm.endDate}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Transactions</label>
                  <input
                    id="generate-count"
                    name="generateCount"
                    type="number"
                    min="1"
                    max="100"
                    value={generateForm.transactionCount}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, transactionCount: parseInt(e.target.value) || 10 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                {/* Transaction Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction Types</label>
                  <div className="flex flex-wrap gap-2">
                    {['deposit', 'withdrawal', 'trade'].map(type => (
                      <label 
                        key={type}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border transition-colors ${
                          generateForm.types.includes(type) 
                            ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-300' 
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={generateForm.types.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGenerateForm(prev => ({ ...prev, types: [...prev.types, type] }));
                            } else if (generateForm.types.length > 1) {
                              setGenerateForm(prev => ({ ...prev, types: prev.types.filter(t => t !== type) }));
                            }
                          }}
                        />
                        <span className="text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Cryptocurrencies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cryptocurrencies</label>
                  <div className="flex flex-wrap gap-2">
                    {['USDT', 'BTC', 'ETH', 'BNB', 'SOL'].map(crypto => (
                      <label 
                        key={crypto}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border transition-colors ${
                          generateForm.cryptocurrencies.includes(crypto) 
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300' 
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={generateForm.cryptocurrencies.includes(crypto)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGenerateForm(prev => ({ ...prev, cryptocurrencies: [...prev.cryptocurrencies, crypto] }));
                            } else if (generateForm.cryptocurrencies.length > 1) {
                              setGenerateForm(prev => ({ ...prev, cryptocurrencies: prev.cryptocurrencies.filter(c => c !== crypto) }));
                            }
                          }}
                        />
                        <span className="text-sm font-medium">{crypto}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-4">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  This will create fake transaction records for testing/demo purposes.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateTransactions}
                  disabled={generating || !generateForm.startDate || !generateForm.endDate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Generate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fund Management Modal */}
      <AnimatePresence>
        {showFundModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFundModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {fundAction === 'deposit' ? 'Deposit Funds' : 'Deduct Funds'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {fundAction === 'deposit' 
                  ? `Add funds to ${user?.username}'s account` 
                  : `Remove funds from ${user?.username}'s account`}
              </p>
              
              <div className="space-y-4">
                {/* Current Balance Display */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Balance</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">USDT:</span>
                      <span className="font-medium">{(user?.balance?.USDT || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">BTC:</span>
                      <span className="font-medium">{(user?.balance?.BTC || 0).toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">ETH:</span>
                      <span className="font-medium">{(user?.balance?.ETH || 0).toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">BNB:</span>
                      <span className="font-medium">{(user?.balance?.BNB || 0).toFixed(6)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount ({fundForm.crypto})
                  </label>
                  <input
                    id="fund-amount"
                    name="fundAmount"
                    type="number"
                    step={fundForm.crypto === 'USDT' ? '0.01' : '0.000001'}
                    min="0.01"
                    value={fundForm.amount}
                    onChange={(e) => setFundForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={`Enter amount in ${fundForm.crypto}`}
                  />
                  {fundForm.amount && prices?.[fundForm.crypto]?.price && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {(() => {
                        const amountUSD = parseFloat(fundForm.amount || 0) * prices[fundForm.crypto].price;
                        const userCurrency = user.settings?.currency || 'USD';
                        return userCurrency !== 'USD' 
                          ? `≈ ${formatCurrencyWithSymbol(convertFromUSD(amountUSD, userCurrency), userCurrency)}`
                          : `≈ ${formatCurrency(amountUSD)} USD`;
                      })()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cryptocurrency</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['USDT', 'BTC', 'ETH', 'BNB'].map((crypto) => (
                      <button
                        key={crypto}
                        type="button"
                        onClick={() => setFundForm(prev => ({ ...prev, crypto }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          fundForm.crypto === crypto
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {crypto}
                      </button>
                    ))}
                  </div>
                </div>

                {fundAction === 'deposit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Transaction Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={fundForm.transactionDate}
                      onChange={(e) => setFundForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Leave empty to use today's date
                    </p>
                  </div>
                )}

                {fundAction === 'deduct' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason *</label>
                    <textarea
                      id="fund-reason"
                      name="fundReason"
                      value={fundForm.reason}
                      onChange={(e) => setFundForm(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={2}
                      placeholder="Why are you deducting these funds?"
                    />
                  </div>
                )}
              </div>

              {fundAction === 'deduct' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-4">
                  <p className="text-xs text-red-800 dark:text-red-200">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    This will immediately deduct funds from the user's account.
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowFundModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFundAction}
                  disabled={processingFund || !fundForm.amount}
                  className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                    fundAction === 'deposit' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {processingFund ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : fundAction === 'deposit' ? 'Deposit' : 'Deduct'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Transactions List Modal */}
      <AnimatePresence>
        {showGeneratedList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGeneratedList(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generated Transactions</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {generatedTransactions.length} transactions created successfully
                  </p>
                </div>
                <button
                  onClick={() => setShowGeneratedList(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-[50vh]">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                    <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Crypto</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {generatedTransactions.map((tx, index) => (
                      <tr key={tx.id || index} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="px-4 py-3">
                          <span className={`capitalize ${
                            tx.type === 'deposit' ? 'text-green-600' :
                            tx.type === 'withdrawal' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {tx.crypto}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            tx.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                            tx.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                            'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <button
                  onClick={() => setShowGeneratedList(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowGeneratedList(false);
                    setActiveTab('transactions');
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  View in Transactions Tab
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier Management Modal */}
      <AnimatePresence>
        {showTierModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTierModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Change Account Tier</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Current tier: <span className="font-medium capitalize">{user.tier || 'Standard'}</span>
              </p>

              <div className="space-y-3 mb-4">
                {[
                  { id: 'standard', name: 'Standard', color: 'gray', limits: '$10 - $10,000 / $50k daily', icon: Users },
                  { id: 'verified', name: 'Verified', color: 'blue', limits: '$10 - $50,000 / $200k daily', icon: CheckCircle },
                  { id: 'premium', name: 'Premium', color: 'purple', limits: '$10 - $250,000 / $1M daily', icon: TrendingUp },
                  { id: 'vip', name: 'VIP', color: 'amber', limits: '$10 - $1,000,000 / $5M daily', icon: Award }
                ].map((tier) => {
                  const Icon = tier.icon;
                  const isSelected = selectedTier === tier.id;
                  const isCurrent = user.tier === tier.id;
                  
                  return (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      disabled={isCurrent}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        isCurrent 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : isSelected
                            ? tier.color === 'gray' ? 'border-gray-500 bg-gray-50 dark:bg-gray-700' :
                              tier.color === 'blue' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                              tier.color === 'purple' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' :
                              'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tier.color === 'gray' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600' :
                          tier.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                          tier.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{tier.name}</span>
                            {isCurrent && (
                              <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{tier.limits}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Change (Optional)
                </label>
                <textarea
                  id="tier-reason"
                  name="tierReason"
                  value={tierReason}
                  onChange={(e) => setTierReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  rows={2}
                  placeholder="Why are you changing this user's tier?"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTierModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTier}
                  disabled={updatingTier || !selectedTier || selectedTier === user.tier}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {updatingTier ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update Tier'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUserDetail;
