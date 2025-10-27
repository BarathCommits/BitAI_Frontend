import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { AlertCircle, Zap, TrendingUp, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { apiUsageService, ProviderUsage } from '../../services/APIUsageService';
import { useAuthStore } from '../../store/authStore';

interface UsageLimit {
  provider: string;
  used: number;
  limit: number;
  resetTime: Date;
  icon: string;
}

export const APIUsageLimits: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [usageLimits, setUsageLimits] = useState<UsageLimit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalLimit, setTotalLimit] = useState(3000);
  const [totalRemaining, setTotalRemaining] = useState(3000);
  const [chatRateLimit, setChatRateLimit] = useState({
    used: 0,
    limit: 50,
    resetTime: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
  });

  const providerIcons: Record<string, string> = {
    gemini: '🤖',
    claude: '🧠',
    cohere: '🔮',
    huggingface: '🤗'
  };

  const providerNames: Record<string, string> = {
    gemini: 'Google Gemini',
    claude: 'Claude AI',
    cohere: 'Cohere',
    huggingface: 'HuggingFace'
  };

  const fetchUsage = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      // TODO: Implement API usage endpoint on backend
      // Return empty data until backend is ready
      setUsageLimits([]);
      setTotalCalls(0);
      setTotalLimit(0);
      setTotalRemaining(0);
    } catch (error) {
      console.error('Failed to fetch API usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const getPercentageUsed = (used: number, limit: number): number => {
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTimeUntilReset = (resetTime: Date): string => {
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    
    if (diff < 0) return 'Resetting soon...';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatResetPeriod = (provider: string): string => {
    if (provider === 'Google Gemini') return 'Daily';
    return 'Monthly';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold">API Usage</h3>
          </div>
          <span className="text-xs text-gray-400">Free Tier</span>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {/* Chat Rate Limit - Compact */}
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-blue-900 dark:text-blue-100">Chat: {chatRateLimit.used}/{chatRateLimit.limit}</span>
            <span className="text-xs text-blue-600">Resets in {getTimeUntilReset(chatRateLimit.resetTime)}</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${getPercentageUsed(chatRateLimit.used, chatRateLimit.limit)}%` }}
            />
          </div>
        </div>

        {/* AI Provider Limits - Compact */}
        <div className="space-y-2">
          {usageLimits.map((provider) => {
            const percentage = getPercentageUsed(provider.used, provider.limit);
            const progressColor = getProgressColor(percentage);
            const remaining = provider.limit - provider.used;
            
            return (
              <div 
                key={provider.provider}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{provider.icon}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {provider.provider.replace('Google ', '')}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {provider.used}/{provider.limit}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div 
                    className={`${progressColor} h-1 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Summary */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <span>Total: {usageLimits.reduce((sum, p) => sum + p.used, 0)}/{usageLimits.reduce((sum, p) => sum + p.limit, 0)}</span>
          <span>{usageLimits.reduce((sum, p) => sum + (p.limit - p.used), 0).toLocaleString()} remaining</span>
        </div>
      </CardContent>
    </Card>
  );
};

