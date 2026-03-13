import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Mail, Calendar, CheckCircle } from 'lucide-react';

const Privacy = () => {
  const sections = [
    {
      icon: Shield,
      title: 'Information We Collect',
      content: (
        <div className="space-y-4">
          <p>We collect information that you provide directly to us, including:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Account Information:</strong> Name, email address, username, password</li>
            <li><strong>Financial Information:</strong> Bank account details, transaction history, cryptocurrency addresses</li>
            <li><strong>Identity Verification:</strong> Government-issued ID, proof of address, selfie verification</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system</li>
            <li><strong>Usage Data:</strong> Trading activity, pages visited, time spent on platform</li>
          </ul>
        </div>
      )
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: (
        <div className="space-y-4">
          <p>We use the collected information for the following purposes:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>To provide and maintain our trading platform services</li>
            <li>To verify your identity and comply with KYC/AML regulations</li>
            <li>To process transactions and manage your account</li>
            <li>To send you technical notices, updates, and support messages</li>
            <li>To detect and prevent fraud, security breaches, and illegal activities</li>
            <li>To comply with legal obligations and regulatory requirements</li>
            <li>To improve our services and user experience through analytics</li>
          </ul>
        </div>
      )
    },
    {
      icon: Eye,
      title: 'Information Sharing and Disclosure',
      content: (
        <div className="space-y-4">
          <p>We do not sell, trade, or rent your personal information to third parties. However, we may share your information in the following circumstances:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in platform operations (payment processors, cloud hosting, customer support)</li>
            <li><strong>Legal Requirements:</strong> When required by law, regulation, legal process, or governmental request</li>
            <li><strong>Protection of Rights:</strong> To protect the safety, rights, and property of BitSolidus, our users, or others</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            <li><strong>With Consent:</strong> When we have your explicit consent to do so</li>
          </ul>
        </div>
      )
    },
    {
      icon: Database,
      title: 'Data Security and Retention',
      content: (
        <div className="space-y-4">
          <p><strong>Security Measures:</strong></p>
          <p>We implement industry-standard security measures to protect your personal information, including:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Encryption of data in transit using SSL/TLS technology</li>
            <li>Secure storage of sensitive information with encryption at rest</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Two-factor authentication (2FA) for account access</li>
            <li>Cold storage for majority of cryptocurrency assets</li>
            <li>Access controls and employee training on data protection</li>
          </ul>
          <p className="mt-4"><strong>Data Retention:</strong></p>
          <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations (typically 5-7 years for financial records), resolve disputes, and enforce our agreements.</p>
        </div>
      )
    },
    {
      icon: Mail,
      title: 'Your Rights and Choices',
      content: (
        <div className="space-y-4">
          <p>Depending on your location, you may have the following rights regarding your personal information:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information under certain circumstances</li>
            <li><strong>Restriction:</strong> Request restriction of processing your data</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
            <li><strong>Opt-Out:</strong> Opt-out of marketing communications at any time</li>
            <li><strong>Cookie Control:</strong> Manage cookie preferences through your browser settings</li>
          </ul>
          <p className="mt-4">To exercise these rights, please contact us at <a href="mailto:privacy@bitsolidus.io" className="text-purple-600 hover:underline">privacy@bitsolidus.io</a></p>
        </div>
      )
    },
    {
      icon: Calendar,
      title: 'Cookies and Tracking Technologies',
      content: (
        <div className="space-y-4">
          <p>We use cookies and similar tracking technologies to enhance your browsing experience and analyze website traffic. Types of cookies we use:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Essential Cookies:</strong> Necessary for platform functionality and security</li>
            <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Security Cookies:</strong> Support security features and help detect malicious activity</li>
          </ul>
          <p className="mt-4">You can control cookie settings through your browser. Most browsers allow you to refuse or accept cookies, delete existing cookies, or receive notifications when cookies are set.</p>
        </div>
      )
    },
    {
      icon: CheckCircle,
      title: 'Children\'s Privacy',
      content: (
        <div className="space-y-4">
          <p>Our services are not directed to individuals under the age of 18 (or the age of legal majority in your jurisdiction). We do not knowingly collect personal information from children. If you believe that we have collected information from a child, please contact us immediately at <a href="mailto:privacy@bitsolidus.io" className="text-purple-600 hover:underline">privacy@bitsolidus.io</a>, and we will take steps to delete such information.</p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last Updated: January 1, 2025
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              GDPR Compliant
            </span>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Introduction</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Welcome to BitSolidus ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy describes how BitSolidus collects, uses, shares, and protects your information when you use our cryptocurrency trading platform and related services (collectively, the "Services").
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            By accessing or using our Services, you agree to the practices described in this Privacy Policy. If you do not agree with this policy, please do not use our Services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <section.icon className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">{section.title}</h2>
                </div>
              </div>
              <div className="p-6">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Questions About Your Privacy?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <Mail className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
              <a href="mailto:privacy@bitsolidus.io" className="text-purple-600 hover:underline font-medium">
                privacy@bitsolidus.io
              </a>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <Mail className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">General Inquiries</p>
              <a href="mailto:support@bitsolidus.io" className="text-purple-600 hover:underline font-medium">
                support@bitsolidus.io
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the updated Privacy Policy on this page and updating the "Last Updated" date.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Privacy;
