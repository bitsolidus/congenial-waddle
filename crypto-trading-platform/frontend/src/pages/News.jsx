import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ArrowRight,
  Filter,
  Bell,
  Newspaper,
  Bitcoin,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchCryptoPrices } from '../store/cryptoSlice';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';
import Pagination from '../components/Pagination';

const News = () => {
  const dispatch = useDispatch();
  const { prices } = useSelector((state) => state.crypto);
  const { config: siteConfig } = useSelector((state) => state.siteConfig);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');
  const [tickerOffset, setTickerOffset] = useState(0);

  // Fetch crypto prices on mount
  useEffect(() => {
    dispatch(fetchCryptoPrices());
    // Refresh prices every 60 seconds
    const priceInterval = setInterval(() => {
      dispatch(fetchCryptoPrices());
    }, 60000);
    return () => clearInterval(priceInterval);
  }, [dispatch]);

  // Auto-scrolling news ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const marketUpdates = [
    { symbol: 'BTC', name: 'Bitcoin', price: prices?.BTC?.price || 65000, change: prices?.BTC?.change24h || 0 },
    { symbol: 'ETH', name: 'Ethereum', price: prices?.ETH?.price || 3500, change: prices?.ETH?.change24h || 0 },
    { symbol: 'BNB', name: 'BNB', price: prices?.BNB?.price || 600, change: prices?.BNB?.change24h || 0 },
    { symbol: 'USDT', name: 'Tether', price: prices?.USDT?.price || 1.00, change: prices?.USDT?.change24h || 0 },
    { symbol: 'SOL', name: 'Solana', price: 98.76, change: 5.67 },
    { symbol: 'ADA', name: 'Cardano', price: 0.58, change: -2.45 },
    { symbol: 'DOT', name: 'Polkadot', price: 7.89, change: 1.23 },
    { symbol: 'AVAX', name: 'Avalanche', price: 34.56, change: 3.45 },
  ];

  const filters = [
    { id: 'all', name: 'All News' },
    { id: 'market', name: 'Market Updates' },
    { id: 'company', name: 'Company News' },
    { id: 'regulation', name: 'Regulation' },
    { id: 'technology', name: 'Technology' },
  ];

  const newsItems = [
    {
      id: 1,
      title: 'Bitcoin Surges Past $45,000 as ETF Approval Hopes Rise',
      excerpt: 'The world\'s largest cryptocurrency gained momentum following positive regulatory signals from the SEC regarding spot Bitcoin ETFs.',
      image: 'https://images.unsplash.com/photo-1518546305927-5fef28a66643?auto=format&fit=crop&q=80&w=600',
      category: 'Market Updates',
      time: '2 hours ago',
      source: `${siteConfig?.siteName || 'BitSolidus'} News`,
      trending: true,
    },
    {
      id: 2,
      title: `${siteConfig?.siteName || 'BitSolidus'} Expands Operations to 50 New Countries`,
      excerpt: `In a major expansion move, ${siteConfig?.siteName || 'BitSolidus'} now serves customers across 150 countries with localized payment options.`,
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600',
      category: 'Company News',
      time: '4 hours ago',
      source: 'Press Release',
      trending: false,
    },
    {
      id: 3,
      title: 'Ethereum Layer 2 Solutions See Record Adoption',
      excerpt: 'Arbitrum and Optimism process over 5 million transactions daily as users seek lower fees and faster confirmation times.',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=600',
      category: 'Technology',
      time: '6 hours ago',
      source: 'Tech Analysis',
      trending: true,
    },
    {
      id: 4,
      title: 'New Crypto Regulations Proposed in European Union',
      excerpt: 'The EU parliament introduces comprehensive framework for digital asset service providers with focus on consumer protection.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600',
      category: 'Regulation',
      time: '8 hours ago',
      source: 'Regulatory Watch',
      trending: false,
    },
    {
      id: 5,
      title: 'DeFi Protocol Reaches $10 Billion Total Value Locked',
      excerpt: 'Major decentralized finance platform hits milestone as institutional investors increase exposure to yield farming.',
      image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=600',
      category: 'Market Updates',
      time: '12 hours ago',
      source: 'DeFi Report',
      trending: true,
    },
    {
      id: 6,
      title: `${siteConfig?.siteName || 'BitSolidus'} Launches New Mobile App Features`,
      excerpt: 'Enhanced portfolio tracking, price alerts, and biometric security now available on iOS and Android platforms.',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600',
      category: 'Company News',
      time: '1 day ago',
      source: 'Product Update',
      trending: false,
    },
    {
      id: 7,
      title: 'Central Bank Digital Currencies: Global Progress Report',
      excerpt: 'Over 130 countries are now exploring CBDCs with several pilot programs showing promising results.',
      image: 'https://images.unsplash.com/photo-1565514020176-db9c2a4a5199?auto=format&fit=crop&q=80&w=600',
      category: 'Regulation',
      time: '1 day ago',
      source: 'Global Finance',
      trending: false,
    },
    {
      id: 8,
      title: 'AI and Blockchain Convergence: The Next Frontier',
      excerpt: 'How artificial intelligence is transforming crypto trading, security, and decentralized applications.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600',
      category: 'Technology',
      time: '2 days ago',
      source: 'Tech Insights',
      trending: true,
    },
  ];

  const filteredNews = activeFilter === 'all' 
    ? newsItems 
    : newsItems.filter(item => item.category.toLowerCase().replace(' ', '-') === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Breadcrumb />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
              <Newspaper className="w-4 h-4 mr-2" />
              Latest News
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Crypto Market News
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Stay informed with real-time updates on cryptocurrency markets, regulations, and industry developments.
            </p>
          </motion.div>
        </div>
      </section>

      {/* News Ticker */}
      <div className="bg-gray-900 text-white py-3 overflow-hidden">
        <div className="flex items-center">
          <div className="flex-shrink-0 px-4 border-r border-gray-700">
            <span className="flex items-center text-sm font-medium text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              LIVE MARKETS
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div 
              className="flex space-x-8 whitespace-nowrap"
              style={{ transform: `translateX(-${tickerOffset}px)` }}
            >
              {[...marketUpdates, ...marketUpdates].map((crypto, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Bitcoin className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium">{crypto.symbol}</span>
                  <span className="text-gray-400">${crypto.price.toLocaleString(undefined, { minimumFractionDigits: crypto.price < 10 ? 2 : 0, maximumFractionDigits: 2 })}</span>
                  <span className={`flex items-center ${crypto.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {crypto.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {Math.abs(crypto.change).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
            <button className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-medium">
              <Bell className="w-5 h-5" />
              <span>Subscribe to Alerts</span>
            </button>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main News Column */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {filteredNews.map((news, index) => (
                  <motion.article
                    key={news.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3">
                      <div className="relative h-48 md:h-auto">
                        <img 
                          src={news.image}
                          alt={news.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {news.trending && (
                          <div className="absolute top-4 left-4">
                            <span className="flex items-center px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2 p-6">
                        <div className="flex items-center space-x-4 mb-3">
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
                            {news.category}
                          </span>
                          <span className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {news.time}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {news.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {news.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{news.source}</span>
                          <Link
                            to="#"
                            className="flex items-center text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300"
                          >
                            Read More
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={5}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Trending Topics */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
                  Trending Topics
                </h3>
                <div className="space-y-3">
                  {['Bitcoin ETF', 'Ethereum 2.0', 'DeFi Yields', 'NFT Market', 'Regulation'].map((topic, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{topic}</span>
                      <span className="text-sm text-gray-500">{100 - i * 15}K mentions</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-500" />
                  Market Overview
                </h3>
                <div className="space-y-4">
                  {marketUpdates.slice(0, 5).map((crypto) => (
                    <div key={crypto.symbol} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                          {crypto.symbol[0]}
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">{crypto.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 dark:text-white">${crypto.price.toLocaleString(undefined, { minimumFractionDigits: crypto.price < 10 ? 2 : 0, maximumFractionDigits: 2 })}</div>
                        <div className={`text-sm ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
                <p className="text-white/80 text-sm mb-4">
                  Get the latest crypto news delivered to your inbox daily.
                </p>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 rounded-lg text-gray-900 mb-3 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="w-full py-2 bg-gray-900 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
