import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import { protect, adminOnly } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import AdminSettings from '../models/AdminSettings.js';
import SiteConfig from '../models/SiteConfig.js';
import DepositConfirmation from '../models/DepositConfirmation.js';
import { upload, uploadBranding } from '../config/upload.js';
import { sendKycApprovedEmail, sendKycRejectedEmail, sendPasswordResetEmail, sendVerificationEmail } from '../config/email.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status;
    
    let query = { isAdmin: false };
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.isActive = status === 'active';
    }
    
    const users = await User.find(query)
      .select('-password -twoFactorSecret')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/user/:id
// @desc    Get user details
// @access  Admin
router.get('/user/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -twoFactorSecret');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's transactions
    const transactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Ensure balance is always returned as an object
    const userObj = user.toObject();
    if (typeof userObj.balance !== 'object' || userObj.balance === null) {
      userObj.balance = { 
        USDT: userObj.balance || 0, 
        BTC: 0, 
        ETH: 0, 
        BNB: 0 
      };
    }
    
    res.json({
      success: true,
      user: {
        ...userObj,
        transactions
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/user/:id
// @desc    Update user
// @access  Admin
router.put(
  '/user/:id',
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { 
        balance, 
        tier, 
        kycStatus, 
        isActive, 
        withdrawalPercentage,
        walletAddress,
        depositAddresses
      } = req.body;
          
      const user = await User.findById(req.params.id);
          
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
          
      if (balance !== undefined) user.balance = balance;
      if (tier) user.tier = tier;
      if (kycStatus) user.kycStatus = kycStatus;
      if (isActive !== undefined) user.isActive = isActive;
      if (withdrawalPercentage !== undefined) user.withdrawalPercentage = withdrawalPercentage;
      if (walletAddress) user.walletAddress = walletAddress;
      if (depositAddresses) user.depositAddresses = depositAddresses;
          
      await user.save();
      
      res.json({
        success: true,
        message: 'User updated successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          tier: user.tier,
          kycStatus: user.kycStatus,
          isActive: user.isActive,
          withdrawalPercentage: user.withdrawalPercentage,
          walletAddress: user.walletAddress,
          depositAddresses: user.depositAddresses
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/admin/user/:id/freeze
// @desc    Freeze/unfreeze user account
// @access  Admin
router.post('/user/:id/freeze', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      success: true,
      message: `User account ${user.isActive ? 'unfrozen' : 'frozen'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Freeze user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/transactions
// @desc    Get all transactions
// @access  Admin
router.get('/transactions', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const status = req.query.status;
    
    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    
    const transactions = await Transaction.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/user/:userId/transactions
// @desc    Get transactions for a specific user
// @access  Admin
router.get('/user/:userId/transactions', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Transaction.countDocuments({ userId });
    
    res.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/transaction/:id
// @desc    Update transaction (approve/reject withdrawal)
// @access  Admin
router.put(
  '/transaction/:id',
  protect,
  adminOnly,
  [
    body('status').isIn(['approved', 'rejected', 'completed']),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { status, adminNotes, rejectedReason } = req.body;
      
      const transaction = await Transaction.findById(req.params.id);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      transaction.status = status;
      transaction.adminNotes = adminNotes;
      
      if (status === 'approved' || status === 'completed') {
        transaction.approvedBy = req.user._id;
        transaction.approvedAt = new Date();
        transaction.completedAt = new Date();
      }
      
      if (status === 'rejected') {
        transaction.rejectedReason = rejectedReason;
        
        // Refund user if withdrawal was rejected
        if (transaction.type === 'withdrawal') {
          const user = await User.findById(transaction.userId);
          if (user) {
            // Ensure balance object exists (for old users with Number type balance)
            if (typeof user.balance !== 'object' || user.balance === null) {
              user.balance = { USDT: 0, BTC: 0, ETH: 0, BNB: 0 };
            }
            
            // Refund the crypto amount
            if (transaction.cryptoCurrency === 'USDT') {
              user.balance.USDT = (user.balance.USDT || 0) + transaction.amount;
            } else {
              user.balance[transaction.cryptoCurrency] = (user.balance[transaction.cryptoCurrency] || 0) + transaction.amount;
            }
            
            // Reduce total withdrawn
            user.totalWithdrawn = (user.totalWithdrawn || 0) - transaction.amount;
            await user.save();
          }
        }
      }
      
      await transaction.save();
      
      res.json({
        success: true,
        message: `Transaction ${status} successfully`,
        transaction: {
          id: transaction._id,
          status: transaction.status,
          approvedBy: transaction.approvedBy,
          approvedAt: transaction.approvedAt
        }
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/admin/settings
// @desc    Get admin settings
// @access  Admin
router.get('/settings', protect, adminOnly, async (req, res) => {
  try {
    const settings = await AdminSettings.getCurrentSettings();
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update admin settings
// @access  Admin
router.put('/settings', protect, adminOnly, async (req, res) => {
  try {
    const {
      withdrawalPercentage,
      globalWithdrawalPercentage,
      minWithdrawal,
      maxWithdrawal,
      withdrawalCooldown,
      requireAdminApproval,
      gasMultiplier,
      gasSubsidy,
      gasPriceSource,
      fixedGasPrice,
      gasLimit,
      withdrawalGasFee,
      networks,
      maintenanceMode,
      maintenanceMessage
    } = req.body;
    
    let settings = await AdminSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      settings = new AdminSettings();
    }
    
    if (withdrawalPercentage !== undefined) settings.withdrawalPercentage = withdrawalPercentage;
    if (globalWithdrawalPercentage !== undefined) settings.globalWithdrawalPercentage = globalWithdrawalPercentage;
    if (minWithdrawal !== undefined) settings.minWithdrawal = minWithdrawal;
    if (maxWithdrawal !== undefined) settings.maxWithdrawal = maxWithdrawal;
    if (withdrawalCooldown !== undefined) settings.withdrawalCooldown = withdrawalCooldown;
    if (requireAdminApproval !== undefined) settings.requireAdminApproval = requireAdminApproval;
    if (gasMultiplier !== undefined) settings.gasMultiplier = gasMultiplier;
    if (gasSubsidy !== undefined) settings.gasSubsidy = gasSubsidy;
    if (gasPriceSource) settings.gasPriceSource = gasPriceSource;
    if (fixedGasPrice !== undefined) settings.fixedGasPrice = fixedGasPrice;
    if (gasLimit !== undefined) settings.gasLimit = gasLimit;
    if (withdrawalGasFee) settings.withdrawalGasFee = withdrawalGasFee;
    if (tierLimits) settings.tierLimits = tierLimits;
    if (networks) settings.networks = networks;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (maintenanceMessage) settings.maintenanceMessage = maintenanceMessage;
    
    settings.updatedBy = req.user._id;
    await settings.save();
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/chat-settings
// @desc    Get chat widget settings
// @access  Admin
router.get('/chat-settings', protect, adminOnly, async (req, res) => {
  try {
    const settings = await AdminSettings.getCurrentSettings();
    res.json({
      success: true,
      settings: settings.chatSettings || {
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
      }
    });
  } catch (error) {
    console.error('Get chat settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/chat-settings
// @desc    Update chat widget settings
// @access  Admin
router.put('/chat-settings', protect, adminOnly, async (req, res) => {
  try {
    const chatSettings = req.body;
    
    let settings = await AdminSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      settings = new AdminSettings();
    }
    
    settings.chatSettings = chatSettings;
    settings.updatedBy = req.user._id;
    await settings.save();
    
    res.json({
      success: true,
      message: 'Chat settings updated successfully',
      settings: chatSettings
    });
  } catch (error) {
    console.error('Update chat settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/wallet/update
// @desc    Update system wallet addresses
// @access  Admin
router.put('/wallet/update', protect, adminOnly, async (req, res) => {
  try {
    const { hotWallet, coldStorage, networkUpdates } = req.body;
    
    const settings = await AdminSettings.getCurrentSettings();
    
    if (hotWallet) {
      settings.systemWallets.hotWallet.address = hotWallet;
    }
    
    if (coldStorage) {
      settings.systemWallets.coldStorage.address = coldStorage;
    }
    
    if (networkUpdates && Array.isArray(networkUpdates)) {
      networkUpdates.forEach(update => {
        const network = settings.networks.find(n => n.name === update.name);
        if (network) {
          if (update.depositAddress) network.depositAddress = update.depositAddress;
          if (update.gasPrice) network.gasPrice = update.gasPrice;
          if (update.enabled !== undefined) network.enabled = update.enabled;
        }
      });
    }
    
    settings.updatedBy = req.user._id;
    await settings.save();
    
    res.json({
      success: true,
      message: 'Wallet addresses updated successfully',
      wallets: settings.systemWallets,
      networks: settings.networks
    });
  } catch (error) {
    console.error('Update wallet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Admin
router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    // Calculate date range
    const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    // Get current period statistics
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const activeUsers = await User.countDocuments({ 
      isAdmin: false,
      lastLogin: { $gte: startDate }
    });
    const newUsers = await User.countDocuments({ 
      isAdmin: false,
      createdAt: { $gte: startDate }
    });
    
    // Get previous period for comparison
    const prevNewUsers = await User.countDocuments({
      isAdmin: false,
      createdAt: { $gte: prevStartDate, $lt: startDate }
    });
    
    const totalTransactions = await Transaction.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    const prevTransactions = await Transaction.countDocuments({
      createdAt: { $gte: prevStartDate, $lt: startDate }
    });
    
    // Deposits
    const deposits = await Transaction.find({
      type: 'deposit',
      status: 'completed',
      createdAt: { $gte: startDate }
    });
    const totalDeposits = deposits.reduce((sum, tx) => sum + tx.amount, 0);
    
    const prevDeposits = await Transaction.find({
      type: 'deposit',
      status: 'completed',
      createdAt: { $gte: prevStartDate, $lt: startDate }
    });
    const prevTotalDeposits = prevDeposits.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Withdrawals
    const withdrawals = await Transaction.find({
      type: 'withdrawal',
      status: { $in: ['completed', 'approved'] },
      createdAt: { $gte: startDate }
    });
    const totalWithdrawals = withdrawals.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Trading volume (all completed transactions)
    const allTransactions = await Transaction.find({
      status: { $in: ['completed', 'approved'] },
      createdAt: { $gte: startDate }
    });
    const tradingVolume = allTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    const prevAllTransactions = await Transaction.find({
      status: { $in: ['completed', 'approved'] },
      createdAt: { $gte: prevStartDate, $lt: startDate }
    });
    const prevTradingVolume = prevAllTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Average transaction
    const avgTransaction = totalTransactions > 0 ? tradingVolume / totalTransactions : 0;
    const prevAvgTransaction = prevTransactions > 0 ? prevTradingVolume / prevTransactions : 0;
    
    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '+0%';
      const change = ((current - previous) / previous) * 100;
      return (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
    };
    
    // Generate daily stats with real data
    const dailyStats = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStart = new Date(date.setHours(0, 0, 0, 0));
      const dateEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayDeposits = await Transaction.find({
        type: 'deposit',
        status: 'completed',
        createdAt: { $gte: dateStart, $lte: dateEnd }
      });
      
      const dayWithdrawals = await Transaction.find({
        type: 'withdrawal',
        status: { $in: ['completed', 'approved'] },
        createdAt: { $gte: dateStart, $lte: dateEnd }
      });
      
      const dayUsers = await User.countDocuments({
        isAdmin: false,
        createdAt: { $gte: dateStart, $lte: dateEnd }
      });
      
      dailyStats.push({
        date: dateStart.toISOString().split('T')[0],
        deposits: dayDeposits.reduce((sum, tx) => sum + tx.amount, 0),
        withdrawals: dayWithdrawals.reduce((sum, tx) => sum + tx.amount, 0),
        users: dayUsers,
        volume: dayDeposits.reduce((sum, tx) => sum + tx.amount, 0) + dayWithdrawals.reduce((sum, tx) => sum + tx.amount, 0)
      });
    }
    
    // Calculate revenue (gas fees from withdrawals)
    const totalGasFees = withdrawals.reduce((sum, tx) => sum + (tx.gasFee || 0), 0);
    const prevGasFees = prevAllTransactions.reduce((sum, tx) => sum + (tx.gasFee || 0), 0);
    
    res.json({
      success: true,
      analytics: {
        // Main stats for dashboard cards
        totalRevenue: totalGasFees,
        revenueChange: calculateChange(totalGasFees, prevGasFees),
        activeUsers,
        userChange: calculateChange(newUsers, prevNewUsers),
        tradingVolume,
        volumeChange: calculateChange(tradingVolume, prevTradingVolume),
        avgTransaction,
        avgChange: calculateChange(avgTransaction, prevAvgTransaction),
        
        // Overview section
        overview: {
          totalUsers,
          newUsers,
          totalTransactions,
          totalDeposits: totalDeposits.toFixed(2),
          totalWithdrawals: totalWithdrawals.toFixed(2),
          totalGasFees: totalGasFees.toFixed(4),
          netFlow: (totalDeposits - totalWithdrawals).toFixed(2)
        },
        dailyStats,
        timeframe
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/pending-withdrawals
// @desc    Get pending withdrawals queue
// @access  Admin
router.get('/pending-withdrawals', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const withdrawals = await Transaction.find({
      type: 'withdrawal',
      status: 'pending'
    })
      .populate('userId', 'username email')
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Transaction.countDocuments({
      type: 'withdrawal',
      status: 'pending'
    });
    
    res.json({
      success: true,
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get pending withdrawals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/dashboard-stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/dashboard-stats', protect, adminOnly, async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const activeUsers = await User.countDocuments({ isAdmin: false, isActive: true });
    const pendingKYC = await User.countDocuments({ isAdmin: false, kycStatus: 'pending' });
    
    // Get transaction stats
    const pendingWithdrawals = await Transaction.countDocuments({
      type: 'withdrawal',
      status: 'pending'
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysDeposits = await Transaction.find({
      type: 'deposit',
      status: 'completed',
      createdAt: { $gte: today }
    });
    
    const todaysWithdrawals = await Transaction.find({
      type: 'withdrawal',
      status: { $in: ['completed', 'approved'] },
      createdAt: { $gte: today }
    });
    
    const totalBalance = await User.aggregate([
      { $match: { isAdmin: false } },
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    
    // Get recent activity
    const recentTransactions = await Transaction.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get recent users
    const recentUsers = await User.find({ isAdmin: false })
      .select('-password -twoFactorSecret')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        pendingKYC,
        pendingWithdrawals,
        totalBalance: totalBalance[0]?.total || 0,
        todayDeposits: todaysDeposits.reduce((sum, tx) => sum + tx.amount, 0),
        todayWithdrawals: todaysWithdrawals.reduce((sum, tx) => sum + tx.amount, 0),
        todayTransactions: todaysDeposits.length + todaysWithdrawals.length
      },
      recentActivity: recentTransactions,
      recentUsers
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/kyc/pending
// @desc    Get all pending KYC submissions
// @access  Admin
router.get('/kyc/pending', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ kycStatus: 'pending' })
      .select('-password -twoFactorSecret')
      .sort({ 'kycData.submittedAt': -1 });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get pending KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/kyc/all
// @desc    Get all KYC submissions with filters
// @access  Admin
router.get('/kyc/all', protect, adminOnly, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    
    let query = { kycStatus: { $ne: 'not_submitted' } };
    if (status !== 'all') {
      query.kycStatus = status;
    }
    
    const users = await User.find(query)
      .select('-password -twoFactorSecret')
      .sort({ 'kycData.submittedAt': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      users
    });
  } catch (error) {
    console.error('Get all KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/kyc/:userId
// @desc    Get KYC details for a specific user
// @access  Admin
router.get('/kyc/:userId', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -twoFactorSecret');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get KYC details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/kyc/:userId/approve
// @desc    Approve KYC for a user
// @access  Admin
router.put('/kyc/:userId/approve', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.kycStatus = 'verified';
    user.kycData.reviewedAt = new Date();
    user.kycData.reviewedBy = req.user._id;
    user.kycData.rejectionReason = null;
    await user.save();
    
    // Log KYC approval activity
    await ActivityLog.create({
      userId: user._id,
      type: 'kyc_approved',
      title: 'KYC Approved',
      description: 'KYC verification has been approved',
      metadata: {
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      severity: 'info'
    });
    
    // Send KYC approval email
    try {
      await sendKycApprovedEmail(user.email, user.username);
    } catch (emailError) {
      console.error('Failed to send KYC approval email:', emailError);
    }
    
    res.json({
      success: true,
      message: 'KYC approved successfully',
      user: {
        id: user._id,
        username: user.username,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    console.error('Approve KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/kyc/:userId/reject
// @desc    Reject KYC for a user
// @access  Admin
router.put('/kyc/:userId/reject', protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.kycStatus = 'rejected';
    user.kycData.reviewedAt = new Date();
    user.kycData.reviewedBy = req.user._id;
    user.kycData.rejectionReason = reason || 'KYC verification failed';
    await user.save();
    
    // Log KYC rejection activity
    await ActivityLog.create({
      userId: user._id,
      type: 'kyc_rejected',
      title: 'KYC Rejected',
      description: `KYC verification rejected: ${reason || 'KYC verification failed'}`,
      metadata: {
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        rejectionReason: reason
      },
      severity: 'warning'
    });
    
    // Send KYC rejection email
    try {
      await sendKycRejectedEmail(user.email, user.username, reason);
    } catch (emailError) {
      console.error('Failed to send KYC rejection email:', emailError);
    }
    
    res.json({
      success: true,
      message: 'KYC rejected',
      user: {
        id: user._id,
        username: user.username,
        kycStatus: user.kycStatus,
        rejectionReason: user.kycData.rejectionReason
      }
    });
  } catch (error) {
    console.error('Reject KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/site-config
// @desc    Get site configuration
// @access  Public (for frontend display) - Admin only for editing
router.get('/site-config', async (req, res) => {
  try {
    const config = await SiteConfig.getConfig();
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Get site config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/site-config
// @desc    Update site configuration
// @access  Admin
router.put('/site-config', protect, adminOnly, async (req, res) => {
  try {
    const {
      siteName,
      siteDescription,
      header,
      footer,
      contact,
      platform,
      branding,
      meta
    } = req.body;

    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig();
    }

    // Update fields
    if (siteName !== undefined) config.siteName = siteName;
    if (siteDescription !== undefined) config.siteDescription = siteDescription;
    if (header !== undefined) config.header = { ...config.header, ...header };
    if (footer !== undefined) config.footer = { ...config.footer, ...footer };
    if (contact !== undefined) config.contact = { ...config.contact, ...contact };
    if (platform !== undefined) config.platform = { ...config.platform, ...platform };
    if (branding !== undefined) config.branding = { ...config.branding, ...branding };
    if (meta !== undefined) config.meta = { ...config.meta, ...meta };
    
    config.updatedBy = req.user._id;
    config.updatedAt = new Date();

    await config.save();

    res.json({
      success: true,
      message: 'Site configuration updated successfully',
      config
    });
  } catch (error) {
    console.error('Update site config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/site-config/upload-logo
// @desc    Upload site logo
// @access  Admin
router.post('/site-config/upload-logo', protect, adminOnly, uploadBranding.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const logoUrl = `/uploads/${req.file.filename}`;
    
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig();
    }
    config.logo = logoUrl;
    config.updatedBy = req.user._id;
    await config.save();

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logoUrl
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/site-config/upload-favicon
// @desc    Upload site favicon
// @access  Admin
router.post('/site-config/upload-favicon', protect, adminOnly, uploadBranding.single('favicon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const faviconUrl = `/uploads/${req.file.filename}`;
    
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig();
    }
    config.favicon = faviconUrl;
    config.updatedBy = req.user._id;
    await config.save();

    res.json({
      success: true,
      message: 'Favicon uploaded successfully',
      faviconUrl
    });
  } catch (error) {
    console.error('Upload favicon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/site-config/upload-footer-logo
// @desc    Upload footer logo
// @access  Admin
router.post('/site-config/upload-footer-logo', protect, adminOnly, uploadBranding.single('footerLogo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const footerLogoUrl = `/uploads/${req.file.filename}`;
    
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig();
    }
    config.footerLogo = footerLogoUrl;
    config.updatedBy = req.user._id;
    await config.save();

    res.json({
      success: true,
      message: 'Footer logo uploaded successfully',
      footerLogoUrl
    });
  } catch (error) {
    console.error('Upload footer logo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/site-config/upload-loading-icon
// @desc    Upload site loading icon
// @access  Admin
router.post('/site-config/upload-loading-icon', protect, adminOnly, uploadBranding.single('loadingIcon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const loadingIconUrl = `/uploads/${req.file.filename}`;
    
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig();
    }
    config.loadingIcon = loadingIconUrl;
    config.updatedBy = req.user._id;
    await config.save();

    res.json({
      success: true,
      message: 'Loading icon uploaded successfully',
      loadingIconUrl
    });
  } catch (error) {
    console.error('Upload loading icon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/site-config/upload-email-logo
// @desc    Upload email logo
// @access  Admin
router.post('/site-config/upload-email-logo', protect, adminOnly, uploadBranding.single('emailLogo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const emailLogoUrl = `/uploads/${req.file.filename}`;
    
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig();
    }
    
    // Initialize emailBranding if it doesn't exist
    if (!config.emailBranding) {
      config.emailBranding = {};
    }
    config.emailBranding.logo = emailLogoUrl;
    config.updatedBy = req.user._id;
    await config.save();

    res.json({
      success: true,
      message: 'Email logo uploaded successfully',
      emailLogoUrl
    });
  } catch (error) {
    console.error('Upload email logo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/change-password
// @desc    Change admin password
// @access  Admin
router.put('/change-password', protect, adminOnly, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/user/:userId/email
// @desc    Update user email
// @access  Admin
router.put('/user/:userId/email', protect, adminOnly, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.params.userId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already in use' });
    }

    const oldEmail = user.email;
    user.email = email;
    // Reset email verification status when email is changed
    user.isEmailVerified = false;
    await user.save();

    res.json({
      success: true,
      message: 'User email updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Update user email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/user/:userId/resend-verification
// @desc    Resend email verification
// @access  Admin
router.post('/user/:userId/resend-verification', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'User email is already verified' });
    }

    // Generate verification token
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL || 'https://bitsolidus.io'}/verify-email?token=${verificationToken}`;
    
    let emailSent = false;
    try {
      const result = await sendVerificationEmail(user.email, user.username, verificationLink);
      emailSent = result?.success !== false;
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the request - return the link so admin can share it manually
    }

    res.json({
      success: true,
      message: emailSent 
        ? 'Verification email sent successfully' 
        : 'Email could not be sent (check SMTP config). Use the verification link below.',
      emailSent,
      verificationLink, // Always return link so admin can share manually
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/user/:userId/verify-email
// @desc    Manually verify user email (admin override)
// @access  Admin
router.put('/user/:userId/verify-email', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'User email verified successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/user/:userId/profile
// @desc    Update user profile (username, name, and joined date)
// @access  Admin
router.put('/user/:userId/profile', protect, adminOnly, async (req, res) => {
  try {
    const { username, name, createdAt } = req.body;
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.params.userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }

    // Update name if provided
    if (name !== undefined) {
      user.name = name;
    }

    // Update createdAt (joined date) if provided
    if (createdAt) {
      user.createdAt = new Date(createdAt);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/user/:userId/reset-password
// @desc    Trigger password reset email for user (admin initiated)
// @access  Admin
router.post('/user/:userId/reset-password', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send password reset email
    const { sendPasswordResetEmail } = await import('../config/email.js');
    const resetLink = `${process.env.FRONTEND_URL || 'https://bitsolidus.io'}/reset-password?token=${resetToken}`;
    
    try {
      await sendPasswordResetEmail(user.email, user.username, resetLink);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({ message: 'Failed to send password reset email' });
    }

    res.json({
      success: true,
      message: 'Password reset email sent successfully',
      resetLink // Include for admin to copy if needed
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/user/:userId/unfreeze
// @desc    Unfreeze/Activate user account
// @access  Admin
router.post('/user/:userId/unfreeze', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'User account activated successfully',
      user: {
        id: user._id,
        username: user.username,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Unfreeze user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/user/:userId/tier
// @desc    Update user account tier (upgrade/downgrade)
// @access  Admin
router.post('/user/:userId/tier', protect, adminOnly, async (req, res) => {
  try {
    const { tier, reason } = req.body;
    
    if (!tier || !['standard', 'verified', 'premium', 'vip'].includes(tier)) {
      return res.status(400).json({ message: 'Valid tier is required (standard, verified, premium, vip)' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldTier = user.tier;
    user.tier = tier;
    await user.save();

    // Log the tier change
    await ActivityLog.create({
      user: req.user._id,
      type: 'tier_change',
      description: `Changed ${user.username}'s tier from ${oldTier} to ${tier}`,
      metadata: { 
        targetUser: user._id, 
        oldTier, 
        newTier: tier, 
        reason: reason || 'Admin decision' 
      }
    });

    res.json({
      success: true,
      message: `User tier updated from ${oldTier} to ${tier}`,
      user: {
        id: user._id,
        username: user.username,
        tier: user.tier,
        previousTier: oldTier
      }
    });
  } catch (error) {
    console.error('Update tier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/user/:userId/generate-transactions
// @desc    Generate automatic transaction history for a user
// @access  Admin
router.post('/user/:userId/generate-transactions', protect, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, transactionCount = 10, types = ['deposit', 'withdrawal', 'trade'] } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const transactions = [];
    const cryptos = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL'];
    const statuses = ['completed', 'completed', 'completed', 'pending', 'failed']; // Weighted toward completed
    
    for (let i = 0; i < transactionCount; i++) {
      // Generate random date between start and end
      const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
      const transactionDate = new Date(randomTime);
      
      // Random type from provided types
      const type = types[Math.floor(Math.random() * types.length)];
      const cryptoType = cryptos[Math.floor(Math.random() * cryptos.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Generate amount based on type
      let amount;
      if (type === 'deposit' || type === 'withdrawal') {
        amount = (Math.random() * 10000 + 100).toFixed(2); // $100 - $10,100
      } else {
        amount = (Math.random() * 5 + 0.1).toFixed(4); // 0.1 - 5.1 crypto
      }
      
      const transactionData = {
        userId: user._id,
        type,
        cryptoCurrency: type === 'trade' ? cryptoType : 'USDT',
        amount: parseFloat(amount),
        status,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} ${type === 'trade' ? cryptoType : ''}`,
        createdAt: transactionDate
      };
      
      // Add blockchain details for realism
      if (status === 'completed') {
        transactionData.transactionHash = '0x' + crypto.randomBytes(32).toString('hex');
        transactionData.gasFee = parseFloat((Math.random() * 0.01).toFixed(6));
      }
      
      const transaction = await Transaction.create(transactionData);
      
      transactions.push(transaction);
    }

    // Sort transactions by date
    transactions.sort((a, b) => a.createdAt - b.createdAt);

    res.json({
      success: true,
      message: `${transactions.length} transactions generated successfully`,
      transactions: transactions.map(t => ({
        id: t._id,
        type: t.type,
        crypto: t.cryptoCurrency,
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt,
        txHash: t.transactionHash
      }))
    });
  } catch (error) {
    console.error('Generate transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/user/:userId/deposit
// @desc    Deposit funds to user account (admin override)
// @access  Admin
router.post('/user/:userId/deposit', protect, adminOnly, async (req, res) => {
  try {
    const { amount, crypto: cryptoType = 'USDT', description = 'Admin deposit' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure balance object exists (for old users with Number type balance)
    if (typeof user.balance !== 'object' || user.balance === null) {
      user.balance = { USDT: 0, BTC: 0, ETH: 0, BNB: 0 };
    }
    
    // Update user balance
    if (cryptoType === 'USDT') {
      user.balance.USDT = (user.balance.USDT || 0) + parseFloat(amount);
    } else {
      user.balance[cryptoType] = (user.balance[cryptoType] || 0) + parseFloat(amount);
    }
    
    // Update total deposited (in USDT equivalent)
    user.totalDeposited = (user.totalDeposited || 0) + parseFloat(amount);
    
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'deposit',
      cryptoCurrency: cryptoType,
      amount: parseFloat(amount),
      status: 'completed',
      description,
      transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
      gasFee: 0
    });

    // Create notification for user
    await Notification.create({
      userId: user._id,
      type: 'deposit',
      title: 'Deposit Received',
      message: `You have received a deposit of ${amount} ${cryptoType} into your account.`,
      data: {
        transactionId: transaction._id,
        amount,
        crypto: cryptoType
      }
    });

    res.json({
      success: true,
      message: `Successfully deposited ${amount} ${cryptoType} to ${user.username}`,
      transaction: {
        id: transaction._id,
        type: transaction.type,
        crypto: transaction.cryptoCurrency,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt
      },
      user: {
        id: user._id,
        username: user.username,
        balance: user.balance,
        totalDeposited: user.totalDeposited
      }
    });
  } catch (error) {
    console.error('Admin deposit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/user/:userId/deduct
// @desc    Deduct funds from user account (admin override)
// @access  Admin
router.post('/user/:userId/deduct', protect, adminOnly, async (req, res) => {
  try {
    const { amount, crypto: cryptoType = 'USDT', description = 'Admin deduction', reason } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Reason for deduction is required' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure balance object exists (for old users with Number type balance)
    if (typeof user.balance !== 'object' || user.balance === null) {
      user.balance = { USDT: 0, BTC: 0, ETH: 0, BNB: 0 };
    }

    // Check if user has sufficient balance
    const currentBalance = cryptoType === 'USDT' ? (user.balance.USDT || 0) : (user.balance[cryptoType] || 0);
    if (currentBalance < amount) {
      return res.status(400).json({ 
        message: `Insufficient balance. Available: ${currentBalance} ${cryptoType}, Requested: ${amount} ${cryptoType}` 
      });
    }

    // Deduct from user balance
    if (cryptoType === 'USDT') {
      user.balance.USDT = (user.balance.USDT || 0) - parseFloat(amount);
    } else {
      user.balance[cryptoType] = (user.balance[cryptoType] || 0) - parseFloat(amount);
    }
    
    // Update total withdrawn (in USDT equivalent)
    user.totalWithdrawn = (user.totalWithdrawn || 0) + parseFloat(amount);
    
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'withdrawal',
      cryptoCurrency: cryptoType,
      amount: parseFloat(amount),
      status: 'completed',
      description: `${description} - Reason: ${reason}`,
      transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
      gasFee: 0
    });

    res.json({
      success: true,
      message: `Successfully deducted ${amount} ${cryptoType} from ${user.username}`,
      transaction: {
        id: transaction._id,
        type: transaction.type,
        crypto: transaction.cryptoCurrency,
        amount: transaction.amount,
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.createdAt
      },
      user: {
        id: user._id,
        username: user.username,
        balance: user.balance,
        totalWithdrawn: user.totalWithdrawn
      }
    });
  } catch (error) {
    console.error('Admin deduct error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/withdrawals/pending
// @desc    Get all pending withdrawal requests
// @access  Admin
router.get('/withdrawals/pending', protect, adminOnly, async (req, res) => {
  try {
    const withdrawals = await Transaction.find({ 
      type: 'withdrawal',
      status: 'pending'
    })
    .populate('userId', 'username email name')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: withdrawals.length,
      withdrawals: withdrawals.map(w => ({
        id: w._id,
        user: w.userId,
        crypto: w.cryptoCurrency,
        amount: w.amount,
        status: w.status,
        description: w.description,
        createdAt: w.createdAt,
        toAddress: w.toAddress
      }))
    });
  } catch (error) {
    console.error('Get pending withdrawals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/withdrawals/:transactionId/approve
// @desc    Approve a withdrawal request
// @access  Admin
router.put('/withdrawals/:transactionId/approve', protect, adminOnly, async (req, res) => {
  try {
    const { notes } = req.body;
    
    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction is not pending' });
    }

    transaction.status = 'completed';
    transaction.approvedBy = req.user._id;
    transaction.approvedAt = new Date();
    transaction.adminNotes = notes || 'Approved by BitSolidus Team';
    transaction.transactionHash = '0x' + crypto.randomBytes(32).toString('hex');
    await transaction.save();

    // Get user details for response
    const user = await User.findById(transaction.userId);

    res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      transaction: {
        id: transaction._id,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        crypto: transaction.crypto,
        amount: transaction.amount,
        status: transaction.status,
        txHash: transaction.txHash,
        approvedAt: transaction.approvedAt,
        notes: transaction.notes
      }
    });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/withdrawals/:transactionId/reject
// @desc    Reject a withdrawal request
// @access  Admin
router.put('/withdrawals/:transactionId/reject', protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction is not pending' });
    }

    // Refund the user
    const user = await User.findById(transaction.userId);
    if (user) {
      // Ensure balance object exists (for old users with Number type balance)
      if (typeof user.balance !== 'object' || user.balance === null) {
        user.balance = { USDT: 0, BTC: 0, ETH: 0, BNB: 0 };
      }
      
      // Refund the crypto amount
      if (transaction.cryptoCurrency === 'USDT') {
        user.balance.USDT = (user.balance.USDT || 0) + transaction.amount;
      } else {
        user.balance[transaction.cryptoCurrency] = (user.balance[transaction.cryptoCurrency] || 0) + transaction.amount;
      }
      
      // Reduce total withdrawn
      user.totalWithdrawn = (user.totalWithdrawn || 0) - transaction.amount;
      await user.save();
    }

    transaction.status = 'rejected';
    transaction.rejectedBy = req.user._id;
    transaction.rejectedAt = new Date();
    transaction.rejectedReason = reason;
    await transaction.save();

    res.json({
      success: true,
      message: 'Withdrawal rejected and funds refunded',
      transaction: {
        id: transaction._id,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        crypto: transaction.cryptoCurrency,
        amount: transaction.amount,
        status: transaction.status,
        rejectionReason: transaction.rejectedReason,
        rejectedAt: transaction.rejectedAt
      }
    });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/user/:userId/activity
// @desc    Get user activity log
// @access  Admin
router.get('/user/:userId/activity', protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const type = req.query.type;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const query = { userId };
    if (type) query.type = type;
    
    const activities = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await ActivityLog.countDocuments(query);
    
    res.json({
      success: true,
      activities,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/alerts
// @desc    Get system alerts and notifications
// @access  Admin
router.get('/alerts', protect, adminOnly, async (req, res) => {
  try {
    const { type, status, limit = 50 } = req.query;
    
    const query = {};
    if (type && type !== 'all') query.type = type;
    if (status) query.status = status;
    
    // Get recent activity logs as alerts
    const activityLogs = await ActivityLog.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Get pending withdrawals as transaction alerts
    const pendingWithdrawals = await Transaction.find({
      type: 'withdrawal',
      status: 'pending'
    })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get pending KYC verifications
    const pendingKYC = await User.find({
      kycStatus: 'pending'
    })
      .select('username email kycStatus kycSubmittedAt')
      .sort({ kycSubmittedAt: -1 })
      .limit(10);
    
    // Format activity logs as alerts
    const alerts = activityLogs.map(log => ({
      id: log._id,
      type: log.type === 'security_alert' ? 'security' : 
            ['deposit', 'withdrawal', 'trade'].includes(log.type) ? 'transaction' : 'system',
      severity: log.severity === 'critical' ? 'critical' : 
                log.severity === 'warning' ? 'high' : 'medium',
      title: log.title,
      message: log.description,
      timestamp: log.createdAt,
      status: 'unread',
      source: log.type,
      userId: log.userId?._id,
      username: log.userId?.username,
      metadata: log.metadata
    }));
    
    // Add pending withdrawals as alerts
    pendingWithdrawals.forEach(tx => {
      alerts.push({
        id: `withdrawal_${tx._id}`,
        type: 'transaction',
        severity: tx.amount > 10000 ? 'high' : 'medium',
        title: 'Pending Withdrawal Request',
        message: `${tx.userId?.username || 'Unknown'} requested withdrawal of ${tx.amount} ${tx.cryptoCurrency || 'USDT'}`,
        timestamp: tx.createdAt,
        status: 'unread',
        source: 'Transaction Service',
        userId: tx.userId?._id,
        username: tx.userId?.username,
        transactionId: tx._id
      });
    });
    
    // Add pending KYC as alerts
    pendingKYC.forEach(user => {
      alerts.push({
        id: `kyc_${user._id}`,
        type: 'security',
        severity: 'medium',
        title: 'KYC Verification Pending',
        message: `${user.username} has submitted KYC documents for review`,
        timestamp: user.kycSubmittedAt,
        status: 'unread',
        source: 'KYC Service',
        userId: user._id,
        username: user.username
      });
    });
    
    // Sort by timestamp
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      alerts: alerts.slice(0, parseInt(limit)),
      counts: {
        total: alerts.length,
        unread: alerts.filter(a => a.status === 'unread').length,
        security: alerts.filter(a => a.type === 'security').length,
        transaction: alerts.filter(a => a.type === 'transaction').length,
        system: alerts.filter(a => a.type === 'system').length
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/system-logs
// @desc    Get system logs
// @access  Admin
router.get('/system-logs', protect, adminOnly, async (req, res) => {
  try {
    const { level, service, limit = 100, page = 1 } = req.query;
    
    const query = {};
    if (level && level !== 'all') query.level = level;
    if (service) query.service = service;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get activity logs as system logs
    const logs = await ActivityLog.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await ActivityLog.countDocuments(query);
    
    // Format logs
    const formattedLogs = logs.map(log => ({
      id: log._id,
      level: log.severity === 'critical' ? 'error' : log.severity === 'warning' ? 'warning' : 'info',
      message: log.description,
      timestamp: log.createdAt,
      service: log.type,
      userId: log.userId?._id,
      username: log.userId?.username,
      metadata: log.metadata
    }));
    
    res.json({
      success: true,
      logs: formattedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/alerts/:alertId/read
// @desc    Mark alert as read
// @access  Admin
router.put('/alerts/:alertId/read', protect, adminOnly, async (req, res) => {
  try {
    const { alertId } = req.params;
    
    // Handle different alert types
    if (alertId.startsWith('withdrawal_')) {
      // It's a withdrawal alert - nothing to update in DB
      return res.json({ success: true, message: 'Alert marked as read' });
    }
    
    if (alertId.startsWith('kyc_')) {
      // It's a KYC alert - nothing to update in DB
      return res.json({ success: true, message: 'Alert marked as read' });
    }
    
    // It's an activity log - could update if we had a read status field
    res.json({ success: true, message: 'Alert marked as read' });
  } catch (error) {
    console.error('Mark alert read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/alerts/:alertId
// @desc    Delete an alert
// @access  Admin
router.delete('/alerts/:alertId', protect, adminOnly, async (req, res) => {
  try {
    const { alertId } = req.params;
    
    // Handle different alert types
    if (alertId.startsWith('withdrawal_') || alertId.startsWith('kyc_')) {
      // These are virtual alerts, just return success
      return res.json({ success: true, message: 'Alert deleted' });
    }
    
    // It's an activity log - we could delete it if needed
    await ActivityLog.findByIdAndDelete(alertId);
    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/settings
// @desc    Get admin settings (gas fees, withdrawal settings, etc.)
// @access  Admin
router.get('/settings', protect, adminOnly, async (req, res) => {
  try {
    const settings = await AdminSettings.getCurrentSettings();
    res.json({
      success: true,
      settings: {
        withdrawalPercentage: settings.withdrawalPercentage,
        globalWithdrawalPercentage: settings.globalWithdrawalPercentage,
        minWithdrawal: settings.minWithdrawal,
        maxWithdrawal: settings.maxWithdrawal,
        withdrawalCooldown: settings.withdrawalCooldown,
        requireAdminApproval: settings.requireAdminApproval,
        gasMultiplier: settings.gasMultiplier,
        gasSubsidy: settings.gasSubsidy,
        gasPriceSource: settings.gasPriceSource,
        fixedGasPrice: settings.fixedGasPrice,
        gasLimit: settings.gasLimit,
        withdrawalGasFee: settings.withdrawalGasFee,
        tierLimits: settings.tierLimits,
        networks: settings.networks,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage
      }
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update admin settings
// @access  Admin
router.put('/settings', protect, adminOnly, async (req, res) => {
  try {
    const {
      withdrawalPercentage,
      globalWithdrawalPercentage,
      minWithdrawal,
      maxWithdrawal,
      withdrawalCooldown,
      requireAdminApproval,
      gasMultiplier,
      gasSubsidy,
      gasPriceSource,
      fixedGasPrice,
      gasLimit,
      withdrawalGasFee,
      networks,
      maintenanceMode,
      maintenanceMessage
    } = req.body;

    let settings = await AdminSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      settings = new AdminSettings();
    }

    // Update fields if provided
    if (withdrawalPercentage !== undefined) settings.withdrawalPercentage = withdrawalPercentage;
    if (globalWithdrawalPercentage !== undefined) settings.globalWithdrawalPercentage = globalWithdrawalPercentage;
    if (minWithdrawal !== undefined) settings.minWithdrawal = minWithdrawal;
    if (maxWithdrawal !== undefined) settings.maxWithdrawal = maxWithdrawal;
    if (withdrawalCooldown !== undefined) settings.withdrawalCooldown = withdrawalCooldown;
    if (requireAdminApproval !== undefined) settings.requireAdminApproval = requireAdminApproval;
    if (gasMultiplier !== undefined) settings.gasMultiplier = gasMultiplier;
    if (gasSubsidy !== undefined) settings.gasSubsidy = gasSubsidy;
    if (gasPriceSource !== undefined) settings.gasPriceSource = gasPriceSource;
    if (fixedGasPrice !== undefined) settings.fixedGasPrice = fixedGasPrice;
    if (gasLimit !== undefined) settings.gasLimit = gasLimit;
    if (withdrawalGasFee !== undefined) settings.withdrawalGasFee = withdrawalGasFee;
    if (networks !== undefined) settings.networks = networks;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (maintenanceMessage !== undefined) settings.maintenanceMessage = maintenanceMessage;

    settings.updatedBy = req.user._id;
    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        withdrawalPercentage: settings.withdrawalPercentage,
        globalWithdrawalPercentage: settings.globalWithdrawalPercentage,
        minWithdrawal: settings.minWithdrawal,
        maxWithdrawal: settings.maxWithdrawal,
        withdrawalCooldown: settings.withdrawalCooldown,
        requireAdminApproval: settings.requireAdminApproval,
        gasMultiplier: settings.gasMultiplier,
        gasSubsidy: settings.gasSubsidy,
        gasPriceSource: settings.gasPriceSource,
        fixedGasPrice: settings.fixedGasPrice,
        gasLimit: settings.gasLimit,
        withdrawalGasFee: settings.withdrawalGasFee,
        networks: settings.networks,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage
      }
    });
  } catch (error) {
    console.error('Update admin settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/deposit-confirmations
// @desc    Get all deposit confirmations (admin)
// @access  Admin
router.get('/deposit-confirmations', protect, adminOnly, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    
    const query = status === 'all' ? {} : { status };
    
    const confirmations = await DepositConfirmation.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await DepositConfirmation.countDocuments(query);

    res.json({
      success: true,
      confirmations: confirmations.map(c => ({
        id: c._id,
        user: c.userId ? {
          id: c.userId._id,
          username: c.userId.username,
          email: c.userId.email
        } : null,
        cryptocurrency: c.cryptocurrency,
        network: c.network,
        transactionId: c.transactionId,
        amount: c.amount,
        fromAddress: c.fromAddress,
        toAddress: c.toAddress,
        status: c.status,
        adminNotes: c.adminNotes,
        createdAt: c.createdAt,
        confirmedAt: c.confirmedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get deposit confirmations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/deposit-confirmations/:id
// @desc    Update deposit confirmation status (confirm/reject)
// @access  Admin
router.put('/deposit-confirmations/:id', protect, adminOnly, [
  body('status').isIn(['confirmed', 'rejected']).withMessage('Status must be confirmed or rejected'),
  body('adminNotes').optional().trim(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const confirmation = await DepositConfirmation.findById(req.params.id)
      .populate('userId', 'username email');
    
    if (!confirmation) {
      return res.status(404).json({ message: 'Deposit confirmation not found' });
    }

    if (confirmation.status !== 'pending') {
      return res.status(400).json({ message: 'This deposit has already been processed' });
    }

    // Update confirmation
    confirmation.status = status;
    confirmation.adminNotes = adminNotes || '';
    confirmation.confirmedBy = req.user._id;
    confirmation.confirmedAt = new Date();
    await confirmation.save();

    // Get user details
    const user = await User.findById(confirmation.userId._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Import email function
    const { default: emailService } = await import('../config/email.js');

    // If confirmed, create transaction and update user balance
    if (status === 'confirmed') {
      // Create transaction record
      const transaction = new Transaction({
        userId: confirmation.userId._id,
        type: 'deposit',
        amount: confirmation.amount,
        currency: confirmation.cryptocurrency,
        status: 'completed',
        txHash: confirmation.transactionId,
        fromAddress: confirmation.fromAddress,
        toAddress: confirmation.toAddress,
        description: `Deposit confirmed by BitSolidus Team`
      });
      await transaction.save();

      // Update user balance
      if (!user.balance) user.balance = {};
      user.balance[confirmation.cryptocurrency] = (user.balance[confirmation.cryptocurrency] || 0) + confirmation.amount;
      await user.save();

      // Create user notification
      const userNotification = new Notification({
        userId: confirmation.userId._id,
        type: 'deposit_confirmed',
        title: 'Deposit Confirmed',
        message: `Your deposit of ${confirmation.amount} ${confirmation.cryptocurrency} has been confirmed and credited to your account.`,
        data: {
          transactionId: transaction._id,
          amount: confirmation.amount,
          cryptocurrency: confirmation.cryptocurrency
        }
      });
      await userNotification.save();

      // Send email notification to user
      try {
        await emailService.sendDepositConfirmedEmail(
          user.email,
          user.username,
          {
            amount: confirmation.amount,
            cryptocurrency: confirmation.cryptocurrency,
            transactionId: confirmation.transactionId
          }
        );
        console.log(`Deposit confirmation email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send deposit confirmation email:', emailError);
      }
    } else {
      // Create rejection notification
      const userNotification = new Notification({
        userId: confirmation.userId._id,
        type: 'deposit_rejected',
        title: 'Deposit Rejected',
        message: `Your deposit confirmation was rejected. ${adminNotes ? `Reason: ${adminNotes}` : 'Please contact support for more information.'}`,
        data: {
          confirmationId: confirmation._id,
          amount: confirmation.amount,
          cryptocurrency: confirmation.cryptocurrency
        }
      });
      await userNotification.save();

      // Send rejection email to user
      try {
        await emailService.sendDepositRejectedEmail(
          user.email,
          user.username,
          {
            amount: confirmation.amount,
            cryptocurrency: confirmation.cryptocurrency,
            transactionId: confirmation.transactionId
          },
          adminNotes || ''
        );
        console.log(`Deposit rejection email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send deposit rejection email:', emailError);
      }
    }

    res.json({
      success: true,
      message: `Deposit ${status === 'confirmed' ? 'confirmed' : 'rejected'} successfully`,
      confirmation: {
        id: confirmation._id,
        status: confirmation.status,
        confirmedAt: confirmation.confirmedAt
      }
    });
  } catch (error) {
    console.error('Update deposit confirmation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/deposit-confirmations/stats
// @desc    Get deposit confirmation statistics
// @access  Admin
router.get('/deposit-confirmations/stats', protect, adminOnly, async (req, res) => {
  try {
    const stats = await DepositConfirmation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const result = {
      pending: 0,
      confirmed: 0,
      rejected: 0,
      totalPendingAmount: 0,
      totalConfirmedAmount: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      if (stat._id === 'pending') result.totalPendingAmount = stat.totalAmount;
      if (stat._id === 'confirmed') result.totalConfirmedAmount = stat.totalAmount;
    });

    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error('Get deposit stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== AGENT MANAGEMENT ====================

// @route   GET /api/admin/agents
// @desc    Get all support agents
// @access  Admin
router.get('/agents', protect, adminOnly, async (req, res) => {
  try {
    const agents = await User.find({ isAgent: true })
      .select('-password -twoFactorSecret')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      agents
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/agents
// @desc    Create a new support agent
// @access  Admin
router.post('/agents', protect, adminOnly, uploadBranding.single('avatar'), [
  body('username').trim().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('department').optional().isIn(['general', 'technical', 'billing', 'trading', 'kyc', 'vip']),
  body('maxConcurrentChats').optional().isInt({ min: 1, max: 20 }),
  handleValidationErrors
], async (req, res) => {
  try {
    console.log('Create agent - req.body:', req.body);
    console.log('Create agent - req.file:', req.file);
    
    const { username, email, password, firstName, lastName, department, maxConcurrentChats } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }
    
    // Generate a unique internal wallet address for the agent (format: BITSXXXXXXX)
    const prefix = 'BITS';
    let internalWallet;
    let existingWallet;
    do {
      const randomPart = Math.random().toString(36).substring(2, 9).toUpperCase();
      internalWallet = `${prefix}${randomPart}`;
      existingWallet = await User.findOne({ internalWallet });
    } while (existingWallet);
    
    const agentData = {
      username,
      email,
      password,
      firstName,
      lastName,
      internalWallet,
      department: department || 'general',
      maxConcurrentChats: maxConcurrentChats || 5,
      agentStatus: 'offline',
      isAgent: true,
      emailVerified: true
    };
    
    // Handle avatar - uploaded file takes precedence over predefined avatar
    if (req.file) {
      agentData.avatar = `/uploads/${req.file.filename}`;
    } else if (req.body.avatar) {
      agentData.avatar = req.body.avatar;
    }
    
    console.log('Create agent - agentData:', agentData);
    
    const agent = await User.create(agentData);
    
    res.status(201).json({
      success: true,
      agent: {
        id: agent._id,
        username: agent.username,
        email: agent.email,
        firstName: agent.firstName,
        lastName: agent.lastName,
        avatar: agent.avatar,
        isAgent: agent.isAgent
      }
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});

// @route   PUT /api/admin/agents/:id
// @desc    Update agent details
// @access  Admin
router.put('/agents/:id', protect, adminOnly, uploadBranding.single('avatar'), async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, isActive, isAgent, avatar, department, maxConcurrentChats, agentStatus } = req.body;
    
    const agent = await User.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Update fields if provided
    if (username) agent.username = username;
    if (email) agent.email = email;
    if (password) agent.password = password;
    if (firstName !== undefined) agent.firstName = firstName;
    if (lastName !== undefined) agent.lastName = lastName;
    if (isActive !== undefined) agent.isActive = isActive;
    if (isAgent !== undefined) agent.isAgent = isAgent;
    if (department) agent.department = department;
    if (maxConcurrentChats !== undefined) agent.maxConcurrentChats = maxConcurrentChats;
    if (agentStatus) agent.agentStatus = agentStatus;
    
    // Handle avatar - uploaded file takes precedence over predefined avatar
    if (req.file) {
      agent.avatar = `/uploads/${req.file.filename}`;
    } else if (avatar) {
      agent.avatar = avatar;
    }
    
    await agent.save();
    
    res.json({
      success: true,
      agent: {
        id: agent._id,
        username: agent.username,
        email: agent.email,
        firstName: agent.firstName,
        lastName: agent.lastName,
        avatar: agent.avatar,
        department: agent.department,
        agentStatus: agent.agentStatus,
        maxConcurrentChats: agent.maxConcurrentChats,
        isAgent: agent.isAgent,
        isActive: agent.isActive
      }
    });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/agents/:id
// @desc    Remove agent status from user
// @access  Admin
router.delete('/agents/:id', protect, adminOnly, async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    agent.isAgent = false;
    await agent.save();
    
    res.json({
      success: true,
      message: 'Agent status removed'
    });
  } catch (error) {
    console.error('Remove agent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/chat/sessions
// @desc    Get all chat sessions with stats
// @access  Admin
router.get('/chat/sessions', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const sessions = await ChatSession.find(query)
      .populate('userId', 'username avatar email')
      .populate('agentId', 'username avatar')
      .sort({ createdAt: -1 });
    
    const stats = {
      waiting: await ChatSession.countDocuments({ status: 'waiting' }),
      active: await ChatSession.countDocuments({ status: 'active' }),
      closed: await ChatSession.countDocuments({ status: 'closed' }),
      total: await ChatSession.countDocuments()
    };
    
    res.json({
      success: true,
      sessions,
      stats
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/notifications
// @desc    Get admin notifications (system-wide notifications)
// @access  Admin
router.get('/notifications', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unread === 'true';
    
    // Get system notifications (userId is null) and notifications for all admins
    const query = { 
      $or: [
        { userId: null }, // System notifications
        { type: { $in: ['email_verified', 'kyc_submitted', 'deposit_confirmation', 'withdrawal_request'] } }
      ]
    };
    
    if (unreadOnly) query.isRead = false;
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });
    
    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/notifications/:id/read
// @desc    Mark admin notification as read
// @access  Admin
router.put('/notifications/:id/read', protect, adminOnly, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/notifications/read-all
// @desc    Mark all admin notifications as read
// @access  Admin
router.put('/notifications/read-all', protect, adminOnly, async (req, res) => {
  try {
    const query = { 
      $or: [
        { userId: null },
        { type: { $in: ['email_verified', 'kyc_submitted', 'deposit_confirmation', 'withdrawal_request'] } }
      ],
      isRead: false
    };
    
    await Notification.updateMany(query, { isRead: true });
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// GAS PURCHASE MANAGEMENT
// ============================================

// @route   GET /api/admin/gas-purchases
// @desc    Get all gas purchase transactions
// @access  Admin
router.get('/gas-purchases', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const search = req.query.search || '';
    
    let query = { type: 'gas_purchase' };
    
    if (status) {
      query.status = status;
    }
    
    // Search by user
    let userIds = [];
    if (search) {
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      userIds = users.map(u => u._id);
      query.userId = { $in: userIds };
    }
    
    const transactions = await Transaction.find(query)
      .populate('userId', 'username email')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get gas purchases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/gas-purchases/:id/approve
// @desc    Approve a gas purchase
// @access  Admin
router.put('/gas-purchases/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      type: 'gas_purchase'
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Gas purchase not found' });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction is not pending' });
    }
    
    // Update transaction
    transaction.status = 'completed';
    transaction.approvedBy = req.user._id;
    transaction.approvedAt = new Date();
    transaction.adminNotes = adminNotes || null;
    transaction.completedAt = new Date();
    await transaction.save();
    
    // Update user's gas balance
    const user = await User.findById(transaction.userId);
    if (user) {
      user.gasBalance = (user.gasBalance || 0) + transaction.amount;
      await user.save();
    }
    
    // Create notification for user
    await Notification.create({
      userId: transaction.userId,
      type: 'transaction',
      title: 'Gas Purchase Approved',
      message: `Your gas purchase of $${transaction.amount} has been approved and added to your gas balance.`,
      data: {
        transactionId: transaction._id,
        amount: transaction.amount,
        status: 'completed'
      }
    });
    
    res.json({
      success: true,
      message: 'Gas purchase approved successfully',
      transaction
    });
  } catch (error) {
    console.error('Approve gas purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/gas-purchases/:id/reject
// @desc    Reject a gas purchase
// @access  Admin
router.put('/gas-purchases/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const { reason, adminNotes } = req.body;
    
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      type: 'gas_purchase'
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Gas purchase not found' });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction is not pending' });
    }
    
    // Update transaction
    transaction.status = 'rejected';
    transaction.approvedBy = req.user._id;
    transaction.approvedAt = new Date();
    transaction.rejectedReason = reason;
    transaction.adminNotes = adminNotes || null;
    await transaction.save();
    
    // Create notification for user
    await Notification.create({
      userId: transaction.userId,
      type: 'transaction',
      title: 'Gas Purchase Rejected',
      message: `Your gas purchase of $${transaction.amount} has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      data: {
        transactionId: transaction._id,
        amount: transaction.amount,
        status: 'rejected',
        reason
      }
    });
    
    res.json({
      success: true,
      message: 'Gas purchase rejected',
      transaction
    });
  } catch (error) {
    console.error('Reject gas purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// WITHDRAWAL MANAGEMENT
// ============================================

// @route   GET /api/admin/withdrawals
// @desc    Get all withdrawal transactions
// @access  Admin
router.get('/withdrawals', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const search = req.query.search || '';
    
    let query = { type: 'withdrawal' };
    
    if (status) {
      query.status = status;
    }
    
    // Search by user
    let userIds = [];
    if (search) {
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      userIds = users.map(u => u._id);
      query.userId = { $in: userIds };
    }
    
    const transactions = await Transaction.find(query)
      .populate('userId', 'username email')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/withdrawals/:id/approve
// @desc    Approve a withdrawal
// @access  Admin
router.put('/withdrawals/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { adminNotes, transactionHash } = req.body;
    
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      type: 'withdrawal'
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }
    
    if (!['pending', 'processing'].includes(transaction.status)) {
      return res.status(400).json({ message: 'Withdrawal cannot be approved' });
    }
    
    // Update transaction
    transaction.status = 'completed';
    transaction.approvedBy = req.user._id;
    transaction.approvedAt = new Date();
    transaction.adminNotes = adminNotes || null;
    transaction.transactionHash = transactionHash || null;
    transaction.completedAt = new Date();
    await transaction.save();
    
    // Create notification for user
    await Notification.create({
      userId: transaction.userId,
      type: 'withdrawal',
      title: 'Withdrawal Approved',
      message: `Your withdrawal of ${transaction.amount} ${transaction.currency} has been approved and processed.`,
      data: {
        transactionId: transaction._id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: 'completed',
        transactionHash
      }
    });
    
    res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      transaction
    });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/withdrawals/:id/reject
// @desc    Reject a withdrawal
// @access  Admin
router.put('/withdrawals/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const { reason, adminNotes } = req.body;
    
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      type: 'withdrawal'
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }
    
    if (!['pending', 'processing'].includes(transaction.status)) {
      return res.status(400).json({ message: 'Withdrawal cannot be rejected' });
    }
    
    // Refund the amount to user
    const user = await User.findById(transaction.userId);
    if (user) {
      if (!user.balance) user.balance = {};
      user.balance[transaction.currency] = (user.balance[transaction.currency] || 0) + transaction.amount;
      user.totalWithdrawn = (user.totalWithdrawn || 0) - transaction.amount;
      
      // Refund gas fee if applicable
      if (transaction.gasFee > 0) {
        user.gasBalance = (user.gasBalance || 0) + transaction.gasFee;
      }
      
      await user.save();
    }
    
    // Update transaction
    transaction.status = 'rejected';
    transaction.approvedBy = req.user._id;
    transaction.approvedAt = new Date();
    transaction.rejectedReason = reason;
    transaction.adminNotes = adminNotes || null;
    await transaction.save();
    
    // Create notification for user
    await Notification.create({
      userId: transaction.userId,
      type: 'withdrawal',
      title: 'Withdrawal Rejected',
      message: `Your withdrawal of ${transaction.amount} ${transaction.currency} has been rejected.${reason ? ` Reason: ${reason}` : ''} The amount has been refunded to your balance.`,
      data: {
        transactionId: transaction._id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: 'rejected',
        reason
      }
    });
    
    res.json({
      success: true,
      message: 'Withdrawal rejected and refunded',
      transaction
    });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/generate-missing-wallets
// @desc    Generate internal wallets for all users who don't have one
// @access  Private (Admin only)
router.post('/generate-missing-wallets', protect, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    console.log('🚀 Starting wallet generation for users without wallets...');

    // Find all users without internalWallet
    const usersWithoutWallet = await User.find({ 
      $or: [
        { internalWallet: null },
        { internalWallet: { $exists: false } },
        { internalWallet: '' }
      ]
    }).select('_id username email');

    console.log(`Found ${usersWithoutWallet.length} users without wallets`);

    if (usersWithoutWallet.length === 0) {
      return res.json({
        success: true,
        message: 'All users already have internal wallets',
        generated: 0,
        total: usersWithoutWallet.length
      });
    }

    // Generate wallets
    let generatedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const userData of usersWithoutWallet) {
      try {
        const prefix = 'BITS';
        let internalWallet;
        let exists = true;
        let attempts = 0;
        
        while (exists && attempts < 10) {
          const randomPart = Math.random().toString(36).substring(2, 9).toUpperCase();
          internalWallet = `${prefix}${randomPart}`;
          
          const existingUser = await User.findOne({ internalWallet });
          if (!existingUser) {
            exists = false;
          } else {
            attempts++;
          }
        }
        
        if (!internalWallet || attempts >= 10) {
          throw new Error('Failed to generate unique wallet');
        }

        userData.internalWallet = internalWallet;
        await userData.save();
        
        generatedCount++;
        results.push({
          username: userData.username,
          wallet: internalWallet,
          status: 'success'
        });

        console.log(`✓ Generated ${internalWallet} for ${userData.username}`);
      } catch (error) {
        errorCount++;
        results.push({
          username: userData.username,
          wallet: null,
          status: 'error',
          error: error.message
        });
        console.error(`✗ Error for ${userData.username}:`, error.message);
      }
    }

    console.log(`\n✅ Completed! Generated ${generatedCount} wallets, ${errorCount} errors`);

    res.json({
      success: true,
      message: `Generated ${generatedCount} internal wallets`,
      generated: generatedCount,
      failed: errorCount,
      total: usersWithoutWallet.length,
      results: results.slice(0, 50) // Return first 50 results
    });
  } catch (error) {
    console.error('Generate wallets error:', error);
    res.status(500).json({ 
      message: 'Server error occurred',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/transactions
// @desc    Get all transactions for analytics
// @access  Admin
router.get('/transactions', protect, adminOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Get recent transactions of all types
    const transactions = await Transaction.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      transactions,
      total: transactions.length
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Admin
router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '7d';
    
    // Calculate date ranges
    const now = new Date();
    let currentStartDate = new Date();
    let previousStartDate = new Date();
    
    // Set current period start date based on timeframe
    if (timeframe === '7d') {
      currentStartDate.setDate(now.getDate() - 7);
      previousStartDate.setDate(now.getDate() - 14); // Previous 7 days
    } else if (timeframe === '30d') {
      currentStartDate.setDate(now.getDate() - 30);
      previousStartDate.setDate(now.getDate() - 60); // Previous 30 days
    } else if (timeframe === '90d') {
      currentStartDate.setDate(now.getDate() - 90);
      previousStartDate.setDate(now.getDate() - 180); // Previous 90 days
    } else if (timeframe === '1y') {
      currentStartDate.setFullYear(now.getFullYear() - 1);
      previousStartDate.setFullYear(now.getFullYear() - 2); // Previous year
    } else {
      currentStartDate.setDate(now.getDate() - 7);
      previousStartDate.setDate(now.getDate() - 14);
    }
    
    const currentEndDate = now;
    const previousEndDate = currentStartDate;
    
    console.log(`Analytics Query:`);
    console.log(`  Timeframe: ${timeframe}`);
    console.log(`  Current Period: ${previousStartDate.toISOString().split('T')[0]} to ${currentEndDate.toISOString().split('T')[0]}`);
    console.log(`  Previous Period: ${previousStartDate.toISOString().split('T')[0]} to ${previousEndDate.toISOString().split('T')[0]}`);
    
    // ==================== CURRENT PERIOD DATA ====================
    
    // Get total users (all time)
    const totalUsers = await User.countDocuments();
    
    // Get active users (users with transactions in current timeframe)
    const activeUsersQuery = await Transaction.distinct('userId', {
      createdAt: { $gte: currentStartDate, $lte: currentEndDate }
    });
    const activeUsers = activeUsersQuery.length;
    
    // Get total revenue (sum of all completed trades and withdrawals) - CURRENT
    const currentRevenueData = await Transaction.aggregate([
      { 
        $match: { 
          createdAt: { $gte: currentStartDate, $lte: currentEndDate },
          type: { $in: ['trade', 'withdrawal'] },
          status: 'completed'
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);
    const currentRevenue = currentRevenueData[0]?.total || 0;
    
    // Get trading volume - CURRENT
    const currentVolumeData = await Transaction.aggregate([
      { 
        $match: { 
          createdAt: { $gte: currentStartDate, $lte: currentEndDate },
          type: 'trade',
          status: 'completed'
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);
    const currentTradingVolume = currentVolumeData[0]?.total || 0;
    
    // Get average transaction size - CURRENT
    const currentAvgTransactionData = await Transaction.aggregate([
      { 
        $match: { 
          createdAt: { $gte: currentStartDate, $lte: currentEndDate },
          status: 'completed'
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' },
          count: { $sum: 1 } 
        } 
      }
    ]);
    const currentAvgTransaction = currentAvgTransactionData[0]?.count 
      ? currentAvgTransactionData[0].total / currentAvgTransactionData[0].count 
      : 0;
    
    // ==================== PREVIOUS PERIOD DATA ====================
    
    // Get total revenue - PREVIOUS
    const previousRevenueData = await Transaction.aggregate([
      { 
        $match: { 
          createdAt: { $gte: previousStartDate, $lte: previousEndDate },
          type: { $in: ['trade', 'withdrawal'] },
          status: 'completed'
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);
    const previousRevenue = previousRevenueData[0]?.total || 0;
    
    // Get active users - PREVIOUS
    const previousActiveUsersQuery = await Transaction.distinct('userId', {
      createdAt: { $gte: previousStartDate, $lte: previousEndDate }
    });
    const previousActiveUsers = previousActiveUsersQuery.length;
    
    // Get trading volume - PREVIOUS
    const previousVolumeData = await Transaction.aggregate([
      { 
        $match: { 
          createdAt: { $gte: previousStartDate, $lte: previousEndDate },
          type: 'trade',
          status: 'completed'
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);
    const previousTradingVolume = previousVolumeData[0]?.total || 0;
    
    // Get average transaction size - PREVIOUS
    const previousAvgTransactionData = await Transaction.aggregate([
      { 
        $match: { 
          createdAt: { $gte: previousStartDate, $lte: previousEndDate },
          status: 'completed'
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' },
          count: { $sum: 1 } 
        } 
      }
    ]);
    const previousAvgTransaction = previousAvgTransactionData[0]?.count 
      ? previousAvgTransactionData[0].total / previousAvgTransactionData[0].count 
      : 0;
    
    // ==================== CALCULATE GROWTH PERCENTAGES ====================
    
    // Helper function to calculate percentage change
    const calculateGrowth = (current, previous) => {
      if (previous === 0) {
        // If previous was 0, any positive current value is 100% growth
        return current > 0 ? 100 : 0;
      }
      return ((current - previous) / previous) * 100;
    };
    
    const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
    const userGrowth = calculateGrowth(activeUsers, previousActiveUsers);
    const volumeGrowth = calculateGrowth(currentTradingVolume, previousTradingVolume);
    const avgGrowth = calculateGrowth(currentAvgTransaction, previousAvgTransaction);
    
    // Format growth percentages
    const formatGrowth = (value) => {
      const formatted = value.toFixed(2);
      return `${formatted >= 0 ? '+' : ''}${formatted}%`;
    };
    
    console.log('\nGrowth Calculations:');
    console.log(`  Revenue: ${currentRevenue.toFixed(2)} vs ${previousRevenue.toFixed(2)} = ${formatGrowth(revenueGrowth)}`);
    console.log(`  Users: ${activeUsers} vs ${previousActiveUsers} = ${formatGrowth(userGrowth)}`);
    console.log(`  Volume: ${currentTradingVolume.toFixed(2)} vs ${previousTradingVolume.toFixed(2)} = ${formatGrowth(volumeGrowth)}`);
    console.log(`  Avg Transaction: ${currentAvgTransaction.toFixed(2)} vs ${previousAvgTransaction.toFixed(2)} = ${formatGrowth(avgGrowth)}`);
    
    res.json({
      success: true,
      analytics: {
        totalRevenue: currentRevenue,
        revenueChange: formatGrowth(revenueGrowth),
        activeUsers,
        userChange: formatGrowth(userGrowth),
        tradingVolume: currentTradingVolume,
        volumeChange: formatGrowth(volumeGrowth),
        avgTransaction: currentAvgTransaction,
        avgChange: formatGrowth(avgGrowth),
        totalUsers,
        timeframe,
        // Additional metadata for debugging
        periods: {
          current: {
            start: currentStartDate,
            end: currentEndDate
          },
          previous: {
            start: previousStartDate,
            end: previousEndDate
          }
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
