import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fuel, 
  Search, 
  User, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  History,
  RefreshCw
} from 'lucide-react';

const AdminGasFee = () => {
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Gas fee credit');
  const [transactionDate, setTransactionDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Search for users
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await axios.get(`/api/admin/users?search=${encodeURIComponent(searchQuery)}&limit=10`);
      setSearchResults(response.data.users || []);
    } catch (err) {
      console.error('Search error:', err);
      setNotification({ message: 'Failed to search users', type: 'error' });
    } finally {
      setSearching(false);
    }
  };

  // Fetch recent gas fee transactions
  const fetchRecentTransactions = async () => {
    setLoadingHistory(true);
    try {
      const response = await axios.get('/api/admin/transactions?limit=50');
      const gasTransactions = (response.data.transactions || [])
        .filter(t => t.type === 'gas_purchase')
        .slice(0, 20);
      setRecentTransactions(gasTransactions);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setNotification({ message: 'Please select a user', type: 'error' });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setNotification({ message: 'Please enter a valid amount', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/admin/user/${selectedUser._id}/gas-fee`, {
        amount: parseFloat(amount),
        description,
        transactionDate: transactionDate || undefined
      });

      setNotification({ 
        message: response.data.message || 'Gas fee credit added successfully', 
        type: 'success' 
      });
      
      // Reset form
      setSelectedUser(null);
      setAmount('');
      setDescription('Gas fee credit');
      setTransactionDate('');
      setSearchQuery('');
      setSearchResults([]);
      
      // Refresh history
      fetchRecentTransactions();
    } catch (err) {
      console.error('Gas fee error:', err);
      setNotification({ 
        message: err.response?.data?.message || 'Failed to add gas fee credit', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '0.00';
    return parseFloat(amount).toFixed(2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Fuel className="w-8 h-8 text-purple-600" />
          Gas Fee Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add USDT gas fee credits to user accounts manually
        </p>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Gas Fee Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            Add Gas Fee Credit
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search User
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && !selectedUser && (
                <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchResults([]);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected User */}
              {selectedUser && (
                <div className="mt-2 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedUser.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          Balance: {formatAmount(selectedUser.balance?.USDT)} USDT
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (USDT)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Gas fee credit"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Transaction Date (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use current date and time
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedUser}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Fuel className="w-5 h-5" />
                  Add Gas Fee Credit
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              Recent Gas Fee Credits
            </h2>
            <button
              onClick={fetchRecentTransactions}
              disabled={loadingHistory}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {loadingHistory ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Fuel className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No gas fee transactions yet</p>
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div
                  key={tx._id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Fuel className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          +{formatAmount(tx.amount)} USDT
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {tx.userId?.username || 'Unknown User'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(tx.createdAt)}
                      </p>
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    </div>
                  </div>
                  {tx.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-13">
                      {tx.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGasFee;
