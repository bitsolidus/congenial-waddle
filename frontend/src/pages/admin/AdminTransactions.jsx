import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, truncateAddress } from '../../utils/helpers';
import axios from 'axios';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/admin/transactions');
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (txId) => {
    try {
      await axios.put(`/api/admin/transaction/${txId}`, { status: 'approved' });
      fetchTransactions();
    } catch (err) {
      console.error('Failed to approve transaction');
    }
  };

  const handleReject = async (txId) => {
    try {
      await axios.put(`/api/admin/transaction/${txId}`, { status: 'rejected', rejectedReason: 'Admin rejection' });
      fetchTransactions();
    } catch (err) {
      console.error('Failed to reject transaction');
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        
        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-full md:w-48"
        >
          <option value="all">All Transactions</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-crypto-border">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Network</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-gray-100 dark:border-crypto-border/50">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{tx.userId?.username || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{tx.userId?.email}</p>
                      </div>
                    </td>
                    <td className="py-4 capitalize text-gray-900 dark:text-white">{tx.type}</td>
                    <td className="py-4 text-gray-900 dark:text-white">{formatCurrency(tx.amount)}</td>
                    <td className="py-4 text-gray-600 dark:text-gray-400 capitalize">{tx.network || 'N/A'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="py-4">
                      {tx.status === 'pending' && tx.type === 'withdrawal' ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApprove(tx._id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(tx._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-crypto-bg rounded-lg">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminTransactions;
