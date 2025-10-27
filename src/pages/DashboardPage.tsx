import React from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { usePortfolio } from '../hooks/usePortfolio';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Zap,
  MessageSquare,
  Store,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [showBalances, setShowBalances] = React.useState(true);
  
  // Use real portfolio data hook (currently returns empty - will be populated when backend ready)
  const { portfolioData, loading: portfolioLoading } = usePortfolio();
  
  // Use real portfolio data only
  const displayData = portfolioData;

  const recentActivity: any[] = []; // Empty until backend provides real data

  const quickActions = [
    { icon: MessageSquare, label: 'AI Chat', description: 'Get help with Web3', color: 'bg-blue-50 text-blue-600' },
    { icon: Store, label: 'dApp Store', description: 'Discover new dApps', color: 'bg-green-50 text-green-600' },
    { icon: Wallet, label: 'Send Tokens', description: 'Transfer assets', color: 'bg-purple-50 text-purple-600' },
    { icon: Shield, label: 'Security', description: 'Check wallet security', color: 'bg-red-50 text-red-600' },
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
          <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600">Welcome back! Here's your Web3 overview.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            {showBalances ? 'Hide' : 'Show'} Balances
          </Button>
          <Button size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-secondary-900">Portfolio Overview</h2>
              <Button variant="outline" size="sm">
                <PieChart className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Total Value */}
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

              {/* Assets List */}
              <div className="space-y-3">
                {portfolioData.assets.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">
                          {asset.symbol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-secondary-900">{asset.symbol}</div>
                        <div className="text-sm text-secondary-600">{asset.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-secondary-900">
                        {showBalances ? formatCurrency(asset.value) : '••••'}
                      </div>
                      <div className={`text-sm flex items-center ${
                        asset.change >= 0 ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {asset.change >= 0 ? (
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 mr-1" />
                        )}
                        {showBalances ? formatChange(asset.changePercent, true) : '•••'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-secondary-900">Quick Actions</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-secondary-900">{action.label}</div>
                    <div className="text-sm text-secondary-600">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-secondary-900">Recent Activity</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'swap' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'stake' ? 'bg-green-100 text-green-600' :
                    activity.type === 'transfer' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {activity.type === 'swap' ? <TrendingUp className="w-4 h-4" /> :
                     activity.type === 'stake' ? <Shield className="w-4 h-4" /> :
                     activity.type === 'transfer' ? <Wallet className="w-4 h-4" /> :
                     <Store className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-medium text-secondary-900">{activity.description}</div>
                    <div className="text-sm text-secondary-600">{activity.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  {activity.amount && (
                    <div className="font-medium text-secondary-900">{activity.amount}</div>
                  )}
                  <div className="text-sm text-success-600 capitalize">{activity.status}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-secondary-900">AI Insights</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-900 mb-2">
                  Portfolio Performance Analysis
                </h3>
                <p className="text-secondary-600 mb-4">
                  Your portfolio is performing well with an 8.82% increase in the last 24 hours. 
                  AAVE tokens are your top performer, up 66.89%. Consider diversifying into 
                  more stable assets like USDC for risk management.
                </p>
                <Button size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask AI for More Insights
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
