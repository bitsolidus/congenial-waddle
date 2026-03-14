import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Search, 
  MessageCircle,
  Shield,
  Wallet,
  TrendingUp,
  HelpCircle,
  CreditCard,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';

const FAQ = () => {
  const { config: siteConfig } = useSelector((state) => state.siteConfig);
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});

  const categories = [
    { id: 'general', name: 'General', icon: HelpCircle },
    { id: 'account', name: 'Account', icon: Shield },
    { id: 'trading', name: 'Trading', icon: TrendingUp },
    { id: 'wallet', name: 'Wallet & Deposits', icon: Wallet },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  const siteName = siteConfig?.siteName || 'BitSolidus';

  const faqData = {
    general: [
      {
        question: `What is ${siteName}?`,
        answer: `${siteName} is a comprehensive cryptocurrency trading platform that allows users to buy, sell, and trade various digital assets. We provide a secure, user-friendly environment for both beginners and experienced traders to participate in the cryptocurrency markets.`
      },
      {
        question: `Is ${siteName} available in my country?`,
        answer: `${siteName} is available in over 150 countries worldwide. However, due to regulatory requirements, some countries may have restricted access. Please check our Terms of Service or contact support to confirm availability in your region.`
      },
      {
        question: `How do I get started with ${siteName}?`,
        answer: 'Getting started is easy: 1) Create an account on our platform, 2) Complete the verification process (KYC), 3) Deposit funds into your account, 4) Start trading. The entire process typically takes less than 10 minutes.'
      },
      {
        question: `What cryptocurrencies can I trade on ${siteName}?`,
        answer: 'We support a wide range of cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), Tether (USDT), BNB, Solana (SOL), Cardano (ADA), and many more. Our platform regularly adds new assets based on market demand and thorough vetting.'
      },
    ],
    account: [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Get Started" button on our homepage, enter your email address, create a strong password, and verify your email. You will then need to complete the KYC verification process to unlock full trading capabilities.'
      },
      {
        question: 'What is KYC verification?',
        answer: 'KYC (Know Your Customer) is a regulatory requirement that helps us verify your identity. You will need to provide a government-issued ID and proof of address. This process helps prevent fraud and ensures compliance with international regulations.'
      },
      {
        question: 'Can I have multiple accounts?',
        answer: 'No, each user is limited to one account. Multiple accounts per person are prohibited and may result in account suspension. If you need to update your account information, please contact our support team.'
      },
      {
        question: 'How do I close my account?',
        answer: 'To close your account, first ensure all balances are withdrawn. Then contact our support team with your account closure request. Please note that account closure is irreversible and may take up to 30 days to process.'
      },
    ],
    trading: [
      {
        question: 'What are the trading fees?',
        answer: 'Our trading fees are competitive and tier-based. Basic accounts pay 0.1% per trade, while Pro accounts enjoy reduced fees of 0.05%. Enterprise clients receive custom pricing. There are no hidden fees or charges.'
      },
      {
        question: 'What order types are supported?',
        answer: 'We support various order types including Market Orders, Limit Orders, Stop-Loss Orders, Take-Profit Orders, and Trailing Stop Orders. Advanced traders can also use our API for algorithmic trading strategies.'
      },
      {
        question: 'Is there a minimum trade amount?',
        answer: 'Yes, the minimum trade amount varies by cryptocurrency but typically starts at $10 equivalent. This ensures efficient order execution and helps manage network fees.'
      },
      {
        question: 'Can I use leverage or margin trading?',
        answer: 'Yes, eligible users can access leverage trading with up to 5x leverage on select trading pairs. Margin trading features are available for Pro and Enterprise tier accounts subject to additional risk assessments.'
      },
    ],
    wallet: [
      {
        question: 'How do I deposit cryptocurrency?',
        answer: 'Navigate to the Deposit section, select your desired cryptocurrency, copy the deposit address or scan the QR code, and send funds from your external wallet. Deposits typically confirm within minutes depending on network congestion.'
      },
      {
        question: 'How do I withdraw cryptocurrency?',
        answer: 'Go to the Withdraw section, select the cryptocurrency, enter the withdrawal address, specify the amount, and confirm the transaction. For security, withdrawals may require email confirmation and 2FA verification.'
      },
      {
        question: `Are my funds safe on ${siteName}?`,
        answer: 'Yes, we employ industry-leading security measures including cold storage for 95% of assets, multi-signature wallets, insurance coverage, and regular security audits. Your funds are protected by bank-grade security protocols.'
      },
      {
        question: 'What is the withdrawal processing time?',
        answer: 'Withdrawals are typically processed within 24 hours. However, large withdrawals or those requiring additional verification may take up to 72 hours. We prioritize security over speed for all withdrawal requests.'
      },
    ],
    payments: [
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept bank transfers (SWIFT, SEPA), credit/debit cards, and cryptocurrency deposits. Available methods may vary by country. All fiat deposits are processed through regulated payment providers.'
      },
      {
        question: 'Are there deposit fees?',
        answer: 'Cryptocurrency deposits are free. Fiat deposits may incur fees depending on the payment method: bank transfers are typically free, while card payments may have a 2-3% processing fee charged by the payment provider.'
      },
      {
        question: 'How long do deposits take?',
        answer: 'Cryptocurrency deposits depend on network confirmation times (typically 10-60 minutes). Fiat deposits via bank transfer take 1-3 business days, while card deposits are usually instant.'
      },
      {
        question: 'Can I set up recurring purchases?',
        answer: 'Yes, our DCA (Dollar Cost Averaging) feature allows you to schedule recurring purchases of your favorite cryptocurrencies. This helps you invest consistently without timing the market.'
      },
    ],
    security: [
      {
        question: 'How do I enable two-factor authentication?',
        answer: 'Go to Security Settings, click "Enable 2FA", scan the QR code with your authenticator app (Google Authenticator, Authy, etc.), and enter the verification code. We strongly recommend enabling 2FA for all accounts.'
      },
      {
        question: 'What should I do if I suspect unauthorized access?',
        answer: 'Immediately change your password, enable 2FA if not already active, check your login history, and contact our support team. We also recommend reviewing all recent transactions and withdrawing funds to a secure wallet if necessary.'
      },
      {
        question: 'Is my personal information secure?',
        answer: 'Absolutely. We use bank-level encryption (AES-256) for all data, maintain strict access controls, and never share your information with third parties without consent. We are GDPR compliant and regularly undergo security audits.'
      },
      {
        question: `What is the ${siteName} Bug Bounty program?`,
        answer: 'We operate a bug bounty program that rewards security researchers for identifying and responsibly disclosing vulnerabilities. Rewards range from $100 to $50,000 depending on the severity of the finding.'
      },
    ],
  };

  const toggleItem = (categoryId, itemIndex) => {
    const key = `${categoryId}-${itemIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredFAQs = searchQuery
    ? Object.entries(faqData).flatMap(([category, items]) =>
        items
          .filter(item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(item => ({ ...item, category }))
      )
    : faqData[activeCategory].map(item => ({ ...item, category: activeCategory }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Breadcrumb />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
              Help Center
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Find answers to common questions about our platform, trading, and security.
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            {!searchQuery && (
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-4">
                    Categories
                  </h3>
                  <nav className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeCategory === category.id
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <category.icon className="w-5 h-5" />
                        <span className="font-medium">{category.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* FAQ Items */}
            <div className={searchQuery ? 'lg:col-span-4' : 'lg:col-span-3'}>
              <div className="space-y-4">
                {filteredFAQs.map((item, index) => {
                  const itemKey = `${item.category}-${index}`;
                  const isOpen = openItems[itemKey];
                  
                  return (
                    <motion.div
                      key={itemKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(item.category, index)}
                        className="w-full flex items-center justify-between p-6 text-left"
                      >
                        <div className="flex items-center space-x-4">
                          {searchQuery && (
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
                              {categories.find(c => c.id === item.category)?.name}
                            </span>
                          )}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.question}
                          </span>
                        </div>
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-6 pb-6">
                              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No results found for your search.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageCircle className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Have Questions?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Our support team is available 24/7 to help you with any inquiries.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </Link>
            <a
              href="mailto:support@bitsolidus.tech"
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
