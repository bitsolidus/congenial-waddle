import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  name: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  walletAddress: {
    type: String,
    default: null
  },
  // Internal wallet for platform-only P2P transfers
  internalWallet: {
    type: String,
    default: null,
    sparse: true
  },
  // Deposit addresses for each cryptocurrency (admin-assigned)
  depositAddresses: {
    BTC: { type: String, default: null },
    ETH: { type: String, default: null },
    USDT: { type: String, default: null },
    BNB: { type: String, default: null }
  },
  balance: {
    USDT: { type: Number, default: 0 },
    BTC: { type: Number, default: 0 },
    ETH: { type: Number, default: 0 },
    BNB: { type: Number, default: 0 }
  },
  totalDeposited: {
    type: Number,
    default: 0.00
  },
  totalWithdrawn: {
    type: Number,
    default: 0.00
  },
  withdrawalPercentage: {
    type: Number,
    default: null // null means use global setting
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'vip'],
    default: 'bronze'
  },
  tierUpgradeProgress: {
    kycCompleted: { type: Boolean, default: false },
    tradingVolume: { type: Number, default: 0 }, // USD volume
    accountAge: { type: Number, default: 0 }, // days
    referrals: { type: Number, default: 0 },
    lastEvaluated: { type: Date, default: null }
  },
  // Referral system
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralEarnings: {
    type: Number,
    default: 0
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'not_submitted'],
    default: 'not_submitted'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  // Login OTP Verification
  loginOtp: {
    code: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null }
  },
  // Personal Information (can be filled from profile or KYC)
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: null },
  dateOfBirth: { type: Date, default: null },
  phone: { type: String, default: null },
  address: { type: String, default: null },
  city: { type: String, default: null },
  country: { type: String, default: null },
  
  kycData: {
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: null },
    dateOfBirth: { type: Date, default: null },
    nationality: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    country: { type: String, default: null },
    postalCode: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    idType: { type: String, enum: ['passport', 'drivers_license', 'national_id'], default: null },
    idNumber: { type: String, default: null },
    idFrontImage: { type: String, default: null }, // URL to stored image
    idBackImage: { type: String, default: null }, // URL to stored image
    selfieImage: { type: String, default: null }, // URL to stored image
    proofOfAddressImage: { type: String, default: null }, // URL to stored image
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: null }
  },
  twoFactorSecret: {
    type: String,
    default: null,
    select: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isAgent: {
    type: Boolean,
    default: false
  },
  
  // Agent department for routing chats
  department: {
    type: String,
    enum: ['general', 'technical', 'billing', 'trading', 'kyc', 'vip'],
    default: 'general'
  },
  
  // Agent specialties/skills
  specialties: [{
    type: String
  }],
  
  // Agent availability status
  agentStatus: {
    type: String,
    enum: ['online', 'away', 'busy', 'offline'],
    default: 'offline'
  },
  
  // Max concurrent chats agent can handle
  maxConcurrentChats: {
    type: Number,
    default: 5
  },
  
  // Current active chat count
  activeChatCount: {
    type: Number,
    default: 0
  },
  
  // Gas balance for withdrawal fees
  gasBalance: {
    type: Number,
    default: 0
  },
  
  lastLogin: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  }
}, {
  timestamps: true
});

// Handle balance migration and password hashing before saving
userSchema.pre('save', async function(next) {
  // Handle balance migration - convert old format or NaN to new object format
  if (this.balance === undefined || this.balance === null || typeof this.balance !== 'object') {
    const oldBalance = parseFloat(this.balance) || 0;
    this.balance = {
      USDT: oldBalance,
      BTC: 0,
      ETH: 0,
      BNB: 0
    };
  } else {
    // Ensure all crypto fields exist and are valid numbers
    this.balance = {
      USDT: parseFloat(this.balance.USDT) || 0,
      BTC: parseFloat(this.balance.BTC) || 0,
      ETH: parseFloat(this.balance.ETH) || 0,
      BNB: parseFloat(this.balance.BNB) || 0
    };
  }
  
  // Hash password if modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  // Generate referral code for new users
  if (this.isNew && !this.referralCode) {
    this.referralCode = generateReferralCode();
  }
  
  next();
});

// Generate unique referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for avatar URL
userSchema.virtual('avatarUrl').get(function() {
  if (!this.avatar) {
    return null;
  }
  // Check if avatar is already a full URL
  if (this.avatar.startsWith('http://') || this.avatar.startsWith('https://')) {
    return this.avatar;
  }
  // Construct full URL from relative path
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:8080';
  return `${baseUrl}/uploads/${this.avatar}`;
});

// Include virtuals in JSON responses
if (!userSchema.options.toObject) {
  userSchema.options.toObject = {};
}
if (!userSchema.options.toJSON) {
  userSchema.options.toJSON = {};
}
userSchema.options.toObject.virtuals = true;
userSchema.options.toJSON.virtuals = true;

// Get effective withdrawal percentage
userSchema.methods.getWithdrawalPercentage = async function() {
  const AdminSettings = mongoose.model('AdminSettings');
  const settings = await AdminSettings.findOne().sort({ createdAt: -1 });
  
  if (this.withdrawalPercentage !== null) {
    return this.withdrawalPercentage;
  }
  
  if (settings && settings.globalWithdrawalPercentage) {
    return settings.withdrawalPercentage;
  }
  
  return 100; // Default to 100% if no settings
};

const User = mongoose.model('User', userSchema);

export default User;
