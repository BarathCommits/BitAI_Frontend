import React, { useState } from 'react';
import { useBuiltInWallet } from '../hooks/useBuiltInWallet';
import { 
  HelpCircle, 
  MessageSquare, 
  BookOpen, 
  Shield, 
  Zap, 
  Globe, 
  Mail, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle,
  AlertCircle,
  Info,
  Github,
  Twitter,
  MessageCircle
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'wallet' | 'vault' | 'developer' | 'troubleshooting';
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I connect my wallet to BitAI?',
    answer: 'Click the wallet button in the header, select your preferred wallet (MetaMask, Phantom, etc.), and sign the connection request. Your wallet will be connected and authenticated automatically.',
    category: 'wallet'
  },
  {
    id: '2',
    question: 'What is the Safe Vault?',
    answer: 'The Safe Vault is your personal secure storage for sensitive information. You can store personal details, credentials, and other data that will be encrypted and associated with your wallet address.',
    category: 'vault'
  },
  {
    id: '3',
    question: 'How secure is my data in BitAI?',
    answer: 'BitAI uses wallet-based authentication and encryption to secure your data. Your information is tied to your wallet address and can only be accessed when you\'re connected with the same wallet.',
    category: 'general'
  },
  {
    id: '4',
    question: 'How do I submit a dApp to the Safe AppStore?',
    answer: 'Navigate to the Developer Portal, click "Submit New dApp", fill out the submission form with your dApp details, smart contract information, and AI integration preferences, then submit for review.',
    category: 'developer'
  },
  {
    id: '5',
    question: 'What happens if I disconnect my wallet?',
    answer: 'When you disconnect your wallet, all personal data in your vault will be cleared from the local session. Your data remains safely stored on the backend and will be restored when you reconnect with the same wallet.',
    category: 'vault'
  },
  {
    id: '6',
    question: 'Can I use multiple wallets with BitAI?',
    answer: 'Yes! You can connect multiple wallets, but each wallet will have its own separate vault and data. Switching between wallets will show the data associated with that specific wallet address.',
    category: 'wallet'
  },
  {
    id: '7',
    question: 'How do I get help with AI integration for my dApp?',
    answer: 'Check out our SDK documentation in the Developer Portal, or use the AI chat feature to get assistance with implementation. Our AI can help with code examples and best practices.',
    category: 'developer'
  },
  {
    id: '8',
    question: 'Why am I getting "Backend AI service temporarily unavailable"?',
    answer: 'This error occurs when the backend AI service is not running. Make sure the backend services are started with `docker compose up -d` in the BitAI_Backend directory.',
    category: 'troubleshooting'
  },
  {
    id: '9',
    question: 'How do I clear my vault data?',
    answer: 'Disconnect your wallet to clear local data, or contact support if you need to permanently delete data from the backend. Remember that vault data is tied to your wallet address.',
    category: 'vault'
  },
  {
    id: '10',
    question: 'What browsers are supported?',
    answer: 'BitAI works best with modern browsers that support Web3 wallet extensions like Chrome, Firefox, Edge, and Brave. Make sure you have a compatible wallet extension installed.',
    category: 'general'
  }
];

const categories = [
  { id: 'all', name: 'All Questions', icon: HelpCircle },
  { id: 'general', name: 'General', icon: Globe },
  { id: 'wallet', name: 'Wallet', icon: Shield },
  { id: 'vault', name: 'Safe Vault', icon: BookOpen },
  { id: 'developer', name: 'Developer', icon: Zap },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: AlertCircle }
];

const HelpSupportPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const { connectedWallets } = useBuiltInWallet();
  const theme = connectedWallets.length > 0 ? 'cyberpunk' : 'modern';

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'cyberpunk' 
        ? 'cyberpunk-theme' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-all duration-300 ${
            theme === 'cyberpunk' 
              ? 'cyberpunk-gradient-bg' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600'
          }`}>
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-4xl font-bold mb-4 transition-all duration-300 ${
            theme === 'cyberpunk' 
              ? 'text-white cyberpunk-font cyberpunk-gradient-text' 
              : 'text-gray-900'
          }`}>
            {theme === 'cyberpunk' ? 'SAFE SUPPORT CENTER' : 'Help & Support'}
          </h1>
          <p className={`text-xl max-w-3xl mx-auto transition-all duration-300 ${
            theme === 'cyberpunk' 
              ? 'text-white/80 cyberpunk-font' 
              : 'text-gray-600'
          }`}>
            {theme === 'cyberpunk' 
              ? 'Access Safe assistance for BitAI, find answers to matrix queries, and connect with our Safe support team.' 
              : 'Get help with BitAI, find answers to common questions, and connect with our support team.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow-sm border p-6 sticky top-8 transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'cyberpunk-card border-green-400/30' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'text-white cyberpunk-font' 
                  : 'text-gray-900'
              }`}>
                {theme === 'cyberpunk' ? 'SAFE QUICK ACCESS' : 'Quick Links'}
              </h3>
              
              <div className="space-y-3">
                <a
                  href="/"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    theme === 'cyberpunk' 
                      ? 'text-white/80 hover:bg-green-500/20 hover:text-green-400' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 mr-3" />
                  {theme === 'cyberpunk' ? 'SAFE AI ASSISTANT' : 'AI Chat Assistant'}
                </a>
                <a
                  href="/developer"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    theme === 'cyberpunk' 
                      ? 'text-white/80 hover:bg-green-500/20 hover:text-green-400' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Zap className="w-5 h-5 mr-3" />
                  {theme === 'cyberpunk' ? 'SAFE DEVELOPER PORTAL' : 'Developer Portal'}
                </a>
                <a
                  href="/sdk"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    theme === 'cyberpunk' 
                      ? 'text-white/80 hover:bg-green-500/20 hover:text-green-400' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <BookOpen className="w-5 h-5 mr-3" />
                  {theme === 'cyberpunk' ? 'SAFE SDK DATABASE' : 'SDK Documentation'}
                </a>
                <a
                  href="/vault"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    theme === 'cyberpunk' 
                      ? 'text-white/80 hover:bg-green-500/20 hover:text-green-400' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Shield className="w-5 h-5 mr-3" />
                  {theme === 'cyberpunk' ? 'SAFE VAULT CONTROL' : 'Safe Vault Management'}
                </a>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Contact Support
                </h4>
                <div className="space-y-2">
                  <a
                    href="mailto:support@safebrowser.com"
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    support@safebrowser.com
                  </a>
                  <a
                    href="https://github.com/safebrowser"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </a>
                  <a
                    href="https://twitter.com/safebrowser"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </a>
                  <a
                    href="https://discord.gg/safebrowser"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Discord
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center p-3 rounded-lg border transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Frequently Asked Questions
                {selectedCategory !== 'all' && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({categories.find(c => c.id === selectedCategory)?.name})
                  </span>
                )}
              </h3>

              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No questions found matching your criteria.</p>
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your search or category filter.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {expandedFAQ === faq.id ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-4">
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Getting Started */}
            <div className={`rounded-lg shadow-sm p-8 mt-8 text-white transition-all duration-500 ${
              theme === 'cyberpunk' 
                ? 'cyberpunk-card' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}>
              <h3 className={`text-2xl font-bold mb-4 transition-all duration-300 ${
                theme === 'cyberpunk' ? 'cyberpunk-font cyberpunk-gradient-text' : ''
              }`}>
                {theme === 'cyberpunk' ? 'NEW TO SAFE?' : 'New to BitAI?'}
              </h3>
              <p className={`mb-6 transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'text-white/80 cyberpunk-font' 
                  : 'text-blue-100'
              }`}>
                {theme === 'cyberpunk' 
                  ? 'Access Safe assistance with our comprehensive guides and tutorials to maximize your BitAI experience.' 
                  : 'Get started with our comprehensive guides and tutorials to make the most of BitAI.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/"
                  className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-colors ${
                    theme === 'cyberpunk' 
                      ? 'cyberpunk-button bg-green-500/20 text-green-400 border border-green-400/50 hover:bg-green-500/30' 
                      : 'bg-white text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  {theme === 'cyberpunk' ? 'INITIATE SAFE ASSISTANT' : 'Try AI Assistant'}
                </a>
                <a
                  href="/developer"
                  className="inline-flex items-center px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Developer Guide
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
