import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import ActivityLog from '../models/ActivityLog.js';
import AdminSettings from '../models/AdminSettings.js';
import { 
  calculateGasFee, 
  checkSufficientGas, 
  calculateWithdrawalAmount,
  getNetworkGasPrices
} from '../utils/gasCalculator.js';
import { getClientIP, getUserAgent } from '../utils/getClientIP.js';

const router = express.Router();

// Helper function to get crypto prices in USD
const getCryptoPrices = async () => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin&vs_currencies=usd'
    );
    const data = await response.json();
    return {
      BTC: data.bitcoin?.usd || 67000,
      ETH: data.ethereum?.usd || 3500,
      USDT: data.tether?.usd || 1,
      BNB: data.binancecoin?.usd || 600
    };
  } catch (error) {
    console.error('Failed to fetch crypto prices:', error.message);
    return { BTC: 67000, ETH: 3500, USDT: 1, BNB: 600 };
  }
};

// Helper function to convert crypto amount to USD
const convertCryptoToUSD = (amount, cryptoCurrency, prices) => {
  const price = prices[cryptoCurrency] || 1;
  return parseFloat(amount) * price;
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(e => e.msg).join(', ');
    return res.status(400).json({ message: `Validation error: ${errorMessages}`, errors: errors.array() });
  }
  next();
};

