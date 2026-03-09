import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Wallet, 
  History,
  AlertCircle,
  ExternalLink,
  Bitcoin,
  Coins,
  DollarSign,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  RefreshCw,
  Shield
} from 'lucide-react';
import { fetchTransactions, fetchBalance } from '../store/walletSlice';
import { copyToClipboard, truncateAddress, formatCurrency, formatRelativeTime, getStatusColor } from '../utils/helpers';
import { CRYPTOCURRENCIES } from '../utils/constants';
import axios from 'axios';

const Deposit = () => {
  const dispatch = useDispatch();
  const { transactions, isLoading, balance } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTOCURRENCIES[0]);
  const [depositAddress, setDepositAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('deposit');
  
  // Wallet connection states
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  
  // Deposit tracking
  const [depositStatus, setDepositStatus] = useState('idle'); // idle, checking, detected, confirmed
  const [detectedDeposit, setDetectedDeposit] = useState(null);
  
  // Deposit confirmation form state
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [confirmationForm, setConfirmationForm] = useState({
    transactionId: '',
    amount: '',
    fromAddress: ''
  });
  const [submittingConfirmation, setSubmittingConfirmation] = useState(false);
  const [confirmationError, setConfirmationError] = useState('');
  const [confirmationSuccess, setConfirmationSuccess] = useState('');
  const [pendingConfirmations, setPendingConfirmations] = useState([]);

  useEffect(() => {
    dispatch(fetchTransactions({ type: 'deposit', limit: 5 }));
    dispatch(fetchBalance());
    generateDepositAddress();
    fetchPendingConfirmations();
  }, [dispatch, selectedCrypto]);

  // Auto-check for deposit status if wallet is connected
  useEffect(() => {
    if (!connectedWallet || !walletAddress) return;
    
    const checkInterval = setInterval(() => {
      checkDepositStatus();
    }, 15000); // Check every 15 seconds
    
    return () => clearInterval(checkInterval);
  }, [connectedWallet, walletAddress, depositAddress]);

  const fetchPendingConfirmations = async () => {
    try {
      const response = await axios.get('/api/user/deposit-confirmations');
      setPendingConfirmations(response.data.confirmations || []);
    } catch (err) {
      console.error('Failed to fetch confirmations:', err);
    }
  };

  const generateDepositAddress = async () => {
    try {
      // Fetch user's deposit addresses from API
      const response = await axios.get('/api/user/deposit-addresses');
      const addresses = response.data.depositAddresses || {};
      
      // Get address for selected crypto
      const address = addresses[selectedCrypto.symbol] || '';
      setDepositAddress(address);
    } catch (err) {
      console.error('Failed to fetch deposit address:', err);
      setDepositAddress('');
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(depositAddress);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitConfirmation = async (e) => {
    e.preventDefault();
    setConfirmationError('');
    setConfirmationSuccess('');
    setSubmittingConfirmation(true);

    try {
      const networkMap = {
        'BTC': 'Bitcoin Network',
        'ETH': 'ERC-20',
        'USDT': 'TRC-20'
      };

      await axios.post('/api/user/deposit-confirm', {
        cryptocurrency: selectedCrypto.symbol,
        transactionId: confirmationForm.transactionId,
        amount: parseFloat(confirmationForm.amount),
        network: networkMap[selectedCrypto.symbol],
        fromAddress: confirmationForm.fromAddress || null,
        toAddress: depositAddress
      });

      setConfirmationSuccess('Deposit confirmation submitted successfully! BitSolidus Team will review shortly.');
      setConfirmationForm({ transactionId: '', amount: '', fromAddress: '' });
      fetchPendingConfirmations();
      setTimeout(() => {
        setShowConfirmationForm(false);
        setConfirmationSuccess('');
      }, 3000);
    } catch (err) {
      setConfirmationError(err.response?.data?.message || 'Failed to submit confirmation. Please try again.');
    } finally {
      setSubmittingConfirmation(false);
    }
  };

  const walletOptions = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊', type: 'evm' },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', type: 'universal' },
    { id: 'manual', name: 'Manual Transfer', icon: '✏️', type: 'manual' },
  ];

  // Connect to MetaMask
  const connectMetaMask = async () => {
    setIsConnecting(true);
    setConnectionError('');
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask extension.');
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setConnectedWallet('metamask');
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (newAccounts) => {
          if (newAccounts.length > 0) {
            setWalletAddress(newAccounts[0]);
          } else {
            disconnectWallet();
          }
        });
        
        // Listen for chain changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      }
    } catch (err) {
      setConnectionError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect wallet handler
  const connectWallet = async (walletId) => {
    if (walletId === 'metamask') {
      await connectMetaMask();
    } else if (walletId === 'walletconnect') {
      // WalletConnect integration would go here
      setConnectionError('WalletConnect coming soon');
    } else if (walletId === 'manual') {
      setConnectedWallet('manual');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setConnectedWallet(null);
    setWalletAddress('');
    setDepositStatus('idle');
    setDetectedDeposit(null);
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  };

  // Check deposit status
  const checkDepositStatus = useCallback(async () => {
    if (!depositAddress || !walletAddress) return;
    
    setDepositStatus('checking');
    try {
      // This would be an API call to check blockchain
      const response = await axios.get('/api/deposit/check-status', {
        params: {
          address: depositAddress,
          fromAddress: walletAddress,
          crypto: selectedCrypto.symbol
        }
      });
      
      if (response.data.detected) {
        setDetectedDeposit(response.data.deposit);
        setDepositStatus('detected');
        
        // Refresh balance and transactions
        dispatch(fetchBalance());
        dispatch(fetchTransactions({ type: 'deposit', limit: 5 }));
      }
    } catch (err) {
      console.error('Failed to check deposit status:', err);
    } finally {
      if (depositStatus !== 'detected') {
        setDepositStatus('idle');
      }
    }
  }, [depositAddress, walletAddress, selectedCrypto.symbol, dispatch, depositStatus]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'confirmed':
        return 'Confirmed';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deposit</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-crypto-bg p-1 rounded-lg w-fit">
        {['deposit', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-crypto-card text-primary-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'deposit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposit Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card space-y-6"
          >
            {/* Cryptocurrency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Cryptocurrency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { symbol: 'BTC', name: 'Bitcoin', icon: Bitcoin, color: 'orange', network: 'Bitcoin Network' },
                  { symbol: 'ETH', name: 'Ethereum', icon: Coins, color: 'blue', network: 'ERC-20' },
                  { symbol: 'USDT', name: 'USDT', icon: DollarSign, color: 'green', network: 'TRC-20' }
                ].map((crypto) => {
                  const Icon = crypto.icon;
                  const isSelected = selectedCrypto.symbol === crypto.symbol;
                  return (
                    <button
                      key={crypto.symbol}
                      type="button"
                      onClick={() => {
                        const selected = CRYPTOCURRENCIES.find(c => c.symbol === crypto.symbol);
                        setSelectedCrypto(selected);
                      }}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        isSelected
                          ? crypto.color === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                            crypto.color === 'blue' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                            'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-crypto-border hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                        crypto.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        crypto.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          crypto.color === 'orange' ? 'text-orange-600' :
                          crypto.color === 'blue' ? 'text-blue-600' :
                          'text-green-600'
                        }`} />
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{crypto.name}</p>
                      <p className="text-xs text-gray-500">{crypto.symbol}</p>
                      <p className={`text-xs mt-1 font-medium ${
                        crypto.color === 'orange' ? 'text-orange-600' :
                        crypto.color === 'blue' ? 'text-blue-600' :
                        'text-green-600'
                      }`}>{crypto.network}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wallet Connection Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {connectedWallet ? 'Connected Wallet' : 'Connect Wallet (Optional)'}
              </label>
              
              {connectionError && (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{connectionError}</p>
                </div>
              )}
              
              {connectedWallet ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {walletOptions.find(w => w.id === connectedWallet)?.icon}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {walletOptions.find(w => w.id === connectedWallet)?.name}
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                        Connected
                      </span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Disconnect
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {truncateAddress(walletAddress)}
                  </p>
                  
                  {/* Deposit Status */}
                  {depositStatus === 'checking' && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Checking for deposits...
                    </div>
                  )}
                  
                  {depositStatus === 'detected' && detectedDeposit && (
                    <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Deposit Detected!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {detectedDeposit.amount} {selectedCrypto.symbol} received
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {walletOptions.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => connectWallet(wallet.id)}
                      disabled={isConnecting}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-crypto-border hover:border-primary-500 transition-colors disabled:opacity-50"
                    >
                      <span className="text-2xl">{wallet.icon}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {wallet.name}
                      </span>
                      {isConnecting && wallet.id === 'metamask' && (
                        <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Connecting your wallet enables automatic deposit detection and faster confirmations.
              </p>
            </div>

            {/* Minimum Deposit Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Minimum Deposit
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Minimum deposit amount is 0.001 {selectedCrypto.symbol}. Deposits below this amount may not be credited.
                </p>
              </div>
            </div>
          </motion.div>

          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Deposit Address
            </h3>
            
            {!depositAddress ? (
              /* No Address Set Warning */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Deposit Address Set
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Please contact support or wait for the BitSolidus Team to assign a {selectedCrypto.symbol} deposit address to your account.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Note:</strong> Each user is assigned unique deposit addresses for BTC, ETH, and USDT by the BitSolidus Team. These addresses are used to credit deposits to your account.
                  </p>
                </div>
              </div>
            ) : (
              /* Address Display */
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl mb-4">
                  <QRCodeSVG 
                    value={depositAddress} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Your {selectedCrypto.symbol} Deposit Address
                    </label>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      selectedCrypto.symbol === 'BTC' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      selectedCrypto.symbol === 'ETH' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {selectedCrypto.symbol === 'BTC' ? 'Bitcoin Network' :
                       selectedCrypto.symbol === 'ETH' ? 'ERC-20' : 'TRC-20'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={depositAddress}
                      readOnly
                      className="input-field flex-1 text-sm"
                    />
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-gray-100 dark:bg-crypto-bg rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Only send {selectedCrypto.symbol} on <strong>{
                      selectedCrypto.symbol === 'BTC' ? 'Bitcoin Network' :
                      selectedCrypto.symbol === 'ETH' ? 'ERC-20' : 'TRC-20'
                    }</strong> to this address. Deposits will be credited to your account after confirmation.
                  </p>
                </div>

                {/* Confirm Deposit Button */}
                <div className="w-full mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {!showConfirmationForm ? (
                    <button
                      onClick={() => setShowConfirmationForm(true)}
                      className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium"
                    >
                      <Send className="w-5 h-5" />
                      I've Made a Deposit - Confirm Now
                    </button>
                  ) : (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500" />
                          Confirm Your Deposit
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Please provide the transaction details to help us verify your deposit.
                        </p>

                        {confirmationError && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{confirmationError}</p>
                          </div>
                        )}

                        {confirmationSuccess && (
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm text-green-600 dark:text-green-400">{confirmationSuccess}</p>
                          </div>
                        )}

                        <form onSubmit={handleSubmitConfirmation} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Transaction ID / Hash *
                            </label>
                            <input
                              type="text"
                              value={confirmationForm.transactionId}
                              onChange={(e) => setConfirmationForm({ ...confirmationForm, transactionId: e.target.value })}
                              placeholder={`Enter ${selectedCrypto.symbol} transaction ID...`}
                              className="input-field w-full"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              You can find this in your wallet or exchange after sending
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Amount Deposited ({selectedCrypto.symbol}) *
                            </label>
                            <input
                              type="number"
                              step="0.00000001"
                              value={confirmationForm.amount}
                              onChange={(e) => setConfirmationForm({ ...confirmationForm, amount: e.target.value })}
                              placeholder={`Enter amount in ${selectedCrypto.symbol}...`}
                              className="input-field w-full"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              From Address (Optional)
                            </label>
                            <input
                              type="text"
                              value={confirmationForm.fromAddress}
                              onChange={(e) => setConfirmationForm({ ...confirmationForm, fromAddress: e.target.value })}
                              placeholder="Your sending wallet address..."
                              className="input-field w-full"
                            />
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowConfirmationForm(false)}
                              className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={submittingConfirmation}
                              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {submittingConfirmation ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="w-5 h-5" />
                                  Submit Confirmation
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>

                {/* Pending Confirmations */}
                {pendingConfirmations.filter(c => c.cryptocurrency === selectedCrypto.symbol).length > 0 && (
                  <div className="w-full mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Your Pending Confirmations
                    </h4>
                    <div className="space-y-2">
                      {pendingConfirmations
                        .filter(c => c.cryptocurrency === selectedCrypto.symbol)
                        .slice(0, 3)
                        .map((confirmation) => (
                          <div
                            key={confirmation.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(confirmation.status)}
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {confirmation.amount} {confirmation.cryptocurrency}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(confirmation.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              confirmation.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              confirmation.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {getStatusText(confirmation.status)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        /* Deposit History */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Deposit History</h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-lg" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-crypto-border">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Currency</th>
                    <th className="pb-3 font-medium">Network</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Tx Hash</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-gray-100 dark:border-crypto-border/50">
                      <td className="py-4 text-gray-900 dark:text-white">
                        {formatRelativeTime(tx.createdAt)}
                      </td>
                      <td className="py-4 text-gray-900 dark:text-white">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-400">
                        {tx.cryptoCurrency || 'USD'}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-400 capitalize">
                        {tx.network || 'N/A'}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {tx.transactionHash ? (
                          <a
                            href={`https://etherscan.io/tx/${tx.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-500 flex items-center"
                          >
                            {truncateAddress(tx.transactionHash)}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No deposit history</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Deposit;
