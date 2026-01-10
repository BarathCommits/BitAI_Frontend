/**
 * Footer Component
 * 
 * Application footer with:
 * - Brand information
 * - Navigation links (MVP: only Chat link active)
 * - Social media links
 * - Theme-aware styling (cyberpunk/modern)
 * 
 * Currently configured for MVP with minimal links.
 * Footer is hidden in Layout component but can be enabled.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, X, Mail } from 'lucide-react';
// import { useBuiltInWallet } from '../../hooks/useBuiltInWallet'; // Commented out for MVP - to be released later

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  // Wallet connection code commented out for MVP - to be released later
  // const { connectedWallets } = useBuiltInWallet();
  const theme = 'modern'; // Default to modern theme when wallet connection is disabled

  // Footer Links - Product section
  const footerLinks = {
    Product: [
      { name: 'AI Chat', href: '/chat' },
    ],
    // Non-MVP Sections - Commented out
    // Developers: [
    //   { name: 'Developer Dashboard', href: '/developer' },
    //   { name: 'Submit dApp', href: '/developer/submit' },
    //   { name: 'SDK Integration', href: '/sdk' },
    //   { name: 'API Documentation', href: '/api' },
    // ],
    // Wallet section removed for MVP - to be released later
    // Wallet: [
    //   { name: 'Connect Wallet', href: '/chat' },
    //   { name: 'Built-in Wallets', href: '/wallets' },
    //   { name: 'Multi-Wallet', href: '/multi-wallet' },
    //   { name: 'Wallet Security', href: '/security' },
    // ],
    // Legal: [
    //   { name: 'Privacy Policy', href: '/privacy' },
    //   { name: 'Terms of Service', href: '/terms' },
    //   { name: 'Cookie Policy', href: '/cookies' },
    //   { name: 'Security Audit', href: '/audit' },
    // ],
  };

  const socialLinks = [
    { name: 'X', href: 'https://x.com/BitPorta', icon: X },
    { name: 'Email', href: 'mailto:bitporta10@gmail.com', icon: Mail },
  ];

  return (
    <footer className={`border-t transition-all duration-500 ${
      theme === 'cyberpunk' 
        ? 'cyberpunk-card border-green-400/30' 
        : 'bg-white border-secondary-200'
    }`}>
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'cyberpunk-gradient-bg' 
                  : 'blue-purple-icon-gradient shadow-glow'
              }`}>
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xl font-bold transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'text-white cyberpunk-font' 
                  : 'text-gradient bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent'
              }`}>
                {theme === 'cyberpunk' ? 'BITPORTA' : 'bitPorta'}
              </span>
            </div>
            <div className="mb-3">
              <span className={`text-lg font-semibold transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'text-white cyberpunk-font' 
                  : 'text-secondary-900'
              }`}>
                bitAI (AI Chat)
              </span>
            </div>
            <p className={`mb-4 text-sm leading-relaxed transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'text-white/80' 
                : 'text-secondary-600'
            }`}>
              A True Native Web3 AI assistant that delivers results from the Web3 landscape. Ask any questions and get responses from a Web3 perspective.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`transition-colors ${
                    theme === 'cyberpunk' 
                      ? 'text-white/60 hover:text-green-400' 
                      : 'text-secondary-400 hover:text-primary-600'
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => {
            // Skip empty sections
            if (links.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'text-green-400 cyberpunk-font' 
                    : 'text-secondary-900'
                }`}>
                  {theme === 'cyberpunk' && category === 'Product' ? 'BIT PRODUCTS' : 
                   theme === 'cyberpunk' && category === 'Developers' ? 'SYSTEM ACCESS' :
                   theme === 'cyberpunk' && category === 'Wallet' ? 'BIT LINKS' :
                   theme === 'cyberpunk' && category === 'Legal' ? 'SYSTEM PROTOCOLS' : category}
                </h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className={`text-sm transition-colors ${
                          theme === 'cyberpunk' 
                            ? 'text-white/80 hover:text-green-400' 
                            : 'text-secondary-600 hover:text-primary-600'
                        }`}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar */}
        <div className={`border-t mt-8 pt-6 transition-all duration-300 ${
          theme === 'cyberpunk' 
            ? 'border-green-400/30' 
            : 'border-secondary-200'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={`text-sm transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'text-white/80 cyberpunk-font' 
                : 'text-secondary-600'
            }`}>
              © {currentYear} {theme === 'cyberpunk' ? 'BITPORTA' : 'bitPorta'}. All rights reserved.
            </div>
            
            <div className={`flex items-center flex-wrap gap-4 text-sm transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'text-white/80 cyberpunk-font' 
                : 'text-secondary-600'
            }`}>
              <span className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'bg-green-400 cyberpunk-text-glow' 
                    : 'bg-green-500'
                }`}></div>
                <span>{theme === 'cyberpunk' ? 'Bit AI active' : 'AI Assistant Ready'}</span>
              </span>
              <span>bitPorta v1.0.0</span>
              <span>•</span>
              <span>Web3 AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
