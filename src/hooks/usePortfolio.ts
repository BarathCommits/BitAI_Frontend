/**
 * Portfolio Hook
 * 
 * Fetches and manages wallet portfolio data.
 * 
 * Features:
 * - Fetch portfolio from wallet API
 * - Convert API response to portfolio format
 * - Track total value and assets
 * - Auto-refresh on wallet change
 * 
 * Used in PortfolioPage component.
 */
import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/AuthService';
import { walletAPIService, PortfolioBalance } from '../services/WalletAPIService';

export interface PortfolioData {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  assets: Array<{
    symbol: string;
    name: string;
    balance: string;
    value: number;
    change: number;
    changePercent: number;
    allocation?: number;
    chain?: string;
    logo?: string;
  }>;
}

const convertPortfolioBalanceToPortfolioData = (balance: PortfolioBalance): PortfolioData => {
  const assets = balance.assets.map(asset => ({
    symbol: asset.symbol,
    name: asset.name,
    balance: asset.balance,
    value: asset.balanceUSD,
    change: 0, // Change data not provided by API
    changePercent: 0, // Change data not provided by API
    allocation: balance.totalValueUSD > 0 ? (asset.balanceUSD / balance.totalValueUSD) * 100 : 0,
    chain: `Chain ${asset.chainId}`,
    logo: asset.logoURI,
  }));

  return {
    totalValue: balance.totalValueUSD,
    totalChange: 0, // Change data not provided by API
    totalChangePercent: 0, // Change data not provided by API
    assets,
  };
};

export const usePortfolio = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValue: 0,
    totalChange: 0,
    totalChangePercent: 0,
    assets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const walletAddress = authService.getWalletAddress();
      
      if (!walletAddress) {
        // No wallet connected - show empty portfolio
        setPortfolioData({
          totalValue: 0,
          totalChange: 0,
          totalChangePercent: 0,
          assets: [],
        });
        setLoading(false);
        return;
      }

      // Fetch portfolio from wallet API service
      const result = await walletAPIService.getPortfolio(walletAddress);
      
      if (result.success && result.data) {
        const convertedData = convertPortfolioBalanceToPortfolioData(result.data);
        setPortfolioData(convertedData);
      } else {
        setError(result.error?.message || 'Failed to fetch portfolio');
        // Set empty portfolio on error
        setPortfolioData({
          totalValue: 0,
          totalChange: 0,
          totalChangePercent: 0,
          assets: [],
        });
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
      setLoading(false);
      // Set empty portfolio on error
      setPortfolioData({
        totalValue: 0,
        totalChange: 0,
        totalChangePercent: 0,
        assets: [],
      });
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
    
    // Refresh portfolio every 30 seconds
    const interval = setInterval(fetchPortfolio, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchPortfolio]);

  const refreshPortfolio = useCallback(async () => {
    await fetchPortfolio();
  }, [fetchPortfolio]);

  return {
    portfolioData,
    loading,
    error,
    refreshPortfolio,
  };
};

export default usePortfolio;


