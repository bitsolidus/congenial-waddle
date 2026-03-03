import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Clock3,
  Copy,
  Check,
  ExternalLink,
  Wallet
} from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../utils/helpers';
import { convertFromUSD, formatCurrencyWithSymbol } from '../utils/currency';
import axios from 'axios';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Get user's currency preference
  const userCurrency = user?.currency || 'USD';

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/user/transactions/${id}`);
      setTransaction(response.data.transaction);
    } catch (err) {
      setError('Failed to load transaction details');
      console.error('Error fetching transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'pending':
      case 'processing':
        return <Clock3 className="w-6 h-6 text-yellow-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-6 h-6 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-6 h-6 text-red-500" />;
      case 'buy':
      case 'sell':
        return <TrendingUp className="w-6 h-6 text-blue-500" />;
      default:
        return <Wallet className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatAmount = (amount, currency) => {
    if (userCurrency !== 'USD' && currency === 'USD') {
      return formatCurrencyWithSymbol(convertFromUSD(amount, userCurrency), userCurrency);
    }
    return formatCurrency(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Transaction Not Found</h2>
        <p className="text-gray-500 mb-4">{error || 'The transaction you are looking for does not exist.'}</p>
        <button
          onClick={() => navigate('/transactions')}
          className="btn-primary"
        >
          Back to Transactions
        </button>
      </div>
    );
  }

  const isDeposit = transaction.type === 'deposit';
  const isWithdrawal = transaction.type === 'withdrawal';
  const networkFee = transaction.gasFee || transaction.gasAmount || 0;
  const netAmount = isWithdrawal 
    ? transaction.amount - networkFee 
    : transaction.amount;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/transactions')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Details</h1>
          <p className="text-gray-500 dark:text-gray-400">View complete transaction information</p>
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-purple-600 to-blue-600 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <p className="text-purple-100 text-sm capitalize">{transaction.type}</p>
              <h2 className="text-2xl font-bold">
                {isDeposit ? '+' : isWithdrawal ? '-' : ''}
                {formatAmount(transaction.amount, transaction.currency)}
              </h2>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
            {transaction.status}
          </span>
        </div>
        
        {userCurrency !== 'USD' && transaction.currency === 'USD' && (
          <p className="text-purple-200 text-sm">
            ≈ {formatCurrency(transaction.amount)} USD
          </p>
        )}
      </motion.div>

      {/* Transaction Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Transaction Information</h3>
        
        <div className="space-y-4">
          {/* Amount Sent/Received */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Amount {isDeposit ? 'Received' : 'Sent'}</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatAmount(transaction.amount, transaction.currency)}
              {transaction.cryptoCurrency && ` ${transaction.cryptoCurrency}`}
            </span>
          </div>

          {/* Network */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Network</span>
            <span className="font-medium text-gray-900 dark:text-white capitalize">
              {transaction.network || 'Internal'}
            </span>
          </div>

          {/* Network Fee */}
          {networkFee > 0 && (
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Network Fee</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatAmount(networkFee, transaction.currency)}
              </span>
            </div>
          )}

          {/* Net Amount (for withdrawals) */}
          {isWithdrawal && networkFee > 0 && (
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Net Amount</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatAmount(netAmount, transaction.currency)}
              </span>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Status</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(transaction.status)}
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {transaction.status}
              </span>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Time</span>
            <div className="text-right">
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(transaction.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                {formatRelativeTime(transaction.createdAt)}
              </p>
            </div>
          </div>

          {/* Transaction ID */}
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
            <div className="flex items-center gap-2">
              <code className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {transaction._id}
              </code>
              <button
                onClick={() => handleCopy(transaction._id)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                title="Copy ID"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Blockchain Details */}
      {transaction.transactionHash && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Blockchain Details</h3>
          
          <div className="space-y-4">
            {/* Transaction Hash */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Transaction Hash</span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded max-w-[200px] truncate">
                  {transaction.transactionHash}
                </code>
                <button
                  onClick={() => handleCopy(transaction.transactionHash)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  title="Copy Hash"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                {transaction.network && (
                  <a
                    href={`https://${transaction.network === 'ethereum' ? 'etherscan.io' : 'bscscan.com'}/tx/${transaction.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}
              </div>
            </div>

            {/* Confirmations */}
            {transaction.confirmations > 0 && (
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Confirmations</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {transaction.confirmations}
                </span>
              </div>
            )}

            {/* From/To Addresses */}
            {transaction.fromAddress && (
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">From</span>
                <code className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded max-w-[200px] truncate">
                  {transaction.fromAddress}
                </code>
              </div>
            )}

            {transaction.toAddress && (
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-500 dark:text-gray-400">To</span>
                <code className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded max-w-[200px] truncate">
                  {transaction.toAddress}
                </code>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Trade Details */}
      {transaction.tradePair && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Trade Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Trading Pair</span>
              <span className="font-medium text-gray-900 dark:text-white">{transaction.tradePair}</span>
            </div>
            
            {transaction.orderType && (
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Order Type</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">{transaction.orderType}</span>
              </div>
            )}
            
            {transaction.price && (
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-500 dark:text-gray-400">Price</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatAmount(transaction.price, 'USD')}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TransactionDetail;
