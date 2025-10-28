import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { bitAppService, BitApp } from '../services/BitAppService';
import { useBuiltInWallet } from '../hooks/useBuiltInWallet';
import { useTheme } from '../hooks/useTheme';
import { 
  Search, 
  Star, 
  Users, 
  ExternalLink,
  Shield,
  CheckCircle,
  Store,
  Wallet,
  Code,
  AlertCircle,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';


const categories = ['All', 'DeFi', 'NFT', 'Gaming', 'Social', 'Custom'];
const sortOptions = ['Popular', 'Newest', 'Rating', 'Name'];
const walletFilters = ['All Wallets', 'My Wallet', 'Connected Wallet'];

export const BitStorePage: React.FC = () => {
  const { connectedWallets } = useBuiltInWallet();
  const { theme, isCyberpunk } = useTheme();
  
  // Check if any wallet is connected
  const isWalletConnected = connectedWallets.length > 0;
  const isConnected = connectedWallets.length > 0;
  const primaryWallet = connectedWallets[0]; // Use first connected wallet
  const walletInfo = primaryWallet ? {
    address: primaryWallet.address || '',
    provider: primaryWallet.id,
    chainId: primaryWallet.chainId || 1
  } : null;
  const [apps, setApps] = useState<BitApp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWalletFilter, setSelectedWalletFilter] = useState('All Wallets');
  const [sortBy, setSortBy] = useState('Popular');
  const [isLoading, setIsLoading] = useState(true);

  // Load apps from backend on component mount
  useEffect(() => {
    loadApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadApps = async () => {
    setIsLoading(true);
    try {
      const result = await bitAppService.getAllApps({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        sortBy: sortBy === 'Popular' ? 'uploadDate' : sortBy.toLowerCase()
      });

      if (result.success && result.data && Array.isArray(result.data)) {
        // Just set the apps without wallet filtering for now
        // Wallet filtering can be done in the UI if needed
        setApps(result.data);
      } else if (result.error) {
        console.error('Failed to load apps:', result.error);
        // Show empty state if backend fails
        setApps([]);
      } else {
        // Unexpected result format, but still try to show apps
        console.warn('Unexpected result format, apps may not load');
        setApps([]);
      }
    } catch (error) {
      console.error('Error loading apps:', error);
      // Show empty state on error
      setApps([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reload apps when filters change
  useEffect(() => {
    loadApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedWalletFilter, searchQuery, sortBy]);



  const getChainName = (chainId: number): string => {
    const chainNames: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum',
      10: 'Optimism',
      43114: 'Avalanche',
      250: 'Fantom',
      25: 'Cronos',
      100: 'Gnosis Chain',
      1284: 'Moonbeam',
      1285: 'Moonriver',
      592: 'Astar',
      128: 'Huobi ECO Chain',
      66: 'OKExChain',
      288: 'Boba Network',
      1088: 'Metis',
      106: 'Velas',
      40: 'Telos',
      82: 'Meter',
      333999: 'Polis',
      321: 'KCC',
      42220: 'Celo',
      1287: 'Moonbase Alpha',
      97: 'BSC Testnet',
      5: 'Goerli',
      80001: 'Mumbai',
      421613: 'Arbitrum Goerli',
      420: 'Optimism Goerli',
      43113: 'Avalanche Fuji'
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  const handleConnectApp = (app: BitApp) => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet to open dApps');
      return;
    }
    // Open the dApp in a new tab
    window.open(app.url, '_blank');
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isCyberpunk 
        ? 'cyberpunk-theme' 
        : 'gradient-bg'
    }`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-glow transition-all duration-300 ${
              isCyberpunk 
                ? 'cyberpunk-gradient-bg' 
                : 'blue-purple-icon-gradient'
            }`}>
              <Store className={`w-6 h-6 transition-all duration-300 ${
                isCyberpunk 
                  ? 'text-white' 
                  : 'text-primary-600'
              }`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold transition-all duration-300 ${
                isCyberpunk 
                  ? 'cyberpunk-gradient-text cyberpunk-font' 
                  : 'text-gradient bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent'
              }`}>
                {isCyberpunk ? 'Bit AppStore' : 'Bit AppStore'}
              </h1>
              <p className={`transition-all duration-300 ${
                isCyberpunk 
                  ? 'text-white/80' 
                  : 'text-secondary-600'
              }`}>
                {isCyberpunk 
                  ? 'Discover and deploy secure Bit applications' 
                  : 'Discover and upload secure decentralized applications'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 text-secondary-600">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span>All apps verified</span>
              </div>
              <div className="flex items-center space-x-2 text-secondary-600">
                <Shield className="w-4 h-4" />
                <span>Secure browsing</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/sdk'}
                className="flex items-center gap-2"
              >
                <Code className="w-4 h-4" />
                <span>SDK Integration</span>
              </Button>
              {isWalletConnected && primaryWallet?.address && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Wallet Connected</span>
                  <span className="text-xs text-secondary-500">
                    {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.href = '/developer/submit'}
                className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-accent-600"
                title="Submit your dApp using our SDK"
              >
                <Code className="w-4 h-4" />
                <span>Submit via SDK</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search apps, categories, or tags..."
                className="pl-10"
                fullWidth={false}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-secondary-700">Category:</span>
              <div className="flex space-x-1">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Wallet Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-secondary-700">Wallet:</span>
              <div className="flex space-x-1">
                {walletFilters.map(filter => {
                  const isWalletFilter = filter === 'My Wallet' || filter === 'Connected Wallet';
                  // Temporarily enable all filters for testing
                  const isDisabled = false; // !isWalletConnected || !primaryWallet?.address;
                  
                  return (
                    <Button
                      key={filter}
                      variant={selectedWalletFilter === filter ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedWalletFilter(filter)}
                      disabled={isDisabled}
                      title={isWalletFilter && !isWalletConnected ? "Wallet connection needed for this filter" : ""}
                    >
                      {filter}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium transition-all duration-300 ${
                isCyberpunk 
                  ? 'text-white/80 cyberpunk-font' 
                  : 'text-secondary-700'
              }`}>
                {isCyberpunk ? 'SAFE SORT:' : 'Sort by:'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isCyberpunk 
                    ? 'cyberpunk-input border-green-400/30 focus:ring-green-400' 
                    : 'border-secondary-300 focus:ring-primary-500'
                }`}
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading apps...</p>
          </div>
        )}

        {/* Apps Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(apps) && apps.map((app) => (
            <Card key={app.id} className={`hover:shadow-lg transition-shadow ${
              isCyberpunk 
                ? 'cyberpunk-card border-green-400/30' 
                : ''
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all duration-300 ${
                      isCyberpunk 
                        ? 'cyberpunk-gradient-bg' 
                        : 'bg-secondary-100'
                    }`}>
                      {app.logo}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold transition-all duration-300 ${
                          isCyberpunk 
                            ? 'text-white cyberpunk-font' 
                            : 'text-secondary-900'
                        }`}>{app.name}</h3>
                        {app.isVerified ? (
                          <CheckCircle className="w-4 h-4 text-success-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-warning-500" />
                        )}
                      </div>
                      <p className={`text-sm transition-all duration-300 ${
                        isCyberpunk 
                          ? 'text-white/80 cyberpunk-font' 
                          : 'text-secondary-500'
                      }`}>{app.category}</p>
                    </div>
                  </div>
                  
                  {app.isUploaded && (
                    <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                      isCyberpunk 
                        ? 'text-green-400 bg-green-500/20 border border-green-400/30' 
                        : 'text-primary-600 bg-primary-50'
                    }`}>
                      <Upload className="w-3 h-3" />
                      <span>Your App</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
                  {app.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {app.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Wallet and Chain Info */}
                {app.walletInfo && app.walletInfo.provider && app.walletInfo.address && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      <Wallet className="w-3 h-3" />
                      <span>{app.walletInfo.provider}</span>
                    </div>
                    {app.walletInfo.chainName && (
                      <div className="flex items-center space-x-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                        <span>Chain: {app.walletInfo.chainName}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded-full">
                      <span>{app.walletInfo.address.slice(0, 6)}...{app.walletInfo.address.slice(-4)}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-secondary-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-warning-500 fill-current" />
                      <span>{app.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{app.users}</span>
                    </div>
                  </div>
                  
                  {app.isUploaded && app.uploadDate && (
                    <span className="text-xs">Uploaded {app.uploadDate}</span>
                  )}
                </div>
                
                <Button
                  onClick={() => handleConnectApp(app)}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Connect App</span>
                </Button>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && Array.isArray(apps) && apps.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-secondary-400" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                No apps found
              </h3>
              <p className="text-secondary-600 mb-6">
                Try adjusting your search or filters to find the app you're looking for, or submit a dApp via our SDK.
              </p>
              <Button onClick={() => window.location.href = '/developer/submit'}>
                <Code className="w-4 h-4 mr-2" />
                Submit via SDK
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BitStorePage;
