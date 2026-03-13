import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Copy, 
  Check, 
  ArrowDownLeft, 
  ArrowUpRight,
  History,
  AlertCircle,
  Send,
  QrCode
} from 'lucide-react';
import { copyToClipboard } from '../utils/helpers';
import axios from 'axios';

const Receive = () => {
  const { user } = useSelector((state) => state.auth);
  const [internalWallet, setInternalWallet] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('receive');
  
  // Send form state
  const [sendForm, setSendForm] = useState({
    toWallet: '',
    amount: '',
    cryptocurrency: 'USDT'
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');
  
  // Transfer history
  const [transferHistory, setTransferHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchInternalWallet();
    fetchTransferHistory();
  }, []);

  const fetchInternalWallet = async () => {
    try {
      const response = await axios.get('/api/user/internal-wallet');
      setInternalWallet(response.data.internalWallet);
    } catch (err) {
      console.error('Failed to fetch internal wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransferHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await axios.get('/api/user/internal-transfer-history');
      setTransferHistory(response.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transfer history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(internalWallet);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSendError('');
    setSendSuccess('');
    setSending(true);

    try {
      const response = await axios.post('/api/user/internal-transfer', {
        toWallet: sendForm.toWallet,
        amount: parseFloat(sendForm.amount),
        cryptocurrency: sendForm.cryptocurrency
      });
      
      setSendSuccess(response.data.message);
      setSendForm({ toWallet: '', amount: '', cryptocurrency: 'USDT' });
      fetchTransferHistory();
    } catch (err) {
      setSendError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setSending(false);
    }
  };

  const cryptocurrencies = [
    { symbol: 'USDT', name: 'Tether', color: 'bg-green-500' },
    { symbol: 'BTC', name: 'Bitcoin', color: 'bg-orange-500' },
    { symbol: 'ETH', name: 'Ethereum', color: 'bg-blue-500' },
    { symbol: 'BNB', name: 'BNB', color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receive & Send</h1>
          <p className="text-gray-500 dark:text-gray-400">Transfer crypto to other BitSolidus users instantly</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('receive')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'receive'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4" />
            Receive
          </span>
        </button>
        <button
          onClick={() => setActiveTab('send')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'send'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" />
            Send
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </span>
        </button>
      </div>

      {/* Receive Tab */}
      {activeTab === 'receive' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          {/* Wallet Address Card */}
          <div className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your BitSolidus Wallet</h2>
              <p className="text-primary-100">Share this address to receive crypto from other BitSolidus users</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Wallet Address */}
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <p className="text-sm text-primary-100 mb-2">Wallet Address</p>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 text-xl font-mono font-bold break-all">
                      {internalWallet}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                      title="Copy address"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-xl">
                    <QrCode className="w-32 h-32 text-gray-900" />
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-100">Platform-Only Wallet</p>
                    <p className="text-sm text-yellow-200">
                      This wallet address only works for transfers between BitSolidus users. 
                      Sending crypto from external wallets or exchanges to this address will result in permanent loss.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Supported Cryptocurrencies */}
          <div className="card mt-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Supported Cryptocurrencies</h3>
            <div className="grid grid-cols-2 gap-4">
              {cryptocurrencies.map((crypto) => (
                <div key={crypto.symbol} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-crypto-bg rounded-lg">
                  <div className={`w-10 h-10 ${crypto.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                    {crypto.symbol[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{crypto.symbol}</p>
                    <p className="text-sm text-gray-500">{crypto.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Send Tab */}
      {activeTab === 'send' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Send Crypto</h2>
                <p className="text-gray-500">Transfer to another BitSolidus user</p>
              </div>
            </div>

            {sendError && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                {sendError}
              </div>
            )}

            {sendSuccess && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
                {sendSuccess}
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              {/* Recipient Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipient's Wallet Address
                </label>
                <input
                  type="text"
                  value={sendForm.toWallet}
                  onChange={(e) => setSendForm({ ...sendForm, toWallet: e.target.value })}
                  className="input-field w-full"
                  placeholder="Enter wallet address (e.g., BITS1A2B3C4)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter a valid BitSolidus internal wallet address (format: BITSXXXXXXX)</p>
              </div>

              {/* Cryptocurrency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cryptocurrency
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {cryptocurrencies.map((crypto) => (
                    <button
                      key={crypto.symbol}
                      type="button"
                      onClick={() => setSendForm({ ...sendForm, cryptocurrency: crypto.symbol })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        sendForm.cryptocurrency === crypto.symbol
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold text-gray-900 dark:text-white">{crypto.symbol}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.00000001"
                    min="0.01"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                    className="input-field w-full pr-20"
                    placeholder="0.00"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {sendForm.cryptocurrency}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Available: {user?.balance?.[sendForm.cryptocurrency] || 0} {sendForm.cryptocurrency}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={sending}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send {sendForm.cryptocurrency}
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Transfer History</h2>
            
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : transferHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transfers yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transferHistory.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-crypto-bg rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.type === 'transfer_sent' ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'
                      }`}>
                        {tx.type === 'transfer_sent' ? (
                          <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tx.type === 'transfer_sent' ? 'Sent' : 'Received'}
                        </p>
                        <p className="text-sm text-gray-500">{tx.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        tx.type === 'transfer_sent' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {tx.type === 'transfer_sent' ? '-' : '+'}{tx.amount} {tx.cryptocurrency}
                      </p>
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Receive;
