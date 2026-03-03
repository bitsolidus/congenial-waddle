import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { 
  Target, 
  Eye, 
  Heart, 
  Shield, 
  Users, 
  Award,
  TrendingUp,
  Globe,
  CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';

const About = () => {
  const { config: siteConfig } = useSelector((state) => state.siteConfig);
  const stats = [
    { value: '2019', label: 'Founded' },
    { value: '50K+', label: 'Active Users' },
    { value: '$2.5B+', label: 'Trading Volume' },
    { value: '150+', label: 'Countries' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'We prioritize the safety of your assets with industry-leading security measures and cold storage solutions.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Heart,
      title: 'Customer Centric',
      description: 'Our users are at the heart of everything we do. We listen, adapt, and continuously improve our platform.',
      color: 'from-red-500 to-pink-600'
    },
    {
      icon: TrendingUp,
      title: 'Innovation Driven',
      description: 'We stay ahead of the curve by embracing new technologies and providing cutting-edge trading tools.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Globe,
      title: 'Global Accessibility',
      description: 'We believe everyone deserves access to financial opportunities, regardless of their location.',
      color: 'from-purple-500 to-violet-600'
    },
  ];

  const team = [
    {
      name: 'Alexander Mitchell',
      role: 'CEO & Founder',
      image: 'AM',
      bio: 'Former Goldman Sachs trader with 15+ years in financial markets.',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      name: 'Sarah Chen',
      role: 'Chief Technology Officer',
      image: 'SC',
      bio: 'Ex-Google engineer specializing in high-frequency trading systems.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      name: 'Michael Roberts',
      role: 'Head of Security',
      image: 'MR',
      bio: 'Cybersecurity expert with experience at NSA and major tech firms.',
      color: 'from-green-500 to-teal-600'
    },
    {
      name: 'Emily Watson',
      role: 'Chief Operating Officer',
      image: 'EW',
      bio: 'Former McKinsey consultant with expertise in scaling tech startups.',
      color: 'from-orange-500 to-red-600'
    },
  ];

  const timeline = [
    {
      year: '2019',
      title: 'Company Founded',
      description: `${siteConfig?.siteName || 'BitSolidus'} was established with a vision to democratize cryptocurrency trading.`,
      icon: Target
    },
    {
      year: '2020',
      title: 'Platform Launch',
      description: 'Official launch of our trading platform with support for major cryptocurrencies.',
      icon: Globe
    },
    {
      year: '2021',
      title: 'Global Expansion',
      description: 'Expanded operations to 100+ countries and reached 10,000 active users.',
      icon: Users
    },
    {
      year: '2022',
      title: 'Security Milestone',
      description: 'Achieved SOC 2 Type II certification and implemented advanced security features.',
      icon: Shield
    },
    {
      year: '2023',
      title: 'Innovation Award',
      description: 'Recognized as "Best Crypto Trading Platform" by FinTech Awards.',
      icon: Award
    },
    {
      year: '2024',
      title: '50K Users Milestone',
      description: 'Celebrated 50,000 active traders and $2.5B in trading volume.',
      icon: TrendingUp
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Breadcrumb />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
              About {siteConfig?.siteName || 'BitSolidus'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Building the Future of<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Digital Finance
              </span>
            </h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              We are on a mission to make cryptocurrency trading accessible, secure, and profitable for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-6">
                From Vision to Reality
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                  {siteConfig?.siteName || 'BitSolidus'} was founded in 2019 by a group of passionate traders and technologists who believed that cryptocurrency trading should be accessible to everyone, not just institutional investors.
                </p>
                <p>
                  What started as a small project has grown into a global platform serving over 50,000 traders across 150+ countries. Our journey has been defined by continuous innovation, unwavering commitment to security, and a deep understanding of our users needs.
                </p>
                <p>
                  Today, we are proud to be one of the most trusted names in cryptocurrency trading, with over $2.5 billion in trading volume and industry-leading security standards.
                </p>
              </div>
              
              <div className="mt-8 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {['AM', 'SC', 'MR', 'EW'].map((initials, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white dark:border-gray-900">
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Leadership Team</p>
                  <p className="text-xs text-gray-500">50+ years combined experience</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                  alt="Our Team"
                  className="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
              </div>
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">SOC 2 Certified</p>
                    <p className="text-sm text-gray-500">Enterprise Security</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                To democratize access to cryptocurrency markets by providing a secure, intuitive, and feature-rich trading platform that empowers individuals to take control of their financial future.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                To become the world's most trusted cryptocurrency trading platform, known for our unwavering commitment to security, innovation, and customer success in the rapidly evolving digital asset landscape.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              What We Stand For
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800" id="team">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
              Leadership
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our leadership team brings decades of experience from top financial and technology companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-2xl font-bold mb-4`}>
                  {member.image}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              Company Timeline
            </h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-600 hidden md:block"></div>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                        {item.year}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-center justify-center my-4 md:my-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg z-10">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Our Growing Team
          </h2>
          <p className="text-white/90 text-lg mb-8">
            We are always looking for talented individuals who are passionate about cryptocurrency and fintech.
          </p>
          <a
            href="/careers"
            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            View Open Positions
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
