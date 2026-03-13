import { motion } from 'framer-motion';
import { Linkedin, Twitter, Github, Mail, Users, ArrowRight, Heart } from 'lucide-react';

const Team = () => {
  const team = [
    {
      name: 'Alex Thompson',
      role: 'CEO & Co-Founder',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
      bio: 'Former VP at Goldman Sachs. 15+ years in finance and blockchain.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Sarah Chen',
      role: 'CTO & Co-Founder',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      bio: 'Ex-Google senior engineer. MIT Computer Science PhD.',
      social: { linkedin: '#', twitter: '#', github: '#' }
    },
    {
      name: 'Michael Rodriguez',
      role: 'Chief Product Officer',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
      bio: 'Previously led product at Coinbase. Stanford MBA.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Emily Watson',
      role: 'VP of Engineering',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
      bio: 'Built engineering teams at Stripe and Square.',
      social: { linkedin: '#', github: '#' }
    },
    {
      name: 'David Kim',
      role: 'Head of Design',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      bio: 'Award-winning designer. Former design lead at Airbnb.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Lisa Patel',
      role: 'VP of Marketing',
      image: 'https://images.unsplash.com/photo-1598550476439-cce866211e69?auto=format&fit=crop&q=80&w=400',
      bio: 'Grew marketing teams at Robinhood and Revolut.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'James O\'Brien',
      role: 'Head of Security',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      bio: 'Former NSA cybersecurity expert. CISSP certified.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Anna Kowalski',
      role: 'VP of Customer Success',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400',
      bio: '10+ years building world-class support teams.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Robert Zhang',
      role: 'Lead Blockchain Engineer',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      bio: 'Core contributor to Ethereum. Smart contract security expert.',
      social: { linkedin: '#', github: '#', twitter: '#' }
    }
  ];

  const values = [
    { icon: Heart, title: 'User First', description: 'Everything we build starts with our users\' needs' },
    { icon: Users, title: 'Transparency', description: 'Open communication and honest feedback' },
    { icon: TrendingUp, title: 'Innovation', description: 'Constantly pushing boundaries and exploring new ideas' },
    { icon: Shield, title: 'Security', description: 'Protecting our users\' assets is our top priority' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Meet the Team Behind<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                BitSolidus
              </span>
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              We're a diverse team of passionate individuals united by a common mission: to make cryptocurrency trading accessible to everyone.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Company Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Values
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The principles that guide everything we do
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Grid */}
      <div className="bg-gray-100 dark:bg-gray-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Leadership Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Meet the experienced leaders driving our vision forward
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                      {member.social.linkedin && (
                        <a href={member.social.linkedin} className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                          <Linkedin className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {member.social.twitter && (
                        <a href={member.social.twitter} className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                          <Twitter className="w-5 h-5 text-white" />
                        </a>
                      )}
                      {member.social.github && (
                        <a href={member.social.github} className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                          <Github className="w-5 h-5 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-purple-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Join CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
          <div className="relative">
            <h2 className="text-4xl font-bold mb-4">
              Want to Join Our Team?
            </h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
              We're always looking for talented individuals who share our passion for innovation and excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/careers"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                View Open Positions
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-purple-700/50 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors border border-white/20"
              >
                Contact Us
                <Mail className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Team;
