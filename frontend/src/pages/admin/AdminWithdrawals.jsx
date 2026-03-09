import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  RefreshCw, 
  Filter,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Fuel,
  ArrowUpRight,
  Clock,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';

const AdminWithdrawals = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('withdrawals'); // 'withdrawals' or 'gas-purchases'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 10;

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'withdrawals' ? '/api/admin/withdrawals' : '/api/admin/gas-purchases';
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', limit);
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`${endpoint}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTransactions(response.data.transactions || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalTransactions(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Fetch transactions error:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, search, statusFilter, token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleApprove = async () => {
    if (!selectedTransaction) return;
    
    setActionLoading(true);
    try {
      const endpoint = activeTab === 'withdrawals' 
        ? `/api/admin/withdrawals/${selectedTransaction._id}/approve`
        : `/api/admin/gas-purchases/${selectedTransaction._id}/approve`;
      
      const payload = { adminNotes };
      if (activeTab === 'withdrawals' && transactionHash) {
        payload.transactionHash = transactionHash;
      }

      await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`${activeTab === 'withdrawals' ? 'Withdrawal' : 'Gas purchase'} approved successfully`);
      setShowApproveModal(false);
      setAdminNotes('');
      setTransactionHash('');
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTransaction) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setActionLoading(true);
    try {
      const endpoint = activeTab === 'withdrawals' 
        ? `/api/admin/withdrawals/${selectedTransaction._id}/reject`
        : `/api/admin/gas-purchases/${selectedTransaction._id}/reject`;

      await axios.put(endpoint, { 
        reason: rejectReason,
        adminNotes 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`${activeTab === 'withdrawals' ? 'Withdrawal' : 'Gas purchase'} rejected`);
      setShowRejectModal(false);
      setRejectReason('');
      setAdminNotes('');
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdrawals & Gas Purchases</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user withdrawals and gas purchases
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setActiveTab('withdrawals');
              setCurrentPage(1);
              setSearch('');
              setStatusFilter('');
            }}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'withdrawals'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/10'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Withdrawals
          </button>
          <button
            onClick={() => {
              setActiveTab('gas-purchases');
              setCurrentPage(1);
              setSearch('');
              setStatusFilter('');
            }}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'gas-purchases'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/10'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Fuel className="w-4 h-4" />
            Gas Purchases
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchTransactions}
              disabled={loading}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No transactions found</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <motion.div
                key={transaction._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    activeTab === 'withdrawals' 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                  }`}>
                    {activeTab === 'withdrawals' ? <ArrowUpRight className="w-5 h-5" /> : <Fuel className="w-5 h-5" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.userId?.username || 'Unknown User'}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({transaction.userId?.email || 'N/A'})
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                          {activeTab === 'withdrawals' ? '-' : '+'}{transaction.amount} {transaction.currency}
                        </p>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {expandedId === transaction._id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2"
                            >
                              {activeTab === 'withdrawals' && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">To Address:</span>
                                    <span className="font-mono text-gray-900 dark:text-white">{truncateAddress(transaction.toAddress)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Network:</span>
                                    <span className="text-gray-900 dark:text-white capitalize">{transaction.network}</span>
                                  </div>
                                  {transaction.gasFee > 0 && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500 dark:text-gray-400">Gas Fee:</span>
                                      <span className="text-gray-900 dark:text-white">${transaction.gasFee}</span>
                                    </div>
                                  )}
                                  {transaction.transactionHash && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500 dark:text-gray-400">Transaction Hash:</span>
                                      <span className="font-mono text-xs text-gray-900 dark:text-white">{transaction.transactionHash}</span>
                                    </div>
                                  )}
                                </>
                              )}
                              
                              {activeTab === 'gas-purchases' && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Crypto:</span>
                                    <span className="text-gray-900 dark:text-white">{transaction.cryptoCurrency || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Network:</span>
                                    <span className="text-gray-900 dark:text-white capitalize">{transaction.network || 'N/A'}</span>
                                  </div>
                                </>
                              )}

                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                <span className="text-gray-900 dark:text-white">{formatDate(transaction.createdAt)}</span>
                              </div>

                              {transaction.approvedBy && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">Processed By:</span>
                                  <span className="text-gray-900 dark:text-white">{transaction.approvedBy?.username || 'Admin'}</span>
                                </div>
                              )}

                              {transaction.rejectedReason && (
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                                  <span className="text-red-600 dark:text-red-400 font-medium">Rejection Reason:</span>
                                  <p className="text-red-700 dark:text-red-300 mt-1">{transaction.rejectedReason}</p>
                                </div>
                              )}

                              {transaction.adminNotes && (
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                                  <span className="text-blue-600 dark:text-blue-400 font-medium">Admin Notes:</span>
                                  <p className="text-blue-700 dark:text-blue-300 mt-1">{transaction.adminNotes}</p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Expand/Collapse */}
                        <button
                          onClick={() => setExpandedId(expandedId === transaction._id ? null : transaction._id)}
                          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {expandedId === transaction._id ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </button>

                        {/* Approve/Reject Buttons */}
                        {transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowApproveModal(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowRejectModal(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <X className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && transactions.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Approve {activeTab === 'withdrawals' ? 'Withdrawal' : 'Gas Purchase'}
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                User: <span className="font-medium text-gray-900 dark:text-white">{selectedTransaction.userId?.username}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Amount: <span className="font-medium text-gray-900 dark:text-white">{selectedTransaction.amount} {selectedTransaction.currency}</span>
              </p>
              {activeTab === 'withdrawals' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  To: <span className="font-mono text-xs text-gray-900 dark:text-white">{truncateAddress(selectedTransaction.toAddress)}</span>
                </p>
              )}
            </div>

            {activeTab === 'withdrawals' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction Hash (optional)
                </label>
                <input
                  type="text"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Admin Notes (optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedTransaction(null);
                  setAdminNotes('');
                  setTransactionHash('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Approve
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reject {activeTab === 'withdrawals' ? 'Withdrawal' : 'Gas Purchase'}
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                User: <span className="font-medium text-gray-900 dark:text-white">{selectedTransaction.userId?.username}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Amount: <span className="font-medium text-gray-900 dark:text-white">{selectedTransaction.amount} {selectedTransaction.currency}</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Please provide a reason for rejection..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Admin Notes (optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedTransaction(null);
                  setRejectReason('');
                  setAdminNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;
