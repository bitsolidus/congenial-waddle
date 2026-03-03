import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react';
import { fetchBalance } from '../store/walletSlice';
import { fetchCryptoPrices } from '../store/cryptoSlice';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { convertFromUSD, formatCurrencyWithSymbol } from '../utils/currency';
import { TRADING_PAIRS, ORDER_TYPES } from '../utils/constants';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import axios from 'axios';

const Trade = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);
  const { prices } = useSelector((state) => state.crypto);
  
  // Get user's currency preference
  const userCurrency = user?.currency || 'USD';
  
  const [selectedPair, setSelectedPair] = useState(TRADING_PAIRS[0]);
  const [orderType, setOrderType] = useState('market');
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get real-time price for selected pair
  const currentPrice = prices?.[selectedPair.base]?.price || 0;
  const priceChange24h = prices?.[selectedPair.base]?.change24h || 0;

  useEffect(() => {
    dispatch(fetchBalance());
    dispatch(fetchCryptoPrices());
    fetchOrderBook();
    fetchChartData();
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
    }
  };

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    // Validation
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
    } catch (err) {
      console.error('Trade failed:', err);
      setError(err.response?.data?.message || 'Trade failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trade</h1>
          <p className="text-gray-600 dark:text-gray-400">Buy and sell cryptocurrencies</p>
        </div>
        
        {/* Pair Selector */}
        <div className="relative">
          <select
            value={selectedPair.symbol}
            onChange={(e) => {
              const pair = TRADING_PAIRS.find(p => p.symbol === e.target.value);
              setSelectedPair(pair);
            }}
            className="input-field pr-10 appearance-none cursor-pointer"
          >
            {TRADING_PAIRS.map((pair) => (
              <option key={pair.symbol} value={pair.symbol}>
                {pair.symbol}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Header */}
          <div className="card flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPair.symbol}</p>
                <button 
                  onClick={() => dispatch(fetchCryptoPrices())}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="Refresh prices"
                >
                  <RefreshCw className="h-3 w-3 text-gray-400" />
                </button>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentPrice > 0 ? (
                  userCurrency !== 'USD' 
                    ? formatCurrencyWithSymbol(convertFromUSD(currentPrice, userCurrency), userCurrency)
                    : formatCurrency(currentPrice)
                ) : 'Loading...'}
              </p>
              <p className={`text-sm flex items-center mt-1 ${priceChange24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {priceChange24h >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">24h High</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentPrice > 0 ? (
                  userCurrency !== 'USD' 
                    ? formatCurrencyWithSymbol(convertFromUSD(currentPrice * 1.02, userCurrency), userCurrency)
                    : formatCurrency(currentPrice * 1.02)
                ) : '-'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">24h Low</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentPrice > 0 ? (
                  userCurrency !== 'USD' 
                    ? formatCurrencyWithSymbol(convertFromUSD(currentPrice * 0.98, userCurrency), userCurrency)
                    : formatCurrency(currentPrice * 0.98)
                ) : '-'}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="card h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="timestamp" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [
                    userCurrency !== 'USD' 
                      ? formatCurrencyWithSymbol(convertFromUSD(value, userCurrency), userCurrency)
                      : formatCurrency(value), 
                    'Price'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Book */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order Book</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Spread: <span className="font-medium text-gray-900 dark:text-white">{orderBook.spread || '0.00'}</span>
                </span>
                <button
                  onClick={fetchOrderBook}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="Refresh order book"
                >
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Order Book Header */}
            <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400 px-2">
              <span>Price ({userCurrency})</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Total</span>
            </div>
            
            {/* Asks (Sell Orders) - Red, displayed in reverse (highest first) */}
            <div className="space-y-0.5 mb-2">
              {orderBook.asks?.slice(0, 8).map((ask, i) => {
                const price = parseFloat(ask.price);
                const amount = parseFloat(ask.amount);
                const total = parseFloat(ask.total);
                const maxTotal = Math.max(...(orderBook.asks?.map(a => parseFloat(a.total)) || [1]));
                const depth = (total / maxTotal) * 100;
                
                return (
                  <div 
                    key={`ask-${i}`} 
                    className="grid grid-cols-3 gap-2 text-sm py-1 px-2 rounded hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer transition-colors relative overflow-hidden"
                    onClick={() => {
                      setPrice(ask.price);
                      setActiveTab('buy');
                    }}
                  >
                    {/* Depth bar */}
                    <div 
                      className="absolute right-0 top-0 h-full bg-red-500/10 dark:bg-red-500/20"
                      style={{ width: `${depth}%` }}
                    />
                    <span className="relative text-red-600 dark:text-red-400 font-medium">
                      {userCurrency !== 'USD' 
                        ? formatCurrencyWithSymbol(convertFromUSD(price, userCurrency), userCurrency)
                        : formatCurrency(price)}
                    </span>
                    <span className="relative text-right text-gray-700 dark:text-gray-300">{amount.toFixed(4)}</span>
                    <span className="relative text-right text-gray-500 dark:text-gray-400">
                      {userCurrency !== 'USD' 
                        ? formatCurrencyWithSymbol(convertFromUSD(total, userCurrency), userCurrency)
                        : formatCurrency(total)}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Current Price Indicator */}
            <div className="py-3 border-y border-gray-200 dark:border-gray-700 text-center">
              <span className={`text-2xl font-bold ${priceChange24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {currentPrice > 0 ? (
                  userCurrency !== 'USD' 
                    ? formatCurrencyWithSymbol(convertFromUSD(currentPrice, userCurrency), userCurrency)
                    : formatCurrency(currentPrice)
                ) : '-'}
              </span>
              <span className={`ml-2 text-sm ${priceChange24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            </div>
            
            {/* Bids (Buy Orders) - Green */}
            <div className="space-y-0.5 mt-2">
              {orderBook.bids?.slice(0, 8).map((bid, i) => {
                const price = parseFloat(bid.price);
                const amount = parseFloat(bid.amount);
                const total = parseFloat(bid.total);
                const maxTotal = Math.max(...(orderBook.bids?.map(b => parseFloat(b.total)) || [1]));
                const depth = (total / maxTotal) * 100;
                
                return (
                  <div 
                    key={`bid-${i}`} 
                    className="grid grid-cols-3 gap-2 text-sm py-1 px-2 rounded hover:bg-green-50 dark:hover:bg-green-900/10 cursor-pointer transition-colors relative overflow-hidden"
                    onClick={() => {
                      setPrice(bid.price);
                      setActiveTab('sell');
                    }}
                  >
                    {/* Depth bar */}
                    <div 
                      className="absolute right-0 top-0 h-full bg-green-500/10 dark:bg-green-500/20"
                      style={{ width: `${depth}%` }}
                    />
                    <span className="relative text-green-600 dark:text-green-400 font-medium">
                      {userCurrency !== 'USD' 
                        ? formatCurrencyWithSymbol(convertFromUSD(price, userCurrency), userCurrency)
                        : formatCurrency(price)}
                    </span>
                    <span className="relative text-right text-gray-700 dark:text-gray-300">{amount.toFixed(4)}</span>
                    <span className="relative text-right text-gray-500 dark:text-gray-400">
                      {userCurrency !== 'USD' 
                        ? formatCurrencyWithSymbol(convertFromUSD(total, userCurrency), userCurrency)
                        : formatCurrency(total)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trading Form */}
        <div className="card">
          {/* Buy/Sell Tabs */}
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-3 text-center font-medium rounded-l-lg transition-colors ${
                activeTab === 'buy'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-crypto-bg text-gray-700 dark:text-gray-300'
              }`}
            >
              Buy {selectedPair.base}
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-3 text-center font-medium rounded-r-lg transition-colors ${
                activeTab === 'sell'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-crypto-bg text-gray-700 dark:text-gray-300'
              }`}
            >
              Sell {selectedPair.base}
            </button>
          </div>

          {/* Order Type */}
          <div className="flex space-x-2 mb-6">
            {Object.values(ORDER_TYPES).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  orderType === type
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'bg-gray-100 dark:bg-crypto-bg text-gray-600 dark:text-gray-400'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
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
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-field"
                  placeholder="0.00"
                  required
                />
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
                className="input-field"
                placeholder="0.00"
                required
              />
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Available: {userCurrency !== 'USD' 
                    ? formatCurrencyWithSymbol(convertFromUSD(balance?.total || 0, userCurrency), userCurrency)
                    : formatCurrency(balance?.total || 0)}
                </span>
                <button
                  type="button"
                  onClick={() => setAmount(((balance?.total || 0) / currentPrice).toFixed(6))}
                  className="text-primary-600 hover:text-primary-500"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 dark:bg-crypto-bg rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {userCurrency !== 'USD' 
                    ? formatCurrencyWithSymbol(
                        convertFromUSD((parseFloat(amount) || 0) * (parseFloat(price) || currentPrice), userCurrency), 
                        userCurrency
                      )
                    : formatCurrency((parseFloat(amount) || 0) * (parseFloat(price) || currentPrice))}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                activeTab === 'buy'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              } disabled:opacity-50`}
            >
              {isLoading ? 'Processing...' : `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${selectedPair.base}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Trade;
