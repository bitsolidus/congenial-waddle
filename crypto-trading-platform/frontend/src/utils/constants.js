// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// App Configuration
export const APP_NAME = 'BitSolidus';
export const APP_VERSION = '1.0.0';

// Supported Cryptocurrencies
export const CRYPTOCURRENCIES = [
  { symbol: 'BTC', name: 'Bitcoin', decimals: 8, color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', decimals: 18, color: '#627EEA' },
  { symbol: 'BNB', name: 'BNB', decimals: 18, color: '#F3BA2F' },
  { symbol: 'USDT', name: 'Tether', decimals: 6, color: '#26A17B' },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, color: '#2775CA' },
  { symbol: 'SOL', name: 'Solana', decimals: 9, color: '#00FFA3' },
  { symbol: 'ADA', name: 'Cardano', decimals: 6, color: '#0033AD' },
  { symbol: 'DOT', name: 'Polkadot', decimals: 10, color: '#E6007A' },
  { symbol: 'MATIC', name: 'Polygon', decimals: 18, color: '#8247E5' },
  { symbol: 'LINK', name: 'Chainlink', decimals: 18, color: '#2A5ADA' },
];

// Supported Networks
export const NETWORKS = [
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    chainId: 1, 
    symbol: 'ETH',
    color: '#627EEA',
    gasToken: 'ETH'
  },
  { 
    id: 'bsc', 
    name: 'BSC', 
    chainId: 56, 
    symbol: 'BNB',
    color: '#F3BA2F',
    gasToken: 'BNB'
  },
  { 
    id: 'polygon', 
    name: 'Polygon', 
    chainId: 137, 
    symbol: 'MATIC',
    color: '#8247E5',
    gasToken: 'MATIC'
  },
  { 
    id: 'arbitrum', 
    name: 'Arbitrum', 
    chainId: 42161, 
    symbol: 'ETH',
    color: '#28A0F0',
    gasToken: 'ETH'
  },
  { 
    id: 'optimism', 
    name: 'Optimism', 
    chainId: 10, 
    symbol: 'ETH',
    color: '#FF0420',
    gasToken: 'ETH'
  },
];

// Trading Pairs
export const TRADING_PAIRS = [
  { symbol: 'BTC/USD', base: 'BTC', quote: 'USD' },
  { symbol: 'ETH/USD', base: 'ETH', quote: 'USD' },
  { symbol: 'BNB/USD', base: 'BNB', quote: 'USD' },
  { symbol: 'SOL/USD', base: 'SOL', quote: 'USD' },
  { symbol: 'ADA/USD', base: 'ADA', quote: 'USD' },
  { symbol: 'DOT/USD', base: 'DOT', quote: 'USD' },
  { symbol: 'MATIC/USD', base: 'MATIC', quote: 'USD' },
  { symbol: 'LINK/USD', base: 'LINK', quote: 'USD' },
];

// User Tiers
export const USER_TIERS = [
  { id: 'bronze', name: 'Bronze', color: '#CD7F32', withdrawalLimit: 10000 },
  { id: 'silver', name: 'Silver', color: '#C0C0C0', withdrawalLimit: 50000 },
  { id: 'gold', name: 'Gold', color: '#FFD700', withdrawalLimit: 100000 },
  { id: 'vip', name: 'VIP', color: '#E5E4E2', withdrawalLimit: 500000 },
];

// KYC Status
export const KYC_STATUS = {
  NOT_SUBMITTED: 'not_submitted',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// Transaction Types
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  BUY: 'buy',
  SELL: 'sell',
  TRADE: 'trade',
  GAS_PURCHASE: 'gas_purchase',
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Order Types
export const ORDER_TYPES = {
  MARKET: 'market',
  LIMIT: 'limit',
  STOP_LOSS: 'stop-loss',
};

// Timeframes for charts
export const CHART_TIMEFRAMES = [
  { value: '1m', label: '1M' },
  { value: '5m', label: '5M' },
  { value: '15m', label: '15M' },
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
  { value: '1M', label: '1MO' },
];

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Toast notification duration
export const TOAST_DURATION = 5000;

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  THEME: 'theme',
  USER: 'user',
  SETTINGS: 'settings',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  TRADE: '/trade',
  DEPOSIT: '/deposit',
  WITHDRAW: '/withdraw',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_TRANSACTIONS: '/admin/transactions',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_ANALYTICS: '/admin/analytics',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please log in again.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  WITHDRAWAL_SUBMITTED: 'Withdrawal request submitted successfully!',
  DEPOSIT_CONFIRMED: 'Deposit confirmed successfully!',
  TRADE_EXECUTED: 'Trade executed successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
};
