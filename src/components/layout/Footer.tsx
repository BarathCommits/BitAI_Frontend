import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, MessageCircle, Mail } from 'lucide-react';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { connectedWallets } = useBuiltInWallet();
  const theme = connectedWallets.length > 0 ? 'cyberpunk' : 'modern';

  const footerLinks = {
    Browser: [
      { name: 'Safe Store', href: '/safe-store' },
      { name: 'Safe Vault', href: '/vault' },
      { name: 'AI Chat', href: '/chat' },
      { name: 'Portfolio', href: '/portfolio' },
    ],
    Developers: [
      { name: 'Developer Dashboard', href: '/developer' },
      { name: 'Submit dApp', href: '/developer/submit' },
      { name: 'SDK Integration', href: '/sdk' },
      { name: 'API Documentation', href: '/api' },
    ],
    Wallet: [
      { name: 'Connect Wallet', href: '/auth' },
      { name: 'Built-in Wallets', href: '/wallets' },
      { name: 'Multi-Wallet', href: '/multi-wallet' },
      { name: 'Wallet Security', href: '/security' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Security Audit', href: '/audit' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/bitai', icon: Github },
    { name: 'Twitter', href: 'https://twitter.com/bitai', icon: Twitter },
    { name: 'Discord', href: 'https://discord.gg/bitai', icon: MessageCircle },
    { name: 'Email', href: 'mailto:hello@bitai.io', icon: Mail },
  ];

  return (
    <footer className={`border-t transition-all duration-500 ${
      theme === 'cyberpunk' 
        ? 'cyberpunk-card border-green-400/30' 
        : 'bg-white border-secondary-200'
    }`}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'cyberpunk-gradient-bg' 
                  : 'bg-primary-600'
              }`}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xl font-bold transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'text-white cyberpunk-font' 
                  : 'text-secondary-900'
              }`}>
                {theme === 'cyberpunk' ? 'BIT' : 'Bit'}
              </span>
            </div>
            <p className={`mb-6 max-w-md transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'text-white/80' 
                : 'text-secondary-600'
            }`}>
              The world's first Web3 browser with integrated AI assistant. 
              Browse dApps, manage your vault, and interact with blockchain seamlessly.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
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
                >
                  <social.icon className="w-5 h-5" />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'text-green-400 cyberpunk-font' 
                  : 'text-secondary-900'
              }`}>
                {theme === 'cyberpunk' && category === 'Browser' ? 'BIT MODULES' : 
                 theme === 'cyberpunk' && category === 'Developers' ? 'SYSTEM ACCESS' :
                 theme === 'cyberpunk' && category === 'Wallet' ? 'BIT LINKS' :
                 theme === 'cyberpunk' && category === 'Legal' ? 'SYSTEM PROTOCOLS' : category}
              </h3>
              <ul className="space-y-3">
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
          ))}
        </div>

        {/* Bottom Bar */}
        <div className={`border-t mt-12 pt-8 transition-all duration-300 ${
          theme === 'cyberpunk' 
            ? 'border-green-400/30' 
            : 'border-secondary-200'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className={`text-sm mb-4 md:mb-0 transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'text-white/80 cyberpunk-font' 
                : 'text-secondary-600'
            }`}>
              © {currentYear} {theme === 'cyberpunk' ? 'BIT' : 'Bit'}. All rights reserved.
            </div>
            
            <div className={`flex items-center space-x-6 text-sm transition-all duration-300 ${
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
                <span>{theme === 'cyberpunk' ? 'Bit networks active' : 'Blockchain networks connected'}</span>
              </span>
              <span>BitAI v1.0.0</span>
              <span>•</span>
              <span>Web3 Ready</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
