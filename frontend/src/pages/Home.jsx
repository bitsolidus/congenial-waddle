import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  TrendingUp, 
  Users, 
  Award,
  ChevronRight,
  Star,
  Play,
  CheckCircle2
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCryptoPrices } from '../store/cryptoSlice';
import { fetchSiteConfig } from '../store/siteConfigSlice';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const dispatch = useDispatch();
  const { prices, isLoading } = useSelector((state) => state.crypto);
  const { config: siteConfig } = useSelector((state) => state.siteConfig);
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    volume: 0,
    countries: 0,
    satisfaction: 0
  });

  useEffect(() => {
    // Animate stats on mount
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    const targets = { users: 50000, volume: 2.5, countries: 150, satisfaction: 99 };
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedStats({
        users: Math.floor(targets.users * progress),
        volume: Math.round(targets.volume * progress * 10) / 10,
        countries: Math.floor(targets.countries * progress),
        satisfaction: Math.floor(targets.satisfaction * progress)
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  // Fetch crypto prices and site config on mount
  useEffect(() => {
    dispatch(fetchCryptoPrices());
    dispatch(fetchSiteConfig());
    // Refresh prices every 60 seconds
    const interval = setInterval(() => {
      dispatch(fetchCryptoPrices());
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const cryptoList = [
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      price: prices?.BTC?.price || 65000, 
      change: prices?.BTC?.change24h || 0 
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      price: prices?.ETH?.price || 3500, 
      change: prices?.ETH?.change24h || 0 
    },
    { 
      symbol: 'USDT', 
      name: 'Tether', 
      price: prices?.USDT?.price || 1.00, 
      change: prices?.USDT?.change24h || 0 
    },
    { 
      symbol: 'BNB', 
      name: 'BNB', 
      price: prices?.BNB?.price || 600, 
      change: prices?.BNB?.change24h || 0 
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Your assets are protected with industry-leading security protocols and cold storage.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Execute trades in milliseconds with our high-performance trading engine.',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Trade from anywhere in the world with 24/7 platform availability.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Make informed decisions with real-time charts and market insights.',
      color: 'from-purple-500 to-pink-600'
    },
  ];

  const testimonials = [
    {
      name: 'Michael Chen',
      role: 'Professional Trader',
      content: `${siteConfig?.siteName || 'BitSolidus'} has transformed my trading experience. The platform is intuitive and the support team is exceptional.`,
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Sarah Johnson',
      role: 'Crypto Investor',
      content: `I have tried many platforms, but ${siteConfig?.siteName || 'BitSolidus'} stands out with its security features and low fees.`,
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'David Park',
      role: 'Day Trader',
      content: 'The real-time analytics and fast execution have helped me maximize my profits consistently.',
      rating: 5,
      avatar: 'DP'
    },
  ];

  const blogPosts = [
    {
      title: 'Understanding Bitcoin Halving',
      excerpt: 'Learn how Bitcoin halving events impact the market and what to expect in 2024.',
      category: 'Education',
      date: 'Jan 15, 2024',
      readTime: '5 min read'
    },
    {
      title: 'Top 10 Crypto Trading Strategies',
      excerpt: 'Discover proven strategies used by successful crypto traders worldwide.',
      category: 'Trading',
      date: 'Jan 12, 2024',
      readTime: '8 min read'
    },
    {
      title: 'DeFi Revolution: What You Need to Know',
      excerpt: 'Explore the world of decentralized finance and its potential impact.',
      category: 'DeFi',
      date: 'Jan 10, 2024',
      readTime: '6 min read'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800) 
              }}
              animate={{ 
                y: [null, -100],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: Math.random() * 5 + 5, 
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Trusted by 50,000+ traders on {siteConfig?.siteName || 'BitSolidus'}
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Trade Crypto with{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-3xl mx-auto">
              Join the most secure and user-friendly cryptocurrency trading platform. 
              Start your journey to financial freedom today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/20">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: `${animatedStats.users.toLocaleString()}+`, label: 'Active Users' },
              { value: `$${animatedStats.volume}B+`, label: 'Trading Volume' },
              { value: `${animatedStats.countries}+`, label: 'Countries' },
              { value: `${animatedStats.satisfaction}%`, label: 'Satisfaction' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Market Overview Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Live Market Prices
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Track real-time cryptocurrency prices and market trends
            </p>
            {isLoading && (
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating prices...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cryptoList.map((crypto, index) => (
              <motion.div
                key={crypto.symbol}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                      crypto.symbol === 'BTC' ? 'bg-orange-500' :
                      crypto.symbol === 'ETH' ? 'bg-blue-500' :
                      crypto.symbol === 'USDT' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {crypto.symbol[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{crypto.name}</h3>
                      <p className="text-sm text-gray-500">{crypto.symbol}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: crypto.price < 10 ? 2 : 0, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <span className={`flex items-center text-sm font-medium ${
                    crypto.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              Features that Set Us Apart
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of cryptocurrency trading with our cutting-edge features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trading Platforms Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-purple-300 font-semibold text-sm uppercase tracking-wider">
                Trading Platforms
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-6">
                Trade Anywhere, Anytime
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Access your account and trade on the go with our mobile apps and web platform. 
                Available on iOS, Android, and all major browsers.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  'Real-time price alerts',
                  'Advanced charting tools',
                  'One-click trading',
                  'Portfolio tracking',
                  'Secure biometric login'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-purple-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  App Store
                </button>
                <button className="px-6 py-3 bg-white text-purple-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.303 2.303-8.633-8.635z"/>
                  </svg>
                  Google Play
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&q=80&w=800" 
                  alt="Trading Platform"
                  className="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              What Our Users Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
                Latest News
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                From Our Blog
              </h2>
            </div>
            <Link 
              to="/blog" 
              className="mt-4 md:mt-0 inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300"
            >
              View All Articles
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden mb-4">
                  <img 
                    src={`https://images.unsplash.com/photo-${['1639762681485-074b7f938ba0', '1611974789855-9c2a0a7236a3', '1621761191319-c6fb62004040'][index]}?auto=format&fit=crop&q=80&w=600`}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {post.excerpt}
                </p>
              </motion.article>
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
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of traders who trust {siteConfig?.siteName || 'BitSolidus'} for their cryptocurrency trading needs.
            Sign up today and get started in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Free Account
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

export default Home;
