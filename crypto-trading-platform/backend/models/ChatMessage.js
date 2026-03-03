import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'agent', 'system'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: null
    }
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for fetching messages by session
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ sessionId: 1, read: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
