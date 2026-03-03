import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Mock cryptocurrency data
const cryptocurrencies = [
  { 
    id: 'bitcoin', 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    price: 43250.50, 
    change24h: 2.35, 
    marketCap: 850000000000, 
    volume24h: 28500000000,
    image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
  },
  { 
    id: 'ethereum', 
    symbol: 'ETH', 
    name: 'Ethereum', 
    price: 2580.75, 
    change24h: -1.20, 
    marketCap: 310000000000, 
    volume24h: 15200000000,
    image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  { 
    id: 'binancecoin', 
    symbol: 'BNB', 
    name: 'BNB', 
    price: 315.20, 
    change24h: 0.85, 
    marketCap: 48000000000, 
    volume24h: 1800000000,
    image: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
  },
  { 
    id: 'solana', 
    symbol: 'SOL', 
    name: 'Solana', 
    price: 98.45, 
    change24h: 5.60, 
    marketCap: 42000000000, 
    volume24h: 3200000000,
    image: 'https://cryptologos.cc/logos/solana-sol-logo.png'
  },
  { 
    id: 'cardano', 
    symbol: 'ADA', 
    name: 'Cardano', 
    price: 0.485, 
    change24h: -0.50, 
    marketCap: 17000000000, 
    volume24h: 450000000,
    image: 'https://cryptologos.cc/logos/cardano-ada-logo.png'
  },
  { 
    id: 'polkadot', 
    symbol: 'DOT', 
    name: 'Polkadot', 
    price: 7.25, 
    change24h: 1.20, 
    marketCap: 9800000000, 
    volume24h: 280000000,
    image: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png'
  },
  { 
    id: 'polygon', 
    symbol: 'MATIC', 
    name: 'Polygon', 
    price: 0.85, 
    change24h: 3.40, 
    marketCap: 7900000000, 
    volume24h: 520000000,
    image: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
  },
  { 
    id: 'chainlink', 
    symbol: 'LINK', 
    name: 'Chainlink', 
    price: 14.30, 
    change24h: -2.10, 
    marketCap: 8200000000, 
    volume24h: 380000000,
    image: 'https://cryptologos.cc/logos/chainlink-link-logo.png'
  },
  { 
    id: 'avalanche', 
    symbol: 'AVAX', 
    name: 'Avalanche', 
    price: 35.80, 
    change24h: 4.20, 
    marketCap: 13000000000, 
    volume24h: 650000000,
    image: 'https://cryptologos.cc/logos/avalanche-avax-logo.png'
  },
  { 
    id: 'uniswap', 
    symbol: 'UNI', 
    name: 'Uniswap', 
    price: 6.75, 
    change24h: -1.50, 
    marketCap: 5100000000, 
    volume24h: 180000000,
    image: 'https://cryptologos.cc/logos/uniswap-uni-logo.png'
  }
];

// Mock news data
const newsArticles = [
  {
    id: 1,
    title: 'Bitcoin Surges Past $43,000 as Institutional Interest Grows',
    summary: 'Major financial institutions continue to show interest in Bitcoin as the cryptocurrency maintains its upward momentum.',
    source: 'CryptoNews',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400'
  },
  {
    id: 2,
    title: 'Ethereum 2.0 Staking Reaches New Milestone',
    summary: 'The total amount of ETH staked in the Ethereum 2.0 deposit contract has reached a new all-time high.',
    source: 'BlockchainDaily',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400'
  },
  {
    id: 3,
    title: 'Regulatory Clarity Boosts Crypto Market Confidence',
    summary: 'New regulatory frameworks in major economies provide clearer guidelines for cryptocurrency operations.',
    source: 'FinanceToday',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400'
  },
  {
    id: 4,
    title: 'DeFi Protocol Launches Revolutionary Yield Farming',
    summary: 'A new decentralized finance protocol promises higher yields with improved security measures.',
    source: 'DeFiWeekly',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    image: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400'
  },
  {
    id: 5,
    title: 'NFT Market Shows Signs of Recovery',
    summary: 'Trading volumes in the NFT space have increased significantly over the past week.',
    source: 'NFTInsider',
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400'
  }
];

// @route   GET /api/market/prices
// @desc    Get current cryptocurrency prices
// @access  Public
router.get('/prices', async (req, res) => {
  try {
    // Simulate price updates
    const updatedPrices = cryptocurrencies.map(crypto => ({
      ...crypto,
      price: crypto.price * (1 + (Math.random() * 0.02 - 0.01)),
      change24h: crypto.change24h + (Math.random() * 0.5 - 0.25)
    }));
    
    res.json({
      success: true,
      prices: updatedPrices
    });
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/market/tickers
// @desc    Get all market tickers
// @access  Public
router.get('/tickers', async (req, res) => {
  try {
    const tickers = cryptocurrencies.map(crypto => ({
      symbol: crypto.symbol,
      price: crypto.price,
      change24h: crypto.change24h,
      volume24h: crypto.volume24h,
      high24h: crypto.price * 1.05,
      low24h: crypto.price * 0.95
    }));
    
    res.json({
      success: true,
      tickers
    });
  } catch (error) {
    console.error('Get tickers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/market/chart/:symbol
// @desc    Get chart data for a cryptocurrency
// @access  Private
router.get('/chart/:symbol', protect, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1d' } = req.query;
    
    const crypto = cryptocurrencies.find(c => c.symbol === symbol.toUpperCase()) || cryptocurrencies[0];
    
    // Generate mock chart data
    const dataPoints = timeframe === '1h' ? 60 : timeframe === '1d' ? 24 : timeframe === '1w' ? 7 : 30;
    const chartData = [];
    
    let currentPrice = crypto.price;
    const now = Date.now();
    
    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = now - (i * (timeframe === '1h' ? 60000 : timeframe === '1d' ? 3600000 : timeframe === '1w' ? 86400000 : 86400000));
      const change = (Math.random() - 0.5) * 0.02;
      currentPrice = currentPrice * (1 + change);
      
      chartData.push({
        timestamp,
        price: currentPrice,
        volume: Math.random() * 1000000
      });
    }
    
    res.json({
      success: true,
      symbol,
      timeframe,
      data: chartData
    });
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/market/news
// @desc    Get cryptocurrency news
// @access  Private
router.get('/news', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedNews = newsArticles.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      news: paginatedNews,
      pagination: {
        page,
        limit,
        total: newsArticles.length,
        pages: Math.ceil(newsArticles.length / limit)
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/market/trends
// @desc    Get market trends
// @access  Private
router.get('/trends', protect, async (req, res) => {
  try {
    // Calculate trends
    const topGainers = [...cryptocurrencies]
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 5);
    
    const topLosers = [...cryptocurrencies]
      .sort((a, b) => a.change24h - b.change24h)
      .slice(0, 5);
    
    const mostTraded = [...cryptocurrencies]
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 5);
    
    res.json({
      success: true,
      trends: {
        topGainers,
        topLosers,
        mostTraded
      }
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
