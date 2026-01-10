/**
 * Header Component
 * 
 * Main application header with:
 * - Brand logo and tagline
 * - Wallet connection/disconnection
 * - Search functionality (optional)
 * - Theme-aware styling (cyberpunk/modern)
 * 
 * Automatically switches to cyberpunk theme when wallet is connected.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
// import { NotificationPanel } from '../ui/NotificationPanel'; // Commented out for MVP - to be released later
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';
import { BuiltInWalletSelector } from '../wallet/BuiltInWalletSelector';
import { logger } from '../../utils/logger';
import { 
  Search, 
  Bell, 
  Shield,
  Menu,
  Wallet,
  Zap,
  CheckCircle,
  AlertCircle,
  Lock,
  Globe,
  ArrowRight
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    connectedWallets,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    clearError
  } = useBuiltInWallet();

  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleWalletConnect = async () => {
    if (connectedWallets.length > 0) {
      // Disconnect all wallets
      for (const wallet of connectedWallets) {
        await disconnectWallet(wallet.id);
      }
    } else {
      setShowWalletModal(true);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isConnected = connectedWallets.length > 0;
  const primaryWallet = connectedWallets[0]; // Use first connected wallet as primary
  const theme = isConnected ? 'cyberpunk' : 'modern';

  return (
    <header className={`border-b shadow-sm transition-all duration-500 ${
      theme === 'cyberpunk' 
        ? 'cyberpunk-card border-green-400/30' 
        : 'bg-white border-secondary-200'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                theme === 'cyberpunk' 
                  ? 'cyberpunk-gradient-bg cyberpunk-text-glow' 
                  : 'blue-purple-icon-gradient shadow-glow'
              }`}>
                <Zap className={`w-6 h-6 ${
                  theme === 'cyberpunk' 
                    ? 'text-white' 
                    : 'text-white'
                }`} />
              </div>
              <span className={`text-xl font-bold ${
                theme === 'cyberpunk' 
                  ? 'cyberpunk-font cyberpunk-gradient-text cyberpunk-text-glow' 
                  : 'text-gradient bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent'
              }`}>
                bitAI
              </span>
            </Link>
            
            {/* Tagline */}
            <div className="hidden lg:block ml-4 pl-4 border-l border-secondary-200">
              <p className={`text-sm ${
                theme === 'cyberpunk' 
                  ? 'text-white/80 cyberpunk-font' 
                  : 'text-secondary-600'
              }`}>
                A True Native Web3 AI assistant that delivers results from the Web3 landscape
              </p>
            </div>
            
            {/* Wallet Status Badge - Commented out per user request */}
            {/* 
            <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              theme === 'cyberpunk'
                ? (isConnected 
                    ? 'bg-green-500/20 border border-green-400/50 text-green-400 cyberpunk-font' 
                    : 'bg-gray-500/20 border border-gray-400/50 text-gray-400 cyberpunk-font')
                : (isConnected 
                    ? 'bg-green-100 border border-green-200 text-green-700' 
                    : 'bg-gray-100 border border-gray-200 text-gray-600')
            }`}>
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <>
                    <Shield className="w-3 h-3" />
                    <span>{theme === 'cyberpunk' ? 'BIT LINK ACTIVE' : 'Secure'}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    <span>{theme === 'cyberpunk' ? 'BIT LINK OFFLINE' : 'Disconnected'}</span>
                  </>
                )}
              </div>
            </div>
            */}
          </div>

          {/* Search Bar - Removed for MVP */}
          {/* 
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="flex items-center bg-secondary-50 rounded-lg border border-secondary-200 hover:border-primary-400 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200 transition-all">
                <div className="pl-3 pr-2">
                  <Search className="w-4 h-4 text-secondary-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search Bit features..."
                  className="flex-1 bg-transparent border-none outline-none py-2 px-2 text-sm text-secondary-900 placeholder-secondary-400"
                />
                <div className="pr-3">
                  <Globe className="w-4 h-4 text-secondary-400" />
                </div>
              </div>
            </div>
          </div>
          */}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Wallet Connection Prompt - Commented out per user request */}
            {/* 
            {!isConnected && (
              <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                theme === 'cyberpunk'
                  ? 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-400 cyberpunk-font animate-pulse'
                  : 'bg-blue-100 border border-blue-200 text-blue-700'
              }`}>
                <Globe className="w-3 h-3 mr-1" />
                <span>Connect wallet for true Web3 experience</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            )}
            */}
            
            {/* Wallet Connection Button - Commented out per user request */}
            {/* 
            <Button
              variant={isConnected ? 'secondary' : 'primary'}
              size="sm"
              leftIcon={<Wallet className="w-4 h-4" />}
              onClick={handleWalletConnect}
              disabled={isLoading}
              className="min-w-[140px]"
            >
              {isConnected && primaryWallet?.address ? (
                <span className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>{formatAddress(primaryWallet.address)}</span>
                </span>
              ) : (
                'Connect Wallet'
              )}
            </Button>
            */}

            {/* Notifications - Commented out for MVP - to be released later */}
            {/* <NotificationPanel /> */}

            {/* Vault - Commented out for MVP - to be released later */}
            {/* 
            <Link to="/vault">
              <Button
                variant="ghost"
                size="sm"
              >
                <Shield className="w-5 h-5" />
              </Button>
            </Link>
            */}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Built-in Wallet Selector */}
      {showWalletModal && (
        <BuiltInWalletSelector
          onWalletConnected={(wallet) => {
            logger.debug('Wallet connected:', wallet);
            setShowWalletModal(false);
          }}
          onClose={() => setShowWalletModal(false)}
        />
      )}
    </header>
  );
};
