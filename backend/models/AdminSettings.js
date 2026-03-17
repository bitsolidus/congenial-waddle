import mongoose from 'mongoose';

const networkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  chainId: {
    type: Number,
    required: true
  },
  rpcUrl: {
    type: String,
    required: true
  },
  gasPrice: {
    type: Number,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  depositAddress: {
    type: String,
    default: null
  },
  symbol: {
    type: String,
    required: true
  },
  decimals: {
    type: Number,
    default: 18
  }
});

const userOverrideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  withdrawalPercentage: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    default: null
  }
});

const adminSettingsSchema = new mongoose.Schema({
  // Global withdrawal settings
  withdrawalPercentage: {
    type: Number,
    default: 75, // 75% of balance
    min: 0,
    max: 100
  },
  globalWithdrawalPercentage: {
    type: Boolean,
    default: true
  },
  minWithdrawal: {
    type: Number,
    default: 0.001
  },
  maxWithdrawal: {
    type: Number,
    default: 10.0
  },
  withdrawalCooldown: {
    type: Number,
    default: 24 // hours
  },
  requireAdminApproval: {
    type: Boolean,
    default: true
  },
  
  // Gas settings
  gasMultiplier: {
    type: Number,
    default: 1.5
  },
  gasSubsidy: {
    type: Number,
    default: 0, // 0 = user pays full, 100 = platform pays full
    min: 0,
    max: 100
  },
  gasPriceSource: {
    type: String,
    enum: ['network', 'fixed'],
    default: 'network'
  },
  fixedGasPrice: {
    type: Number,
    default: 50 // in Gwei
  },
  gasLimit: {
    type: Number,
    default: 21000
  },
  
  // Percentage-based gas fee for withdrawals (new)
  withdrawalGasFee: {
    enabled: {
      type: Boolean,
      default: true
    },
    percentage: {
      type: Number,
      default: 2.5, // 2.5% of withdrawal amount
      min: 0,
      max: 100
    },
    minFee: {
      type: Number,
      default: 5 // Minimum $5 USD
    },
    maxFee: {
      type: Number,
      default: 500 // Maximum $500 USD
    }
  },
  
  // Tier-based withdrawal limits (matches User model tiers: bronze, silver, gold, vip)
  tierLimits: {
    bronze: {
      min: { type: Number, default: 10 },
      max: { type: Number, default: 10000 },
      dailyLimit: { type: Number, default: 50000 }
    },
    silver: {
      min: { type: Number, default: 10 },
      max: { type: Number, default: 25000 },
      dailyLimit: { type: Number, default: 100000 }
    },
    gold: {
      min: { type: Number, default: 10 },
      max: { type: Number, default: 50000 },
      dailyLimit: { type: Number, default: 200000 }
    },
    vip: {
      min: { type: Number, default: 10 },
      max: { type: Number, default: 100000 },
      dailyLimit: { type: Number, default: 500000 }
    }
  },
  
  // Network settings
  networks: [networkSchema],
  
  // User overrides
  userOverrides: [userOverrideSchema],
  
  // System wallets
  systemWallets: {
    hotWallet: {
      address: { type: String, default: null },
      privateKey: { type: String, default: null, select: false }
    },
    coldStorage: {
      address: { type: String, default: null }
    }
  },
  
  // Maintenance mode
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'Platform is under maintenance. Please try again later.'
  },
  
  // Chat Widget Settings
  chatSettings: {
    type: mongoose.Schema.Types.Mixed,
    default: {
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
  },
  
  // Audit fields
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Static method to get current settings
adminSettingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne().sort({ createdAt: -1 });
  
  if (!settings) {
    // Create default settings
    settings = await this.create({
      networks: [
        {
          name: 'ethereum',
          chainId: 1,
          rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/demo',
          gasPrice: 50,
          symbol: 'ETH',
          enabled: true
        },
        {
          name: 'bsc',
          chainId: 56,
          rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
          gasPrice: 5,
          symbol: 'BNB',
          enabled: true
        },
        {
          name: 'polygon',
          chainId: 137,
          rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com/',
          gasPrice: 30,
          symbol: 'MATIC',
          enabled: true
        }
      ]
    });
  }
  
  return settings;
};

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

export default AdminSettings;
