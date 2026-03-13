import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, MapPin, DollarSign, Clock, Users, 
  TrendingUp, Award, Heart, CheckCircle, ArrowRight,
  Search, Filter, X, Mail, Upload, Globe
} from 'lucide-react';

const Careers = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const departments = ['all', 'Engineering', 'Marketing', 'Support', 'Product', 'Operations'];

  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$120k - $180k',
      posted: '2 days ago',
      description: 'We're looking for an experienced Frontend Engineer to join our growing team and help build the future of cryptocurrency trading.',
      requirements: [
        '5+ years of experience with React and modern JavaScript',
        'Strong understanding of TypeScript and state management',
        'Experience with Web3 and blockchain technologies',
        'Excellent problem-solving and communication skills',
        'Bachelor's degree in Computer Science or related field'
      ],
      responsibilities: [
        'Build responsive and performant user interfaces',
        'Collaborate with designers and backend engineers',
        'Optimize application for maximum speed and scalability',
        'Mentor junior developers and conduct code reviews',
        'Stay up-to-date with emerging frontend technologies'
      ],
      benefits: [
        'Competitive salary and equity package',
        'Comprehensive health, dental, and vision insurance',
        'Unlimited PTO and flexible working hours',
        'Home office stipend and latest tech equipment',
        'Learning and development budget'
      ]
    },
    {
      id: 2,
      title: 'Backend Engineer (Blockchain)',
      department: 'Engineering',
      location: 'Remote / New York',
      type: 'Full-time',
      salary: '$130k - $200k',
      posted: '1 week ago',
      description: 'Join our blockchain team to build scalable backend systems and integrate with multiple cryptocurrency networks.',
      requirements: [
        '4+ years of backend development experience',
        'Strong proficiency in Node.js, Python, or Go',
        'Experience with blockchain protocols and smart contracts',
        'Knowledge of database systems (PostgreSQL, MongoDB)',
        'Understanding of microservices architecture'
      ],
      responsibilities: [
        'Design and implement RESTful APIs',
        'Build and maintain blockchain integrations',
        'Ensure system security and data protection',
        'Optimize database queries and performance',
        'Participate in on-call rotation'
      ],
      benefits: [
        'Competitive salary and equity package',
        'Comprehensive health, dental, and vision insurance',
        'Unlimited PTO and flexible working hours',
        'Home office stipend and latest tech equipment',
        'Learning and development budget'
      ]
    },
    {
      id: 3,
      title: 'Product Designer',
      department: 'Product',
      location: 'Remote',
      type: 'Full-time',
      salary: '$100k - $160k',
      posted: '3 days ago',
      description: 'We're seeking a talented Product Designer to create intuitive and beautiful experiences for our trading platform.',
      requirements: [
        '4+ years of product design experience',
        'Strong portfolio demonstrating UX/UI skills',
        'Proficiency in Figma and design systems',
        'Experience with user research and testing',
        'Understanding of web3 and crypto is a plus'
      ],
      responsibilities: [
        'Design user flows, wireframes, and high-fidelity mockups',
        'Conduct user research and usability testing',
        'Collaborate with product managers and engineers',
        'Maintain and evolve our design system',
        'Present design concepts to stakeholders'
      ],
      benefits: [
        'Competitive salary and equity package',
        'Comprehensive health, dental, and vision insurance',
        'Unlimited PTO and flexible working hours',
        'Home office stipend and latest tech equipment',
        'Learning and development budget'
      ]
    },
    {
      id: 4,
      title: 'Customer Support Specialist',
      department: 'Support',
      location: 'Remote',
      type: 'Full-time',
      salary: '$50k - $70k',
      posted: '5 days ago',
      description: 'Help our users succeed by providing exceptional customer support and resolving their inquiries promptly.',
      requirements: [
        '2+ years of customer support experience',
        'Excellent written and verbal communication',
        'Ability to explain technical concepts simply',
        'Experience with support tools (Zendesk, Intercom)',
        'Passion for cryptocurrency and blockchain'
      ],
      responsibilities: [
        'Respond to customer inquiries via chat and email',
        'Troubleshoot technical issues and escalate when needed',
        'Document common issues and solutions',
        'Gather and share customer feedback with product team',
        'Maintain high customer satisfaction ratings'
      ],
      benefits: [
        'Competitive salary and equity package',
        'Comprehensive health, dental, and vision insurance',
        'Unlimited PTO and flexible working hours',
        'Home office stipend and latest tech equipment',
        'Learning and development budget'
      ]
    },
    {
      id: 5,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Remote / San Francisco',
      type: 'Full-time',
      salary: '$90k - $140k',
      posted: '1 week ago',
      description: 'Lead our marketing initiatives and drive user acquisition through innovative campaigns and strategies.',
      requirements: [
        '5+ years of marketing experience, preferably in fintech/crypto',
        'Proven track record of successful digital marketing campaigns',
        'Strong analytical and data-driven mindset',
        'Experience with SEO, SEM, and social media marketing',
        'Excellent project management skills'
      ],
      responsibilities: [
        'Develop and execute marketing strategies',
        'Manage paid advertising campaigns',
        'Create engaging content for various channels',
        'Analyze campaign performance and optimize ROI',
        'Collaborate with product and sales teams'
      ],
      benefits: [
        'Competitive salary and equity package',
        'Comprehensive health, dental, and vision insurance',
        'Unlimited PTO and flexible working hours',
        'Home office stipend and latest tech equipment',
        'Learning and development budget'
      ]
    },
    {
      id: 6,
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$140k - $210k',
      posted: '4 days ago',
      description: 'Build and maintain our cloud infrastructure to ensure high availability and security of our trading platform.',
      requirements: [
        '4+ years of DevOps or SRE experience',
        'Strong knowledge of AWS, GCP, or Azure',
        'Experience with Kubernetes and Docker',
        'Proficiency in Infrastructure as Code (Terraform)',
        'Understanding of CI/CD pipelines'
      ],
      responsibilities: [
        'Manage cloud infrastructure and deployments',
        'Implement monitoring and alerting systems',
        'Automate deployment processes',
        'Ensure system security and compliance',
        'Participate in on-call rotation'
      ],
      benefits: [
        'Competitive salary and equity package',
        'Comprehensive health, dental, and vision insurance',
        'Unlimited PTO and flexible working hours',
        'Home office stipend and latest tech equipment',
        'Learning and development budget'
      ]
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const stats = [
    { icon: Users, label: 'Team Members', value: '50+' },
    { icon: Globe, label: 'Countries', value: '20+' },
    { icon: TrendingUp, label: 'User Growth', value: '300%' },
    { icon: Award, label: 'Industry Awards', value: '15+' }
  ];

  const perks = [
    { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive medical, dental, and vision coverage for you and your family' },
    { icon: DollarSign, title: 'Competitive Compensation', description: 'Top-tier salary, equity packages, and performance bonuses' },
    { icon: Clock, title: 'Flexible Work', description: 'Remote-first culture with flexible hours and unlimited PTO' },
    { icon: TrendingUp, title: 'Career Growth', description: 'Learning budget, conference attendance, and mentorship programs' },
    { icon: Briefcase, title: 'Latest Equipment', description: 'MacBook Pro, monitor, and home office setup stipend' },
    { icon: Users, title: 'Team Events', description: 'Quarterly retreats, team building activities, and annual company offsite' }
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
              Build the Future of<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Cryptocurrency Trading
              </span>
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Join our mission to make cryptocurrency trading accessible, secure, and lightning-fast for millions of users worldwide.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-purple-300" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-purple-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Culture Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Work at BitSolidus?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We're building more than just a product—we're creating a culture of innovation, collaboration, and excellence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {perks.map((perk, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <perk.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {perk.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {perk.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Job Listings */}
      <div className="bg-gray-100 dark:bg-gray-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Find your perfect role and make an impact
            </p>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center max-w-4xl mx-auto">
              {/* Department Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {departments.map(dept => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDepartment(dept)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDepartment === dept
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {dept === 'all' ? 'All Departments' : dept}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Job Cards */}
          <div className="grid gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                          {job.title}
                        </h3>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                          {job.department}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Posted {job.posted}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <span className="font-medium">View Details</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No positions found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedJob.title}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedJob.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedJob.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {selectedJob.salary}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About the Role</h3>
                  <p className="text-gray-700 dark:text-gray-300">{selectedJob.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Responsibilities</h3>
                  <ul className="space-y-2">
                    {selectedJob.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Benefits</h3>
                  <ul className="space-y-2">
                    {selectedJob.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <Award className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowApplicationForm(true);
                    setSelectedJob(null);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Apply Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Form Modal */}
      <AnimatePresence>
        {showApplicationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApplicationForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Apply for Position</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Send us your application</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resume/CV *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                    <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                      Choose File
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Tell us why you're interested in this position..."
                  ></textarea>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all">
                  Submit Application
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Careers;
