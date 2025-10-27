import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Wallet, ExternalLink, Trash2, Shield, Star } from 'lucide-react';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';
import toast from 'react-hot-toast';

export const ConnectedWalletsList: React.FC = () => {
  const { connectedWallets, disconnectWallet, isLoading } = useBuiltInWallet();

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return '0';
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  const getChainName = (chainId: number | undefined) => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum',
    };
    return chainId ? chains[chainId] || `Chain ${chainId}` : 'Unknown';
  };

  const handleRemoveWallet = async (walletId: string, provider: string) => {
    try {
      await disconnectWallet(walletId);
      toast.success(`${provider} wallet disconnected`);
    } catch (error) {
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleViewOnExplorer = (address: string, chainId: number | undefined) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/address/',
      137: 'https://polygonscan.com/address/',
      56: 'https://bscscan.com/address/',
      42161: 'https://arbiscan.io/address/',
    };
    const explorerUrl = chainId ? explorers[chainId] : explorers[1];
    if (explorerUrl) {
      window.open(`${explorerUrl}${address}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold">Connected Wallets</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-400">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading wallets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (connectedWallets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold">Connected Wallets</h3>
            <span className="text-xs text-gray-400 ml-auto">0 wallets</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-400">
            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No wallets connected. Use the header to connect.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold">Connected Wallets</h3>
          </div>
              <span className="text-xs text-gray-400">
                {connectedWallets.length} {connectedWallets.length === 1 ? 'wallet' : 'wallets'}
              </span>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-2">
          {connectedWallets.map((wallet) => (
            <div
              key={wallet.address}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                      {formatAddress(wallet.address)}
                    </p>
                    <span className="w-2 h-2 bg-green-500 rounded-full" title="Connected"></span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {getChainName(wallet.chainId)} • {wallet.name || wallet.id || 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewOnExplorer(wallet.address, wallet.chainId)}
                  title="View on explorer"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveWallet(wallet.id, wallet.name || 'Wallet')}
                  className="text-red-600 hover:text-red-700"
                  title="Disconnect wallet"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

