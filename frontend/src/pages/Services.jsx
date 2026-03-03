import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { 
  BarChart3, 
  Wallet, 
  Shield, 
  Zap, 
  Globe, 
  Headphones,
  ArrowRight,
  Check,
  TrendingUp,
  Lock,
  Smartphone,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';

const Services = () => {
  const { config: siteConfig } = useSelector((state) => state.siteConfig);
  const mainServices = [
    {
      icon: BarChart3,
      title: 'Advanced Trading',
      description: 'Professional-grade trading tools with real-time charts, technical indicators, and instant order execution.',
      features: ['Real-time order book', 'Advanced charting', 'Multiple order types', 'API trading'],
      color: 'from-purple-500 to-indigo-600',
      image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&q=80&w=600'
    },
    {
      icon: Wallet,
      title: 'Secure Wallet',
      description: 'Institutional-grade custody solution with multi-signature security and cold storage protection.',
      features: ['Cold storage', 'Multi-sig security', 'Insurance coverage', 'Instant withdrawals'],
      color: 'from-blue-500 to-cyan-600',
      image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=600'
    },
    {
      icon: Shield,
      title: 'Security First',
      description: 'Comprehensive security measures including 2FA, biometric authentication, and 24/7 monitoring.',
      features: ['2FA authentication', 'Biometric login', 'Anti-phishing', '24/7 monitoring'],
      color: 'from-green-500 to-emerald-600',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600'
    },
    {
      icon: Zap,
      title: 'Lightning Execution',
      description: 'Ultra-fast trade execution with sub-millisecond latency and 99.99% uptime guarantee.',
      features: ['Sub-ms latency', '99.99% uptime', 'Auto-scaling', 'Global CDN'],
      color: 'from-yellow-500 to-orange-600',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=600'
    },
  ];

  const additionalServices = [
    {
      icon: Globe,
      title: 'Global Markets',
      description: 'Access to 150+ markets worldwide with competitive fees and deep liquidity.',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support via chat, email, and phone.',
    },
    {
      icon: TrendingUp,
      title: 'Portfolio Analytics',
      description: 'Comprehensive portfolio tracking with performance insights and tax reporting.',
    },
    {
      icon: Lock,
      title: 'Institutional Services',
      description: 'Custom solutions for institutions including OTC trading and custody.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Trading',
      description: 'Full-featured mobile apps for iOS and Android devices.',
    },
    {
      icon: Cpu,
      title: 'API Access',
      description: 'Powerful REST and WebSocket APIs for algorithmic trading.',
    },
  ];

  const pricingTiers = [
    {
      name: 'Basic',
      price: '0%',
      description: 'Perfect for beginners',
      features: [
        'Spot trading',
        'Basic charts',
        'Mobile app access',
        'Email support',
        'Up to $10K daily volume',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '0.1%',
      description: 'For active traders',
      features: [
        'Everything in Basic',
        'Advanced charts',
        'API access',
        'Priority support',
        'Up to $100K daily volume',
        'Lower fees',
      ],
      cta: 'Upgrade to Pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For institutions',
      features: [
        'Everything in Pro',
        'Dedicated manager',
        'Custom integrations',
        'OTC trading',
        'Unlimited volume',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Breadcrumb />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
              Our Services
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Comprehensive Crypto<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Trading Solutions
              </span>
            </h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              From beginner-friendly tools to institutional-grade solutions, we provide everything you need to succeed in the crypto markets.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
              Core Services
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              Everything You Need to Trade
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mainServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6`}>
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative h-64 md:h-auto">
                    <img 
                      src={service.image}
                      alt={service.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 dark:from-gray-800 to-transparent md:from-gray-50/0 md:via-gray-50/0 md:to-transparent"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
              More Services
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              Additional Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Flexible pricing options designed to meet the needs of every trader, from beginners to institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl p-8 ${
                  tier.popular
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-xl scale-105'
                    : 'bg-white dark:bg-gray-800 shadow-lg'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-xl font-bold mb-2 ${tier.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className={`text-4xl font-bold ${tier.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {tier.price}
                    </span>
                    {tier.price !== 'Custom' && (
                      <span className={`ml-1 ${tier.popular ? 'text-white/80' : 'text-gray-500'}`}>/trade</span>
                    )}
                  </div>
                  <p className={`mt-2 text-sm ${tier.popular ? 'text-white/80' : 'text-gray-500'}`}>
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${
                        tier.popular ? 'text-white' : 'text-green-500'
                      }`} />
                      <span className={tier.popular ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={tier.name === 'Enterprise' ? '/contact' : '/register'}
                  className={`block w-full py-3 text-center rounded-xl font-semibold transition-colors ${
                    tier.popular
                      ? 'bg-white text-purple-600 hover:bg-gray-100'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join thousands of traders who trust {siteConfig?.siteName || 'BitSolidus'} for their cryptocurrency trading needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
