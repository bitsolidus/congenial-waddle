import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import AdminSettings from '../models/AdminSettings.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// @route   GET /api/deposit/address
// @desc    Get deposit address
// @access  Private
router.get('/address', protect, async (req, res) => {
  try {
    const { network, currency } = req.query;
    
    const settings = await AdminSettings.getCurrentSettings();
    
    // Get network configuration
    const networkConfig = settings.networks.find(
      n => n.name === network && n.enabled
    );
    
    if (!networkConfig) {
      return res.status(400).json({ message: 'Network not supported' });
    }
    
    // Generate or get deposit address
    // In a real implementation, this would generate a unique address per user
    const depositAddress = networkConfig.depositAddress || 
      `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    res.json({
      success: true,
      depositAddress,
      network: networkConfig.name,
      chainId: networkConfig.chainId,
      symbol: networkConfig.symbol,
      minimumDeposit: 0.001,
      confirmationsRequired: network === 'ethereum' ? 12 : network === 'bsc' ? 15 : 20
    });
  } catch (error) {
    console.error('Get deposit address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/deposit/confirm
// @desc    Confirm a deposit (mock implementation)
// @access  Private
router.post(
  '/confirm',
  protect,
  [
    body('amount').isFloat({ min: 0.000001 }),
    body('currency').notEmpty(),
    body('network').notEmpty(),
    body('transactionHash').notEmpty(),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { amount, currency, network, transactionHash, fromAddress } = req.body;
      
      const user = await User.findById(req.user._id);
      
      // Check if transaction already exists
      const existingTx = await Transaction.findOne({ transactionHash });
      if (existingTx) {
        return res.status(400).json({ message: 'Transaction already processed' });
      }
      
      // Create deposit transaction
      const transaction = await Transaction.create({
        userId: user._id,
        type: 'deposit',
        amount: amount,
        currency: 'USD',
        cryptoCurrency: currency,
        status: 'processing',
        transactionHash,
        network,
        fromAddress,
        confirmations: 0
      });
      
      // Simulate processing delay
      setTimeout(async () => {
        transaction.status = 'completed';
        transaction.confirmations = 12;
        transaction.completedAt = new Date();
        await transaction.save();
        
        // Update user balance
        user.balance += amount;
        user.totalDeposited += amount;
        await user.save();
      }, 5000);
      
      res.json({
        success: true,
        message: 'Deposit confirmation received',
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          status: transaction.status,
          transactionHash: transaction.transactionHash,
          estimatedCompletion: '5 minutes'
        }
      });
    } catch (error) {
      console.error('Confirm deposit error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/deposit/history
// @desc    Get deposit history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const deposits = await Transaction.find({
      userId: req.user._id,
      type: 'deposit'
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Transaction.countDocuments({
      userId: req.user._id,
      type: 'deposit'
    });
    
    res.json({
      success: true,
      deposits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get deposit history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/deposit/wallet-connect
// @desc    Connect wallet for deposit
// @access  Private
router.post(
  '/wallet-connect',
  protect,
  [
    body('walletType').isIn(['metamask', 'walletconnect', 'manual']),
    body('address').notEmpty(),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { walletType, address, chainId } = req.body;
      
      // Update user's wallet address
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { walletAddress: address },
        { new: true }
      );
      
      res.json({
        success: true,
        message: 'Wallet connected successfully',
        wallet: {
          type: walletType,
          address: user.walletAddress,
          chainId
        }
      });
    } catch (error) {
      console.error('Wallet connect error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
