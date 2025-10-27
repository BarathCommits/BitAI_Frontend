import { useState, useEffect } from 'react';
import { authService } from '../services/AuthService';

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

export const usePortfolio = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValue: 0,
    totalChange: 0,
    totalChangePercent: 0,
    assets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
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

        // TODO: Replace with real API call when backend endpoint is ready
        // const response = await fetch(`${API_CONFIG.WALLET.PORTFOLIO}?address=${walletAddress}`);
        // const data = await response.json();
        
        // Return empty portfolio data until backend is ready
        setPortfolioData({
          totalValue: 0,
          totalChange: 0,
          totalChangePercent: 0,
          assets: [],
        });
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
        setLoading(false);
      }
    };

    fetchPortfolio();
    
    // Refresh portfolio every 30 seconds
    const interval = setInterval(fetchPortfolio, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const refreshPortfolio = async () => {
    // TODO: Implement manual refresh
  };

  return {
    portfolioData,
    loading,
    error,
    refreshPortfolio,
  };
};

export default usePortfolio;


