import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  Upload, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Lock,
  Save,
  X,
  Plus,
  Trash2,
  Twitter,
  Facebook,
  MessageCircle,
  Instagram,
  CheckCircle,
  Eye,
  EyeOff,
  Fuel,
  Settings2,
  MessageSquare,
  Clock,
  Users,
  Palette,
  ToggleLeft,
  ToggleRight,
  Layout
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getImageUrl = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
};

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Site Config State
  const [siteConfig, setSiteConfig] = useState({
    siteName: 'BitSolidus',
    siteDescription: 'Secure Cryptocurrency Trading Platform',
    logo: null,
    favicon: null,
    header: {
      showLogo: true,
      showNavigation: true,
      showUserMenu: true,
      customLinks: []
    },
    footer: {
      showLogo: true,
      showCopyright: true,
      copyrightText: '© 2026 BitSolidus. All rights reserved.',
      footerLinks: [],
      socialLinks: {
        twitter: '',
        facebook: '',
        telegram: '',
        discord: '',
        instagram: ''
      }
    },
    contact: {
      email: 'support@cryptoplatform.com',
      phone: '',
      address: ''
    },
    platform: {
      maintenanceMode: false,
      maintenanceMessage: 'We are currently performing maintenance. Please check back later.',
      allowRegistration: true,
      requireEmailVerification: false,
      requireKycForTrading: false,
      gasFeePercentage: 2.5,
      gasFeeEnabled: true,
      minGasFee: 5,
      maxGasFee: 500
    },
    branding: {
      primaryColor: '#7c3aed',
      secondaryColor: '#4f46e5',
      accentColor: '#10b981'
    },
    meta: {
      title: 'BitSolidus - Secure Cryptocurrency Trading',
      description: 'Trade cryptocurrencies with confidence on our secure platform',
      keywords: 'crypto, trading, bitcoin, ethereum, cryptocurrency'
    }
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Admin Settings State (Withdrawal & Gas)
  const [adminSettings, setAdminSettings] = useState({
    withdrawalPercentage: 75,
    globalWithdrawalPercentage: true,
    minWithdrawal: 0.001,
    maxWithdrawal: 10.0,
    withdrawalCooldown: 24,
    requireAdminApproval: true,
    withdrawalGasFee: {
      enabled: true,
      percentage: 2.5,
      minFee: 5,
      maxFee: 500
    },
    tierLimits: {
      standard: { min: 10, max: 10000, dailyLimit: 50000 },
      verified: { min: 10, max: 50000, dailyLimit: 200000 },
      premium: { min: 10, max: 250000, dailyLimit: 1000000 },
      vip: { min: 10, max: 1000000, dailyLimit: 5000000 }
    }
  });

  // Logo/Favicon Preview
  const [logoPreview, setLogoPreview] = useState(null);
  const [footerLogoPreview, setFooterLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [loadingIconPreview, setLoadingIconPreview] = useState(null);

  // Chat Settings State
  const [chatSettings, setChatSettings] = useState({
    enabled: true,
    position: 'bottom-right',
    theme: 'purple',
    greetingMessage: 'Hello! How can we help you today?',
    offlineMessage: 'We are currently offline. Please leave a message and we will get back to you soon.',
    showOnPages: {
      home: true,
      about: true,
      services: true,
      blog: true,
      news: true,
      faq: true,
      contact: true,
      dashboard: true,
      login: false,
      register: false
    },
    requireGuestInfo: true,
    autoAssign: true,
    maxWaitTime: 300,
    businessHours: {
      enabled: false,
      timezone: 'UTC',
      schedule: {
        monday: { enabled: true, start: '09:00', end: '17:00' },
        tuesday: { enabled: true, start: '09:00', end: '17:00' },
        wednesday: { enabled: true, start: '09:00', end: '17:00' },
        thursday: { enabled: true, start: '09:00', end: '17:00' },
        friday: { enabled: true, start: '09:00', end: '17:00' },
        saturday: { enabled: false, start: '09:00', end: '17:00' },
        sunday: { enabled: false, start: '09:00', end: '17:00' }
      }
    },
    departments: [
      { id: 'general', name: 'General Support', enabled: true },
      { id: 'technical', name: 'Technical Support', enabled: true },
      { id: 'billing', name: 'Billing & Payments', enabled: true },
      { id: 'trading', name: 'Trading Support', enabled: true },
      { id: 'kyc', name: 'KYC & Verification', enabled: true },
      { id: 'vip', name: 'VIP Support', enabled: true }
    ],
    customization: {
      buttonColor: '#7c3aed',
      headerColor: '#7c3aed',
      bubbleColor: '#f3f4f6',
      textColor: '#1f2937',
      fontFamily: 'Inter',
      borderRadius: '12',
      widgetTitle: 'Live Support',
      widgetSubtitle: 'We typically reply in a few minutes'
    }
  });

  useEffect(() => {
    fetchSiteConfig();
    fetchAdminSettings();
    fetchChatSettings();
  }, []);

  const fetchChatSettings = async () => {
    try {
      const response = await axios.get('/api/admin/chat-settings');
      if (response.data.settings) {
        setChatSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (err) {
      console.error('Failed to fetch chat settings:', err);
    }
  };

  const fetchSiteConfig = async () => {
    try {
      const response = await axios.get('/api/admin/site-config');
      if (response.data.config) {
        setSiteConfig(prev => ({ ...prev, ...response.data.config }));
        if (response.data.config.logo) {
          setLogoPreview(getImageUrl(response.data.config.logo));
        }
        if (response.data.config.footerLogo) {
          setFooterLogoPreview(getImageUrl(response.data.config.footerLogo));
        }
        if (response.data.config.favicon) {
          setFaviconPreview(getImageUrl(response.data.config.favicon));
        }
        if (response.data.config.loadingIcon) {
          setLoadingIconPreview(getImageUrl(response.data.config.loadingIcon));
        }
      }
    } catch (err) {
      console.error('Failed to fetch site config:', err);
    }
  };

  const fetchAdminSettings = async () => {
    try {
      const response = await axios.get('/api/admin/settings');
      if (response.data.settings) {
        setAdminSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (err) {
      console.error('Failed to fetch admin settings:', err);
    }
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      await axios.put('/api/admin/site-config', siteConfig);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await axios.post('/api/admin/site-config/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fullLogoUrl = getImageUrl(response.data.logoUrl);
      setSiteConfig(prev => ({ ...prev, logo: response.data.logoUrl }));
      setLogoPreview(fullLogoUrl);
      setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
    } catch (err) {
      console.error('Logo upload error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload logo' });
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('favicon', file);

    try {
      const response = await axios.post('/api/admin/site-config/upload-favicon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fullFaviconUrl = getImageUrl(response.data.faviconUrl);
      setSiteConfig(prev => ({ ...prev, favicon: response.data.faviconUrl }));
      setFaviconPreview(fullFaviconUrl);
      setMessage({ type: 'success', text: 'Favicon uploaded successfully!' });
    } catch (err) {
      console.error('Favicon upload error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload favicon' });
    }
  };

  const handleFooterLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('footerLogo', file);

    try {
      const response = await axios.post('/api/admin/site-config/upload-footer-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fullFooterLogoUrl = getImageUrl(response.data.footerLogoUrl);
      setSiteConfig(prev => ({ ...prev, footerLogo: response.data.footerLogoUrl }));
      setFooterLogoPreview(fullFooterLogoUrl);
      setMessage({ type: 'success', text: 'Footer logo uploaded successfully!' });
    } catch (err) {
      console.error('Footer logo upload error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload footer logo' });
    }
  };

  const handleLoadingIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('loadingIcon', file);

    try {
      const response = await axios.post('/api/admin/site-config/upload-loading-icon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fullLoadingIconUrl = getImageUrl(response.data.loadingIconUrl);
      setSiteConfig(prev => ({ ...prev, loadingIcon: response.data.loadingIconUrl }));
      setLoadingIconPreview(fullLoadingIconUrl);
      setMessage({ type: 'success', text: 'Loading icon uploaded successfully!' });
    } catch (err) {
      console.error('Loading icon upload error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload loading icon' });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      await axios.put('/api/admin/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  const addFooterLink = () => {
    setSiteConfig(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        footerLinks: [...prev.footer.footerLinks, { label: '', url: '', order: prev.footer.footerLinks.length }]
      }
    }));
  };

  const removeFooterLink = (index) => {
    setSiteConfig(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        footerLinks: prev.footer.footerLinks.filter((_, i) => i !== index)
      }
    }));
  };

  const updateFooterLink = (index, field, value) => {
    setSiteConfig(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        footerLinks: prev.footer.footerLinks.map((link, i) => 
          i === index ? { ...link, [field]: value } : link
        )
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'branding', label: 'Branding', icon: Upload },
    { id: 'header', label: 'Header', icon: Globe },
    { id: 'footer', label: 'Footer', icon: Globe },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'platform', label: 'Platform', icon: AlertCircle },
    { id: 'withdrawal', label: 'Withdrawal & Gas', icon: Fuel },
    { id: 'chat', label: 'Live Chat', icon: MessageSquare },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
        <button
          onClick={handleSaveConfig}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Save Changes
        </button>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* General Settings */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">General Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={siteConfig.siteName}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, siteName: e.target.value }))}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={siteConfig.siteDescription}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, siteDescription: e.target.value }))}
                    className="input-field w-full h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={siteConfig.meta.title}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, meta: { ...prev.meta, title: e.target.value } }))}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={siteConfig.meta.description}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, meta: { ...prev.meta, description: e.target.value } }))}
                    className="input-field w-full h-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={siteConfig.meta.keywords}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, meta: { ...prev.meta, keywords: e.target.value } }))}
                    className="input-field w-full"
                    placeholder="crypto, trading, bitcoin..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Branding Settings */}
          {activeTab === 'branding' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Branding</h2>
              
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Site Logo
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-gray-400 text-sm">No logo</span>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
                      <Upload className="h-5 w-5" />
                      Upload Logo
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Recommended: 200x60px, PNG or SVG</p>
                  </div>
                </div>
              </div>

              {/* Footer Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Footer Logo
                  <span className="text-xs text-gray-500 font-normal ml-2">(Optional - falls back to main logo)</span>
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {footerLogoPreview ? (
                      <img src={footerLogoPreview} alt="Footer Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-gray-400 text-sm">No footer logo</span>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
                      <Upload className="h-5 w-5" />
                      Upload Footer Logo
                      <input type="file" accept="image/*" onChange={handleFooterLogoUpload} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Recommended: 200x60px, PNG or SVG</p>
                  </div>
                </div>
              </div>

              {/* Favicon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Favicon
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {faviconPreview ? (
                      <img src={faviconPreview} alt="Favicon" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-gray-400 text-xs">No favicon</span>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
                      <Upload className="h-5 w-5" />
                      Upload Favicon
                      <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Recommended: 32x32px, ICO or PNG</p>
                  </div>
                </div>
              </div>

              {/* Loading Icon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Site Loading Icon
                  <span className="text-xs text-gray-500 font-normal ml-2">(Shown during page loads)</span>
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {loadingIconPreview ? (
                      <img src={loadingIconPreview} alt="Loading Icon" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-gray-400 text-xs text-center px-2">No loading icon</span>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
                      <Upload className="h-5 w-5" />
                      Upload Loading Icon
                      <input type="file" accept="image/*,.gif" onChange={handleLoadingIconUpload} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Recommended: 64x64px, GIF, SVG, or PNG (animated GIF supported)</p>
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={siteConfig.branding.primaryColor}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, branding: { ...prev.branding, primaryColor: e.target.value } }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={siteConfig.branding.primaryColor}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, branding: { ...prev.branding, primaryColor: e.target.value } }))}
                      className="input-field flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={siteConfig.branding.secondaryColor}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, branding: { ...prev.branding, secondaryColor: e.target.value } }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={siteConfig.branding.secondaryColor}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, branding: { ...prev.branding, secondaryColor: e.target.value } }))}
                      className="input-field flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={siteConfig.branding.accentColor}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, branding: { ...prev.branding, accentColor: e.target.value } }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={siteConfig.branding.accentColor}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, branding: { ...prev.branding, accentColor: e.target.value } }))}
                      className="input-field flex-1"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Header Settings */}
          {activeTab === 'header' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Header Settings</h2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={siteConfig.header.showLogo}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, header: { ...prev.header, showLogo: e.target.checked } }))}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Show Logo in Header</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={siteConfig.header.showNavigation}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, header: { ...prev.header, showNavigation: e.target.checked } }))}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Show Navigation Menu</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={siteConfig.header.showUserMenu}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, header: { ...prev.header, showUserMenu: e.target.checked } }))}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Show User Menu</span>
                </label>
              </div>
            </motion.div>
          )}

          {/* Footer Settings */}
          {activeTab === 'footer' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Footer Settings</h2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={siteConfig.footer.showLogo}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, footer: { ...prev.footer, showLogo: e.target.checked } }))}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Show Logo in Footer</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={siteConfig.footer.showCopyright}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, footer: { ...prev.footer, showCopyright: e.target.checked } }))}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Show Copyright Text</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Copyright Text
                  </label>
                  <input
                    type="text"
                    value={siteConfig.footer.copyrightText}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, footer: { ...prev.footer, copyrightText: e.target.value } }))}
                    className="input-field w-full"
                  />
                </div>

                {/* Footer Links */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Footer Links
                    </label>
                    <button
                      onClick={addFooterLink}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Link
                    </button>
                  </div>
                  <div className="space-y-2">
                    {siteConfig.footer.footerLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Label"
                          value={link.label}
                          onChange={(e) => updateFooterLink(index, 'label', e.target.value)}
                          className="input-field flex-1"
                        />
                        <input
                          type="text"
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => updateFooterLink(index, 'url', e.target.value)}
                          className="input-field flex-1"
                        />
                        <button
                          onClick={() => removeFooterLink(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Social Media Links</h3>
                  
                  <div className="flex items-center gap-3">
                    <Twitter className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Twitter URL"
                      value={siteConfig.footer.socialLinks.twitter}
                      onChange={(e) => setSiteConfig(prev => ({ 
                        ...prev, 
                        footer: { 
                          ...prev.footer, 
                          socialLinks: { ...prev.footer.socialLinks, twitter: e.target.value } 
                        } 
                      }))}
                      className="input-field flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Facebook className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Facebook URL"
                      value={siteConfig.footer.socialLinks.facebook}
                      onChange={(e) => setSiteConfig(prev => ({ 
                        ...prev, 
                        footer: { 
                          ...prev.footer, 
                          socialLinks: { ...prev.footer.socialLinks, facebook: e.target.value } 
                        } 
                      }))}
                      className="input-field flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Telegram URL"
                      value={siteConfig.footer.socialLinks.telegram}
                      onChange={(e) => setSiteConfig(prev => ({ 
                        ...prev, 
                        footer: { 
                          ...prev.footer, 
                          socialLinks: { ...prev.footer.socialLinks, telegram: e.target.value } 
                        } 
                      }))}
                      className="input-field flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Discord URL"
                      value={siteConfig.footer.socialLinks.discord}
                      onChange={(e) => setSiteConfig(prev => ({ 
                        ...prev, 
                        footer: { 
                          ...prev.footer, 
                          socialLinks: { ...prev.footer.socialLinks, discord: e.target.value } 
                        } 
                      }))}
                      className="input-field flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Instagram URL"
                      value={siteConfig.footer.socialLinks.instagram}
                      onChange={(e) => setSiteConfig(prev => ({ 
                        ...prev, 
                        footer: { 
                          ...prev.footer, 
                          socialLinks: { ...prev.footer.socialLinks, instagram: e.target.value } 
                        } 
                      }))}
                      className="input-field flex-1"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact Settings */}
          {activeTab === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="h-4 w-4" />
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={siteConfig.contact.email}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, contact: { ...prev.contact, email: e.target.value } }))}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={siteConfig.contact.phone}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
                    className="input-field w-full"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </label>
                  <textarea
                    value={siteConfig.contact.address}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, contact: { ...prev.contact, address: e.target.value } }))}
                    className="input-field w-full h-20"
                    placeholder="Company address..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Platform Settings */}
          {activeTab === 'platform' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Platform Settings</h2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={siteConfig.platform.maintenanceMode}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, platform: { ...prev.platform, maintenanceMode: e.target.checked } }))}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Maintenance Mode</span>
                </label>

                {siteConfig.platform.maintenanceMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maintenance Message
                    </label>
                    <textarea
                      value={siteConfig.platform.maintenanceMessage}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, platform: { ...prev.platform, maintenanceMessage: e.target.value } }))}
                      className="input-field w-full h-20"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={siteConfig.platform.allowRegistration}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, platform: { ...prev.platform, allowRegistration: e.target.checked } }))}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Allow New Registrations</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={siteConfig.platform.requireEmailVerification}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, platform: { ...prev.platform, requireEmailVerification: e.target.checked } }))}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Require Email Verification</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={siteConfig.platform.requireKycForTrading}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, platform: { ...prev.platform, requireKycForTrading: e.target.checked } }))}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Require KYC for Trading</span>
                </label>

                {/* Gas Fee Settings */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gas Fee Settings</h3>
                  
                  <label className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      checked={siteConfig.platform.gasFeeEnabled}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, platform: { ...prev.platform, gasFeeEnabled: e.target.checked } }))}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Enable Gas Fee for Withdrawals</span>
                  </label>

                  {siteConfig.platform.gasFeeEnabled && (
                    <div className="space-y-4 pl-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Gas Fee Percentage (%)
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={siteConfig.platform.gasFeePercentage}
                            onChange={(e) => setSiteConfig(prev => ({ ...prev, platform: { ...prev.platform, gasFeePercentage: parseFloat(e.target.value) } }))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                          <span className="text-lg font-semibold text-purple-600 dark:text-purple-400 w-16 text-right">
                            {siteConfig.platform.gasFeePercentage}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Percentage of withdrawal amount charged as gas fee
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Minimum Gas Fee (USD)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={siteConfig.platform.minGasFee}
                            onChange={(e) => setSiteConfig(prev => ({ ...prev, platform: { ...prev.platform, minGasFee: parseFloat(e.target.value) || 0 } }))}
                            className="input-field w-full"
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Minimum fee regardless of percentage
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Maximum Gas Fee (USD)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={siteConfig.platform.maxGasFee}
                            onChange={(e) => setSiteConfig(prev => ({ ...prev, platform: { ...prev.platform, maxGasFee: parseFloat(e.target.value) || 0 } }))}
                            className="input-field w-full"
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Maximum fee cap
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Example Calculation</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          For a $1,000 withdrawal: Gas Fee = ${Math.min(Math.max(1000 * (siteConfig.platform.gasFeePercentage / 100), siteConfig.platform.minGasFee), siteConfig.platform.maxGasFee).toFixed(2)} USD
                          ({siteConfig.platform.gasFeePercentage}% of $1,000, min ${siteConfig.platform.minGasFee}, max ${siteConfig.platform.maxGasFee})
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Withdrawal & Gas Settings */}
          {activeTab === 'withdrawal' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Withdrawal & Gas Settings</h2>
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await axios.put('/api/admin/settings', adminSettings);
                      setMessage({ type: 'success', text: 'Settings saved successfully!' });
                    } catch (err) {
                      setMessage({ type: 'error', text: 'Failed to save settings' });
                    } finally {
                      setIsLoading(false);
                      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                    }
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Settings
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Withdrawal Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Withdrawal Limits</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Global Withdrawal Percentage (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={adminSettings.withdrawalPercentage}
                        onChange={(e) => setAdminSettings(prev => ({ ...prev, withdrawalPercentage: parseFloat(e.target.value) || 0 }))}
                        className="input-field w-full"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Percentage of balance users can withdraw
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Withdrawal Cooldown (hours)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={adminSettings.withdrawalCooldown}
                        onChange={(e) => setAdminSettings(prev => ({ ...prev, withdrawalCooldown: parseInt(e.target.value) || 0 }))}
                        className="input-field w-full"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Time between withdrawals
                      </p>
                    </div>
                  </div>

                  {/* Tier-Based Withdrawal Limits */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Account Tier Withdrawal Limits (USD)</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Configure withdrawal limits based on user account tier. Users can withdraw up to the max per transaction and up to daily limit per day.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Standard Tier */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          <h5 className="font-medium text-gray-900 dark:text-white">Standard</h5>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Min per Transaction</label>
                            <input
                              type="number"
                              min="0"
                              value={adminSettings.tierLimits?.standard?.min || 10}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                tierLimits: {
                                  ...prev.tierLimits,
                                  standard: { ...prev.tierLimits?.standard, min: parseFloat(e.target.value) || 0 }
                                }
                              }))}
                              className="input-field w-full mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Max per Transaction</label>
                            <input
                              type="number"
                              min="0"
                              value={adminSettings.tierLimits?.standard?.max || 10000}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                tierLimits: {
                                  ...prev.tierLimits,
                                  standard: { ...prev.tierLimits?.standard, max: parseFloat(e.target.value) || 0 }
                                }
                              }))}
                              className="input-field w-full mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Daily Limit</label>
                            <input
                              type="number"
                              min="0"
                              value={adminSettings.tierLimits?.standard?.dailyLimit || 50000}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                tierLimits: {
                                  ...prev.tierLimits,
                                  standard: { ...prev.tierLimits?.standard, dailyLimit: parseFloat(e.target.value) || 0 }
                                }
                              }))}
                              className="input-field w-full mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Verified Tier */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <h5 className="font-medium text-gray-900 dark:text-white">Verified</h5>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Min per Transaction</label>
                            <input
                              type="number"
                              min="0"
                              value={adminSettings.tierLimits?.verified?.min || 10}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                tierLimits: {
                                  ...prev.tierLimits,
                                  verified: { ...prev.tierLimits?.verified, min: parseFloat(e.target.value) || 0 }
                                }
                              }))}
                              className="input-field w-full mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Max per Transaction</label>
                            <input
                              type="number"
                              min="0"
                              value={adminSettings.tierLimits?.verified?.max || 50000}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                tierLimits: {
                                  ...prev.tierLimits,
                                  verified: { ...prev.tierLimits?.verified, max: parseFloat(e.target.value) || 0 }
                                }
                              }))}
                              className="input-field w-full mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Daily Limit</label>
                            <input
                              type="number"
                              min="0"
                              value={adminSettings.tierLimits?.verified?.dailyLimit || 200000}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                tierLimits: {
                                  ...prev.tierLimits,
                                  verified: { ...prev.tierLimits?.verified, dailyLimit: parseFloat(e.target.value) || 0 }
                                }
                              }))}
                              className="input-field w-full mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Premium Tier */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <h5 className="font-medium text-gray-900 dark:text-white">Premium</h5>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Min per Transaction</label>
                            <input
                              type="number"
                              min="0"
                              value={adminSettings.tierLimits?.premium?.min || 10}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                tierLimits: {
                                  ...prev.tierLimits,
                                  premium: { ...prev.tierLimits?.premium, min: parseFloat(e.target.value) || 0 }
                                }
                              }))}
                              className="input-field w-full mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Max per Transaction</label>
                            <input
                              type="number"
                              min="0"
                              value={adminSettings.tierLimits?.premium?.max || 250000}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                tierLimits: {
                                  ...prev.tierLimits,
                                  premium: { ...prev.tierLimits?.premium, max: parseFloat(e.target.value) || 0 }
                                }
                              }))}
                              className="input-field w-full mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Daily Limit</label>
                            <input
                              type="number"
                              min="0"
                              value={adminSettings.tierLimits?.premium?.dailyLimit || 1000000}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                tierLimits: {
                                  ...prev.tierLimits,
                                  premium: { ...prev.tierLimits?.premium, dailyLimit: parseFloat(e.target.value) || 0 }
                                }
                              }))}
                              className="input-field w-full mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* VIP Tier */}
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <h5 className="font-medium text-gray-900 dark:text-white">VIP</h5>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Min per Transaction</label>
                            <input
                              type="number"
                              min="0"
                              value={adminSettings.tierLimits?.vip?.min || 10}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                tierLimits: {
                                  ...prev.tierLimits,
                                  vip: { ...prev.tierLimits?.vip, min: parseFloat(e.target.value) || 0 }
                                }
                              }))}
                              className="input-field w-full mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Max per Transaction</label>
                            <input
                              type="number"
                              min="0"
                              value={adminSettings.tierLimits?.vip?.max || 1000000}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                tierLimits: {
                                  ...prev.tierLimits,
                                  vip: { ...prev.tierLimits?.vip, max: parseFloat(e.target.value) || 0 }
                                }
                              }))}
                              className="input-field w-full mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Daily Limit</label>
                            <input
                              type="number"
                              min="0"
                              value={adminSettings.tierLimits?.vip?.dailyLimit || 5000000}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                tierLimits: {
                                  ...prev.tierLimits,
                                  vip: { ...prev.tierLimits?.vip, dailyLimit: parseFloat(e.target.value) || 0 }
                                }
                              }))}
                              className="input-field w-full mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={adminSettings.requireAdminApproval}
                      onChange={(e) => setAdminSettings(prev => ({ ...prev, requireAdminApproval: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Require Admin Approval for Withdrawals</span>
                  </label>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Gas Fee Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gas Fee Settings</h3>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={adminSettings.withdrawalGasFee?.enabled}
                      onChange={(e) => setAdminSettings(prev => ({ 
                        ...prev, 
                        withdrawalGasFee: { 
                          ...prev.withdrawalGasFee, 
                          enabled: e.target.checked 
                        } 
                      }))}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Enable Gas Fee for Withdrawals</span>
                  </label>

                  {adminSettings.withdrawalGasFee?.enabled && (
                    <div className="space-y-4 pl-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Gas Fee Percentage (%)
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={adminSettings.withdrawalGasFee?.percentage || 2.5}
                            onChange={(e) => setAdminSettings(prev => ({ 
                              ...prev, 
                              withdrawalGasFee: { 
                                ...prev.withdrawalGasFee, 
                                percentage: parseFloat(e.target.value) 
                              } 
                            }))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                          <span className="text-lg font-semibold text-purple-600 dark:text-purple-400 w-16 text-right">
                            {adminSettings.withdrawalGasFee?.percentage || 2.5}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Percentage of withdrawal USD value charged as gas fee (deducted in USDT)
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Minimum Gas Fee (USD)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={adminSettings.withdrawalGasFee?.minFee || 5}
                            onChange={(e) => setAdminSettings(prev => ({ 
                              ...prev, 
                              withdrawalGasFee: { 
                                ...prev.withdrawalGasFee, 
                                minFee: parseFloat(e.target.value) || 0 
                              } 
                            }))}
                            className="input-field w-full"
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Minimum fee regardless of percentage
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Maximum Gas Fee (USD)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={adminSettings.withdrawalGasFee?.maxFee || 500}
                            onChange={(e) => setAdminSettings(prev => ({ 
                              ...prev, 
                              withdrawalGasFee: { 
                                ...prev.withdrawalGasFee, 
                                maxFee: parseFloat(e.target.value) || 0 
                              } 
                            }))}
                            className="input-field w-full"
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Maximum fee cap
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Example Calculation</h4>
                        <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                          <p className="font-medium">For a 0.075 BTC withdrawal (≈ $5,000 USD at current price):</p>
                          <p>Step 1: 0.075 BTC × $67,000 USD = $5,025 USD</p>
                          <p>Step 2: $5,025 USD × {adminSettings.withdrawalGasFee?.percentage || 2.5}% = ${
                            Math.min(
                              Math.max(5025 * ((adminSettings.withdrawalGasFee?.percentage || 2.5) / 100), adminSettings.withdrawalGasFee?.minFee || 5), 
                              adminSettings.withdrawalGasFee?.maxFee || 500
                            ).toFixed(2)
                          } USD Gas Fee</p>
                          <p className="text-xs mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                            Formula: USD Value × {adminSettings.withdrawalGasFee?.percentage || 2.5}% (min ${adminSettings.withdrawalGasFee?.minFee || 5}, max ${adminSettings.withdrawalGasFee?.maxFee || 500})
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Settings */}
          {activeTab === 'chat' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Enable/Disable Chat */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Live Chat</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Enable or disable the live chat widget</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      chatSettings.enabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        chatSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {chatSettings.enabled && (
                <>
                  {/* Page Visibility Settings */}
                  <div className="card space-y-4">
                    <div className="flex items-center gap-3">
                      <Layout className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Show Chat Widget On</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Select which pages the chat widget should appear on</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { key: 'home', label: 'Home Page' },
                        { key: 'about', label: 'About Page' },
                        { key: 'services', label: 'Services Page' },
                        { key: 'blog', label: 'Blog Page' },
                        { key: 'news', label: 'News Page' },
                        { key: 'faq', label: 'FAQ Page' },
                        { key: 'contact', label: 'Contact Page' },
                        { key: 'dashboard', label: 'Dashboard' },
                        { key: 'login', label: 'Login Page' },
                        { key: 'register', label: 'Register Page' }
                      ].map((page) => (
                        <label key={page.key} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <input
                            type="checkbox"
                            checked={chatSettings.showOnPages[page.key]}
                            onChange={(e) => setChatSettings(prev => ({
                              ...prev,
                              showOnPages: { ...prev.showOnPages, [page.key]: e.target.checked }
                            }))}
                            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{page.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Departments */}
                  <div className="card space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Support Departments</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enable or disable departments for chat routing</p>
                    
                    <div className="space-y-2">
                      {chatSettings.departments.map((dept, index) => (
                        <div key={dept.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {dept.id === 'general' && '💬'}
                              {dept.id === 'technical' && '🔧'}
                              {dept.id === 'billing' && '💳'}
                              {dept.id === 'trading' && '📈'}
                              {dept.id === 'kyc' && '🆔'}
                              {dept.id === 'vip' && '⭐'}
                            </span>
                            <input
                              type="text"
                              value={dept.name}
                              onChange={(e) => {
                                const newDepts = [...chatSettings.departments];
                                newDepts[index].name = e.target.value;
                                setChatSettings(prev => ({ ...prev, departments: newDepts }));
                              }}
                              className="bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white font-medium"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newDepts = [...chatSettings.departments];
                              newDepts[index].enabled = !newDepts[index].enabled;
                              setChatSettings(prev => ({ ...prev, departments: newDepts }));
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              dept.enabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                dept.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Guest Settings */}
                  <div className="card space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Guest User Settings</h3>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Require Name & Email</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Guests must provide contact info before chatting</p>
                      </div>
                      <button
                        onClick={() => setChatSettings(prev => ({ ...prev, requireGuestInfo: !prev.requireGuestInfo }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          chatSettings.requireGuestInfo ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            chatSettings.requireGuestInfo ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Widget Customization */}
                  <div className="card space-y-4">
                    <div className="flex items-center gap-3">
                      <Palette className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Widget Appearance</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Widget Title
                        </label>
                        <input
                          type="text"
                          value={chatSettings.customization.widgetTitle}
                          onChange={(e) => setChatSettings(prev => ({
                            ...prev,
                            customization: { ...prev.customization, widgetTitle: e.target.value }
                          }))}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Widget Subtitle
                        </label>
                        <input
                          type="text"
                          value={chatSettings.customization.widgetSubtitle}
                          onChange={(e) => setChatSettings(prev => ({
                            ...prev,
                            customization: { ...prev.customization, widgetSubtitle: e.target.value }
                          }))}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Button Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={chatSettings.customization.buttonColor}
                            onChange={(e) => setChatSettings(prev => ({
                              ...prev,
                              customization: { ...prev.customization, buttonColor: e.target.value }
                            }))}
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={chatSettings.customization.buttonColor}
                            onChange={(e) => setChatSettings(prev => ({
                              ...prev,
                              customization: { ...prev.customization, buttonColor: e.target.value }
                            }))}
                            className="input-field flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Position
                        </label>
                        <select
                          value={chatSettings.position}
                          onChange={(e) => setChatSettings(prev => ({ ...prev, position: e.target.value }))}
                          className="input-field w-full"
                        >
                          <option value="bottom-right">Bottom Right</option>
                          <option value="bottom-left">Bottom Left</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="card space-y-4">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Chat Messages</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Greeting Message
                        </label>
                        <textarea
                          value={chatSettings.greetingMessage}
                          onChange={(e) => setChatSettings(prev => ({ ...prev, greetingMessage: e.target.value }))}
                          rows={2}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Offline Message
                        </label>
                        <textarea
                          value={chatSettings.offlineMessage}
                          onChange={(e) => setChatSettings(prev => ({ ...prev, offlineMessage: e.target.value }))}
                          rows={2}
                          className="input-field w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Auto Assign */}
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Auto-Assign Chats</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Automatically assign incoming chats to available agents</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setChatSettings(prev => ({ ...prev, autoAssign: !prev.autoAssign }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          chatSettings.autoAssign ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            chatSettings.autoAssign ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await axios.put('/api/admin/chat-settings', chatSettings);
                      setMessage({ type: 'success', text: 'Chat settings saved successfully!' });
                    } catch (err) {
                      setMessage({ type: 'error', text: 'Failed to save chat settings' });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  Save Chat Settings
                </button>
              </div>
            </motion.div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Admin Password</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="input-field w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="input-field w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="input-field w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                  Change Password
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
