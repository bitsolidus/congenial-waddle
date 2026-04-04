import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import DepositConfirmation from '../models/DepositConfirmation.js';
import { upload, uploadBranding } from '../config/upload.js';
import { sendKycSubmittedEmail, sendDepositNotificationEmail } from '../config/email.js';
import { getClientIP, getUserAgent } from '../utils/getClientIP.js';
import * as otplib from 'otplib';
import QRCode from 'qrcode';

// Get authenticator from otplib (ESM workaround)
const authenticator = otplib.authenticator;

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return res.status(400).json({ message: errorMessages });
  }
  next();
};

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Ensure settings object exists with default values
    if (!user.settings) {
      user.settings = {
        currency: 'USD',
        language: 'en',
        theme: 'auto',
        notifications: true
      };
      await user.save();
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        currency: user.settings?.currency || 'USD',
        walletAddress: user.walletAddress,
        balance: user.balance,
        totalDeposited: user.totalDeposited,
        totalWithdrawn: user.totalWithdrawn,
        tier: user.tier,
        kycStatus: user.kycStatus,
        kycData: user.kycData,
        isAdmin: user.isAdmin,
        isAgent: user.isAgent,
        agentStatus: user.agentStatus,
        department: user.department,
        maxConcurrentChats: user.maxConcurrentChats,
        settings: user.settings,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  protect,
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body('settings').optional().isObject(),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { 
        username, 
        avatar, 
        settings,
        firstName,
        lastName,
        gender,
        dateOfBirth,
        phone,
        address,
        city,
        country,
        currency
      } = req.body;
      
      const updateData = {};
      
      if (username) updateData.username = username;
      if (avatar) updateData.avatar = avatar;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (gender !== undefined) updateData.gender = gender;
      if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (country !== undefined) updateData.country = country;
      
      // Handle settings update (including currency)
      updateData.settings = {
        ...req.user.settings,
        ...settings
      };
      
      // If currency is provided directly, add it to settings
      if (currency !== undefined && currency !== null && currency !== '') {
        updateData.settings.currency = currency;
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      );

      // Log profile update activity
      await ActivityLog.create({
        userId: user._id,
        type: 'profile_update',
        title: 'Profile Updated',
        description: 'User profile information was updated',
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        metadata: {
          updatedFields: Object.keys(updateData).filter(k => k !== 'settings'),
          currencyChanged: currency !== undefined && currency !== req.user.settings?.currency
        },
        severity: 'info'
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          phone: user.phone,
          address: user.address,
          city: user.city,
          country: user.country,
          currency: user.settings?.currency || 'USD',
          isAdmin: user.isAdmin,
          settings: user.settings,
          kycStatus: user.kycStatus,
          kycData: user.kycData
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/user/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', protect, (req, res, next) => {
  uploadBranding.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error:', err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading
      console.error('Unknown upload error:', err);
      return res.status(500).json({ message: `Upload failed: ${err.message}` });
    }
    // No error, proceed to the next middleware
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    
    console.log('Avatar uploaded:', {
      filename: req.file.filename,
      path: req.file.path,
      avatarUrl: avatarUrl,
      uploadsDir: process.env.UPLOADS_DIR || 'default'
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   GET /api/user/balance
// @desc    Get user balance and portfolio with real-time prices
// @access  Private
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Ensure balance object exists
    const balance = typeof user.balance === 'object' && user.balance !== null
      ? user.balance
      : { USDT: user.balance || 0, BTC: 0, ETH: 0, BNB: 0 };
    
    // Fetch real-time prices from CoinGecko
    let prices = {};
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await response.json();
      prices = {
        BTC: data.bitcoin?.usd || 0,
        ETH: data.ethereum?.usd || 0,
        USDT: data.tether?.usd || 1,
        BNB: data.binancecoin?.usd || 0
      };
    } catch (priceError) {
      console.error('Failed to fetch prices:', priceError);
      // Fallback prices
      prices = { BTC: 67000, ETH: 3500, USDT: 1, BNB: 600 };
    }
    
    // Calculate portfolio with real-time USD values
    // Backend stores actual crypto amounts (e.g., 0.075 BTC)
    // Frontend displays crypto amounts, USD values calculated from real-time prices
    const portfolio = {
      USDT: { 
        amount: balance.USDT || 0, 
        value: (balance.USDT || 0) * prices.USDT,
        price: prices.USDT
      },
      BTC: { 
        amount: balance.BTC || 0, 
        value: (balance.BTC || 0) * prices.BTC,
        price: prices.BTC
      },
      ETH: { 
        amount: balance.ETH || 0, 
        value: (balance.ETH || 0) * prices.ETH,
        price: prices.ETH
      },
      BNB: { 
        amount: balance.BNB || 0, 
        value: (balance.BNB || 0) * prices.BNB,
        price: prices.BNB
      }
    };
    
    // Calculate total portfolio value in USD
    const total = portfolio.USDT.value + portfolio.BTC.value + portfolio.ETH.value + portfolio.BNB.value;
    
    // Calculate 24h change based on crypto price changes
    const btcChange = prices.BTC > 0 ? 0 : 0; // Simplified - would need historical data
    const change24h = (Math.random() * 10 - 5).toFixed(2); // Placeholder
    
    res.json({
      success: true,
      balance: {
        total: total,
        currency: user.settings?.currency || 'USD',
        change24h: parseFloat(change24h),
        change24hValue: (total * parseFloat(change24h) / 100).toFixed(2)
      },
      portfolio,
      prices,
      totalDeposited: user.totalDeposited || 0,
      totalWithdrawn: user.totalWithdrawn || 0
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/wallet/update
// @desc    Update wallet address
// @access  Private
router.post(
  '/wallet/update',
  protect,
  [
    body('walletAddress').notEmpty().withMessage('Wallet address is required'),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { walletAddress } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { walletAddress },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Wallet address updated successfully',
        walletAddress: user.walletAddress
      });
    } catch (error) {
      console.error('Update wallet error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/user/transactions
// @desc    Get user transaction history
// @access  Private
router.get('/transactions', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (status) query.status = status;
    
    // Add date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
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

// @route   GET /api/user/transactions/:id
// @desc    Get single transaction details
// @access  Private
router.get('/transactions/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/user/password
// @desc    Change password
// @access  Private
router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty(),
    body('newPassword')
      .isLength({ min: 6 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await User.findById(req.user._id).select('+password');
      
      const isMatch = await user.comparePassword(currentPassword);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      user.password = newPassword;
      await user.save();
      
      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/user/kyc/submit
// @desc    Submit KYC verification with file uploads
// @access  Private
router.post('/kyc/submit', 
  protect, 
  upload.fields([
    { name: 'idFrontImage', maxCount: 1 },
    { name: 'idBackImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 },
    { name: 'proofOfAddressImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        gender,
        dateOfBirth,
        nationality,
        address,
        city,
        state,
        country,
        postalCode,
        phoneNumber,
        idType,
        idNumber
      } = req.body;

      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get file URLs if uploaded
      const files = req.files || {};
      // Use BACKEND_URL from env or default - this ensures correct URL for cross-domain access
      const backendUrl = process.env.BACKEND_URL || 'https://bitsolidus.tech';
      const getFileUrl = (fieldName) => {
        if (files[fieldName] && files[fieldName][0]) {
          // Return full URL for cross-domain access from Vercel frontend
          return `${backendUrl}/uploads/kyc/${files[fieldName][0].filename}`;
        }
        return null;
      };

      // Update KYC data
      user.kycData = {
        firstName: firstName || user.kycData?.firstName,
        lastName: lastName || user.kycData?.lastName,
        gender: gender || user.kycData?.gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : user.kycData?.dateOfBirth,
        nationality: nationality || user.kycData?.nationality,
        address: address || user.kycData?.address,
        city: city || user.kycData?.city,
        state: state || user.kycData?.state,
        country: country || user.kycData?.country,
        postalCode: postalCode || user.kycData?.postalCode,
        phoneNumber: phoneNumber || user.kycData?.phoneNumber,
        idType: idType || user.kycData?.idType,
        idNumber: idNumber || user.kycData?.idNumber,
        idFrontImage: getFileUrl('idFrontImage') || user.kycData?.idFrontImage,
        idBackImage: getFileUrl('idBackImage') || user.kycData?.idBackImage,
        selfieImage: getFileUrl('selfieImage') || user.kycData?.selfieImage,
        proofOfAddressImage: getFileUrl('proofOfAddressImage') || user.kycData?.proofOfAddressImage,
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null
      };
      user.kycStatus = 'pending';

      // Sync KYC data to user profile
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.gender = gender || user.gender;
      user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth;
      user.phone = phoneNumber || user.phone;
      user.address = address || user.address;
      user.city = city || user.city;
      user.state = state || user.state;
      user.country = country || user.country;

      await user.save();

      // Log KYC submission activity
      await ActivityLog.create({
        userId: user._id,
        type: 'kyc_submitted',
        title: 'KYC Submitted',
        description: `Submitted KYC verification with ${idType} (${idNumber.substring(0, 4)}...)`,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        metadata: {
          idType,
          nationality,
          country
        },
        severity: 'info'
      });

      // Send KYC submission email
      try {
        await sendKycSubmittedEmail(user.email, user.username);
      } catch (emailError) {
        console.error('Failed to send KYC submission email:', emailError);
        // Don't fail the submission if email fails
      }

      res.json({
        success: true,
        message: 'KYC submitted successfully',
        user: {
          id: user._id,
          username: user.username,
          kycStatus: user.kycStatus,
          kycData: user.kycData
        }
      });
    } catch (error) {
      console.error('KYC submission error:', error);
      res.status(500).json({ message: 'Server error during KYC submission' });
    }
  }
);

// @route   GET /api/user/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unread === 'true';
    
    const query = { userId: req.user._id };
    if (unreadOnly) query.isRead = false;
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    
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
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/user/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/user/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/user/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/notifications/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/gas-balance
// @desc    Get user's USDT balance for transaction fees
// @access  Private
router.get('/gas-balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const AdminSettings = (await import('../models/AdminSettings.js')).default;
    const settings = await AdminSettings.getCurrentSettings();
    
    res.json({
      success: true,
      gasBalance: user.gasBalance || 0,
      gasFeeSettings: {
        enabled: settings.withdrawalGasFee?.enabled || false,
        percentage: settings.withdrawalGasFee?.percentage || 2.5
      }
    });
  } catch (error) {
    console.error('Get gas balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/tier-limits
// @desc    Get tier limits and withdrawal settings for users (public read-only)
// @access  Private
router.get('/tier-limits', protect, async (req, res) => {
  try {
    const AdminSettings = (await import('../models/AdminSettings.js')).default;
    const settings = await AdminSettings.getCurrentSettings();
    
    // Only return safe, non-sensitive settings that users need to see
    res.json({
      success: true,
      tierLimits: settings.tierLimits || {
        bronze: { min: 10, max: 10000, dailyLimit: 50000 },
        silver: { min: 10, max: 25000, dailyLimit: 100000 },
        gold: { min: 10, max: 50000, dailyLimit: 200000 },
        platinum: { min: 10, max: 75000, dailyLimit: 350000 },
        vip: { min: 10, max: 100000, dailyLimit: 500000 }
      },
      // Withdrawal transaction fee settings - users need to see this
      withdrawalGasFee: {
        enabled: settings.withdrawalGasFee?.enabled || false,
        percentage: settings.withdrawalGasFee?.percentage || 2.5
      },
      // General withdrawal settings
      withdrawalSettings: {
        minWithdrawal: settings.minWithdrawal || 10,
        maxWithdrawal: settings.maxWithdrawal || 100000,
        withdrawalCooldown: settings.withdrawalCooldown || 24
      }
    });
  } catch (error) {
    console.error('Get tier limits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/buy-gas
// @desc    Deposit USDT for transaction fees
// @access  Private
router.post('/buy-gas', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    const user = await User.findById(req.user._id);
    
    // Check if user has sufficient USDT balance
    const usdtBalance = user.balance?.USDT || 0;
    if (usdtBalance < amount) {
      return res.status(400).json({ message: 'Insufficient USDT balance' });
    }
    
    // Deduct from USDT balance and add to gas balance
    user.balance.USDT = usdtBalance - amount;
    user.gasBalance = (user.gasBalance || 0) + amount;
    
    await user.save();
    
    // Create transaction record
    const Transaction = (await import('../models/Transaction.js')).default;
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'gas_purchase',
      amount: amount,
      currency: 'USDT',
      status: 'pending', // Pending BitSolidus Team approval
      description: 'Gas fee deposit - pending approval'
    });
    
    // Create admin notification for gas purchase approval
    const Notification = (await import('../models/Notification.js')).default;
    await Notification.create({
      userId: null, // Admin notification
      type: 'admin',
      title: 'Gas Purchase Pending Approval',
      message: `${user.username} purchased ${amount} USD gas and needs approval`,
      data: {
        transactionId: transaction._id,
        userId: user._id,
        username: user.username,
        amount: amount,
        requiresAction: true,
        actionType: 'approve_gas'
      }
    });
    
    res.json({
      success: true,
      message: 'Gas purchase submitted for BitSolidus Team approval',
      gasBalance: user.gasBalance,
      usdtBalance: user.balance.USDT,
      transactionId: transaction._id,
      status: 'pending'
    });
  } catch (error) {
    console.error('Buy gas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/tier-progress
// @desc    Get user's tier upgrade progress
// @access  Private
router.get('/tier-progress', protect, async (req, res) => {
  try {
    const user = req.user;
    
    // Calculate account age in days
    const accountAge = Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    
    // Get trading volume (sum of all completed trades)
    const Transaction = (await import('../models/Transaction.js')).default;
    const tradingVolume = await Transaction.aggregate([
      { 
        $match: { 
          userId: user._id, 
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
    
    // Get referral count
    const referralCount = await User.countDocuments({ referredBy: user._id });
    
    // Calculate premium duration (if applicable)
    let premiumDuration = 0;
    if (user.tier === 'premium' || user.tier === 'vip') {
      // Get when user was upgraded to premium (from activity logs)
      const ActivityLog = (await import('../models/ActivityLog.js')).default;
      const upgradeLog = await ActivityLog.findOne({
        'metadata.targetUser': user._id,
        'metadata.newTier': { $in: ['premium', 'vip'] }
      }).sort({ createdAt: 1 });
      
      if (upgradeLog) {
        premiumDuration = Math.floor((Date.now() - new Date(upgradeLog.createdAt)) / (1000 * 60 * 60 * 24));
      }
    }
    
    const progress = {
      kycCompleted: user.kycStatus === 'verified',
      tradingVolume: tradingVolume[0]?.total || 0,
      accountAge,
      referrals: referralCount,
      premiumDuration,
      currentTier: user.tier || 'bronze',
      lastEvaluated: user.tierUpgradeProgress?.lastEvaluated || null
    };
    
    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get tier progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/deposit-addresses
// @desc    Get user's deposit addresses for all cryptocurrencies
// @access  Private
router.get('/deposit-addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      depositAddresses: {
        BTC: user.depositAddresses?.BTC || null,
        ETH: user.depositAddresses?.ETH || null,
        USDT: user.depositAddresses?.USDT || null,
        BNB: user.depositAddresses?.BNB || null
      }
    });
  } catch (error) {
    console.error('Get deposit addresses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/daily-withdrawals
// @desc    Get user's total withdrawals for today
// @access  Private
router.get('/daily-withdrawals', protect, async (req, res) => {
  try {
    const user = req.user;
    const Transaction = (await import('../models/Transaction.js')).default;
    
    // Get start of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    // Get all withdrawals from today
    const todayWithdrawals = await Transaction.find({
      userId: user._id,
      type: 'withdrawal',
      status: { $in: ['completed', 'pending'] },
      createdAt: { $gte: startOfDay }
    });
    
    // Calculate total USD value
    const total = todayWithdrawals.reduce((sum, tx) => {
      return sum + (tx.amount || 0);
    }, 0);
    
    res.json({
      success: true,
      total,
      count: todayWithdrawals.length,
      withdrawals: todayWithdrawals.map(tx => ({
        id: tx._id,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        createdAt: tx.createdAt
      }))
    });
  } catch (error) {
    console.error('Get daily withdrawals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/deposit-confirm
// @desc    Submit deposit confirmation with transaction ID
// @access  Private
router.post('/deposit-confirm', protect, [
  body('cryptocurrency').isIn(['BTC', 'ETH', 'USDT', 'BNB']).withMessage('Invalid cryptocurrency'),
  body('transactionId').notEmpty().trim().withMessage('Transaction ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
  body('network').notEmpty().trim().withMessage('Network is required'),
  body('toAddress').notEmpty().trim().withMessage('Deposit address is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { cryptocurrency, transactionId, amount, network, fromAddress, toAddress } = req.body;
    
    // Check if transaction ID already exists
    const existingConfirmation = await DepositConfirmation.findOne({ transactionId });
    if (existingConfirmation) {
      return res.status(400).json({ 
        success: false, 
        message: 'This transaction ID has already been submitted' 
      });
    }

    // Create deposit confirmation
    const confirmation = new DepositConfirmation({
      userId: req.user._id,
      cryptocurrency,
      network,
      transactionId,
      amount,
      fromAddress: fromAddress || null,
      toAddress,
      status: 'pending'
    });

    await confirmation.save();

    // Get user details for notification
    const user = await User.findById(req.user._id);

    // Create admin notification
    const adminNotification = new Notification({
      userId: null, // System notification for admins
      type: 'deposit_confirmation',
      title: 'New Deposit Confirmation',
      message: `${user.username} submitted a ${amount} ${cryptocurrency} deposit confirmation (TxID: ${transactionId.substring(0, 20)}...)`,
      data: {
        depositConfirmationId: confirmation._id,
        userId: user._id,
        username: user.username,
        amount,
        cryptocurrency,
        transactionId
      }
    });
    await adminNotification.save();

    // Log deposit activity
    await ActivityLog.create({
      userId: user._id,
      type: 'deposit',
      title: 'Deposit Submitted',
      description: `Submitted ${amount} ${cryptocurrency} deposit confirmation (TxID: ${transactionId.substring(0, 20)}...)`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
      metadata: {
        cryptocurrency,
        amount,
        transactionId,
        network,
        confirmationId: confirmation._id
      },
      severity: 'info'
    });

    // Send email notification to admin
    try {
      await sendDepositNotificationEmail({
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        deposit: {
          cryptocurrency,
          amount,
          transactionId,
          network,
          toAddress
        }
      });
    } catch (emailError) {
      console.error('Failed to send admin email notification:', emailError);
    }

    res.json({
      success: true,
      message: 'Deposit confirmation submitted successfully. BitSolidus Team will review shortly.',
      confirmation: {
        id: confirmation._id,
        status: confirmation.status,
        createdAt: confirmation.createdAt
      }
    });
  } catch (error) {
    console.error('Deposit confirmation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/deposit-confirmations
// @desc    Get user's deposit confirmations
// @access  Private
router.get('/deposit-confirmations', protect, async (req, res) => {
  try {
    const confirmations = await DepositConfirmation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      confirmations: confirmations.map(c => ({
        id: c._id,
        cryptocurrency: c.cryptocurrency,
        network: c.network,
        transactionId: c.transactionId,
        amount: c.amount,
        status: c.status,
        adminNotes: c.adminNotes,
        createdAt: c.createdAt,
        confirmedAt: c.confirmedAt
      }))
    });
  } catch (error) {
    console.error('Get deposit confirmations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/internal-wallet
// @desc    Get or generate user's internal wallet address for P2P transfers
// @access  Private
router.get('/internal-wallet', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // If user doesn't have an internal wallet, generate one
    if (!user.internalWallet) {
      try {
        // Generate a unique internal wallet address (format: BITSXXXXXXX)
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
          throw new Error('Failed to generate unique wallet address');
        }
        
        user.internalWallet = internalWallet;
        await user.save();
        
        console.log(`Generated wallet ${internalWallet} for user ${user.username}`);
      } catch (walletError) {
        console.error('Failed to generate wallet:', walletError.message);
        return res.status(500).json({ 
          message: 'Failed to generate wallet. Please contact support.' 
        });
      }
    }
    
    res.json({
      success: true,
      internalWallet: user.internalWallet,
      message: 'This wallet address is for BitSolidus platform transfers only. External transfers will not work.'
    });
  } catch (error) {
    console.error('Get internal wallet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/lookup-wallet/:walletAddress
// @desc    Look up a user by their internal wallet address (for P2P transfers)
// @access  Private
router.get('/lookup-wallet/:walletAddress', protect, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress || walletAddress.length < 8) {
      return res.status(400).json({ 
        message: 'Invalid wallet address format' 
      });
    }
    
    // Find user by internal wallet address
    const user = await User.findOne({ 
      internalWallet: walletAddress.toUpperCase() 
    }).select('username internalWallet');
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    // Return only safe public info
    res.json({
      success: true,
      username: user.username,
      wallet: user.internalWallet
    });
  } catch (error) {
    console.error('Wallet lookup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/internal-transfer
// @desc    Transfer funds to another user's internal wallet
// @access  Private
router.post('/internal-transfer', protect, async (req, res) => {
  try {
    const { toWallet, amount, cryptocurrency } = req.body;
    
    // Manual validation with clear error messages
    if (!toWallet || typeof toWallet !== 'string' || !toWallet.trim()) {
      return res.status(400).json({ 
        message: 'Recipient wallet address is required' 
      });
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0.01) {
      return res.status(400).json({
        message: 'Amount must be at least 0.01'
      });
    }
    
    const validCryptos = ['USDT', 'BTC', 'ETH', 'BNB'];
    if (!validCryptos.includes(cryptocurrency)) {
      return res.status(400).json({
        message: `Invalid cryptocurrency. Supported: ${validCryptos.join(', ')}`
      });
    }
    
    // Ensure sender has an internal wallet (auto-generate if missing)
    const sender = await User.findById(req.user._id);
    if (!sender.internalWallet) {
      try {
        // Generate internal wallet for sender
        const prefix = 'BITS';
        let internalWallet;
        let exists = true;
        let attempts = 0;
        
        while (exists && attempts < 10) {
          const randomPart = Math.random().toString(36).substring(2, 9).toUpperCase();
          internalWallet = `${prefix}${randomPart}`;
          
          const existing = await User.findOne({ internalWallet });
          if (!existing) {
            exists = false;
          } else {
            attempts++;
          }
        }
        
        if (!internalWallet || attempts >= 10) {
          throw new Error('Failed to generate unique wallet address');
        }
        
        sender.internalWallet = internalWallet;
        await sender.save();
        
        console.log(`Auto-generated wallet ${internalWallet} for user ${sender.username}`);
      } catch (walletError) {
        console.error('Failed to auto-generate wallet:', walletError.message);
        return res.status(500).json({ 
          message: 'Failed to initialize your wallet. Please contact support.' 
        });
      }
    }
    
    // Find recipient by internal wallet
    const recipient = await User.findOne({ internalWallet: toWallet.trim() });
    if (!recipient) {
      return res.status(404).json({ 
        message: 'Recipient wallet address not found. Please verify the address is a valid BitSolidus internal wallet (format: BITSXXXXXXX).' 
      });
    }
    
    // Cannot send to self
    if (recipient._id.toString() === sender._id.toString()) {
      return res.status(400).json({ 
        message: 'You cannot send funds to your own wallet address. Please enter a different user\'s wallet address.' 
      });
    }
    
    // Check sender's balance
    const senderBalance = sender.balance[cryptocurrency] || 0;
    if (senderBalance < parsedAmount) {
      return res.status(400).json({ 
        message: `Insufficient ${cryptocurrency} balance. Your balance: ${senderBalance.toFixed(6)} ${cryptocurrency}` 
      });
    }

    // Perform transfer
    sender.balance[cryptocurrency] -= parsedAmount;
    recipient.balance[cryptocurrency] = (recipient.balance[cryptocurrency] || 0) + parsedAmount;
    
    await sender.save();
    await recipient.save();
    
    // Create transaction records with detailed metadata
    const senderTransaction = new Transaction({
      userId: sender._id,
      type: 'internal_transfer_sent',
      amount: parsedAmount,
      cryptoCurrency: cryptocurrency,
      currency: 'USD',
      status: 'completed',
      toAddress: recipient.internalWallet
    });
    await senderTransaction.save();
    
    const recipientTransaction = new Transaction({
      userId: recipient._id,
      type: 'internal_transfer_received',
      amount: parsedAmount,
      cryptoCurrency: cryptocurrency,
      currency: 'USD',
      status: 'completed',
      fromAddress: sender.internalWallet
    });
    await recipientTransaction.save();
    
    // Create notifications
    await Notification.create({
      userId: sender._id,
      title: 'Transfer Sent',
      message: `You sent ${parsedAmount} ${cryptocurrency} to ${recipient.username}`,
      type: 'transaction',
      read: false
    });
    
    await Notification.create({
      userId: recipient._id,
      title: 'Transfer Received',
      message: `You received ${parsedAmount} ${cryptocurrency} from ${sender.username}`,
      type: 'transaction',
      read: false
    });
    
    // Import email functions
    const { default: emailService } = await import('../config/email.js');
    
    // Send email to sender (confirmation)
    try {
      await emailService.sendTransferSentEmail(
        sender.email,
        sender.username,
        {
          amount: parsedAmount,
          cryptocurrency,
          recipientUsername: recipient.username
        }
      );
      console.log(`Transfer sent email confirmation sent to ${sender.email}`);
    } catch (emailError) {
      console.error('Failed to send transfer sent email to sender:', emailError);
      // Don't fail the transfer if email fails
    }
    
    // Send email to recipient (notification)
    try {
      await emailService.sendTransferReceivedEmail(
        recipient.email,
        recipient.username,
        {
          amount: parsedAmount,
          cryptocurrency,
          senderUsername: sender.username
        }
      );
      console.log(`Transfer received email notification sent to ${recipient.email}`);
    } catch (emailError) {
      console.error('Failed to send transfer received email to recipient:', emailError);
      // Don't fail the transfer if email fails
    }
    
    // Log transfer activity for sender
    try {
      await ActivityLog.create({
        userId: sender._id,
        type: 'transfer_sent',
        title: 'Transfer Sent',
        description: `Sent ${parsedAmount} ${cryptocurrency} to ${recipient.username}`,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        metadata: {
          amount: parsedAmount,
          cryptocurrency,
          recipientId: recipient._id,
          recipientUsername: recipient.username,
          transactionId: senderTransaction._id
        },
        severity: 'info'
      });
    } catch (logError) {
      console.error('Failed to log sender activity:', logError);
    }
    
    // Log transfer activity for recipient
    try {
      await ActivityLog.create({
        userId: recipient._id,
        type: 'transfer_received',
        title: 'Transfer Received',
        description: `Received ${parsedAmount} ${cryptocurrency} from ${sender.username}`,
        metadata: {
          amount: parsedAmount,
          cryptocurrency,
          senderId: sender._id,
          senderUsername: sender.username,
          transactionId: recipientTransaction._id
        },
        severity: 'info'
      });
    } catch (logError) {
      console.error('Failed to log recipient activity:', logError);
    }
    
    res.json({
      success: true,
      message: `Successfully transferred ${parsedAmount} ${cryptocurrency} to ${recipient.username} (${recipient.internalWallet})`,
      transaction: {
        amount: parsedAmount,
        cryptocurrency,
        recipient: recipient.username,
        recipientWallet: recipient.internalWallet,
        newBalance: sender.balance[cryptocurrency]
      }
    });
  } catch (error) {
    console.error('Internal transfer error:', {
      message: error.message,
      stack: error.stack,
      toWallet: req.body.toWallet,
      amount: req.body.amount,
      cryptocurrency: req.body.cryptocurrency
    });
    
    // More specific error messages
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: `Validation error: ${messages.join(', ')}` 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid user ID format.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error occurred during transfer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/user/internal-transfer-history
// @desc    Get internal transfer history
// @access  Private
router.get('/internal-transfer-history', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
      type: { $in: ['internal_transfer_sent', 'internal_transfer_received'] }
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json({
      success: true,
      transactions: transactions.map(tx => ({
        id: tx._id,
        type: tx.type,
        cryptocurrency: tx.cryptoCurrency,
        amount: tx.amount,
        status: tx.status,
        description: tx.type === 'internal_transfer_sent' 
          ? `Sent to ${tx.toAddress || 'user'}` 
          : `Received from ${tx.fromAddress || 'user'}`,
        walletAddress: tx.type === 'internal_transfer_sent' ? tx.toAddress : tx.fromAddress,
        createdAt: tx.createdAt
      }))
    });
  } catch (error) {
    console.error('Get transfer history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/referral
// @desc    Get user referral information
// @access  Private
router.get('/referral', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Generate referral code if not exists (for existing users)
    if (!user.referralCode) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      user.referralCode = code;
      await user.save();
    }
    
    // Get referral count
    const referralCount = await User.countDocuments({ referredBy: user._id });
    
    // Get list of referred users (limited info)
    const referredUsers = await User.find({ referredBy: user._id })
      .select('username createdAt tier')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({
      success: true,
      referral: {
        code: user.referralCode,
        link: `${process.env.FRONTEND_URL || 'https://bitsolidus.io'}/register?ref=${user.referralCode}`,
        totalReferrals: referralCount,
        referralEarnings: user.referralEarnings || 0,
        referredUsers: referredUsers.map(u => ({
          username: u.username,
          tier: u.tier,
          joinedAt: u.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get referral error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/referral/validate
// @desc    Validate a referral code
// @access  Public
router.post('/referral/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ valid: false, message: 'Referral code is required' });
    }
    
    const referrer = await User.findOne({ referralCode: code.toUpperCase() });
    
    if (!referrer) {
      return res.json({ valid: false, message: 'Invalid referral code' });
    }
    
    res.json({
      valid: true,
      referrer: {
        username: referrer.username
      }
    });
  } catch (error) {
    console.error('Validate referral error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/pending-actions
// @desc    Get user's pending actions (KYC, withdrawals, etc.)
// @access  Private
router.get('/pending-actions', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const pendingActions = [];
    
    // Check KYC status
    if (user.kycStatus === 'pending') {
      pendingActions.push({
        type: 'kyc',
        title: 'KYC Verification Pending',
        message: 'Your KYC documents are under review',
        status: 'pending'
      });
    } else if (!user.kycSubmittedAt) {
      pendingActions.push({
        type: 'kyc',
        title: 'Complete KYC Verification',
        message: 'Please submit your KYC documents to unlock all features',
        status: 'required'
      });
    }
    
    // Check pending withdrawals
    const pendingWithdrawals = await Transaction.countDocuments({
      user: req.user._id,
      type: 'withdrawal',
      status: 'pending'
    });
    
    if (pendingWithdrawals > 0) {
      pendingActions.push({
        type: 'withdrawal',
        title: 'Pending Withdrawals',
        message: `You have ${pendingWithdrawals} pending withdrawal(s)`,
        count: pendingWithdrawals,
        status: 'processing'
      });
    }
    
    res.json({
      success: true,
      pendingActions
    });
  } catch (error) {
    console.error('Get pending actions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// 2FA (Two-Factor Authentication) Routes
// ============================================

// @route   GET /api/user/2fa/setup
// @desc    Generate 2FA secret and QR code
// @access  Private
router.get('/2fa/setup', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled. Disable it first to generate a new secret.' });
    }
    
    // Generate a new secret
    const secret = authenticator.generateSecret();
    
    // Create OTPAuth URL
    const appName = process.env.APP_NAME || 'CryptoTrade';
    const otpauth = authenticator.keyuri(user.email, appName, secret);
    
    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(otpauth);
    
    // Temporarily store the secret (will be saved when verified)
    user.twoFactorSecret = secret;
    await user.save();
    
    res.json({
      success: true,
      secret,
      qrCodeUrl,
      manualEntryKey: secret
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/2fa/verify
// @desc    Verify 2FA code and enable 2FA
// @access  Private
router.post('/2fa/verify', protect, [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    
    const { code } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: 'Please setup 2FA first' });
    }
    
    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();
    
    // Create activity log
    await ActivityLog.create({
      userId: user._id,
      action: '2fa_enabled',
      details: 'Two-factor authentication enabled',
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req)
    });
    
    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/2fa/disable
// @desc    Disable 2FA
// @access  Private
router.post('/2fa/disable', protect, [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    
    const { code } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }
    
    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = '';
    await user.save();
    
    // Create activity log
    await ActivityLog.create({
      userId: user._id,
      action: '2fa_disabled',
      details: 'Two-factor authentication disabled',
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req)
    });
    
    res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user/2fa/status
// @desc    Get 2FA status
// @access  Private
router.get('/2fa/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled || false
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
