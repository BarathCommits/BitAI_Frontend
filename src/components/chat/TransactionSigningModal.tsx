/**
 * Transaction Signing Modal Component
 * 
 * Displays a modal for signing blockchain transactions initiated from AI chat.
 * Supports Solana transactions with wallet integration.
 * 
 * Features:
 * - Multi-step signing process (preparing → signing → sending → confirming)
 * - Wallet provider detection (Phantom, Solflare)
 * - Transaction preview and validation
 * - Error handling with user-friendly messages
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { FunctionCallTransaction } from '../../types';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';
import { Icons } from '../../utils/iconUtils';
import { X, Wallet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '../../utils/logger';

const { ExternalLink } = Icons;

interface TransactionSigningModalProps {
  transaction: FunctionCallTransaction;
  isOpen: boolean;
  onClose: () => void;
  onSigned: (signature: string, txHash?: string) => void;
  onError: (error: string) => void;
  theme?: 'cyberpunk' | 'modern';
}

export const TransactionSigningModal: React.FC<TransactionSigningModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSigned,
  onError,
  theme = 'modern'
}) => {
  const { connectedWallets } = useBuiltInWallet();
  const effectiveTheme = connectedWallets.length > 0 ? 'cyberpunk' : theme;
  const [isSigning, setIsSigning] = useState(false);
  const [signingStep, setSigningStep] = useState<'preparing' | 'signing' | 'sending' | 'confirming'>('preparing');

  if (!isOpen) return null;

  const handleSign = async () => {
    if (!transaction.rawTransaction) {
      onError('Transaction data is missing');
      return;
    }

    if (connectedWallets.length === 0) {
      onError('No wallet connected. Please connect your wallet first.');
      return;
    }

    const wallet = connectedWallets[0];
    setIsSigning(true);
    setSigningStep('preparing');

    try {
      // For Solana transactions
      if (transaction.type === 'solana') {
        setSigningStep('signing');
        
        // Get Solana provider from wallet
        const walletId = wallet.id.toLowerCase();
        let solanaProvider: any = null;

        if (walletId === 'phantom' && (window as any).solana?.isPhantom) {
          solanaProvider = (window as any).solana;
        } else if (walletId === 'solflare' && (window as any).solflare) {
          solanaProvider = (window as any).solflare;
        } else {
          onError('Solana wallet provider not found');
          setIsSigning(false);
          return;
        }

        // Decode base64 transaction
        const { Transaction } = await import('@solana/web3.js');
        // Convert base64 to Uint8Array for browser compatibility
        const base64String = transaction.rawTransaction;
        const binaryString = atob(base64String);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const tx = Transaction.from(bytes);

        // Request signature from wallet
        setSigningStep('signing');
        const signedTransaction = await solanaProvider.signTransaction(tx);
        
        setSigningStep('sending');
        
        // Serialize and send transaction
        const serializedTx = signedTransaction.serialize();
        // Convert Uint8Array to base64 for browser compatibility
        const base64Tx = btoa(String.fromCharCode(...serializedTx));
        
        // Send to backend for broadcasting
        const response = await fetch('/api/v1/solana/send-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction: base64Tx })
        });

        if (!response.ok) {
          throw new Error('Failed to send transaction');
        }

        const result = await response.json();
        const signature = result.signature || result.txHash;

        setSigningStep('confirming');
        onSigned(signature, signature);
        toast.success('Transaction signed and sent successfully!');
        
      } else if (transaction.type === 'ethereum') {
        // Ethereum transaction signing
        setSigningStep('signing');
        
        if (!(window as any).ethereum) {
          onError('MetaMask not found. Please install MetaMask.');
          setIsSigning(false);
          return;
        }

        const ethereum = (window as any).ethereum;
        const txParams = {
          from: transaction.transactionData?.from,
          to: transaction.transactionData?.to,
          value: transaction.transactionData?.amount,
          data: transaction.rawTransaction,
        };

        setSigningStep('sending');
        const txHash = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        });

        setSigningStep('confirming');
        onSigned(txHash, txHash);
        toast.success('Transaction sent successfully!');
      } else {
        throw new Error('Unsupported transaction type');
      }
    } catch (error: any) {
      logger.error('Transaction signing error:', error);
      const errorMessage = error.message || 'Failed to sign transaction';
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSigning(false);
      setSigningStep('preparing');
    }
  };

  const getStepMessage = () => {
    switch (signingStep) {
      case 'preparing':
        return 'Preparing transaction...';
      case 'signing':
        return 'Please approve the transaction in your wallet';
      case 'sending':
        return 'Sending transaction to network...';
      case 'confirming':
        return 'Waiting for confirmation...';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <Card 
        className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className={`w-5 h-5 ${
                effectiveTheme === 'cyberpunk' ? 'text-green-400' : 'text-primary-600'
              }`} />
              <h3 className={`text-lg font-semibold ${
                effectiveTheme === 'cyberpunk' ? 'text-white' : 'text-secondary-900'
              }`}>
                Sign Transaction
              </h3>
            </div>
            {!isSigning && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isSigning ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className={`w-12 h-12 animate-spin ${
                effectiveTheme === 'cyberpunk' ? 'text-green-400' : 'text-primary-600'
              }`} />
              <p className={`text-center ${
                effectiveTheme === 'cyberpunk' ? 'text-white/80' : 'text-secondary-700'
              }`}>
                {getStepMessage()}
              </p>
              {signingStep === 'signing' && (
                <p className={`text-xs text-center ${
                  effectiveTheme === 'cyberpunk' ? 'text-white/60' : 'text-secondary-500'
                }`}>
                  Check your wallet extension to approve
                </p>
              )}
            </div>
          ) : (
            <>
              <div className={`space-y-2 mb-4 ${
                effectiveTheme === 'cyberpunk' ? 'text-white/90' : 'text-secondary-700'
              }`}>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Operation:</span>
                  <span className="text-sm">{transaction.operation}</span>
                </div>
                {transaction.transactionData?.amount && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Amount:</span>
                    <span className="text-sm font-semibold">
                      {transaction.transactionData.amount} {transaction.transactionData.token || 'SOL'}
                    </span>
                  </div>
                )}
                {transaction.transactionData?.to && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">To:</span>
                    <span className="text-sm font-mono text-xs">
                      {transaction.transactionData.to.slice(0, 8)}...{transaction.transactionData.to.slice(-6)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleSign}
                  className="flex-1"
                  disabled={isSigning}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Sign in Wallet
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSigning}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

