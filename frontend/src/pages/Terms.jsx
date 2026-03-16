import { motion } from 'framer-motion';
import { FileText, Shield, AlertCircle, CheckCircle, Scale, Globe, DollarSign, Lock } from 'lucide-react';

const Terms = () => {
  const sections = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            By accessing or using BitSolidus ("we," "our," or "us"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            We reserve the right to modify these terms at any time without prior notice. Your continued use of the Services following any changes constitutes your acceptance of such changes. It is your responsibility to review these terms periodically for updates.
          </p>
        </div>
      )
    },
    {
      icon: Shield,
      title: 'Account Registration and Security',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300"><strong>Registration Requirements:</strong></p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>You must be at least 18 years old (or the age of legal majority in your jurisdiction)</li>
            <li>You must provide accurate, current, and complete information during registration</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must immediately notify us of any unauthorized use of your account</li>
            <li>You may not use another user's account without authorization</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4"><strong>Security Obligations:</strong></p>
          <p className="text-gray-700 dark:text-gray-300">
            You agree to implement reasonable security measures to protect your account, including but not limited to: using strong passwords, enabling two-factor authentication, not sharing login credentials, and logging out after each session.
          </p>
        </div>
      )
    },
    {
      icon: DollarSign,
      title: 'Trading Services and Fees',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300"><strong>Services Provided:</strong></p>
          <p className="text-gray-700 dark:text-gray-300">
            BitSolidus provides a platform for trading cryptocurrencies and related services. We act as an intermediary facility and do not take possession of your digital assets unless explicitly stated.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4"><strong>Fee Structure:</strong></p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Trading fees are charged on each transaction (maker/taker model)</li>
            <li>Deposit and withdrawal fees may apply depending on the method</li>
            <li>Network (gas) fees apply for blockchain transactions</li>
            <li>P2P transfer fees as outlined in our fee schedule</li>
            <li>All fees are subject to change with prior notice</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Current fee schedules are available on our pricing page or upon request from customer support.
          </p>
        </div>
      )
    },
    {
      icon: AlertCircle,
      title: 'Risk Disclosures',
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
            <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
              ⚠️ HIGH RISK WARNING
            </p>
            <p className="text-yellow-700 dark:text-yellow-300">
              Cryptocurrency trading involves substantial risk of loss and is not suitable for every investor. The valuation of cryptocurrencies may fluctuate, and as a result, clients may lose more than their original investment.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300"><strong>You acknowledge that:</strong></p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Cryptocurrency markets are highly volatile and unpredictable</li>
            <li>Past performance is not indicative of future results</li>
            <li>You are solely responsible for your trading decisions</li>
            <li>You should never trade with money you cannot afford to lose</li>
            <li>Regulatory changes may significantly impact cryptocurrency values</li>
            <li>Technical failures, network issues, or market conditions may affect trade execution</li>
          </ul>
        </div>
      )
    },
    {
      icon: Lock,
      title: 'User Conduct and Prohibited Activities',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">You agree NOT to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Use the platform for illegal activities, including money laundering or terrorist financing</li>
            <li>Manipulate markets, engage in wash trading, or conduct fraudulent schemes</li>
            <li>Use bots, scripts, or automated systems to abuse platform features</li>
            <li>Attempt to gain unauthorized access to our systems or user accounts</li>
            <li>Interfere with or disrupt the platform's servers or networks</li>
            <li>Reverse engineer, decompile, or disassemble any part of the platform</li>
            <li>Use the platform while located in a sanctioned or restricted jurisdiction</li>
            <li>Create multiple accounts to exploit bonuses or evade restrictions</li>
            <li>Impersonate any person or entity or misrepresent your identity</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Violation of these prohibited activities may result in immediate account suspension or termination, forfeiture of funds, and reporting to relevant authorities.
          </p>
        </div>
      )
    },
    {
      icon: Scale,
      title: 'Compliance with Laws',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            You agree to comply with all applicable local, state, national, and international laws and regulations, including but not limited to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Tax Obligations:</strong> You are responsible for reporting and paying any applicable taxes on your cryptocurrency gains</li>
            <li><strong>KYC/AML:</strong> You must complete identity verification and not attempt to circumvent AML procedures</li>
            <li><strong>Sanctions:</strong> You confirm you are not located in a sanctioned country or on any sanctions list</li>
            <li><strong>Securities Laws:</strong> You understand that certain tokens may be considered securities in your jurisdiction</li>
          </ul>
        </div>
      )
    },
    {
      icon: Globe,
      title: 'Intellectual Property Rights',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            All content, features, and functionality of the BitSolidus platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are the exclusive property of BitSolidus or its licensors and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4"><strong>Limited License:</strong></p>
          <p className="text-gray-700 dark:text-gray-300">
            You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the platform for personal, non-commercial purposes in accordance with these terms.
          </p>
        </div>
      )
    },
    {
      icon: AlertCircle,
      title: 'Disclaimers and Limitation of Liability',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300"><strong>"AS IS" Disclaimer:</strong></p>
          <p className="text-gray-700 dark:text-gray-300">
            THE PLATFORM AND ALL SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4"><strong>Limitation of Liability:</strong></p>
          <p className="text-gray-700 dark:text-gray-300">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, BITSOLIDUS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUES, DATA, OR USE, INCURRED BY YOU OR ANY THIRD PARTY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM YOUR ACCESS TO OR USE OF THE PLATFORM.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Our total liability to you for any claims shall not exceed the amount of fees paid by you to BitSolidus in the 12 months preceding the claim.
          </p>
        </div>
      )
    },
    {
      icon: CheckCircle,
      title: 'Termination',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            We reserve the right to suspend or terminate your access to the platform at our sole discretion, with or without cause, with or without notice. Grounds for termination include but are not limited to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Violation of these Terms of Service</li>
            <li>Suspected fraudulent or illegal activity</li>
            <li>Extended periods of account inactivity</li>
            <li>Request by law enforcement or regulatory authorities</li>
            <li>Technical or security reasons</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Upon termination, you retain the right to withdraw your remaining funds, subject to applicable fees and compliance requirements.
          </p>
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
              <Scale className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Please read these terms carefully before using the BitSolidus platform
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Last Updated: January 1, 2025
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Legally Binding Agreement
            </span>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 p-6 rounded-r-xl mb-8">
          <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            IMPORTANT LEGAL NOTICE
          </h3>
          <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
            These Terms of Service constitute a legally binding agreement between you and BitSolidus. By accessing or using our platform, you acknowledge that you have read, understood, and agree to be bound by these terms and our Privacy Policy.
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

        {/* Governing Law */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Governing Law and Dispute Resolution</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where BitSolidus operates, without regard to its conflict of law provisions. Any disputes arising from or relating to these terms or the platform shall first be attempted to be resolved through good faith negotiations.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            If disputes cannot be resolved through negotiation, both parties agree to submit to binding arbitration, except where prohibited by law or for claims involving intellectual property infringement or unauthorized access to the platform.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Questions About These Terms?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Legal Department Email</p>
              <a href="mailto:legal@bitsolidus.tech" className="text-purple-600 hover:underline font-medium">
                legal@bitsolidus.tech
              </a>

            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Customer Support</p>
              <a href="mailto:support@bitsolidus.tech" className="text-purple-600 hover:underline font-medium">
                support@bitsolidus.tech
              </a>

            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>By using BitSolidus, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Terms;
