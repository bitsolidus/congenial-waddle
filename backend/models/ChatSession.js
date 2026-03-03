import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  // For guest users (not logged in)
  guestInfo: {
    name: { type: String, default: null },
    email: { type: String, default: null },
    isGuest: { type: Boolean, default: false }
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'closed', 'transferred'],
    default: 'waiting'
  },
  // Department this chat is assigned to
  department: {
    type: String,
    enum: ['general', 'technical', 'billing', 'trading', 'kyc', 'vip'],
    default: 'general'
  },
  subject: {
    type: String,
    default: 'General Support'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Transfer history
  transferHistory: [{
    fromAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    toAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transferredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      default: ''
    },
    transferredAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Agent assignment history
  assignmentHistory: [{
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    unassignedAt: {
      type: Date,
      default: null
    }
  }],
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date,
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for finding active sessions
chatSessionSchema.index({ status: 1, createdAt: -1 });
chatSessionSchema.index({ agentId: 1, status: 1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
