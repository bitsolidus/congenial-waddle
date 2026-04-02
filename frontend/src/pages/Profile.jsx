import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Wallet, Shield, Edit2, Camera, MapPin, Phone, Calendar, Globe, Upload, X, FileCheck, Users, Eye, EyeOff, DollarSign } from 'lucide-react';
import { updateProfile } from '../store/authSlice';
import { fetchBalance } from '../store/walletSlice';
import { formatCurrency, truncateAddress } from '../utils/helpers';
import { getAvailableCurrencies, convertFromUSD, formatCurrencyWithSymbol } from '../utils/currency';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance, totalDeposited, totalWithdrawn } = useSelector((state) => state.wallet);
  
  // Get user's currency preference
  const userCurrency = user?.currency || 'USD';
  
  // Fetch balance data on mount
  useEffect(() => {
    dispatch(fetchBalance());
  }, [dispatch]);
  
  // Use balance from wallet slice (in USD)
  const totalBalance = balance?.total || 0;
  
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    dateOfBirth: '',
    currency: 'USD',
  });
  
  const availableCurrencies = getAvailableCurrencies();

  // Update formData when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || user?.kycData?.firstName || '',
        lastName: user.lastName || user?.kycData?.lastName || '',
        gender: user.gender || user?.kycData?.gender || '',
        phone: user.phone || user?.kycData?.phoneNumber || '',
        address: user.address || user?.kycData?.address || '',
        city: user.city || user?.kycData?.city || '',
        country: user.country || user?.kycData?.country || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : 
                     user?.kycData?.dateOfBirth ? new Date(user.kycData.dateOfBirth).toISOString().split('T')[0] : '',
        currency: user.currency || 'USD',
      });
    }
  }, [user]);

  // Predefined avatar options
  const avatarOptions = [
    { id: 'default', color: 'from-primary-500 to-primary-700', icon: '👤' },
    { id: 'blue', color: 'from-blue-500 to-blue-700', icon: '😎' },
    { id: 'green', color: 'from-green-500 to-green-700', icon: '🤠' },
    { id: 'purple', color: 'from-purple-500 to-purple-700', icon: '🤓' },
    { id: 'orange', color: 'from-orange-500 to-orange-700', icon: '😊' },
    { id: 'pink', color: 'from-pink-500 to-pink-700', icon: '🤩' },
    { id: 'red', color: 'from-red-500 to-red-700', icon: '😁' },
    { id: 'yellow', color: 'from-yellow-500 to-yellow-700', icon: '🥳' },
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'default');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Update selectedAvatar when user data from Redux changes
  useEffect(() => {
    if (user?.avatar !== undefined) {
      setSelectedAvatar(user.avatar || 'default');
    }
  }, [user?.avatar]);

  const handleSave = async () => {
    await dispatch(updateProfile({ ...formData, avatar: selectedAvatar }));
    setIsEditing(false);
  };

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    return avatar.startsWith('http') ? avatar : `${API_BASE_URL}${avatar}`;
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.post('/api/user/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedAvatar(response.data.avatarUrl);
      // Update user in Redux store
      await dispatch(updateProfile({ avatar: response.data.avatarUrl }));
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const tierColors = {
    bronze: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    silver: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    gold: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    vip: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  };

  const kycColors = {
    verified: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    not_submitted: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>

      {/* Profile Header with Avatar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            {selectedAvatar && typeof selectedAvatar === 'string' && selectedAvatar.startsWith('/uploads/') ? (
              <img 
                src={getAvatarUrl(selectedAvatar)} 
                alt="Avatar" 
                className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-crypto-card shadow-lg"
              />
            ) : (
              <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${avatarOptions.find(a => a.id === selectedAvatar)?.color || avatarOptions[0].color} flex items-center justify-center text-4xl border-4 border-white dark:border-crypto-card shadow-lg`}>
                {avatarOptions.find(a => a.id === selectedAvatar)?.icon || user?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="absolute bottom-0 right-0 h-8 w-8 bg-white dark:bg-crypto-card rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-crypto-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Camera className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-field w-48"
                />
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.firstName 
                        ? user.firstName 
                        : user?.username}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{user?.username}</p>
                </div>
              )}
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {isEditing ? 'Save' : <Edit2 className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <div className="flex items-center justify-center md:justify-start space-x-2 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${tierColors[user?.tier]}`}>
                {user?.tier} Tier
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${kycColors[user?.kycStatus]}`}>
                {user?.kycStatus?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-crypto-card rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Choose Avatar</h3>
              <button 
                onClick={() => setShowAvatarModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar.id)}
                  className={`h-16 w-16 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-2xl transition-transform hover:scale-110 ${
                    selectedAvatar === avatar.id ? 'ring-4 ring-primary-500 ring-offset-2 dark:ring-offset-crypto-card' : ''
                  }`}
                >
                  {avatar.icon}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-crypto-border pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Or upload your own</p>
              <label className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {uploadingAvatar ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Upload Image</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
              <p className="text-xs text-gray-400 mt-2 text-center">Recommended: 200x200px, JPG or PNG</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch(updateProfile({ avatar: selectedAvatar }));
                  setShowAvatarModal(false);
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {userCurrency !== 'USD' 
                  ? formatCurrencyWithSymbol(convertFromUSD(totalBalance, userCurrency), userCurrency)
                  : formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Deposited</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {userCurrency !== 'USD' 
                  ? formatCurrencyWithSymbol(convertFromUSD(totalDeposited, userCurrency), userCurrency)
                  : formatCurrency(totalDeposited)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Withdrawn</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {userCurrency !== 'USD' 
                  ? formatCurrencyWithSymbol(convertFromUSD(totalWithdrawn, userCurrency), userCurrency)
                  : formatCurrency(totalWithdrawn)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Wallet Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Connected Wallet</h3>
        {user?.walletAddress ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-crypto-bg rounded-lg">
            <div className="flex items-center space-x-3">
              <Wallet className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-mono">
                {truncateAddress(user.walletAddress)}
              </span>
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
              Connected
            </span>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No wallet connected</p>
            <button className="btn-primary">Connect Wallet</button>
          </div>
        )}
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-500"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <User className="h-4 w-4" />
              First Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-field w-full"
                placeholder="Enter first name"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">
                {user?.firstName || user?.kycData?.firstName || 'Not set'}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <User className="h-4 w-4" />
              Last Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-field w-full"
                placeholder="Enter last name"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">
                {user?.lastName || user?.kycData?.lastName || 'Not set'}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <p className="text-gray-900 dark:text-white">{user?.email}</p>
          </div>

          {/* Gender */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Users className="h-4 w-4" />
              Gender
            </label>
            {isEditing ? (
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="input-field w-full"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            ) : (
              <p className="text-gray-900 dark:text-white capitalize">
                {(user?.gender || user?.kycData?.gender)?.replace(/_/g, ' ') || 'Not set'}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Phone className="h-4 w-4" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field w-full"
                placeholder="Enter phone number"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">
                {user?.phone || user?.kycData?.phoneNumber || 'Not set'}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Calendar className="h-4 w-4" />
              Date of Birth
            </label>
            {isEditing ? (
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="input-field w-full"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">
                {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 
                 user?.kycData?.dateOfBirth ? new Date(user.kycData.dateOfBirth).toLocaleDateString() : 'Not set'}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Globe className="h-4 w-4" />
              Country
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="input-field w-full"
                placeholder="Enter country"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">
                {user?.country || user?.kycData?.country || 'Not set'}
              </p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <DollarSign className="h-4 w-4" />
              Preferred Currency
            </label>
            {isEditing ? (
              <select
                name="currency"
                value={formData.currency || 'USD'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="input-field w-full appearance-none"
              >
                {availableCurrencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{availableCurrencies.find(c => c.code === user?.currency)?.symbol || '$'}</span>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.currency || 'USD'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {availableCurrencies.find(c => c.code === user?.currency)?.name || 'US Dollar'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* City */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <MapPin className="h-4 w-4" />
              City
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input-field w-full"
                placeholder="Enter city"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">
                {user?.city || user?.kycData?.city || 'Not set'}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <MapPin className="h-4 w-4" />
              Address
            </label>
            {isEditing ? (
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field w-full h-20 resize-none"
                placeholder="Enter address"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">
                {user?.address || user?.kycData?.address || 'Not set'}
              </p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-crypto-border">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </motion.div>

      {/* KYC Information (if submitted) */}
      {user?.kycData?.idType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">KYC Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nationality</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {user?.kycData?.nationality || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID Type</p>
              <p className="text-gray-900 dark:text-white font-medium capitalize">
                {user?.kycData?.idType?.replace(/_/g, ' ') || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID Number</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {user?.kycData?.idNumber ? `****${user.kycData.idNumber.slice(-4)}` : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">KYC Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                user?.kycStatus === 'verified' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                user?.kycStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                user?.kycStatus === 'rejected' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
                {user?.kycStatus?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Settings */}
      <SecuritySettings user={user} />
    </div>
  );
};

// Security Settings Component
const SecuritySettings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('password');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // 2FA setup states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableCode, setDisableCode] = useState('');

  // Fetch 2FA status on mount
  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const res = await axios.get('/api/user/2fa/status');
        setTwoFactorEnabled(res.data.twoFactorEnabled);
      } catch (err) {
        console.log('Could not fetch 2FA status');
      }
    };
    fetch2FAStatus();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/user/2fa/setup');
      setQrCodeUrl(res.data.qrCodeUrl);
      setManualKey(res.data.manualEntryKey);
      setShow2FAModal(true);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to setup 2FA' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (verifyCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a 6-digit code' });
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.post('/api/user/2fa/verify', { code: verifyCode });
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setVerifyCode('');
      setMessage({ type: 'success', text: 'Two-factor authentication enabled successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid verification code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (disableCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a 6-digit code' });
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.post('/api/user/2fa/disable', { code: disableCode });
      setTwoFactorEnabled(false);
      setShowDisableModal(false);
      setDisableCode('');
      setMessage({ type: 'success', text: 'Two-factor authentication disabled successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid verification code' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="card"
    >
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security Settings</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-crypto-border">
        <button
          onClick={() => setActiveTab('password')}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'password'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          Change Password
        </button>
        <button
          onClick={() => setActiveTab('2fa')}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === '2fa'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          Two-Factor Auth
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'sessions'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          Active Sessions
        </button>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg mb-4 ${
          message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
          'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Password Change Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input-field w-full pr-10"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input-field w-full pr-10"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input-field w-full pr-10"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}

      {/* 2FA Tab */}
      {activeTab === '2fa' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-crypto-bg rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {twoFactorEnabled 
                  ? 'Your account is protected with 2FA' 
                  : 'Add an extra layer of security to your account'}
              </p>
            </div>
            <button
              onClick={() => twoFactorEnabled ? setShowDisableModal(true) : handleSetup2FA()}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {twoFactorEnabled && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                <span className="font-medium">Status:</span> Enabled
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                You'll be asked for a verification code when signing in from a new device.
              </p>
            </div>
          )}

          {/* Setup 2FA Modal */}
          {show2FAModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-crypto-card rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Setup Two-Factor Authentication</h3>
                
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto rounded-lg" />
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                    Or enter this code manually:
                  </p>
                  <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-center text-sm font-mono break-all">
                    {manualKey}
                  </code>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Enter verification code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    className="input-field w-full text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShow2FAModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerify2FA}
                    disabled={isLoading || verifyCode.length !== 6}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Disable 2FA Modal */}
          {showDisableModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-crypto-card rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Disable Two-Factor Authentication</h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Enter your current 2FA code to disable two-factor authentication.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verification code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    className="input-field w-full text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDisableModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisable2FA}
                    disabled={isLoading || disableCode.length !== 6}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* Active Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-crypto-bg rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Current Session</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Web Browser • {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'}</p>
                <p className="text-xs text-gray-400">Active now</p>
              </div>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                Active
              </span>
            </div>
          </div>

          <button
            onClick={() => alert('This would log out all other devices')}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Log out all other devices
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Profile;
