/**
 * Stripe Payment Modal Component
 * 
 * Handles payment processing for vault subscriptions using Stripe.
 * 
 * Features:
 * - Payment form with Stripe integration
 * - Subscription management
 * - Payment status tracking
 * 
 * Used in VaultPage for premium subscription payments.
 */
import React, { useState } from 'react';
import { logger } from '../../utils/logger';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';
import { 
  CreditCard, 
  CheckCircle, 
  X, 
  Zap,
  Shield,
  AlertCircle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usageTrackingService, SubscriptionStatus } from '../../services/UsageTrackingService';

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onPaymentSuccess: (subscription: SubscriptionStatus) => void;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  priceId: string; // Stripe Price ID
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
  onPaymentSuccess
}) => {
  const { connectedWallets } = useBuiltInWallet();
  const theme = connectedWallets.length > 0 ? 'cyberpunk' : 'modern';
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Pricing plans - Replace with your actual Stripe Price IDs
  const plans: PricingPlan[] = [
    {
      id: 'monthly',
      name: 'Monthly Pro',
      price: 9.99,
      priceId: process.env.REACT_APP_STRIPE_PRICE_ID_MONTHLY || 'price_monthly_pro',
      interval: 'month',
      features: [
        'Unlimited wallet assistance',
        'Priority AI responses',
        'Advanced Solana CLI commands',
        '24/7 support',
        'Cancel anytime'
      ],
      popular: true
    },
    {
      id: 'yearly',
      name: 'Yearly Pro',
      price: 99.99,
      priceId: process.env.REACT_APP_STRIPE_PRICE_ID_YEARLY || 'price_yearly_pro',
      interval: 'year',
      features: [
        'Unlimited wallet assistance',
        'Priority AI responses',
        'Advanced Solana CLI commands',
        '24/7 support',
        'Save 17% vs monthly',
        'Cancel anytime'
      ]
    }
  ];

  const handleCheckout = async (plan: PricingPlan) => {
    if (!walletAddress) {
      toast.error('Wallet address required');
      return;
    }

    setProcessing(true);
    setSelectedPlan(plan.id);

    try {
      // Call backend to create Stripe Checkout Session
      const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '');
      const token = localStorage.getItem('jwtToken');

      const response = await fetch(`${API_BASE_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          walletAddress,
          priceId: plan.priceId,
          planId: plan.id,
          successUrl: `${window.location.origin}/vault?payment=success`,
          cancelUrl: `${window.location.origin}/vault?payment=canceled`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      if (data.success && data.data?.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.checkoutUrl;
      } else if (data.success && data.data?.sessionId) {
        // Alternative: If backend returns sessionId, construct checkout URL
        // This should only happen if backend is properly configured
        throw new Error('Checkout URL not provided by backend');
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (error: any) {
      logger.error('Payment error:', error);
      toast.error(error.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
      setSelectedPlan(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={`w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto transition-all duration-300 ${
        theme === 'cyberpunk' ? 'cyberpunk-card' : ''
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                theme === 'cyberpunk' 
                  ? 'cyberpunk-gradient-bg' 
                  : 'bg-primary-100'
              }`}>
                <CreditCard className={`w-6 h-6 ${
                  theme === 'cyberpunk' ? 'text-white' : 'text-primary-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${
                  theme === 'cyberpunk' 
                    ? 'cyberpunk-font cyberpunk-gradient-text cyberpunk-text-glow' 
                    : 'text-secondary-900'
                }`}>
                  {theme === 'cyberpunk' ? 'UPGRADE TO PRO' : 'Upgrade to Pro'}
                </h2>
                <p className={`text-sm ${
                  theme === 'cyberpunk' 
                    ? 'text-white/80 cyberpunk-font' 
                    : 'text-secondary-600'
                }`}>
                  Unlock unlimited wallet assistance
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all duration-200 ${
                theme === 'cyberpunk' 
                  ? 'hover:bg-green-500/20 text-white/80 hover:text-white' 
                  : 'hover:bg-secondary-100 text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Usage Limit Reached Message */}
          <div className={`p-4 rounded-lg border ${
            theme === 'cyberpunk' 
              ? 'border-green-400/50 bg-green-500/10' 
              : 'border-yellow-200 bg-yellow-50'
          }`}>
            <div className="flex items-start space-x-3">
              <AlertCircle className={`w-5 h-5 ${
                theme === 'cyberpunk' ? 'text-green-400' : 'text-yellow-600'
              }`} />
              <div>
                <p className={`font-semibold ${
                  theme === 'cyberpunk' ? 'text-white' : 'text-yellow-900'
                }`}>
                  Free Tier Limit Reached
                </p>
                <p className={`text-sm mt-1 ${
                  theme === 'cyberpunk' ? 'text-white/80' : 'text-yellow-700'
                }`}>
                  You've used all 10 free wallet assistance attempts. Upgrade to Pro for unlimited access.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  plan.popular
                    ? theme === 'cyberpunk'
                      ? 'border-green-400 cyberpunk-gradient-border'
                      : 'border-primary-500 bg-primary-50'
                    : theme === 'cyberpunk'
                      ? 'border-green-400/30 hover:border-green-400/50'
                      : 'border-secondary-200 hover:border-primary-300'
                } ${selectedPlan === plan.id ? 'ring-2 ring-primary-500' : ''}`}
                onClick={() => !processing && handleCheckout(plan)}
              >
                {plan.popular && (
                  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${
                    theme === 'cyberpunk' 
                      ? 'bg-green-500 text-white cyberpunk-font' 
                      : 'bg-primary-600 text-white'
                  }`}>
                    Popular
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className={`text-xl font-bold mb-2 ${
                    theme === 'cyberpunk' ? 'text-white cyberpunk-font' : 'text-secondary-900'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className={`text-3xl font-bold ${
                      theme === 'cyberpunk' ? 'text-white' : 'text-secondary-900'
                    }`}>
                      ${plan.price}
                    </span>
                    <span className={`ml-2 text-sm ${
                      theme === 'cyberpunk' ? 'text-white/60' : 'text-secondary-600'
                    }`}>
                      /{plan.interval}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${
                        theme === 'cyberpunk' ? 'text-green-400' : 'text-primary-600'
                      }`} />
                      <span className={`text-sm ${
                        theme === 'cyberpunk' ? 'text-white/90' : 'text-secondary-700'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    theme === 'cyberpunk' ? 'cyberpunk-button' : ''
                  }`}
                  disabled={processing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckout(plan);
                  }}
                >
                  {processing && selectedPlan === plan.id ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Security Note */}
          <div className={`p-4 rounded-lg border ${
            theme === 'cyberpunk' 
              ? 'border-green-400/30 bg-green-500/5' 
              : 'border-secondary-200 bg-secondary-50'
          }`}>
            <div className="flex items-start space-x-3">
              <Shield className={`w-5 h-5 ${
                theme === 'cyberpunk' ? 'text-green-400' : 'text-primary-600'
              }`} />
              <div>
                <p className={`text-sm font-semibold ${
                  theme === 'cyberpunk' ? 'text-white' : 'text-secondary-900'
                }`}>
                  Secure Payment
                </p>
                <p className={`text-xs mt-1 ${
                  theme === 'cyberpunk' ? 'text-white/70' : 'text-secondary-600'
                }`}>
                  Powered by Stripe. Your payment information is encrypted and secure. Cancel anytime from your account.
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className={`p-3 rounded-lg ${
            theme === 'cyberpunk' 
              ? 'bg-green-500/10 border border-green-400/30' 
              : 'bg-secondary-50 border border-secondary-200'
          }`}>
            <div className="flex items-center space-x-2">
              <Info className={`w-4 h-4 ${
                theme === 'cyberpunk' ? 'text-green-400' : 'text-secondary-600'
              }`} />
              <p className={`text-xs ${
                theme === 'cyberpunk' ? 'text-white/80' : 'text-secondary-600'
              }`}>
                Subscription linked to: <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
