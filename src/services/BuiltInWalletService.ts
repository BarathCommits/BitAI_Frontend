/**
 * Built-in Wallet Service for Safe
 * 
 * This service provides access to built-in wallet functionality.
 * It now delegates to the UnifiedWalletService to avoid duplication.
 */

import { unifiedWalletService } from './UnifiedWalletService';
import { useWalletStore } from '../store/walletStore';

// Define types locally to avoid circular imports
export interface BuiltInWalletInfo {
  id: string;
  name: string;
  type: 'ethereum' | 'solana' | 'multi';
  icon: string;
  isAvailable: boolean;
  isConnected: boolean;
  address?: string;
  balance?: string;
  chainId?: number;
  isBundled?: boolean;
  version?: string;
}

export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  chainId?: number;
  walletInfo?: BuiltInWalletInfo;
  error?: string;
}

export class BuiltInWalletService {
  private listeners: Set<(connected: BuiltInWalletInfo[]) => void> = new Set();

  constructor() {
    // Listeners will be notified immediately on connect/disconnect
  }

  /**
   * Get all available wallets
   */
  public getAvailableWallets(): BuiltInWalletInfo[] {
    const unifiedWallets = unifiedWalletService.getAvailableWallets();
    return unifiedWallets.map(this.convertToBuiltInWalletInfo);
  }

  /**
   * Get connected wallets
   */
  public getConnectedWallets(): BuiltInWalletInfo[] {
    const unifiedWallets = unifiedWalletService.getConnectedWallets();
    return unifiedWallets.map(this.convertToBuiltInWalletInfo);
  }

  /**
   * Connect to a wallet with authentication
   */
  public async connectWallet(walletId: string): Promise<WalletConnectionResult> {
    const result = await unifiedWalletService.connectWalletWithAuth(walletId);
    
    // If connection was successful, update wallet store and notify listeners
    if (result.success && result.walletInfo && result.address) {
      // Update wallet store to dispatch walletConnected event
      useWalletStore.getState().connectWallet({
        address: result.address,
        chainId: result.chainId || 1,
        walletInfo: result.walletInfo
      });
      
      // Notify listeners after a small delay to ensure state is updated
      setTimeout(() => {
        this.notifyListeners();
      }, 100);
    } else if (!result.success) {
      // If connection failed, make sure to clear loading state
      console.log('❌ Wallet connection failed:', result.error);
    }
    
    return {
      success: result.success,
      address: result.address,
      chainId: result.chainId,
      walletInfo: result.walletInfo ? this.convertToBuiltInWalletInfo(result.walletInfo) : undefined,
      error: result.error,
    };
  }

  /**
   * Disconnect a wallet
   */
  public async disconnectWallet(walletId: string): Promise<void> {
    await unifiedWalletService.disconnectWallet(walletId);
    
    // Update wallet store to dispatch walletDisconnected event
    useWalletStore.getState().disconnectWallet();
    
    // Notify listeners after disconnection
    this.notifyListeners();
  }

  /**
   * Check if wallet is connected
   */
  public isWalletConnected(walletId: string): boolean {
    return unifiedWalletService.isWalletConnected(walletId);
  }

  /**
   * Get wallet provider
   */
  public getWalletProvider(walletId: string): any {
    return unifiedWalletService.getWalletProvider(walletId);
  }

  /**
   * Convert UnifiedWalletService WalletInfo to BuiltInWalletInfo
   */
  private convertToBuiltInWalletInfo(wallet: any): BuiltInWalletInfo {
    return {
      id: wallet.id,
      name: wallet.name,
      type: wallet.type,
      icon: wallet.icon,
      isAvailable: wallet.isAvailable,
      isConnected: wallet.isConnected,
      address: wallet.address,
      balance: wallet.balance,
      chainId: wallet.chainId,
      isBundled: wallet.isBundled,
      version: wallet.version,
    };
  }

  /**
   * Add listener for wallet changes
   */
  public addListener(listener: (connected: BuiltInWalletInfo[]) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners of changes
   */
  private notifyListeners(): void {
    const connected = this.getConnectedWallets();
    this.listeners.forEach(listener => listener(connected));
  }
}

// Export singleton instance
export const builtInWalletService = new BuiltInWalletService();