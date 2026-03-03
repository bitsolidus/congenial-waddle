import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'trade', 'buy', 'sell', 'gas_purchase'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  cryptoCurrency: {
    type: String,
    default: null // BTC, ETH, USDT, etc.
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'approved', 'rejected'],
    default: 'pending'
  },
  // Gas fee information
  gasFee: {
    type: Number,
    default: 0
  },
  gasPaidBy: {
    type: String,
    enum: ['user', 'platform', 'split'],
    default: 'user'
  },
  gasAmount: {
    type: Number,
    default: 0
  },
  // Withdrawal percentage logic
  withdrawalPercentage: {
    type: Number,
    default: null
  },
  originalAmount: {
    type: Number,
    default: null
  },
  blockedAmount: {
    type: Number,
    default: 0
  },
  // Blockchain details
  fromAddress: {
    type: String,
    default: null
  },
  toAddress: {
    type: String,
    default: null
  },
  transactionHash: {
    type: String,
    default: null,
    index: true
  },
  network: {
    type: String,
    default: null // ethereum, bsc, polygon, etc.
  },
  chainId: {
    type: Number,
    default: null
  },
  confirmations: {
    type: Number,
    default: 0
  },
  // Trade specific fields
  tradePair: {
    type: String,
    default: null
  },
  orderType: {
    type: String,
    enum: ['market', 'limit', 'stop-loss', null],
    default: null
  },
  price: {
    type: Number,
    default: null
  },
  // Admin fields
  adminNotes: {
    type: String,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedReason: {
    type: String,
    default: null
  },
  // Metadata
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for common queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ transactionHash: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
