/**
 * Transaction Preview Component
 * 
 * Displays a preview card for blockchain transactions before signing.
 * Shows transaction details like:
 * - Operation type (transfer, swap, etc.)
 * - From/To addresses
 * - Amount and token information
 * - Network fees
 * 
 * Supports both cyberpunk and modern themes based on wallet connection.
 */
import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { FunctionCallTransaction } from '../../types';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';
import { Icons } from '../../utils/iconUtils';
import { Wallet, ArrowRight, Zap, AlertCircle } from 'lucide-react';

const { ExternalLink } = Icons;

interface TransactionPreviewProps {
  transaction: FunctionCallTransaction;
  onSign: () => void;
  onCancel: () => void;
  theme?: 'cyberpunk' | 'modern';
}

export const TransactionPreview: React.FC<TransactionPreviewProps> = ({
  transaction,
  onSign,
  onCancel,
  theme = 'modern'
}) => {
  const { connectedWallets } = useBuiltInWallet();
  const effectiveTheme = connectedWallets.length > 0 ? 'cyberpunk' : theme;

  const formatAmount = (amount?: string) => {
    if (!amount) return 'N/A';
    try {
      const num = parseFloat(amount);
      return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
    } catch {
      return amount;
    }
  };

  const getOperationIcon = () => {
    switch (transaction.operation.toLowerCase()) {
      case 'transfer':
      case 'send':
        return <ArrowRight className="w-5 h-5" />;
      case 'swap':
      case 'exchange':
        return <Zap className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const getOperationColor = () => {
    if (effectiveTheme === 'cyberpunk') {
      return 'text-green-400';
    }
    return 'text-primary-600';
  };

  return (
    <Card variant="outlined" className="mt-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`${getOperationColor()}`}>
              {getOperationIcon()}
            </div>
            <div>
              <h4 className={`font-semibold ${
                effectiveTheme === 'cyberpunk' ? 'text-white' : 'text-secondary-900'
              }`}>
                Transaction Ready
              </h4>
              <p className={`text-sm ${
                effectiveTheme === 'cyberpunk' ? 'text-white/70' : 'text-secondary-600'
              }`}>
                {transaction.operation.charAt(0).toUpperCase() + transaction.operation.slice(1)}
              </p>
            </div>
          </div>
        </div>
        {transaction.description && (
          <p className={`text-sm mt-2 ${
            effectiveTheme === 'cyberpunk' ? 'text-white/80' : 'text-secondary-700'
          }`}>
            {transaction.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className={`space-y-3 ${
          effectiveTheme === 'cyberpunk' ? 'text-white/90' : 'text-secondary-700'
        }`}>
          {transaction.transactionData?.from && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">From:</span>
              <span className="text-sm font-mono">
                {transaction.transactionData.from.slice(0, 6)}...{transaction.transactionData.from.slice(-4)}
              </span>
            </div>
          )}
          
          {transaction.transactionData?.to && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">To:</span>
              <span className="text-sm font-mono">
                {transaction.transactionData.to.slice(0, 6)}...{transaction.transactionData.to.slice(-4)}
              </span>
            </div>
          )}
          
          {transaction.transactionData?.amount && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Amount:</span>
              <span className="text-sm font-semibold">
                {formatAmount(transaction.transactionData.amount)} {transaction.transactionData.token || 'SOL'}
              </span>
            </div>
          )}
          
          {transaction.estimatedFee && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estimated Fee:</span>
              <span className="text-sm">
                {transaction.estimatedFee}
              </span>
            </div>
          )}

          {transaction.transactionData?.contractAddress && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Contract:</span>
              <span className="text-sm font-mono">
                {transaction.transactionData.contractAddress.slice(0, 6)}...{transaction.transactionData.contractAddress.slice(-4)}
              </span>
            </div>
          )}

          {transaction.requiresSigning && (
            <div className={`flex items-center gap-2 p-2 rounded ${
              effectiveTheme === 'cyberpunk'
                ? 'bg-yellow-500/20 border border-yellow-400/50'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <AlertCircle className={`w-4 h-4 ${
                effectiveTheme === 'cyberpunk' ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
              <span className={`text-xs ${
                effectiveTheme === 'cyberpunk' ? 'text-yellow-300' : 'text-yellow-800'
              }`}>
                This transaction requires your signature
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="primary"
            onClick={onSign}
            className="flex-1"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Sign & Send
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

