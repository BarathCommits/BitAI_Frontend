import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { NotificationPanel } from '../ui/NotificationPanel';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';
import { BuiltInWalletSelector } from '../wallet/BuiltInWalletSelector';
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
            <Link to="/" className="flex items-center">
              {/* Logo removed as requested */}
            </Link>
            
            {/* Wallet Status Badge */}
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
                    <span>{theme === 'cyberpunk' ? 'SAFE LINK ACTIVE' : 'Secure'}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    <span>{theme === 'cyberpunk' ? 'SAFE LINK OFFLINE' : 'Disconnected'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="flex items-center bg-secondary-50 rounded-lg border border-secondary-200 hover:border-primary-400 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200 transition-all">
                {/* Search Icon */}
                <div className="pl-3 pr-2">
                  <Search className="w-4 h-4 text-secondary-400" />
                </div>
                
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search Bit features..."
                  className="flex-1 bg-transparent border-none outline-none py-2 px-2 text-sm text-secondary-900 placeholder-secondary-400"
                />
                
                {/* Search Icon (right side) */}
                <div className="pr-3">
                  <Globe className="w-4 h-4 text-secondary-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Wallet Connection */}
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

            {/* Notifications */}
            <NotificationPanel />

            {/* Vault */}
            <Link to="/vault">
              <Button
                variant="ghost"
                size="sm"
              >
                <Shield className="w-5 h-5" />
              </Button>
            </Link>


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
            console.log('Wallet connected:', wallet);
            setShowWalletModal(false);
          }}
          onClose={() => setShowWalletModal(false)}
        />
      )}
    </header>
  );
};