// @route   GET /api/withdrawal/calculate-gas
// @desc    Calculate gas fee for withdrawal
// @access  Private
router.get('/calculate-gas', protect, async (req, res) => {
  try {
    const { amount, currency, network } = req.query;
    
    if (!amount || !currency || !network) {
      return res.status(400).json({ message: 'Amount, currency, and network are required' });
    }
    
    const gasInfo = await calculateGasFee(parseFloat(amount), currency, network);
    
    res.json({
      success: true,
      gasInfo
    });
  } catch (error) {
    console.error('Calculate gas error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   GET /api/withdrawal/estimate-fee
// @desc    Estimate transaction fee before withdrawal
// @access  Private
router.get('/estimate-fee', protect, async (req, res) => {
  try {
    const { amount, currency, network } = req.query;
    
    if (!amount || !currency || !network) {
      return res.status(400).json({ message: 'Amount, currency, and network are required' });
    }
    
    const parsedAmount = parseFloat(amount);
    
    // Get network gas prices
    const gasPrices = await getNetworkGasPrices();
    const networkGasPrice = gasPrices[network] || { baseFee: 0.001, priorityFee: 0.0005 };
    
    // Calculate network fee based on transaction complexity
    let networkFee = 0;
    let estimatedTime = '10-30 minutes';
    
    switch(network) {
      case 'bitcoin':
        // BTC fees based on transaction size (simplified)
        networkFee = Math.max(0.0001, parsedAmount * 0.0005); // 0.05% min 0.0001 BTC
        estimatedTime = networkGasPrice.baseFee < 0.0005 ? '10-20 minutes' : '30-60 minutes';
        break;
      case 'ethereum':
        // ETH gas fees
        networkFee = Math.max(0.001, parsedAmount * 0.002); // 0.2% min 0.001 ETH
        estimatedTime = networkGasPrice.baseFee < 20 ? '2-5 minutes' : '10-30 minutes';
        break;
      default:
        networkFee = Math.max(0.001, parsedAmount * 0.001);
    }
    
    // Platform fee (0.5%)
    const platformFeeRate = 0.005;
    const platformFee = parsedAmount * platformFeeRate;
    
    // Total fee
    const totalFee = networkFee + platformFee;
    const receiveAmount = parsedAmount - totalFee;
    
    res.json({
      success: true,
      estimate: {
        amount: parsedAmount,
        currency: currency.toUpperCase(),
        network,
        networkFee: networkFee.toFixed(6),
        platformFee: platformFee.toFixed(6),
        totalFee: totalFee.toFixed(6),
        receiveAmount: receiveAmount.toFixed(6),
        estimatedTime,
        feeBreakdown: {
          network: `${(networkFee / parsedAmount * 100).toFixed(3)}%`,
          platform: `${(platformFeeRate * 100).toFixed(1)}%`
        }
      }
    });
  } catch (error) {
    console.error('Estimate fee error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   GET /api/withdrawal/gas-prices
// @desc    Get current gas prices for all networks
// @access  Private
router.get('/gas-prices', protect, async (req, res) => {
  try {
    const gasPrices = await getNetworkGasPrices();
    
    res.json({
      success: true,
      gasPrices
    });
  } catch (error) {
    console.error('Get gas prices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/withdrawal/request
// @desc    Request a withdrawal
// @access  Private
router.post(
  '/request',
  protect,
  [
    body('amount').isFloat({ min: 0.000001 }).withMessage('Valid amount is required'),
    body('currency').notEmpty().withMessage('Currency is required'),
    body('network').notEmpty().withMessage('Network is required'),
    body('toAddress').notEmpty().withMessage('Destination address is required'),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { amount, currency, network, toAddress, gasOption, fromCrypto } = req.body;
      
      console.log('Withdrawal request received:', { amount, currency, network, toAddress, fromCrypto });
      
      const sourceCrypto = fromCrypto || currency; // Which crypto balance to withdraw from
      
      const user = await User.findById(req.user._id);
      const settings = await AdminSettings.getCurrentSettings();
      
      // Check minimum withdrawal
      if (amount < settings.minWithdrawal) {
        return res.status(400).json({
          message: `Minimum withdrawal amount is ${settings.minWithdrawal}`
        });
      }
      
      // Check maximum withdrawal
      if (amount > settings.maxWithdrawal) {
        return res.status(400).json({
          message: `Maximum withdrawal amount is ${settings.maxWithdrawal}`
        });
      }
      
      // Calculate withdrawal amount with percentage logic
      const withdrawalCalc = await calculateWithdrawalAmount(amount, user, settings, sourceCrypto);
      
      if (!withdrawalCalc.canWithdraw) {
        return res.status(400).json({
          message: 'Withdrawal amount exceeds your allowed limit',
          details: withdrawalCalc
        });
      }
      
      // Check if user has sufficient balance in the selected crypto
      const sourceBalance = user.balance?.[sourceCrypto] || 0;
      if (sourceBalance < amount) {
        return res.status(400).json({
          message: `Insufficient ${sourceCrypto} balance. You have ${sourceBalance} ${sourceCrypto}`
        });
      }
      
      // Calculate percentage-based gas fee if enabled
      let gasFeeUSD = 0;
      if (settings.withdrawalGasFee?.enabled) {
        gasFeeUSD = Math.min(
          Math.max(withdrawalCalc.allowed * (settings.withdrawalGasFee.percentage / 100), 
                   settings.withdrawalGasFee.minFee),
          settings.withdrawalGasFee.maxFee
        );
        
        // Check if user has sufficient gas balance
        const userGasBalance = user.gasBalance || 0;
        if (userGasBalance < gasFeeUSD) {
          return res.status(400).json({
            message: 'Insufficient gas balance',
            details: {
              gasSufficient: false,
              required: gasFeeUSD,
              current: userGasBalance,
              deficit: gasFeeUSD - userGasBalance
            }
          });
        }
      }
      
      // Calculate network gas fee
      const gasInfo = await calculateGasFee(withdrawalCalc.allowed, currency, network);
      
      // Create withdrawal transaction
      const transaction = await Transaction.create({
        userId: user._id,
        type: 'withdrawal',
        amount: amount,
        originalAmount: amount,
        sourceCrypto: sourceCrypto,
        currency: sourceCrypto,
        cryptoCurrency: currency,
        status: settings.requireAdminApproval ? 'pending' : 'processing',
        gasFee: gasFeeUSD,
        networkGasFee: gasInfo.gasFee,
        gasPaidBy: 'user',
        gasAmount: gasFeeUSD,
        toAddress,
        network,
        chainId: gasInfo.chainId
      });
      
      // Deduct amount from user's selected crypto balance
      if (!user.balance) user.balance = {};
      user.balance[sourceCrypto] = (user.balance[sourceCrypto] || 0) - amount;
      
      // Convert to USD for totalWithdrawn
      const prices = await getCryptoPrices();
      const usdValue = convertCryptoToUSD(amount, sourceCrypto, prices);
      user.totalWithdrawn = (user.totalWithdrawn || 0) + usdValue;
      
      // Deduct gas fee from gas balance if enabled
      if (settings.withdrawalGasFee?.enabled && gasFeeUSD > 0) {
        user.gasBalance -= gasFeeUSD;
      }
      
      await user.save();
      
      // Log withdrawal activity
      await ActivityLog.create({
        userId: user._id,
        type: 'withdrawal',
        title: 'Withdrawal Requested',
        description: `Requested withdrawal of ${amount} ${sourceCrypto} to ${toAddress.substring(0, 10)}...`,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        metadata: {
          amount,
          sourceCrypto,
          toAddress,
          network,
          transactionId: transaction._id,
          gasFee: gasFeeUSD
        },
        severity: 'info'
      });
      
      // Create admin notification for withdrawal approval
      if (settings.requireAdminApproval) {
        const Notification = (await import('../models/Notification.js')).default;
        await Notification.create({
          userId: null, // Admin notification
          type: 'admin',
          title: 'New Withdrawal Request',
          message: `${user.username} requested withdrawal of ${amount} ${sourceCrypto}`,
          data: {
            transactionId: transaction._id,
            userId: user._id,
            username: user.username,
            amount: amount,
            sourceCrypto: sourceCrypto,
            requiresAction: true
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Withdrawal request submitted successfully',
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          sourceCrypto: transaction.sourceCrypto,
          status: transaction.status,
          gasFee: transaction.gasFee,
          network: transaction.network,
          requiresApproval: settings.requireAdminApproval
        }
      });
    } catch (error) {
      console.error('Withdrawal request error:', error);
      res.status(500).json({ message: error.message || 'Server error' });
    }
  }
);

// @route   POST /api/withdrawal/add-gas
// @desc    Add gas to a withdrawal transaction
// @access  Private
router.post(
  '/add-gas',
  protect,
  [
    body('transactionId').notEmpty(),
    body('amount').isFloat({ min: 0 }),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { transactionId, amount, paymentMethod } = req.body;
      
      const transaction = await Transaction.findOne({
        _id: transactionId,
        userId: req.user._id
      });
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      // Create gas purchase transaction
      const gasTransaction = await Transaction.create({
        userId: req.user._id,
        type: 'gas_purchase',
        amount: amount,
        currency: 'USD',
        cryptoCurrency: transaction.cryptoCurrency,
        status: 'completed',
        network: transaction.network
      });
      
      // Update original transaction
      transaction.gasAmount += amount;
      await transaction.save();
      
      res.json({
        success: true,
        message: 'Gas added successfully',
        gasTransaction: {
          id: gasTransaction._id,
          amount: gasTransaction.amount,
          status: gasTransaction.status
        }
      });
    } catch (error) {
      console.error('Add gas error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/withdrawal/status/:id
// @desc    Get withdrawal status
// @access  Private
router.get('/status/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
      type: 'withdrawal'
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({
      success: true,
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        network: transaction.network,
        transactionHash: transaction.transactionHash,
        confirmations: transaction.confirmations,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
        gasFee: transaction.gasFee,
        toAddress: transaction.toAddress
      }
    });
  } catch (error) {
    console.error('Get withdrawal status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/withdrawal/cancel/:id
// @desc    Cancel a pending withdrawal
// @access  Private
router.post('/cancel/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
      type: 'withdrawal',
      status: { $in: ['pending', 'processing'] }
    });
    
    if (!transaction) {
      return res.status(404).json({ 
        message: 'Transaction not found or cannot be cancelled' 
      });
    }
    
    // Refund the amount to user
    const user = await User.findById(req.user._id);
    
    // Get prices and convert to USD for totalWithdrawn adjustment
    const prices = await getCryptoPrices();
    const usdValue = convertCryptoToUSD(transaction.amount, transaction.cryptoCurrency || transaction.sourceCrypto, prices);
    
    // Refund to the correct crypto balance
    const cryptoType = transaction.sourceCrypto || transaction.cryptoCurrency || 'USDT';
    if (!user.balance || typeof user.balance !== 'object') {
      user.balance = { USDT: 0, BTC: 0, ETH: 0, BNB: 0 };
    }
    user.balance[cryptoType] = (user.balance[cryptoType] || 0) + transaction.amount;
    user.totalWithdrawn = (user.totalWithdrawn || 0) - usdValue;
    await user.save();
    
    // Update transaction status
    transaction.status = 'cancelled';
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Withdrawal cancelled successfully',
      refundAmount: transaction.amount
    });
  } catch (error) {
    console.error('Cancel withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
