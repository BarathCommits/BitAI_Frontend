/**
 * Wallet Connection Recovery Utility
 * 
 * Handles wallet connection recovery and state synchronization
 */

import { useWalletStore } from '../store/walletStore';

export class WalletRecoveryService {
  private static instance: WalletRecoveryService;
  private recoveryAttempts = 0;
  private maxRecoveryAttempts = 3;

  public static getInstance(): WalletRecoveryService {
    if (!WalletRecoveryService.instance) {
      WalletRecoveryService.instance = new WalletRecoveryService();
    }
    return WalletRecoveryService.instance;
  }

  /**
   * Attempt to recover wallet connection
   */
  public async attemptRecovery(): Promise<boolean> {
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      console.log('❌ Wallet Recovery: Max recovery attempts reached');
      return false;
    }

    this.recoveryAttempts++;
    console.log(`🔄 Wallet Recovery: Attempt ${this.recoveryAttempts}/${this.maxRecoveryAttempts}`);

    try {
      const walletStore = useWalletStore.getState();
      
      // Check if we have stored connection data
      const token = localStorage.getItem('jwtToken');
      const walletAddress = localStorage.getItem('walletAddress');
      const walletProvider = localStorage.getItem('walletProvider');
      
      if (!walletAddress) {
        console.log('❌ Wallet Recovery: No stored wallet address found');
        return false;
      }

      // Check if wallet is still connected in browser
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts.length === 0) {
          console.log('❌ Wallet Recovery: No accounts connected in browser');
          this.clearStoredConnection();
          return false;
        }

        const isAccountConnected = accounts.some((account: string) => 
          account.toLowerCase() === walletAddress.toLowerCase()
        );

        if (!isAccountConnected) {
          console.log('❌ Wallet Recovery: Account not connected in browser');
          this.clearStoredConnection();
          return false;
        }

        // Validate token if available (optional for local connections)
        if (token) {
          const isValid = await this.validateToken(token);
          if (!isValid) {
            console.log('❌ Wallet Recovery: Token validation failed, but continuing with local connection');
            // Don't fail - just clear the token and continue with local connection
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('user');
          }
        }

        // Restore wallet state (works with or without backend authentication)
        console.log('✅ Wallet Recovery: Connection recovered successfully');
        walletStore.setConnected(true);
        walletStore.setWalletInfo({
          address: walletAddress,
          chainId: parseInt(localStorage.getItem('walletChainId') || '1'),
          walletInfo: { 
            id: walletProvider || 'recovered', 
            name: walletProvider || 'Recovered Wallet', 
            type: 'ethereum' 
          }
        });

        // Dispatch recovery event
        window.dispatchEvent(new CustomEvent('walletRecovered', { 
          detail: { address: walletAddress } 
        }));

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Wallet Recovery: Recovery attempt failed:', error);
      return false;
    }
  }

  /**
   * Validate JWT token
   */
  private async validateToken(token: string): Promise<boolean> {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Wallet Recovery: Token validation error:', error);
      return false;
    }
  }

  /**
   * Clear stored connection data
   */
  private clearStoredConnection(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('userStats');
    localStorage.removeItem('wallet-storage');
    
    const walletStore = useWalletStore.getState();
    walletStore.disconnectWallet();
  }

  /**
   * Reset recovery attempts counter
   */
  public resetRecoveryAttempts(): void {
    this.recoveryAttempts = 0;
  }

  /**
   * Handle wallet disconnection events
   */
  public handleWalletDisconnection(): void {
    console.log('🔄 Wallet Recovery: Wallet disconnected, resetting recovery attempts');
    this.resetRecoveryAttempts();
  }

  /**
   * Handle wallet connection events
   */
  public handleWalletConnection(): void {
    console.log('✅ Wallet Recovery: Wallet connected, resetting recovery attempts');
    this.resetRecoveryAttempts();
  }
}

// Export singleton instance
export const walletRecoveryService = WalletRecoveryService.getInstance();

// Set up event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('walletConnected', () => {
    walletRecoveryService.handleWalletConnection();
  });

  window.addEventListener('walletDisconnected', () => {
    walletRecoveryService.handleWalletDisconnection();
  });
}
