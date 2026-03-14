import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Filter, Calendar, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchTransactions } from '../store/walletSlice';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';

const Transactions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { transactions, transactionsPagination, loading } = useSelector((state) => state.wallet);
  
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    sortOrder: 'newest', // 'newest' or 'oldest'
    dateRange: 'all', // 'all', 'today', 'week', 'month', 'year'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadTransactions();
  }, [filters, currentPage]);

  const loadTransactions = () => {
    const params = {
      page: currentPage,
      limit: 20,
    };
    
    if (filters.type !== 'all') {
      params.type = filters.type;
    }
    
    if (filters.status !== 'all') {
      params.status = filters.status;
    }
    
    // Add date range filter
    const now = new Date();
    let startDate = null;
    
    switch (filters.dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = null;
    }
    
    if (startDate) {
      params.startDate = startDate.toISOString();
    }
    
    dispatch(fetchTransactions(params));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      sortOrder: 'newest',
      dateRange: 'all',
    });
    setCurrentPage(1);
  };

  // Sort transactions based on sortOrder
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return filters.sortOrder === 'newest' 
      ? dateB - dateA 
      : dateA - dateB;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <span className="text-green-600 text-lg">↓</span>
        </div>;
      case 'withdrawal':
        return <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-lg">↑</span>
        </div>;
      case 'trade':
        return <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <ArrowLeftRight className="w-5 h-5 text-blue-600" />
        </div>;
      default:
        return <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-gray-600">•</span>
        </div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View all your deposits, withdrawals, and trades
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="trade">Trades</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Clear all filters
            </button>
          </div>
        </motion.div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {transactionsPagination?.total || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Deposits</p>
          <p className="text-2xl font-bold text-green-600">
            {transactions.filter(t => t.type === 'deposit').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Withdrawals</p>
          <p className="text-2xl font-bold text-red-600">
            {transactions.filter(t => t.type === 'withdrawal').length}
          </p>
        </div>
      </div>

      {/* Transactions List - Mobile Card View, Desktop Table View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sortedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No transactions found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or make your first transaction
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                    <th className="px-6 py-4 font-medium">Transaction</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Crypto</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {sortedTransactions.map((tx) => (
                    <tr 
                      key={tx._id} 
                      onClick={() => navigate(`/transactions/${tx._id}`)}
                      className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(tx.type)}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {tx.type}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {tx.description || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`capitalize ${
                          tx.type === 'deposit' ? 'text-green-600' :
                          tx.type === 'withdrawal' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {(() => {
                          const crypto = tx.cryptoCurrency || tx.crypto || 'USDT';
                          // Format amount based on currency type
                          if (crypto === 'USDT' || crypto === 'USD') {
                            return formatCurrency(tx.amount);
                          } else if (crypto === 'BTC') {
                            return `${tx.amount.toFixed(8)} ${crypto}`;
                          } else if (crypto === 'ETH') {
                            return `${tx.amount.toFixed(6)} ${crypto}`;
                          } else if (crypto === 'BNB') {
                            return `${tx.amount.toFixed(6)} ${crypto}`;
                          } else {
                            return `${tx.amount.toFixed(4)} ${crypto}`;
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {tx.cryptoCurrency || tx.crypto || 'USDT'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {sortedTransactions.map((tx) => (
                <div 
                  key={tx._id} 
                  onClick={() => navigate(`/transactions/${tx._id}`)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getTransactionIcon(tx.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {tx.type}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {tx.description || formatDate(tx.createdAt)}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {(() => {
                              const crypto = tx.cryptoCurrency || tx.crypto || 'USDT';
                              if (crypto === 'USDT' || crypto === 'USD') {
                                return formatCurrency(tx.amount);
                              } else if (crypto === 'BTC') {
                                return `${tx.amount.toFixed(8)} ${crypto}`;
                              } else if (crypto === 'ETH') {
                                return `${tx.amount.toFixed(6)} ${crypto}`;
                              } else if (crypto === 'BNB') {
                                return `${tx.amount.toFixed(6)} ${crypto}`;
                              } else {
                                return `${tx.amount.toFixed(4)} ${crypto}`;
                              }
                            })()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tx.cryptoCurrency || tx.crypto || 'USDT'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {transactionsPagination && transactionsPagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                  Showing {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, transactionsPagination.total)} of {transactionsPagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(transactionsPagination.pages, prev + 1))}
                    disabled={currentPage === transactionsPagination.pages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Transactions;
