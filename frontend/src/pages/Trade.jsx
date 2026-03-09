import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown,
  RefreshCw,
  Star,
  StarOff,
  BarChart3,
  LineChart,
  Layers,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  MoreHorizontal,
  Plus,
  Minus
} from 'lucide-react';
import { fetchBalance } from '../store/walletSlice';
import { fetchCryptoPrices } from '../store/cryptoSlice';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { convertFromUSD, formatCurrencyWithSymbol } from '../utils/currency';
import { TRADING_PAIRS, ORDER_TYPES } from '../utils/constants';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import axios from 'axios';

const Trade = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);
  const { prices } = useSelector((state) => state.crypto);
  
  const userCurrency = user?.currency || 'USD';
  
  const [selectedPair, setSelectedPair] = useState(TRADING_PAIRS[0]);
  const [orderType, setOrderType] = useState('market');
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPairDropdown, setShowPairDropdown] = useState(false);
  const [favorites, setFavorites] = useState(['BTC/USDT', 'ETH/USDT']);
  const [chartType, setChartType] = useState('area'); // 'area' | 'line'
  const [timeframe, setTimeframe] = useState('1D');
  const [recentTrades, setRecentTrades] = useState([]);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  
  const dropdownRef = useRef(null);

  const currentPrice = prices?.[selectedPair.base]?.price || 0;
  const priceChange24h = prices?.[selectedPair.base]?.change24h || 0;

  useEffect(() => {
    dispatch(fetchBalance());
    dispatch(fetchCryptoPrices());
    fetchOrderBook();
    fetchChartData();
    fetchRecentTrades();
  }, [dispatch, selectedPair]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPairDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-refresh prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchCryptoPrices());
      fetchOrderBook();
      fetchRecentTrades();
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch, selectedPair]);

  const fetchOrderBook = async () => {
    try {
      const response = await axios.get(`/api/trade/orderbook/${selectedPair.symbol}`);
      setOrderBook(response.data.orderBook);
    } catch (err) {
      console.error('Failed to fetch order book');
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get(`/api/market/chart/${selectedPair.base}`);
      setChartData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch chart data');
      // Generate mock data if API fails
      generateMockChartData();
    }
  };

  const fetchRecentTrades = async () => {
    try {
      const response = await axios.get(`/api/trade/recent/${selectedPair.symbol}`);
      setRecentTrades(response.data.trades || []);
    } catch (err) {
      console.error('Failed to fetch recent trades');
      // Generate mock data if API fails
      generateMockRecentTrades();
    }
  };

  const generateMockChartData = () => {
    const data = [];
    let basePrice = currentPrice || 50000;
    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * basePrice * 0.02;
      basePrice += change;
      data.push({
        timestamp: new Date(Date.now() - (100 - i) * 60000).toLocaleTimeString(),
        price: basePrice,
        volume: Math.random() * 100
      });
    }
    setChartData(data);
  };

  const generateMockRecentTrades = () => {
    const trades = [];
    let basePrice = currentPrice || 50000;
    for (let i = 0; i < 20; i++) {
      const isBuy = Math.random() > 0.5;
      const change = (Math.random() - 0.5) * basePrice * 0.001;
      basePrice += change;
      trades.push({
        id: i,
        price: basePrice,
        amount: (Math.random() * 2).toFixed(6),
        total: (basePrice * Math.random() * 2).toFixed(2),
        time: new Date(Date.now() - i * 30000).toLocaleTimeString(),
        type: isBuy ? 'buy' : 'sell'
      });
    }
    setRecentTrades(trades);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setIsLoading(false);
      return;
    }
    
    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      setError('Please enter a valid price for limit order');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.post(`/api/trade/${activeTab}`, {
        pair: selectedPair.symbol,
        amount: parseFloat(amount),
        price: orderType === 'limit' ? parseFloat(price) : undefined,
        orderType,
      });
      setSuccess(response.data.message || `${activeTab === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);
      dispatch(fetchBalance());
      setAmount('');
      setPrice('');
      fetchOrderBook();
      fetchRecentTrades();
    } catch (err) {
      console.error('Trade failed:', err);
      setError(err.response?.data?.message || 'Trade failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePercentClick = (percent) => {
    const available = balance?.total || 0;
    const maxAmount = available / currentPrice;
    setAmount((maxAmount * (percent / 100)).toFixed(6));
  };

  const toggleFavorite = (symbol) => {
    if (favorites.includes(symbol)) {
      setFavorites(favorites.filter(f => f !== symbol));
    } else {
      setFavorites([...favorites, symbol]);
    }
  };

  const formatPrice = (value) => {
    if (!value) return '0.00';
    return userCurrency !== 'USD' 
      ? formatCurrencyWithSymbol(convertFromUSD(value, userCurrency), userCurrency)
      : formatCurrency(value);
  };

  const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Price Ticker */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center gap-6 overflow-x-auto text-sm">
          {TRADING_PAIRS.slice(0, 6).map((pair) => {
            const pairPrice = prices?.[pair.base]?.price || 0;
            const pairChange = prices?.[pair.base]?.change24h || 0;
            return (
              <div 
                key={pair.symbol} 
                className={`flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  selectedPair.symbol === pair.symbol ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => setSelectedPair(pair)}
              >
                <span className="font-medium">{pair.symbol}</span>
                <span className={pairChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatPrice(pairPrice).replace(/[^0-9.,]/g, '')}
                </span>
                <span className={`text-xs ${pairChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {pairChange >= 0 ? '+' : ''}{pairChange.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar - Pair List */}
        <div className="hidden xl:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Markets</h3>
              <button onClick={() => dispatch(fetchCryptoPrices())} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-1">
              {TRADING_PAIRS.map((pair) => {
                const pairPrice = prices?.[pair.base]?.price || 0;
                const pairChange = prices?.[pair.base]?.change24h || 0;
                return (
                  <div
                    key={pair.symbol}
                    onClick={() => setSelectedPair(pair)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPair.symbol === pair.symbol 
                        ? 'bg-purple-50 dark:bg-purple-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(pair.symbol); }}
                        className="text-gray-400 hover:text-yellow-500"
                      >
                        {favorites.includes(pair.symbol) ? (
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </button>
                      <span className="font-medium text-gray-900 dark:text-white">{pair.base}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${pairChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPrice(pairPrice).replace(/[^0-9.,]/g, '')}
                      </div>
                      <div className={`text-xs ${pairChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {pairChange >= 0 ? '+' : ''}{pairChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 space-y-4">
          {/* Chart Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Pair Selector Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowPairDropdown(!showPairDropdown)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="font-bold text-gray-900 dark:text-white">{selectedPair.symbol}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  <AnimatePresence>
                    {showPairDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                      >
                        {TRADING_PAIRS.map((pair) => (
                          <button
                            key={pair.symbol}
                            onClick={() => { setSelectedPair(pair); setShowPairDropdown(false); }}
                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                          >
                            <span className="font-medium text-gray-900 dark:text-white">{pair.symbol}</span>
                            <span className="text-sm text-gray-500">
                              {formatPrice(prices?.[pair.base]?.price || 0).replace(/[^0-9.,]/g, '')}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Price Display */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPrice(currentPrice)}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      priceChange24h >= 0 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {priceChange24h >= 0 ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                      {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        timeframe === tf
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setChartType('area')}
                    className={`p-1.5 rounded transition-colors ${
                      chartType === 'area' ? 'bg-white dark:bg-gray-600 shadow' : ''
                    }`}
                  >
                    <LineChart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`p-1.5 rounded transition-colors ${
                      chartType === 'line' ? 'bg-white dark:bg-gray-600 shadow' : ''
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">24h High</span>
                <p className="font-medium text-gray-900 dark:text-white">{formatPrice(currentPrice * 1.02)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">24h Low</span>
                <p className="font-medium text-gray-900 dark:text-white">{formatPrice(currentPrice * 0.98)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">24h Volume</span>
                <p className="font-medium text-gray-900 dark:text-white">{formatNumber(Math.random() * 1000000)} {selectedPair.base}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Market Cap</span>
                <p className="font-medium text-gray-900 dark:text-white">{formatPrice(currentPrice * 19000000)}</p>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={priceChange24h >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={priceChange24h >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [formatPrice(value), 'Price']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={priceChange24h >= 0 ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <XAxis dataKey="timestamp" hide />
                  <YAxis hide />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="volume" fill={priceChange24h >= 0 ? '#10b981' : '#ef4444'} opacity={0.8} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Order Book and Recent Trades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Order Book */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Order Book
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Spread: <span className="text-gray-900 dark:text-white">{orderBook.spread || '0.01%'}</span>
                  </span>
                  <button onClick={fetchOrderBook} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Header */}
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400 px-2 mb-2">
                <span>Price ({userCurrency})</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Total</span>
              </div>

              {/* Asks */}
              <div className="space-y-0.5 mb-2 max-h-40 overflow-y-auto">
                {orderBook.asks?.slice(0, 10).reverse().map((ask, i) => {
                  const askPrice = parseFloat(ask.price);
                  const askAmount = parseFloat(ask.amount);
                  const askTotal = parseFloat(ask.total);
                  const maxTotal = Math.max(...(orderBook.asks?.map(a => parseFloat(a.total)) || [1]));
                  const depth = (askTotal / maxTotal) * 100;
                  
                  return (
                    <div 
                      key={`ask-${i}`} 
                      className="grid grid-cols-3 gap-2 text-xs py-1.5 px-2 rounded hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer relative overflow-hidden"
                      onClick={() => { setPrice(ask.price); setOrderType('limit'); }}
                    >
                      <div className="absolute right-0 top-0 h-full bg-red-500/10" style={{ width: `${depth}%` }} />
                      <span className="relative text-red-500 font-medium">{formatPrice(askPrice).replace(/[^0-9.,]/g, '')}</span>
                      <span className="relative text-right text-gray-700 dark:text-gray-300">{askAmount.toFixed(4)}</span>
                      <span className="relative text-right text-gray-500">{formatPrice(askTotal).replace(/[^0-9.,]/g, '')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Current Price */}
              <div className="py-2 border-y border-gray-200 dark:border-gray-700 text-center">
                <span className={`text-lg font-bold ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPrice(currentPrice)}
                </span>
              </div>

              {/* Bids */}
              <div className="space-y-0.5 mt-2 max-h-40 overflow-y-auto">
                {orderBook.bids?.slice(0, 10).map((bid, i) => {
                  const bidPrice = parseFloat(bid.price);
                  const bidAmount = parseFloat(bid.amount);
                  const bidTotal = parseFloat(bid.total);
                  const maxTotal = Math.max(...(orderBook.bids?.map(b => parseFloat(b.total)) || [1]));
                  const depth = (bidTotal / maxTotal) * 100;
                  
                  return (
                    <div 
                      key={`bid-${i}`} 
                      className="grid grid-cols-3 gap-2 text-xs py-1.5 px-2 rounded hover:bg-green-50 dark:hover:bg-green-900/10 cursor-pointer relative overflow-hidden"
                      onClick={() => { setPrice(bid.price); setOrderType('limit'); }}
                    >
                      <div className="absolute right-0 top-0 h-full bg-green-500/10" style={{ width: `${depth}%` }} />
                      <span className="relative text-green-500 font-medium">{formatPrice(bidPrice).replace(/[^0-9.,]/g, '')}</span>
                      <span className="relative text-right text-gray-700 dark:text-gray-300">{bidAmount.toFixed(4)}</span>
                      <span className="relative text-right text-gray-500">{formatPrice(bidTotal).replace(/[^0-9.,]/g, '')}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Trades
                </h3>
                <button onClick={fetchRecentTrades} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Header */}
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 dark:text-gray-400 px-2 mb-2">
                <span>Price</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Total</span>
                <span className="text-right">Time</span>
              </div>

              {/* Trades List */}
              <div className="space-y-0.5 max-h-80 overflow-y-auto">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="grid grid-cols-4 gap-2 text-xs py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <span className={trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                      {formatPrice(trade.price).replace(/[^0-9.,]/g, '')}
                    </span>
                    <span className="text-right text-gray-700 dark:text-gray-300">{trade.amount}</span>
                    <span className="text-right text-gray-500">{formatPrice(trade.total).replace(/[^0-9.,]/g, '')}</span>
                    <span className="text-right text-gray-500">{trade.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Order Form */}
        <div className="w-full lg:w-80 bg-white dark:bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 p-4">
          {/* Buy/Sell Tabs */}
          <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-2.5 text-center font-medium rounded-md transition-all ${
                activeTab === 'buy'
                  ? 'bg-green-500 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-2.5 text-center font-medium rounded-md transition-all ${
                activeTab === 'sell'
                  ? 'bg-red-500 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Order Type */}
          <div className="flex space-x-2 mb-4">
            {['market', 'limit'].map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  orderType === type
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Price Input (for limit orders) */}
            {orderType === 'limit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price ({userCurrency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPrice(currentPrice.toFixed(2))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-purple-600 hover:text-purple-500"
                  >
                    Current
                  </button>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount ({selectedPair.base})
              </label>
              <input
                type="number"
                step="0.000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
              
              {/* Percentage Buttons */}
              <div className="flex gap-2 mt-2">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    onClick={() => handlePercentClick(percent)}
                    className="flex-1 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>

            {/* Available Balance */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Available</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatPrice(balance?.total || 0)}
                </span>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatPrice((parseFloat(amount) || 0) * (parseFloat(price) || currentPrice))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Fee (0.1%)</span>
                <span className="text-gray-900 dark:text-white">
                  {formatPrice((parseFloat(amount) || 0) * (parseFloat(price) || currentPrice) * 0.001)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !amount}
              className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
                activeTab === 'buy'
                  ? 'bg-green-500 hover:bg-green-600 disabled:bg-green-300'
                  : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
              } disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${selectedPair.base}`
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Market orders execute immediately at current market price. Limit orders only execute when the market reaches your specified price.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
