import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Mock market data
const tradingPairs = [
  { symbol: 'BTC/USD', base: 'BTC', quote: 'USD', price: 43250.50, change24h: 2.35, volume24h: 28500000000 },
  { symbol: 'ETH/USD', base: 'ETH', quote: 'USD', price: 2580.75, change24h: -1.20, volume24h: 15200000000 },
  { symbol: 'BNB/USD', base: 'BNB', quote: 'USD', price: 315.20, change24h: 0.85, volume24h: 1800000000 },
  { symbol: 'SOL/USD', base: 'SOL', quote: 'USD', price: 98.45, change24h: 5.60, volume24h: 3200000000 },
  { symbol: 'ADA/USD', base: 'ADA', quote: 'USD', price: 0.485, change24h: -0.50, volume24h: 450000000 },
  { symbol: 'DOT/USD', base: 'DOT', quote: 'USD', price: 7.25, change24h: 1.20, volume24h: 280000000 },
  { symbol: 'MATIC/USD', base: 'MATIC', quote: 'USD', price: 0.85, change24h: 3.40, volume24h: 520000000 },
  { symbol: 'LINK/USD', base: 'LINK', quote: 'USD', price: 14.30, change24h: -2.10, volume24h: 380000000 }
];

// @route   GET /api/trade/pairs
// @desc    Get all trading pairs
// @access  Private
router.get('/pairs', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      pairs: tradingPairs
    });
  } catch (error) {
    console.error('Get trading pairs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/trade/orderbook/:pair
// @desc    Get order book for a trading pair
// @access  Private
router.get('/orderbook/:pair', protect, async (req, res) => {
  try {
    const { pair } = req.params;
    
    // Generate mock order book
    const currentPair = tradingPairs.find(p => p.symbol === pair) || tradingPairs[0];
    const basePrice = currentPair.price;
    
    const asks = [];
    const bids = [];
    
    // Generate asks (sell orders) - higher prices
    for (let i = 1; i <= 10; i++) {
      asks.push({
        price: (basePrice * (1 + i * 0.001)).toFixed(2),
        amount: (Math.random() * 5 + 0.1).toFixed(4),
        total: 0
      });
    }
    
    // Generate bids (buy orders) - lower prices
    for (let i = 1; i <= 10; i++) {
      bids.push({
        price: (basePrice * (1 - i * 0.001)).toFixed(2),
        amount: (Math.random() * 5 + 0.1).toFixed(4),
        total: 0
      });
    }
    
    // Calculate totals
    asks.forEach((ask, index) => {
      ask.total = (parseFloat(ask.price) * parseFloat(ask.amount)).toFixed(2);
    });
    
    bids.forEach((bid, index) => {
      bid.total = (parseFloat(bid.price) * parseFloat(bid.amount)).toFixed(2);
    });
    
    const lowestAsk = parseFloat(asks[asks.length - 1].price);
    const highestBid = parseFloat(bids[0].price);
    const spread = (lowestAsk - highestBid).toFixed(2);
    const spreadPercent = ((spread / lowestAsk) * 100).toFixed(3);
    
    res.json({
      success: true,
      pair,
      orderBook: {
        asks: asks.reverse(), // Highest ask first
        bids: bids, // Highest bid first
        spread: spread,
        spreadPercent: spreadPercent,
        lastPrice: basePrice
      }
    });
  } catch (error) {
    console.error('Get order book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/trade/buy
// @desc    Place a buy order
// @access  Private
router.post(
  '/buy',
  protect,
  [
    body('pair').notEmpty(),
    body('amount').isFloat({ min: 0.000001 }),
    body('orderType').isIn(['market', 'limit', 'stop-loss']),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { pair, amount, price, orderType } = req.body;
      
      const user = await User.findById(req.user._id);
      const currentPair = tradingPairs.find(p => p.symbol === pair) || tradingPairs[0];
      
      // Ensure balance object exists
      if (typeof user.balance !== 'object' || user.balance === null) {
        user.balance = { USDT: user.balance || 0, BTC: 0, ETH: 0, BNB: 0 };
      }
      
      const orderPrice = orderType === 'market' ? currentPair.price : price;
      const totalCost = amount * orderPrice;
      
      // Check if user has sufficient USDT balance
      const usdtBalance = user.balance.USDT || 0;
      if (usdtBalance < totalCost) {
        return res.status(400).json({
          message: 'Insufficient USDT balance',
          required: totalCost,
          available: usdtBalance
        });
      }
      
      // Deduct USDT balance and add crypto balance
      user.balance.USDT = usdtBalance - totalCost;
      user.balance[currentPair.base] = (user.balance[currentPair.base] || 0) + parseFloat(amount);
      await user.save();
      
      // Create transaction
      const transaction = await Transaction.create({
        userId: user._id,
        type: 'buy',
        amount: totalCost,
        currency: 'USDT',
        cryptoCurrency: currentPair.base,
        status: 'completed',
        tradePair: pair,
        orderType,
        price: orderPrice
      });
      
      res.json({
        success: true,
        message: `Successfully bought ${amount} ${currentPair.base}`,
        order: {
          id: transaction._id,
          pair,
          type: 'buy',
          orderType,
          amount,
          price: orderPrice,
          total: totalCost,
          status: transaction.status,
          timestamp: transaction.createdAt
        }
      });
    } catch (error) {
      console.error('Buy order error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/trade/sell
// @desc    Place a sell order
// @access  Private
router.post(
  '/sell',
  protect,
  [
    body('pair').notEmpty(),
    body('amount').isFloat({ min: 0.000001 }),
    body('orderType').isIn(['market', 'limit', 'stop-loss']),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const { pair, amount, price, orderType } = req.body;
      
      const user = await User.findById(req.user._id);
      const currentPair = tradingPairs.find(p => p.symbol === pair) || tradingPairs[0];
      
      // Ensure balance object exists
      if (typeof user.balance !== 'object' || user.balance === null) {
        user.balance = { USDT: user.balance || 0, BTC: 0, ETH: 0, BNB: 0 };
      }
      
      const orderPrice = orderType === 'market' ? currentPair.price : price;
      const totalValue = amount * orderPrice;
      
      // Check if user has sufficient crypto balance
      const cryptoBalance = user.balance[currentPair.base] || 0;
      if (cryptoBalance < amount) {
        return res.status(400).json({
          message: `Insufficient ${currentPair.base} balance`,
          required: amount,
          available: cryptoBalance
        });
      }
      
      // Deduct crypto balance and add USDT
      user.balance[currentPair.base] = cryptoBalance - parseFloat(amount);
      user.balance.USDT = (user.balance.USDT || 0) + totalValue;
      await user.save();
      
      // Create transaction
      const transaction = await Transaction.create({
        userId: user._id,
        type: 'sell',
        amount: totalValue,
        currency: 'USDT',
        cryptoCurrency: currentPair.base,
        status: 'completed',
        tradePair: pair,
        orderType,
        price: orderPrice
      });
      
      res.json({
        success: true,
        message: `Successfully sold ${amount} ${currentPair.base}`,
        order: {
          id: transaction._id,
          pair,
          type: 'sell',
          orderType,
          amount,
          price: orderPrice,
          total: totalValue,
          status: transaction.status,
          timestamp: transaction.createdAt
        }
      });
    } catch (error) {
      console.error('Sell order error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/trade/orders
// @desc    Get user's open orders
// @access  Private
router.get('/orders', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const orders = await Transaction.find({
      userId: req.user._id,
      type: { $in: ['buy', 'sell'] }
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Transaction.countDocuments({
      userId: req.user._id,
      type: { $in: ['buy', 'sell'] }
    });
    
    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/trade/order/:id
// @desc    Cancel an order
// @access  Private
router.delete('/order/:id', protect, async (req, res) => {
  try {
    const order = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'pending'
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found or cannot be cancelled' });
    }
    
    // Refund if it was a buy order
    if (order.type === 'buy') {
      const user = await User.findById(req.user._id);
      user.balance += order.amount;
      await user.save();
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
