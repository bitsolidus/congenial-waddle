import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema({
  // Site Identity
  siteName: {
    type: String,
    default: 'BitSolidus'
  },
  siteDescription: {
    type: String,
    default: 'Secure Cryptocurrency Trading Platform'
  },
  logo: {
    type: String,
    default: null // URL to logo image
  },
  footerLogo: {
    type: String,
    default: null // URL to footer logo image (optional, falls back to main logo)
  },
  favicon: {
    type: String,
    default: null // URL to favicon
  },
  loadingIcon: {
    type: String,
    default: null // URL to loading/spinner icon (GIF, SVG, or PNG)
  },
  
  // Header Configuration
  header: {
    showLogo: { type: Boolean, default: true },
    showNavigation: { type: Boolean, default: true },
    showUserMenu: { type: Boolean, default: true },
    customLinks: [{
      label: String,
      url: String,
      order: Number
    }]
  },
  
  // Footer Configuration
  footer: {
    showLogo: { type: Boolean, default: true },
    showCopyright: { type: Boolean, default: true },
    copyrightText: {
      type: String,
      default: '© 2026 BitSolidus. All rights reserved.'
    },
    footerLinks: [{
      label: String,
      url: String,
      order: Number
    }],
    socialLinks: {
      twitter: { type: String, default: null },
      facebook: { type: String, default: null },
      telegram: { type: String, default: null },
      discord: { type: String, default: null },
      instagram: { type: String, default: null }
    }
  },
  
  // Contact Information
  contact: {
    email: { type: String, default: 'support@bitsolidus.tech' },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    supportUrl: { type: String, default: 'https://bitsolidus.io/support' },
    liveChatUrl: { type: String, default: 'https://bitsolidus.io/chat' }
  },
  
  // Email Branding
  emailBranding: {
    logo: { type: String, default: null }, // URL to email logo image
    showLogo: { type: Boolean, default: true },
    primaryColor: { type: String, default: '#7c3aed' },
    secondaryColor: { type: String, default: '#4f46e5' },
    supportEmail: { type: String, default: 'support@bitsolidus.tech' },
    replyToEmail: { type: String, default: 'support@bitsolidus.tech' },
    showSupportLink: { type: Boolean, default: true },
    showLiveChatLink: { type: Boolean, default: true }
  },
  
  // Platform Settings
  platform: {
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: {
      type: String,
      default: 'We are currently performing maintenance. Please check back later.'
    },
    allowRegistration: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: false },
    requireKycForTrading: { type: Boolean, default: false },
    gasFeePercentage: { type: Number, default: 2.5 },
    gasFeeEnabled: { type: Boolean, default: true },
    minGasFee: { type: Number, default: 5 },
    maxGasFee: { type: Number, default: 500 }
  },
  
  // Branding Colors (optional custom colors)
  branding: {
    primaryColor: { type: String, default: '#7c3aed' },
    secondaryColor: { type: String, default: '#4f46e5' },
    accentColor: { type: String, default: '#10b981' }
  },
  
  // Meta Information
  meta: {
    title: { type: String, default: 'BitSolidus - Secure Cryptocurrency Trading' },
    description: { type: String, default: 'Trade cryptocurrencies with confidence on our secure platform' },
    keywords: { type: String, default: 'crypto, trading, bitcoin, ethereum, cryptocurrency' }
  },
  
  // Updated timestamp
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Ensure only one config document exists
siteConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);

export default SiteConfig;
