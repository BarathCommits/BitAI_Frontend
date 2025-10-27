/**
 * Solana NFT Service - Comprehensive NFT operations
 * Integrates with major Solana NFT marketplaces and protocols
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

export interface NFTMetadata {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  collection?: {
    name: string;
    family: string;
  };
}

export interface NFTCollection {
  collectionId: string;
  name: string;
  description: string;
  image: string;
  floorPrice: number;
  volume24h: number;
  totalSupply: number;
  verified: boolean;
}

export interface NFTListing {
  mint: string;
  price: number;
  currency: string;
  marketplace: string;
  seller: string;
  listedAt: Date;
}

export interface NFTAnalytics {
  mint: string;
  floorPrice: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  sales24h: number;
  averagePrice: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
}

class SolanaNFTService {
  private connection: Connection;
  private metaplex: Metaplex;
  private walletPublicKey: PublicKey | null = null;

  constructor(rpcUrl: string = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.metaplex = Metaplex.make(this.connection);
  }

  setWallet(publicKey: PublicKey) {
    this.walletPublicKey = publicKey;
  }

  // Get user's NFT collection
  async getUserNFTs(): Promise<NFTMetadata[]> {
    if (!this.walletPublicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const nfts = await this.metaplex
        .nfts()
        .findAllByOwner({ owner: this.walletPublicKey })
        .run();

      const nftMetadata: NFTMetadata[] = [];

      for (const nft of nfts) {
        try {
          const metadata = await this.metaplex
            .nfts()
            .load({ metadata: nft })
            .run();

          nftMetadata.push({
            mint: nft.address.toString(),
            name: metadata.name,
            symbol: metadata.symbol,
            description: metadata.description,
            image: metadata.json?.image || '',
            attributes: metadata.json?.attributes || [],
            collection: metadata.collection ? {
              name: metadata.collection.name,
              family: metadata.collection.family,
            } : undefined,
          });
        } catch (error) {
          console.warn(`Failed to load metadata for NFT ${nft.address}:`, error);
        }
      }

      return nftMetadata;
    } catch (error) {
      throw new Error(`Failed to fetch user NFTs: ${error}`);
    }
  }

  // Get NFT metadata by mint address
  async getNFTMetadata(mintAddress: string): Promise<NFTMetadata> {
    try {
      const mint = new PublicKey(mintAddress);
      const nft = await this.metaplex
        .nfts()
        .findByMint({ mint })
        .run();

      return {
        mint: mintAddress,
        name: nft.name,
        symbol: nft.symbol,
        description: nft.description,
        image: nft.json?.image || '',
        attributes: nft.json?.attributes || [],
        collection: nft.collection ? {
          name: nft.collection.name,
          family: nft.collection.family,
        } : undefined,
      };
    } catch (error) {
      throw new Error(`Failed to fetch NFT metadata: ${error}`);
    }
  }

  // Get NFT analytics
  async getNFTAnalytics(mintAddress: string): Promise<NFTAnalytics> {
    try {
      const response = await fetch(`https://api.helius.xyz/v0/token-metadata?api-key=${process.env.REACT_APP_HELIUS_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mintAccounts: [mintAddress],
          includeOffChain: true,
          disableCache: false,
        }),
      });

      const data = await response.json();
      const tokenData = data[0];

      return {
        mint: mintAddress,
        floorPrice: tokenData.floorPrice || 0,
        volume24h: tokenData.volume24h || 0,
        volume7d: tokenData.volume7d || 0,
        volume30d: tokenData.volume30d || 0,
        sales24h: tokenData.sales24h || 0,
        averagePrice: tokenData.averagePrice || 0,
        priceChange24h: tokenData.priceChange24h || 0,
        priceChange7d: tokenData.priceChange7d || 0,
        priceChange30d: tokenData.priceChange30d || 0,
      };
    } catch (error) {
      throw new Error(`Failed to fetch NFT analytics: ${error}`);
    }
  }

  // Get trending NFT collections
  async getTrendingCollections(): Promise<NFTCollection[]> {
    try {
      const response = await fetch('https://api.helius.xyz/v0/collections?api-key=${process.env.REACT_APP_HELIUS_API_KEY}');
      const data = await response.json();

      return data.map((collection: any) => ({
        collectionId: collection.collectionId,
        name: collection.name,
        description: collection.description,
        image: collection.image,
        floorPrice: collection.floorPrice,
        volume24h: collection.volume24h,
        totalSupply: collection.totalSupply,
        verified: collection.verified,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch trending collections: ${error}`);
    }
  }

  // Get NFT listings from Magic Eden
  async getNFTListings(mintAddress: string): Promise<NFTListing[]> {
    try {
      const response = await fetch(`https://api-mainnet.magiceden.io/v2/tokens/${mintAddress}/listings`);
      const data = await response.json();

      return data.map((listing: any) => ({
        mint: mintAddress,
        price: listing.price,
        currency: listing.currency,
        marketplace: 'Magic Eden',
        seller: listing.seller,
        listedAt: new Date(listing.createdAt),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch NFT listings: ${error}`);
    }
  }

  // Mint NFT (requires wallet connection)
  async mintNFT(metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  }): Promise<string> {
    if (!this.walletPublicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const { nft } = await this.metaplex
        .nfts()
        .create({
          uri: '', // You'll need to upload metadata to IPFS first
          name: metadata.name,
          symbol: metadata.symbol,
          description: metadata.description,
          image: metadata.image,
          attributes: metadata.attributes,
        })
        .run();

      return nft.address.toString();
    } catch (error) {
      throw new Error(`Failed to mint NFT: ${error}`);
    }
  }

  // Get NFT portfolio value
  async getNFTPortfolioValue(): Promise<{
    totalValue: number;
    nftCount: number;
    topHoldings: Array<{ mint: string; name: string; value: number }>;
  }> {
    const userNFTs = await this.getUserNFTs();
    let totalValue = 0;
    const topHoldings: Array<{ mint: string; name: string; value: number }> = [];

    for (const nft of userNFTs) {
      try {
        const analytics = await this.getNFTAnalytics(nft.mint);
        const value = analytics.floorPrice || 0;
        totalValue += value;

        topHoldings.push({
          mint: nft.mint,
          name: nft.name,
          value: value,
        });
      } catch (error) {
        console.warn(`Failed to get analytics for NFT ${nft.mint}:`, error);
      }
    }

    // Sort by value and take top 10
    topHoldings.sort((a, b) => b.value - a.value);
    const top10 = topHoldings.slice(0, 10);

    return {
      totalValue,
      nftCount: userNFTs.length,
      topHoldings: top10,
    };
  }
}

export default SolanaNFTService;

