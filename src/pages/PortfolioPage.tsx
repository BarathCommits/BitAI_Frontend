import React from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { usePortfolio } from '../hooks/usePortfolio';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Filter,
  Download,
  RefreshCw,
  Wallet
} from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const [showBalances, setShowBalances] = React.useState(true);
  
  // Use real portfolio data hook
  const { portfolioData, loading: portfolioLoading, refreshPortfolio } = usePortfolio();

  const performanceData = [
    { period: '1D', change: 8.82, value: 15420.50 },
    { period: '7D', change: 12.45, value: 15200.30 },
    { period: '30D', change: -5.23, value: 16800.75 },
    { period: '90D', change: 25.67, value: 12800.20 },
    { period: '1Y', change: 45.32, value: 10800.10 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatChange = (change: number, isPercent = false) => {
    const sign = change >= 0 ? '+' : '';
    const formatted = isPercent ? `${sign}${change.toFixed(2)}%` : `${sign}${formatCurrency(change)}`;
    return formatted;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Portfolio</h1>
          <p className="text-secondary-600">Track your Solana assets and performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={refreshPortfolio} disabled={portfolioLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${portfolioLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            {showBalances ? 'Hide' : 'Show'} Balances
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold text-secondary-900">Total Portfolio Value</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-900 mb-2">
                {showBalances ? formatCurrency(portfolioData.totalValue) : '••••••'}
              </div>
              <div className={`flex items-center justify-center space-x-2 ${
                portfolioData.totalChange >= 0 ? 'text-success-600' : 'text-error-600'
              }`}>
                {portfolioData.totalChange >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-lg font-medium">
                  {showBalances ? formatChange(portfolioData.totalChangePercent, true) : '•••'}
                </span>
                <span className="text-sm text-secondary-500">24h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-secondary-900">Assets</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-900 mb-1">
                {portfolioData.assets.length}
              </div>
              <div className="text-sm text-secondary-600">Different tokens</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-secondary-900">Chains</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-900 mb-1">2</div>
              <div className="text-sm text-secondary-600">Networks</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-secondary-900">Performance</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {performanceData.map((data) => (
              <div key={data.period} className="text-center p-4 bg-secondary-50 rounded-lg">
                <div className="text-sm text-secondary-600 mb-2">{data.period}</div>
                <div className={`text-lg font-semibold mb-1 ${
                  data.change >= 0 ? 'text-success-600' : 'text-error-600'
                }`}>
                  {showBalances ? formatChange(data.change, true) : '•••'}
                </div>
                <div className="text-sm text-secondary-500">
                  {showBalances ? formatCurrency(data.value) : '••••'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-secondary-900">Assets</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 font-medium text-secondary-600">Asset</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-600">Balance</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-600">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-600">24h Change</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-600">Allocation</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-600">Chain</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.assets.map((asset) => (
                  <tr key={asset.symbol} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{asset.logo}</div>
                        <div>
                          <div className="font-medium text-secondary-900">{asset.symbol}</div>
                          <div className="text-sm text-secondary-600">{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-secondary-900">
                        {showBalances ? asset.balance : '••••'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-secondary-900">
                        {showBalances ? formatCurrency(asset.value) : '••••'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`flex items-center ${
                        asset.change >= 0 ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {asset.change >= 0 ? (
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 mr-1" />
                        )}
                        <span className="font-medium">
                          {showBalances ? formatChange(asset.changePercent, true) : '•••'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-secondary-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${asset.allocation}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-secondary-600">
                          {showBalances ? `${asset.allocation}%` : '••%'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-secondary-600">{asset.chain}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-secondary-900">Asset Allocation</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioData.assets.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">{asset.logo}</div>
                    <div>
                      <div className="font-medium text-secondary-900">{asset.symbol}</div>
                      <div className="text-sm text-secondary-600">{asset.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-secondary-900">
                      {showBalances ? `${asset.allocation}%` : '••%'}
                    </div>
                    <div className="text-sm text-secondary-600">
                      {showBalances ? formatCurrency(asset.value) : '••••'}
                    </div>
                  </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-secondary-900">Chain Distribution</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">E</span>
                  </div>
                  <div>
                    <div className="font-medium text-secondary-900">Ethereum</div>
                    <div className="text-sm text-secondary-600">4 assets</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-secondary-900">
                    {showBalances ? '70.8%' : '••%'}
                  </div>
                  <div className="text-sm text-secondary-600">
                    {showBalances ? formatCurrency(10920.50) : '••••'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-orange-600">B</span>
                  </div>
                  <div>
                    <div className="font-medium text-secondary-900">Bitcoin</div>
                    <div className="text-sm text-secondary-600">1 asset</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-secondary-900">
                    {showBalances ? '29.2%' : '••%'}
                  </div>
                  <div className="text-sm text-secondary-600">
                    {showBalances ? formatCurrency(4500.00) : '••••'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioPage;
