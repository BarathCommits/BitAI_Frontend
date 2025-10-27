/**
 * Built-in Wallet Selector Component
 * 
 * A native wallet selector that shows all built-in wallets without requiring extensions
 */

import React, { useState } from 'react';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';
import { BuiltInWalletInfo } from '../../services/BuiltInWalletService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Wallet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface BuiltInWalletSelectorProps {
  onWalletConnected?: (wallet: BuiltInWalletInfo) => void;
  onClose?: () => void;
}

export const BuiltInWalletSelector: React.FC<BuiltInWalletSelectorProps> = ({
  onWalletConnected,
  onClose,
}) => {
  const {
    wallets,
    connectedWallets,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    refreshWallets,
    clearError,
  } = useBuiltInWallet();

  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  const handleConnectWallet = async (wallet: BuiltInWalletInfo) => {
    if (wallet.isConnected) {
      // Disconnect if already connected
      await disconnectWallet(wallet.id);
      return;
    }

    // Prevent multiple connection attempts
    if (connectingWallet) {
      console.log('⚠️ Connection already in progress');
      return;
    }

    setConnectingWallet(wallet.id);
    clearError();

    try {
      // Add a timeout to the entire connection process
      const connectionPromise = connectWallet(wallet.id);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 15000) // 15 second timeout
      );
      
      const result = await Promise.race([connectionPromise, timeoutPromise]) as any;
      
      if (result.success && result.walletInfo) {
        onWalletConnected?.(result.walletInfo);
        onClose?.();
      } else {
        // Show error message
        console.error('Connection failed:', result.error);
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      // Force clear loading state
      setConnectingWallet(null);
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleRefresh = () => {
    refreshWallets();
  };

  const getWalletIcon = (wallet: BuiltInWalletInfo) => {
    if (wallet.isConnected) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    return <span className="text-2xl">{wallet.icon}</span>;
  };

  const getWalletStatus = (wallet: BuiltInWalletInfo) => {
    if (wallet.isConnected) {
      return (
        <div className="text-sm text-green-600">
          <div className="font-medium">Connected</div>
          {wallet.address && (
            <div className="text-xs opacity-75">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </div>
          )}
          {wallet.balance && (
            <div className="text-xs opacity-75">
              {parseFloat(wallet.balance).toFixed(4)} {wallet.type === 'solana' ? 'SOL' : 'ETH'}
            </div>
          )}
        </div>
      );
    }

    if (!wallet.isAvailable) {
      return (
        <div className="text-sm text-gray-500">
          <div>Not Available</div>
          <div className="text-xs">SDK not loaded</div>
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-600">
        <div>Available</div>
        <div className="text-xs">Click to connect</div>
      </div>
    );
  };

  const getWalletTypeBadge = (wallet: BuiltInWalletInfo) => {
    const typeColors = {
      ethereum: 'bg-blue-100 text-blue-800',
      solana: 'bg-purple-100 text-purple-800',
      multi: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[wallet.type]}`}>
        {wallet.type.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Built-in Wallets</h2>
              <p className="text-gray-600 mt-1">
                Connect to wallets built into Safe - no extensions required!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {onClose && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  ×
                </Button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Connected Wallets Summary */}
          {connectedWallets.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  {connectedWallets.length} Wallet{connectedWallets.length > 1 ? 's' : ''} Connected
                </span>
              </div>
              <div className="text-sm text-green-700">
                You can now use Safe's Web3 features with your connected wallets.
              </div>
            </div>
          )}

          {/* Wallet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  wallet.isConnected
                    ? 'border-green-300 bg-green-50'
                    : wallet.isAvailable
                    ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getWalletIcon(wallet)}
                    <div>
                      <h3 className="font-medium text-gray-900">{wallet.name}</h3>
                      {getWalletTypeBadge(wallet)}
                    </div>
                  </div>
                  {getWalletStatus(wallet)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {wallet.type === 'solana' && 'Solana Ecosystem'}
                  </div>
                  
                  <Button
                    variant={wallet.isConnected ? "outline" : "primary"}
                    size="sm"
                    onClick={() => handleConnectWallet(wallet)}
                    disabled={!wallet.isAvailable || connectingWallet === wallet.id}
                    className="min-w-[100px]"
                  >
                    {connectingWallet === wallet.id ? (
                      <LoadingSpinner size="sm" />
                    ) : wallet.isConnected ? (
                      'Disconnect'
                    ) : (
                      'Connect'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet className="w-4 h-4" />
                <span className="font-medium">Built-in Wallet Features:</span>
              </div>
              <ul className="text-xs space-y-1 ml-6">
                <li>• No browser extensions required</li>
                <li>• Native integration with Safe</li>
                <li>• Support for Solana wallets only</li>
                <li>• Secure key management</li>
                <li>• Optimized for Solana ecosystem</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
