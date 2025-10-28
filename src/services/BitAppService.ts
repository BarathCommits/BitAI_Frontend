/**
 * Bit Apps Service
 * Handles all Bit App operations with backend API
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export interface BitApp {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  logo: string;
  rating: number;
  users: string;
  isVerified: boolean;
  tags: string[];
  isUploaded: boolean;
  uploadDate?: string;
  status?: string;
  uploader?: {
    username: string;
    email: string;
  };
  // Wallet and chain mapping
  walletInfo?: {
    address: string;
    provider: string;
    chainId: number;
    chainName?: string;
  };
}

export interface BitAppAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadAppRequest {
  name: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  walletInfo: {
    address: string;
    provider: string;
    chainId: number;
    chainName?: string;
  };
}

class BitAppService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken') || localStorage.getItem('jwtToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private transformBackendDAppToBitApp(backendDApp: any): BitApp {
    return {
      id: backendDApp.dappId || backendDApp._id || backendDApp.id,
      name: backendDApp.name,
      description: backendDApp.description,
      category: backendDApp.category?.charAt(0).toUpperCase() + backendDApp.category?.slice(1) || 'DeFi',
      url: backendDApp.url,
      logo: this.getCategoryEmoji(backendDApp.category),
      rating: backendDApp.rating || 4.5,
      users: backendDApp.totalUsers || backendDApp.users || '10K+',
      isVerified: backendDApp.isVerified || backendDApp.status?.isActive || true,
      tags: backendDApp.tags || [backendDApp.category],
      isUploaded: backendDApp.isUploaded || false,
      uploadDate: backendDApp.createdAt || backendDApp.uploadDate,
      status: backendDApp.status?.isActive ? 'active' : 'inactive',
      uploader: backendDApp.uploader,
      walletInfo: backendDApp.walletInfo
    };
  }

  private getCategoryEmoji(category: string): string {
    const emojiMap: { [key: string]: string } = {
      'defi': '💰',
      'nft': '🎨',
      'gaming': '🎮',
      'social': '👥',
      'dao': '🏛️',
      'bridge': '🌉',
      'tools': '🛠️',
      'custom': '⚙️'
    };
    return emojiMap[category?.toLowerCase()] || '🔷';
  }

  private async handleResponse<T>(response: Response): Promise<BitAppAPIResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}` 
        };
      }
      
      // Extract apps array from nested response structure
      // Backend returns: { success: true, data: { dapps: [...] } }
      let appsData = data.data?.dapps || data.data?.apps || data.data || data;
      
      // Transform backend dapp format to frontend BitApp format
      if (Array.isArray(appsData)) {
        appsData = appsData.map((app: any) => this.transformBackendDAppToBitApp(app));
      }
      
      return { success: true, data: appsData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  // Upload a new Bit App
  async uploadApp(appData: UploadAppRequest): Promise<BitAppAPIResponse<BitApp>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dapp/upload`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(appData),
      });

      return this.handleResponse<BitApp>(response);
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload app' 
      };
    }
  }

  // Get dummy apps for fallback when backend is not available
  private getDummyApps(category?: string, search?: string): BitApp[] {
    const allDummyApps: BitApp[] = [
      // DeFi Apps
      {
        id: 'uniswap-v3',
        name: 'Uniswap V3',
        description: 'Advanced decentralized exchange with concentrated liquidity and multiple fee tiers for efficient trading.',
        category: 'DeFi',
        url: 'https://app.uniswap.org',
        logo: '🦄',
        rating: 4.8,
        users: '500K+',
        isVerified: true,
        tags: ['DEX', 'Trading', 'Liquidity', 'AMM'],
        isUploaded: false
      },
      {
        id: 'aave-v3',
        name: 'Aave V3',
        description: 'Decentralized lending and borrowing protocol with innovative features like isolated markets and eMode.',
        category: 'DeFi',
        url: 'https://app.aave.com',
        logo: '👻',
        rating: 4.7,
        users: '300K+',
        isVerified: true,
        tags: ['Lending', 'Borrowing', 'Yield', 'Flash Loans'],
        isUploaded: false
      },
      {
        id: 'compound-finance',
        name: 'Compound Finance',
        description: 'Algorithmic money markets enabling users to supply and borrow assets with variable interest rates.',
        category: 'DeFi',
        url: 'https://app.compound.finance',
        logo: '🏦',
        rating: 4.6,
        users: '200K+',
        isVerified: true,
        tags: ['Lending', 'Borrowing', 'Governance', 'CTokens'],
        isUploaded: false
      },
      {
        id: 'curve-finance',
        name: 'Curve Finance',
        description: 'Efficient stablecoin and pegged asset exchange with low slippage and low fees.',
        category: 'DeFi',
        url: 'https://curve.fi',
        logo: '📈',
        rating: 4.5,
        users: '150K+',
        isVerified: true,
        tags: ['Stablecoins', 'Low Slippage', 'Yield Farming', 'AMM'],
        isUploaded: false
      },
      {
        id: 'yearn-finance',
        name: 'Yearn Finance',
        description: 'Automated yield farming protocol that optimizes DeFi strategies to maximize returns.',
        category: 'DeFi',
        url: 'https://yearn.finance',
        logo: '⚡',
        rating: 4.4,
        users: '100K+',
        isVerified: true,
        tags: ['Yield Farming', 'Vaults', 'Automation', 'Strategy'],
        isUploaded: false
      },

      // NFT Apps
      {
        id: 'opensea',
        name: 'OpenSea',
        description: 'The world\'s largest NFT marketplace for buying, selling, and discovering digital collectibles.',
        category: 'NFT',
        url: 'https://opensea.io',
        logo: '🌊',
        rating: 4.6,
        users: '2M+',
        isVerified: true,
        tags: ['Marketplace', 'Collectibles', 'Art', 'Trading'],
        isUploaded: false
      },
      {
        id: 'foundation',
        name: 'Foundation',
        description: 'Curated NFT marketplace for digital art, connecting creators with collectors in a premium environment.',
        category: 'NFT',
        url: 'https://foundation.app',
        logo: '🎨',
        rating: 4.5,
        users: '500K+',
        isVerified: true,
        tags: ['Art', 'Curated', 'Premium', 'Creators'],
        isUploaded: false
      },
      {
        id: 'superrare',
        name: 'SuperRare',
        description: 'Single-edition digital art marketplace where artists can mint and sell unique NFT artworks.',
        category: 'NFT',
        url: 'https://superrare.com',
        logo: '💎',
        rating: 4.4,
        users: '300K+',
        isVerified: true,
        tags: ['Single Edition', 'Art', 'Rare', 'Minting'],
        isUploaded: false
      },
      {
        id: 'nifty-gateway',
        name: 'Nifty Gateway',
        description: 'Premier NFT marketplace featuring drops from top artists and brands with fiat payment options.',
        category: 'NFT',
        url: 'https://niftygateway.com',
        logo: '🚪',
        rating: 4.3,
        users: '200K+',
        isVerified: true,
        tags: ['Drops', 'Fiat Payments', 'Brands', 'Premium'],
        isUploaded: false
      },
      {
        id: 'async-art',
        name: 'Async Art',
        description: 'Programmable art platform where NFTs can change over time based on blockchain data.',
        category: 'NFT',
        url: 'https://async.art',
        logo: '🔄',
        rating: 4.2,
        users: '50K+',
        isVerified: true,
        tags: ['Programmable', 'Dynamic', 'Layers', 'Interactive'],
        isUploaded: false
      },

      // Gaming Apps
      {
        id: 'axie-infinity',
        name: 'Axie Infinity',
        description: 'Play-to-earn game where players battle, collect, and trade fantasy creatures called Axies.',
        category: 'Gaming',
        url: 'https://axieinfinity.com',
        logo: '🦄',
        rating: 4.3,
        users: '1M+',
        isVerified: true,
        tags: ['Play-to-Earn', 'Battles', 'Collectibles', 'Ronin'],
        isUploaded: false
      },
      {
        id: 'sandbox',
        name: 'The Sandbox',
        description: 'Virtual world where players can create, own, and monetize their gaming experiences using NFTs.',
        category: 'Gaming',
        url: 'https://sandbox.game',
        logo: '🏗️',
        rating: 4.4,
        users: '800K+',
        isVerified: true,
        tags: ['Virtual World', 'Creator Economy', 'LAND', 'Voxel'],
        isUploaded: false
      },
      {
        id: 'decentraland',
        name: 'Decentraland',
        description: 'Virtual reality platform powered by Ethereum where users can create, experience, and monetize content.',
        category: 'Gaming',
        url: 'https://decentraland.org',
        logo: '🌐',
        rating: 4.2,
        users: '600K+',
        isVerified: true,
        tags: ['Virtual Reality', 'LAND', 'Events', 'Social'],
        isUploaded: false
      },
      {
        id: 'gods-unchained',
        name: 'Gods Unchained',
        description: 'Trading card game where players own their cards as NFTs and can trade them freely.',
        category: 'Gaming',
        url: 'https://godsunchained.com',
        logo: '⚔️',
        rating: 4.1,
        users: '400K+',
        isVerified: true,
        tags: ['Trading Cards', 'NFTs', 'Strategy', 'Competitive'],
        isUploaded: false
      },
      {
        id: 'illuvium',
        name: 'Illuvium',
        description: 'Open-world RPG adventure game with NFT creatures and decentralized autonomous organization governance.',
        category: 'Gaming',
        url: 'https://illuvium.io',
        logo: '🌟',
        rating: 4.5,
        users: '300K+',
        isVerified: true,
        tags: ['RPG', 'Open World', 'DAO', 'Adventure'],
        isUploaded: false
      },

      // Social Apps
      {
        id: 'mirror',
        name: 'Mirror',
        description: 'Decentralized publishing platform where writers can monetize their content through crypto subscriptions.',
        category: 'Social',
        url: 'https://mirror.xyz',
        logo: '🪞',
        rating: 4.6,
        users: '100K+',
        isVerified: true,
        tags: ['Publishing', 'Writing', 'Subscriptions', 'Crypto'],
        isUploaded: false
      },
      {
        id: 'lens-protocol',
        name: 'Lens Protocol',
        description: 'Decentralized social graph protocol enabling creators to own their content and relationships.',
        category: 'Social',
        url: 'https://lens.xyz',
        logo: '👁️',
        rating: 4.4,
        users: '200K+',
        isVerified: true,
        tags: ['Social Graph', 'Content Ownership', 'Follow', 'Mirror'],
        isUploaded: false
      },
      {
        id: 'farcaster',
        name: 'Farcaster',
        description: 'Decentralized social network protocol that gives users control over their data and social connections.',
        category: 'Social',
        url: 'https://farcaster.xyz',
        logo: '📡',
        rating: 4.3,
        users: '150K+',
        isVerified: true,
        tags: ['Social Network', 'Decentralized', 'Protocol', 'Community'],
        isUploaded: false
      },
      {
        id: 'rally',
        name: 'Rally',
        description: 'Platform for creators to launch their own social tokens and build engaged communities.',
        category: 'Social',
        url: 'https://rally.io',
        logo: '🚀',
        rating: 4.2,
        users: '80K+',
        isVerified: true,
        tags: ['Social Tokens', 'Creator Economy', 'Community', 'Fan Tokens'],
        isUploaded: false
      },
      {
        id: 'audius',
        name: 'Audius',
        description: 'Decentralized music streaming platform that gives artists direct access to fans and fair compensation.',
        category: 'Social',
        url: 'https://audius.co',
        logo: '🎵',
        rating: 4.1,
        users: '500K+',
        isVerified: true,
        tags: ['Music', 'Streaming', 'Artists', 'Decentralized'],
        isUploaded: false
      },

      // Custom Apps
      {
        id: 'gnosis-bit',
        name: 'Gnosis Bit',
        description: 'Smart wallet infrastructure for secure management of digital assets with multi-signature capabilities.',
        category: 'Custom',
        url: 'https://gnosis-safe.io',
        logo: '🛡️',
        rating: 4.8,
        users: '1M+',
        isVerified: true,
        tags: ['Wallet', 'Multi-sig', 'Security', 'Infrastructure'],
        isUploaded: false
      },
      {
        id: 'snapshot',
        name: 'Snapshot',
        description: 'Decentralized voting platform for DAOs and communities to make governance decisions.',
        category: 'Custom',
        url: 'https://snapshot.org',
        logo: '📊',
        rating: 4.7,
        users: '300K+',
        isVerified: true,
        tags: ['Governance', 'Voting', 'DAO', 'Decisions'],
        isUploaded: false
      },
      {
        id: 'tally',
        name: 'Tally',
        description: 'Governance dashboard and analytics platform for DAOs to track proposals and voting activity.',
        category: 'Custom',
        url: 'https://tally.xyz',
        logo: '📈',
        rating: 4.5,
        users: '100K+',
        isVerified: true,
        tags: ['Analytics', 'Governance', 'Dashboard', 'DAO'],
        isUploaded: false
      },
      {
        id: 'coingecko',
        name: 'CoinGecko',
        description: 'Independent cryptocurrency market data aggregator providing comprehensive market insights.',
        category: 'Custom',
        url: 'https://coingecko.com',
        logo: '🦎',
        rating: 4.6,
        users: '5M+',
        isVerified: true,
        tags: ['Market Data', 'Analytics', 'Prices', 'Portfolio'],
        isUploaded: false
      },
      {
        id: 'etherscan',
        name: 'Etherscan',
        description: 'Blockchain explorer and analytics platform for Ethereum network transactions and smart contracts.',
        category: 'Custom',
        url: 'https://etherscan.io',
        logo: '🔍',
        rating: 4.8,
        users: '10M+',
        isVerified: true,
        tags: ['Explorer', 'Analytics', 'Transactions', 'Smart Contracts'],
        isUploaded: false
      }
    ];

    // Filter by category if specified
    let filteredApps = allDummyApps;
    if (category && category !== 'All') {
      filteredApps = allDummyApps.filter(app => 
        app.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by search query if specified
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApps = filteredApps.filter(app =>
        app.name.toLowerCase().includes(searchLower) ||
        app.description.toLowerCase().includes(searchLower) ||
        app.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filteredApps;
  }

  // Get all Bit Apps
  async getAllApps(params?: {
    category?: string;
    search?: string;
    sortBy?: string;
  }): Promise<BitAppAPIResponse<BitApp[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

      // Use /api/v1/dapp endpoint
      const response = await fetch(`${API_BASE_URL}/dapp?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      // If backend returns data, use it
      if (response.ok) {
        const result = await this.handleResponse<BitApp[]>(response);
        // If we got valid data from backend, return it
        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          console.log('✅ Loaded', result.data.length, 'apps from backend');
          return result;
        }
      }

      // Backend failed or returned empty data - return dummy data
      console.log('⚠️ Backend not available or returned empty data, using dummy data');
      const dummyApps = this.getDummyApps(params?.category, params?.search);
      return {
        success: true,
        data: dummyApps
      };
    } catch (error) {
      // Return dummy data on any error
      console.error('❌ Error loading apps from backend:', error);
      const dummyApps = this.getDummyApps(params?.category, params?.search);
      return { 
        success: true,
        data: dummyApps
      };
    }
  }

  // Get user's uploaded apps
  async getMyApps(): Promise<BitAppAPIResponse<BitApp[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dapp/my-apps`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<BitApp[]>(response);
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch your apps' 
      };
    }
  }

  // Get app by ID
  async getAppById(id: string): Promise<BitAppAPIResponse<BitApp>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dapp/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<BitApp>(response);
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch app' 
      };
    }
  }

  // Update app
  async updateApp(id: string, appData: Partial<UploadAppRequest>): Promise<BitAppAPIResponse<BitApp>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dapp/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(appData),
      });

      return this.handleResponse<BitApp>(response);
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update app' 
      };
    }
  }

  // Delete app
  async deleteApp(id: string): Promise<BitAppAPIResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/dapp/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<void>(response);
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete app' 
      };
    }
  }
}

export const bitAppService = new BitAppService();
