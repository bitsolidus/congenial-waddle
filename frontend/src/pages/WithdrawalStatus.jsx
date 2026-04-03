import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  Copy,
  ExternalLink,
  Bitcoin
} from 'lucide-react';

const WithdrawalStatus = () => {
  const { transactionId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [withdrawal, setWithdrawal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWithdrawalStatus();
  }, [transactionId]);

  const fetchWithdrawalStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/transactions/${transactionId}`);
      setWithdrawal(response.data.transaction);
    } catch (err) {
      console.error('Failed to fetch withdrawal status:', err);
      setError(err.response?.data?.message || 'Failed to load withdrawal status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWithdrawalStatus();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfirmationProgress = () => {
    if (!withdrawal) return 0;
    const current = withdrawal.confirmations || 0;
    const required = withdrawal.requiredConfirmations || 3;
    return Math.min((current / required) * 100, 100);
  };

  const getStatusConfig = () => {
    if (!withdrawal) return { color: 'gray', icon: Clock, text: 'Loading...' };
    
    switch (withdrawal.confirmationStatus) {
      case 'confirmed':
      case 'completed':
        return { 
          color: 'green', 
          icon: CheckCircle, 
          text: 'Confirmed',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-800 dark:text-green-400',
          borderColor: 'border-green-500'
        };
      case 'confirming':
        return { 
          color: 'blue', 
          icon: RefreshCw, 
          text: 'Confirming',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-800 dark:text-blue-400',
          borderColor: 'border-blue-500'
        };
      case 'failed':
        return { 
          color: 'red', 
          icon: AlertCircle, 
          text: 'Failed',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          textColor: 'text-red-800 dark:text-red-400',
          borderColor: 'border-red-500'
        };
      case 'pending':
      default:
        return { 
          color: 'yellow', 
          icon: Clock, 
          text: 'Pending',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          textColor: 'text-yellow-800 dark:text-yellow-400',
          borderColor: 'border-yellow-500'
        };
    }
  };

  const formatAmount = (amount, crypto) => {
    if (!amount) return '0.00';
    return parseFloat(amount).toFixed(crypto === 'USDT' ? 2 : 8);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getExplorerUrl = (crypto, txHash) => {
    if (!txHash) return null;
    const explorers = {
      'BTC': `https://blockchain.info/tx/${txHash}`,
      'ETH': `https://etherscan.io/tx/${txHash}`,
      'USDT': `https://etherscan.io/tx/${txHash}`,
      'BNB': `https://bscscan.com/tx/${txHash}`
    };
    return explorers[crypto] || null;
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading withdrawal status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Link 
              to="/transactions" 
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              Back to Transactions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!withdrawal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Withdrawal not found</p>
            <Link 
              to="/transactions" 
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              Back to Transactions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/transactions"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Transactions
        </Link>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className={`p-6 ${statusConfig.bgColor} border-b ${statusConfig.borderColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full bg-white dark:bg-gray-800 ${statusConfig.textColor}`}>
                  <StatusIcon className={`w-8 h-8 ${refreshing && withdrawal.confirmationStatus === 'confirming' ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Withdrawal {statusConfig.text}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {withdrawal.confirmationStatus === 'confirmed' 
                      ? 'Your withdrawal has been confirmed on the blockchain'
                      : withdrawal.confirmationStatus === 'confirming'
                      ? 'Your withdrawal is being confirmed on the blockchain'
                      : withdrawal.confirmationStatus === 'failed'
                      ? 'Your withdrawal has failed'
                      : 'Your withdrawal is being processed'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Confirmation Progress */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Blockchain Confirmations
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {withdrawal.confirmations || 0} / {withdrawal.requiredConfirmations || 3}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${getConfirmationProgress()}%` }}
                transition={{ duration: 0.5 }}
                className={`h-full rounded-full ${
                  withdrawal.confirmationStatus === 'confirmed' 
                    ? 'bg-green-500' 
                    : withdrawal.confirmationStatus === 'confirming'
                    ? 'bg-blue-500'
                    : 'bg-yellow-500'
                }`}
              />
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {withdrawal.confirmationStatus === 'confirmed' 
                ? 'All required confirmations received. Transaction is complete.'
                : withdrawal.confirmationStatus === 'confirming'
                ? `${withdrawal.requiredConfirmations - (withdrawal.confirmations || 0)} more confirmation(s) needed for completion`
                : 'Waiting for blockchain confirmation...'
              }
            </p>

            {/* Confirmation Steps */}
            <div className="mt-4 flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    (withdrawal.confirmations || 0) >= step
                      ? 'bg-green-500 text-white'
                      : step <= (withdrawal.requiredConfirmations || 3)
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-300'
                  }`}>
                    {(withdrawal.confirmations || 0) >= step ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {step === 1 ? '1st' : step === 2 ? '2nd' : step === 3 ? '3rd' : `${step}th`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Transaction Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatAmount(withdrawal.amount, withdrawal.cryptoCurrency)} {withdrawal.cryptoCurrency}
                </span>
              </div>
              
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Network Fee</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {withdrawal.gasFee || 0} {withdrawal.cryptoCurrency}
                </span>
              </div>
              
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                  <StatusIcon className="w-3 h-3" />
                  {withdrawal.status}
                </span>
              </div>
              
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Date</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(withdrawal.createdAt)}
                </span>
              </div>
              
              <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 block mb-2">To Address</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-gray-900 dark:text-white break-all">
                    {withdrawal.toAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(withdrawal.toAddress)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                  </button>
                </div>
              </div>
              
              {withdrawal.transactionHash && (
                <div className="py-3">
                  <span className="text-gray-500 dark:text-gray-400 block mb-2">Transaction Hash</span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-gray-900 dark:text-white break-all">
                      {withdrawal.transactionHash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(withdrawal.transactionHash)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                    </button>
                    {getExplorerUrl(withdrawal.cryptoCurrency, withdrawal.transactionHash) && (
                      <a
                        href={getExplorerUrl(withdrawal.cryptoCurrency, withdrawal.transactionHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-6 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <Bitcoin className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">About Blockchain Confirmations</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Blockchain confirmations ensure your transaction is secure and irreversible. 
                  Each confirmation represents a new block added to the blockchain after your transaction. 
                  We require {withdrawal.requiredConfirmations || 3} confirmations for security purposes.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WithdrawalStatus;
