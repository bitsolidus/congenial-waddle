import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Bitcoin,
  Settings,
  X,
  Save,
  Loader2,
  Eye
} from 'lucide-react';

const AdminWithdrawalManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Edit states
  const [editConfirmations, setEditConfirmations] = useState(0);
  const [editRequiredConfirmations, setEditRequiredConfirmations] = useState(3);
  const [editStatus, setEditStatus] = useState('');
  const [editConfirmationStatus, setEditConfirmationStatus] = useState('');

  const itemsPerPage = 20;

  useEffect(() => {
    fetchWithdrawals();
  }, [currentPage, filterStatus]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/admin/transactions?page=${currentPage}&limit=${itemsPerPage}`);
      
      let filteredWithdrawals = (response.data.transactions || [])
        .filter(t => t.type === 'withdrawal');
      
      // Apply status filter
      if (filterStatus !== 'all') {
        filteredWithdrawals = filteredWithdrawals.filter(w => 
          w.confirmationStatus === filterStatus || w.status === filterStatus
        );
      }
      
      // Apply search filter
      if (searchTerm) {
        filteredWithdrawals = filteredWithdrawals.filter(w => 
          w.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.transactionHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.toAddress?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setWithdrawals(filteredWithdrawals);
      setTotalPages(Math.ceil((response.data.total || filteredWithdrawals.length) / itemsPerPage));
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err);
      setError(err.response?.data?.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWithdrawals();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchWithdrawals();
  };

  const viewWithdrawalDetail = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setEditConfirmations(withdrawal.confirmations || 0);
    setEditRequiredConfirmations(withdrawal.requiredConfirmations || 3);
    setEditStatus(withdrawal.status || 'pending');
    setEditConfirmationStatus(withdrawal.confirmationStatus || 'pending');
    setShowDetailModal(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedWithdrawal) return;
    
    setSaving(true);
    try {
      const response = await axios.put(`/api/admin/withdrawals/${selectedWithdrawal._id}`, {
        confirmations: editConfirmations,
        requiredConfirmations: editRequiredConfirmations,
        status: editStatus,
        confirmationStatus: editConfirmationStatus
      });
      
      // Update local state
      setWithdrawals(prev => prev.map(w => 
        w._id === selectedWithdrawal._id ? response.data.withdrawal : w
      ));
      
      setSelectedWithdrawal(response.data.withdrawal);
      setNotification({ message: 'Withdrawal updated successfully', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({ 
        message: err.response?.data?.message || 'Failed to update withdrawal', 
        type: 'error' 
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'confirming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getConfirmationProgress = (current, required) => {
    if (!required) return 0;
    return Math.min((current / required) * 100, 100);
  };

  const formatAmount = (amount, crypto) => {
    if (!amount) return '0.00';
    return parseFloat(amount).toFixed(crypto === 'USDT' ? 2 : 8);
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

  const truncateAddress = (address) => {
    if (!address) return 'N/A';
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Withdrawal Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage user withdrawals with blockchain confirmations
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Withdrawals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {withdrawals.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {withdrawals.filter(w => w.confirmationStatus === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Confirming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {withdrawals.filter(w => w.confirmationStatus === 'confirming').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {withdrawals.filter(w => w.confirmationStatus === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user, tx hash, or wallet address..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </form>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirming">Confirming</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Withdrawals Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading withdrawals...</p>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-8 text-center">
            <ArrowUpRight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No withdrawals found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      To Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Confirmations
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {withdrawals.map((withdrawal) => (
                    <tr 
                      key={withdrawal._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {withdrawal.userId?.username || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {withdrawal.userId?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          -{formatAmount(withdrawal.amount, withdrawal.cryptoCurrency)} {withdrawal.cryptoCurrency}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {truncateAddress(withdrawal.toAddress)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-24">
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-600 transition-all duration-300"
                                style={{ width: `${getConfirmationProgress(withdrawal.confirmations, withdrawal.requiredConfirmations)}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {withdrawal.confirmations || 0}/{withdrawal.requiredConfirmations || 3}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(withdrawal.confirmationStatus)}`}>
                          {withdrawal.confirmationStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(withdrawal.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => viewWithdrawalDetail(withdrawal)}
                          className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {withdrawals.length} withdrawals
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail/Edit Modal */}
      <AnimatePresence>
        {showDetailModal && selectedWithdrawal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Manage Withdrawal
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Transaction Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Transaction Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                      <p className="font-mono text-gray-900 dark:text-white">{selectedWithdrawal._id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">User:</span>
                      <p className="text-gray-900 dark:text-white">{selectedWithdrawal.userId?.username}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                      <p className="text-red-600 dark:text-red-400 font-medium">
                        -{formatAmount(selectedWithdrawal.amount, selectedWithdrawal.cryptoCurrency)} {selectedWithdrawal.cryptoCurrency}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Date:</span>
                      <p className="text-gray-900 dark:text-white">{formatDate(selectedWithdrawal.createdAt)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">To Address:</span>
                      <p className="font-mono text-xs text-gray-900 dark:text-white break-all">{selectedWithdrawal.toAddress}</p>
                    </div>
                    {selectedWithdrawal.transactionHash && (
                      <div className="col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">Transaction Hash:</span>
                        <p className="font-mono text-xs text-gray-900 dark:text-white break-all">{selectedWithdrawal.transactionHash}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Controls */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Admin Controls
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Confirmations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Confirmations
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editConfirmations}
                        onChange={(e) => setEditConfirmations(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Required Confirmations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Required Confirmations (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editRequiredConfirmations}
                        onChange={(e) => setEditRequiredConfirmations(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transaction Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    {/* Confirmation Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirmation Status
                      </label>
                      <select
                        value={editConfirmationStatus}
                        onChange={(e) => setEditConfirmationStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirming">Confirming</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>

                  {/* Progress Preview */}
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Confirmation Progress</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {editConfirmations}/{editRequiredConfirmations} ({Math.round(getConfirmationProgress(editConfirmations, editRequiredConfirmations))}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${getConfirmationProgress(editConfirmations, editRequiredConfirmations)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminWithdrawalManagement;
