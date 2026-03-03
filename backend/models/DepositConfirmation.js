import mongoose from 'mongoose';

const depositConfirmationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cryptocurrency: {
    type: String,
    required: true,
    enum: ['BTC', 'ETH', 'USDT', 'BNB']
  },
  network: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  fromAddress: {
    type: String,
    default: null
  },
  toAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  emailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
depositConfirmationSchema.index({ userId: 1, status: 1 });
depositConfirmationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('DepositConfirmation', depositConfirmationSchema);
