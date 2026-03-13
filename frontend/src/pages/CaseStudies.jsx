import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Award, Users, ArrowRight, X, 
  CheckCircle, Quote, ExternalLink, Filter
} from 'lucide-react';

const CaseStudies = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);

  const industries = ['all', 'Finance', 'E-commerce', 'Healthcare', 'Real Estate', 'Technology'];

  const caseStudies = [
    {
      id: 1,
      title: 'Global Investment Firm Modernizes Trading Infrastructure',
      company: 'Apex Capital Management',
      industry: 'Finance',
      challenge: 'Legacy trading systems causing 3-second delays in trade execution, resulting in significant slippage and lost revenue.',
      solution: 'Implemented BitSolidus institutional API with custom market-making algorithms and direct exchange connectivity.',
      results: {
        speed: '99.7% reduction in latency (3s → 8ms)',
        volume: '$2.3B monthly trading volume',
        savings: '$4.2M annual cost savings'
      },
      testimonial: {
        text: 'BitSolidus transformed our trading operations. The speed and reliability are unmatched in the industry.',
        author: 'Michael Chen',
        role: 'CTO, Apex Capital'
      },
      metrics: [
        { label: 'Latency Reduction', value: '99.7%' },
        { label: 'Monthly Volume', value: '$2.3B' },
        { label: 'Cost Savings', value: '$4.2M' },
        { label: 'Uptime', value: '99.99%' }
      ]
    },
    {
      id: 2,
      title: 'E-commerce Platform Enables Crypto Payments',
      company: 'ShopGlobal Inc.',
      industry: 'E-commerce',
      challenge: 'Customers demanding cryptocurrency payment options. High cross-border transaction fees eating into margins.',
      solution: 'Integrated BitSolidus payment gateway supporting 15+ cryptocurrencies with automatic fiat conversion.',
      results: {
        adoption: '34% of transactions now crypto',
        fees: '67% reduction in payment processing fees',
        revenue: '28% increase in international sales'
      },
      testimonial: {
        text: 'Our customers love paying with crypto. BitSolidus made integration seamless and the fees are incredible.',
        author: 'Sarah Martinez',
        role: 'VP of Payments, ShopGlobal'
      },
      metrics: [
        { label: 'Crypto Adoption', value: '34%' },
        { label: 'Fee Reduction', value: '67%' },
        { label: 'Revenue Growth', value: '28%' },
        { label: 'Countries Served', value: '45+' }
      ]
    },
    {
      id: 3,
      title: 'Healthcare Startup Streamlines International Payments',
      company: 'MediConnect Health',
      industry: 'Healthcare',
      challenge: 'Paying international medical suppliers was slow and expensive. Wire transfers taking 5-7 business days.',
      solution: 'Deployed BitSolidus B2B payment solution for instant cross-border settlements.',
      results: {
        speed: 'Same-day settlement (from 5-7 days)',
        cost: '82% reduction in transaction costs',
        efficiency: '15 hours/week saved on payment processing'
      },
      testimonial: {
        text: 'We can now pay our suppliers instantly and focus on what matters—patient care.',
        author: 'Dr. James Wilson',
        role: 'CFO, MediConnect Health'
      },
      metrics: [
        { label: 'Settlement Time', value: '<24h' },
        { label: 'Cost Savings', value: '82%' },
        { label: 'Time Saved', value: '15h/week' },
        { label: 'Suppliers Paid', value: '120+' }
      ]
    },
    {
      id: 4,
      title: 'Real Estate Platform Tokenizes Property Assets',
      company: 'PropertyChain',
      industry: 'Real Estate',
      challenge: 'Traditional real estate investment limited to wealthy individuals. High barriers to entry preventing broader participation.',
      solution: 'Built tokenization platform on BitSolidus infrastructure, enabling fractional property ownership.',
      results: {
        accessibility: '$100 minimum investment (from $50k)',
        liquidity: '24/7 secondary market trading',
        growth: '$50M tokenized in first quarter'
      },
      testimonial: {
        text: 'BitSolidus enabled us to democratize real estate investing. Anyone can now own a piece of premium properties.',
        author: 'Amanda Foster',
        role: 'CEO, PropertyChain'
      },
      metrics: [
        { label: 'Tokenized Assets', value: '$50M' },
        { label: 'Min. Investment', value: '$100' },
        { label: 'Active Investors', value: '12,000+' },
        { label: 'Properties', value: '85' }
      ]
    },
    {
      id: 5,
      title: 'Tech Company Manages Treasury with Crypto',
      company: 'InnovateTech Solutions',
      industry: 'Technology',
      challenge: 'Corporate cash losing value due to inflation. Seeking diversified treasury management strategy.',
      solution: 'Implemented BitSolidus institutional custody and staking services for corporate treasury.',
      results: {
        yield: '8.5% APY on crypto holdings',
        diversification: '40% of treasury in digital assets',
        security: 'Institutional-grade custody with insurance'
      },
      testimonial: {
        text: 'BitSolidus helps us preserve and grow our treasury value while maintaining complete security.',
        author: 'Robert Kim',
        role: 'CFO, InnovateTech'
      },
      metrics: [
        { label: 'Treasury Yield', value: '8.5%' },
        { label: 'Digital Allocation', value: '40%' },
        { label: 'Assets Secured', value: '$120M' },
        { label: 'Insurance Coverage', value: '$250M' }
      ]
    },
    {
      id: 6,
      title: 'Remittance Company Revolutionizes Money Transfers',
      company: 'SendFast Global',
      industry: 'Finance',
      challenge: 'Traditional remittance costly and slow. Customers losing 7-10% in fees and waiting days for transfers.',
      solution: 'Leveraged BitSolidus blockchain infrastructure for instant, low-cost international money transfers.',
      results: {
        cost: 'Average fee reduced to 1.2%',
        speed: 'Instant transfers (from 3-5 days)',
        volume: '$500M+ processed annually'
      },
      testimonial: {
        text: 'We\'re helping families save millions in fees. BitSolidus technology makes it possible.',
        author: 'Carlos Rodriguez',
        role: 'Founder, SendFast'
      },
      metrics: [
        { label: 'Fee Reduction', value: '85%' },
        { label: 'Transfer Speed', value: 'Instant' },
        { label: 'Annual Volume', value: '$500M' },
        { label: 'Users Served', value: '250,000+' }
      ]
    }
  ];

  const filteredCases = caseStudies.filter(cs => 
    selectedIndustry === 'all' || cs.industry === selectedIndustry
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Success Stories<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                From Our Clients
              </span>
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              See how businesses worldwide are transforming their operations with BitSolidus
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {industries.map(industry => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedIndustry === industry
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {industry === 'all' ? 'All Industries' : industry}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Case Study Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCases.map((cs, index) => (
            <motion.div
              key={cs.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
              onClick={() => setSelectedCase(cs)}
            >
              <div className="h-48 bg-gradient-to-br from-purple-600 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                    {cs.industry}
                  </span>
                  <h3 className="text-xl font-bold mt-2 line-clamp-2">{cs.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-purple-600 font-medium mb-2">{cs.company}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {cs.challenge}
                </p>
                <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
                  Read More <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedCase(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-start justify-between">
                <div>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                    {selectedCase.industry}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {selectedCase.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCase.company}</p>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Challenge */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                    The Challenge
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">{selectedCase.challenge}</p>
                </div>

                {/* Solution */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    The Solution
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">{selectedCase.solution}</p>
                </div>

                {/* Metrics */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Results & Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedCase.metrics.map((metric, index) => (
                      <div key={index} className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                          {metric.value}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonial */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border-l-4 border-purple-600">
                  <Quote className="w-8 h-8 text-purple-600 mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                    "{selectedCase.testimonial.text}"
                  </p>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedCase.testimonial.author}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCase.testimonial.role}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
                <a
                  href="/contact"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all inline-flex items-center gap-2"
                >
                  Start Your Success Story
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CaseStudies;
