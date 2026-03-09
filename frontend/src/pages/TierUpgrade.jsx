import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Award,
  CheckCircle,
  TrendingUp,
  Users,
  Shield,
  Clock,
  ArrowRight,
  Lock,
  Unlock,
  Wallet,
  UserCheck,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Copy,
  Share2,
  Gift,
  Check
} from 'lucide-react';

const TierUpgrade = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [tierSettings, setTierSettings] = useState(null);
  const [referralData, setReferralData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [userProgress, setUserProgress] = useState({
    kycCompleted: false,
    tradingVolume: 0,
    accountAge: 0,
    referrals: 0
  });

  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze',
      color: 'gray',
      icon: Users,
      description: 'Basic account for new users',
      benefits: [
        'Withdraw up to $10,000 per transaction',
        '$50,000 daily withdrawal limit',
        'Basic customer support',
        'Standard trading fees'
      ],
      requirements: [
        { label: 'Account Registration', completed: true },
        { label: 'Email Verification', completed: true }
      ]
    },
    {
      id: 'silver',
      name: 'Silver',
      color: 'blue',
      icon: Shield,
      description: 'For users who completed KYC',
      benefits: [
        'Withdraw up to $50,000 per transaction',
        '$200,000 daily withdrawal limit',
        'Priority customer support',
        'Reduced trading fees',
        'Access to exclusive features'
      ],
      requirements: [
        { label: 'Complete KYC Verification', key: 'kycCompleted' },
        { label: 'Account Age: 30+ days', key: 'accountAge', threshold: 30 }
      ]
    },
    {
      id: 'gold',
      name: 'Gold',
      color: 'purple',
      icon: TrendingUp,
      description: 'For active traders',
      benefits: [
        'Withdraw up to $250,000 per transaction',
        '$1,000,000 daily withdrawal limit',
        '24/7 Priority support',
        'Lowest trading fees',
        'Early access to new features',
        'Dedicated account manager'
      ],
      requirements: [
        { label: 'KYC Verified', key: 'kycCompleted' },
        { label: 'Trading Volume: $100,000+', key: 'tradingVolume', threshold: 100000 },
        { label: 'Account Age: 90+ days', key: 'accountAge', threshold: 90 },
        { label: '3+ Successful Referrals', key: 'referrals', threshold: 3 }
      ]
    },
    {
      id: 'vip',
      name: 'VIP',
      color: 'amber',
      icon: Award,
      description: 'Exclusive tier for high-volume traders',
      benefits: [
        'Withdraw up to $1,000,000 per transaction',
        '$5,000,000 daily withdrawal limit',
        'White-glove concierge service',
        'Zero trading fees',
        'Custom features & API access',
        'Personal relationship manager',
        'Exclusive events & rewards'
      ],
      requirements: [
        { label: 'Gold Tier for 6+ months', key: 'premiumDuration', threshold: 180 },
        { label: 'Trading Volume: $1,000,000+', key: 'tradingVolume', threshold: 1000000 },
        { label: 'Account Age: 1+ year', key: 'accountAge', threshold: 365 },
        { label: '10+ Successful Referrals', key: 'referrals', threshold: 10 }
      ]
    }
  ];

  useEffect(() => {
    fetchTierData();
    fetchReferralData();
  }, []);

  const fetchTierData = async () => {
    try {
      setLoading(true);
      const [settingsRes, progressRes] = await Promise.all([
        axios.get('/api/admin/settings'),
        axios.get('/api/user/tier-progress')
      ]);
      
      setTierSettings(settingsRes.data.settings?.tierLimits);
      setUserProgress(progressRes.data.progress || {
        kycCompleted: user?.kycStatus === 'verified',
        tradingVolume: 0,
        accountAge: user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0,
        referrals: 0
      });
    } catch (error) {
      console.error('Error fetching tier data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Separate function to fetch referral data
  const fetchReferralData = async () => {
    try {
      const response = await axios.get('/api/user/referral');
      if (response.data.success && response.data.referral) {
        setReferralData(response.data.referral);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      // Set fallback data if API fails
      setReferralData({
        code: null,
        link: null,
        totalReferrals: 0,
        referralEarnings: 0,
        referredUsers: []
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurrentTierIndex = () => {
    return tiers.findIndex(t => t.id === (user?.tier || 'bronze'));
  };

  const isRequirementMet = (req) => {
    if (req.completed !== undefined) return req.completed;
    if (!req.key) return false;
    
    const value = userProgress[req.key] || 0;
    return value >= (req.threshold || 0);
  };

  const getNextTier = () => {
    const currentIndex = getCurrentTierIndex();
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  const canUpgradeToTier = (tier) => {
    return tier.requirements.every(req => isRequirementMet(req));
  };

  const currentTier = tiers[getCurrentTierIndex()] || tiers[0];
  const nextTier = getNextTier();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Account Tier & Benefits
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upgrade your account tier to unlock higher withdrawal limits and exclusive benefits
        </p>
      </div>

      {/* Current Tier Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${
          currentTier.color === 'gray' ? 'from-gray-500 to-gray-600' :
          currentTier.color === 'blue' ? 'from-blue-500 to-blue-600' :
          currentTier.color === 'purple' ? 'from-purple-500 to-purple-600' :
          'from-amber-500 to-amber-600'
        } rounded-2xl p-6 mb-8 text-white`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <currentTier.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Current Tier</p>
              <h2 className="text-2xl font-bold">{currentTier.name}</h2>
              <p className="text-white/80 text-sm mt-1">{currentTier.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">Daily Limit</p>
            <p className="text-2xl font-bold">
              ${tierSettings?.[currentTier.id]?.dailyLimit?.toLocaleString() || '50,000'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Next Tier Progress */}
      {nextTier && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                nextTier.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                nextTier.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
              }`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Upgrade to {nextTier.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Complete the requirements below to unlock higher limits
                </p>
              </div>
            </div>
            <Link
              to={nextTier.id === 'verified' ? '/kyc' : '#'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                canUpgradeToTier(nextTier)
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canUpgradeToTier(nextTier) ? 'Upgrade Now' : 'In Progress'}
            </Link>
          </div>

          {/* Requirements Progress */}
          <div className="space-y-3">
            {nextTier.requirements.map((req, index) => {
              const met = isRequirementMet(req);
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    met 
                      ? 'bg-green-100 dark:bg-green-900 text-green-600' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}>
                    {met ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-3 h-3" />}
                  </div>
                  <span className={`flex-1 text-sm ${
                    met ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {req.label}
                  </span>
                  {req.threshold && (
                    <span className="text-xs text-gray-500">
                      {userProgress[req.key]?.toLocaleString() || 0} / {req.threshold.toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* All Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier, index) => {
          const isCurrent = tier.id === currentTier.id;
          const isLocked = index > getCurrentTierIndex() + 1;
          const Icon = tier.icon;
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 ${
                isCurrent 
                  ? tier.color === 'gray' ? 'border-gray-500' :
                    tier.color === 'blue' ? 'border-blue-500' :
                    tier.color === 'purple' ? 'border-purple-500' :
                    'border-amber-500'
                  : isLocked 
                    ? 'border-gray-200 dark:border-gray-700 opacity-60'
                    : 'border-gray-200 dark:border-gray-700'
              } p-6`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                    tier.color === 'gray' ? 'bg-gray-500' :
                    tier.color === 'blue' ? 'bg-blue-500' :
                    tier.color === 'purple' ? 'bg-purple-500' :
                    'bg-amber-500'
                  }`}>
                    Current
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                  tier.color === 'gray' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600' :
                  tier.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                  tier.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                  'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                }`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{tier.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tier.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Per Transaction</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${tierSettings?.[tier.id]?.max?.toLocaleString() || 
                      (tier.id === 'standard' ? '10,000' :
                       tier.id === 'verified' ? '50,000' :
                       tier.id === 'premium' ? '250,000' : '1,000,000')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Daily Limit</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${tierSettings?.[tier.id]?.dailyLimit?.toLocaleString() ||
                      (tier.id === 'standard' ? '50,000' :
                       tier.id === 'verified' ? '200,000' :
                       tier.id === 'premium' ? '1,000,000' : '5,000,000')}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Benefits:</p>
                <ul className="space-y-1">
                  {tier.benefits.slice(0, 3).map((benefit, i) => (
                    <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
                      <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {isLocked && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions to Upgrade</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/kyc"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Complete KYC</p>
              <p className="text-xs text-gray-500">Verify your identity</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            to="/trade"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Start Trading</p>
              <p className="text-xs text-gray-500">Increase your volume</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <button
            onClick={() => document.getElementById('referral-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Refer Friends</p>
              <p className="text-xs text-gray-500">Invite & earn rewards</p>
            </div>
            <span className="text-xs text-green-600 font-medium">{referralData?.totalReferrals || 0} joined</span>
          </button>
        </div>
      </motion.div>

      {/* Referral Section */}
      <motion.div
        id="referral-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Refer Friends & Earn Rewards</h3>
              <p className="text-white/80 text-sm">Share your referral link and get rewards when friends join and trade</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{referralData?.totalReferrals || 0}</p>
              <p className="text-xs text-white/80">Referrals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">${referralData?.referralEarnings?.toFixed(2) || '0.00'}</p>
              <p className="text-xs text-white/80">Earnings</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white/10 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs text-white/80 mb-1 block">Your Referral Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralData?.link || 'Generating your referral link...'}
                  className="flex-1 bg-white/20 border-0 rounded-lg px-4 py-2.5 text-white placeholder-white/50 text-sm focus:ring-2 focus:ring-white/30"
                />
                <button
                  onClick={() => copyToClipboard(referralData?.link)}
                  className="px-4 py-2.5 bg-white text-green-600 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="flex items-end">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Join me on this platform',
                        text: 'Use my referral link to sign up and get started!',
                        url: referralData?.link
                      });
                    } else {
                      copyToClipboard(referralData?.link);
                    }
                  }}
                  className="px-4 py-2.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-xs text-white/70">
              Your referral code: <span className="font-mono font-bold">{referralData?.code || 'Generating...'}</span>
            </p>
          </div>
        </div>

        {/* Referred Users List */}
        {referralData?.referredUsers?.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Your Referrals</h4>
            <div className="bg-white/10 rounded-lg divide-y divide-white/10">
              {referralData.referredUsers.slice(0, 5).map((referredUser, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{referredUser.username}</p>
                      <p className="text-xs text-white/70">
                        {new Date(referredUser.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    referredUser.tier === 'bronze' ? 'bg-orange-500/30' :
                    referredUser.tier === 'silver' ? 'bg-gray-400/30' :
                    referredUser.tier === 'gold' ? 'bg-yellow-500/30' :
                    'bg-purple-500/30'
                  }`}>
                    {referredUser.tier?.charAt(0).toUpperCase() + referredUser.tier?.slice(1)}
                  </span>
                </div>
              ))}
              {referralData.referredUsers.length > 5 && (
                <div className="px-4 py-2 text-center text-xs text-white/70">
                  +{referralData.referredUsers.length - 5} more referrals
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TierUpgrade;
