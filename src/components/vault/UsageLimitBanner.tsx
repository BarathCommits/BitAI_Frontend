import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';
import { usageTrackingService } from '../../services/UsageTrackingService';
import { 
  AlertCircle, 
  Zap, 
  TrendingUp,
  Lock
} from 'lucide-react';

interface UsageLimitBannerProps {
  onUpgradeClick: () => void;
}

export const UsageLimitBanner: React.FC<UsageLimitBannerProps> = ({ onUpgradeClick }) => {
  const { connectedWallets } = useBuiltInWallet();
  const theme = connectedWallets.length > 0 ? 'cyberpunk' : 'modern';
  
  const walletAddress = connectedWallets[0]?.address || '';
  const stats = usageTrackingService.getUsageStats(walletAddress);

  if (stats.isPro || !walletAddress) {
    return null; // Don't show for Pro users or when no wallet connected
  }

  const remaining = stats.remaining;
  const isLimitReached = remaining === 0;

  return (
    <Card className={`transition-all duration-300 ${
      theme === 'cyberpunk' ? 'cyberpunk-card' : ''
    } ${
      isLimitReached 
        ? theme === 'cyberpunk'
          ? 'border-red-400/50 bg-red-500/10'
          : 'border-red-200 bg-red-50'
        : theme === 'cyberpunk'
          ? 'border-yellow-400/50 bg-yellow-500/10'
          : 'border-yellow-200 bg-yellow-50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isLimitReached
                ? theme === 'cyberpunk'
                  ? 'bg-red-500/20'
                  : 'bg-red-100'
                : theme === 'cyberpunk'
                  ? 'bg-yellow-500/20'
                  : 'bg-yellow-100'
            }`}>
              {isLimitReached ? (
                <Lock className={`w-5 h-5 ${
                  theme === 'cyberpunk' ? 'text-red-400' : 'text-red-600'
                }`} />
              ) : (
                <AlertCircle className={`w-5 h-5 ${
                  theme === 'cyberpunk' ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
              )}
            </div>
            <div>
              <p className={`font-semibold ${
                theme === 'cyberpunk' ? 'text-white' : 'text-secondary-900'
              }`}>
                {isLimitReached 
                  ? 'Free Tier Limit Reached' 
                  : `${remaining} Free Attempt${remaining !== 1 ? 's' : ''} Remaining`}
              </p>
              <p className={`text-sm ${
                theme === 'cyberpunk' ? 'text-white/70' : 'text-secondary-600'
              }`}>
                {isLimitReached
                  ? 'Upgrade to Pro for unlimited wallet assistance'
                  : `${stats.used}/${stats.limit} attempts used`}
              </p>
            </div>
          </div>
          <Button
            onClick={onUpgradeClick}
            className={theme === 'cyberpunk' ? 'cyberpunk-button' : ''}
            size="sm"
          >
            {isLimitReached ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrade Now
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

