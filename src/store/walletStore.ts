import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletInfo } from '../services/Web3WalletService';
import { walletRecoveryService } from '../utils/walletRecovery';

interface WalletState {
  // State
  isConnected: boolean;
  walletInfo: WalletInfo | null;
  connectedWallets: WalletInfo[]; // List of all connected wallets
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean; // Track if wallet state has been restored
  connectionAttempts: number; // Track connection attempts to prevent hanging
  
  // Actions
  setConnected: (connected: boolean) => void;
  setWalletInfo: (walletInfo: WalletInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  connectWallet: (walletInfo: WalletInfo) => void;
  disconnectWallet: () => void;
  addConnectedWallet: (walletInfo: WalletInfo) => void;
  removeConnectedWallet: (address: string) => void;
  clearError: () => void;
  initializeWalletState: () => Promise<void>; // Restore wallet state on app startup
  validateConnection: () => Promise<boolean>; // Validate if stored connection is still valid
  incrementConnectionAttempts: () => void;
  resetConnectionAttempts: () => void;
  
  // Computed getters
  getEffectiveConnection: () => boolean;
  getWalletAddress: () => string | null;
  getProvider: () => string | null;
  getAllConnectedWallets: () => WalletInfo[];
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      walletInfo: null,
      connectedWallets: [],
      isLoading: false,
      error: null,
      isInitialized: false,
      connectionAttempts: 0,
      
      // Actions
      setConnected: (connected: boolean) => {
        set({ isConnected: connected });
      },
      
      setWalletInfo: (walletInfo: WalletInfo | null) => {
        set({ walletInfo });
        // Automatically set connected state based on wallet info
        set({ isConnected: walletInfo?.isConnected || false });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      connectWallet: (walletInfo: WalletInfo) => {
        const state = get();
        const existing = state.connectedWallets.find(w => w.address === walletInfo.address);
        
        set({
          isConnected: true,
          walletInfo,
          connectedWallets: existing 
            ? state.connectedWallets.map(w => w.address === walletInfo.address ? walletInfo : w)
            : [...state.connectedWallets, walletInfo],
          error: null,
        });

        // Save wallet address to localStorage for backward compatibility with VaultService
        if (walletInfo.address) {
          localStorage.setItem('walletAddress', walletInfo.address);
          console.log('💾 Wallet address saved to localStorage:', walletInfo.address);
        }

        // Dispatch wallet connected event
        window.dispatchEvent(new CustomEvent('walletConnected', { 
          detail: { address: walletInfo.address } 
        }));
      },
      
      disconnectWallet: () => {
        const state = get();
        const currentAddress = state.walletInfo?.address;
        
        // Clear all wallet state completely
        set({
          isConnected: false,
          walletInfo: null,
          connectedWallets: [],
          isLoading: false,
          error: null,
        });

        // Clear authentication data from localStorage
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletProvider');
        localStorage.removeItem('walletChainId');
        localStorage.removeItem('userStats');
        
        // Clear the persisted wallet storage to prevent state restoration
        localStorage.removeItem('wallet-storage');

        // Dispatch wallet disconnected event
        window.dispatchEvent(new CustomEvent('walletDisconnected', { 
          detail: { address: currentAddress } 
        }));
      },
      
      addConnectedWallet: (walletInfo: WalletInfo) => {
        const state = get();
        const existing = state.connectedWallets.find(w => w.address === walletInfo.address);
        
        if (!existing) {
          set({ connectedWallets: [...state.connectedWallets, walletInfo] });
        }
      },
      
      removeConnectedWallet: (address: string) => {
        const state = get();
        set({ 
          connectedWallets: state.connectedWallets.filter(w => w.address !== address),
          ...(state.walletInfo?.address === address ? { walletInfo: null, isConnected: false } : {})
        });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      // Initialize wallet state on app startup
      initializeWalletState: async () => {
        const state = get();
        if (state.isInitialized) return;
        
        set({ isLoading: true, error: null });
        
        try {
          // Check if we have stored wallet data
          const token = localStorage.getItem('jwtToken');
          const walletAddress = localStorage.getItem('walletAddress');
          
          if (walletAddress) {
            console.log('🔄 Wallet: Restoring wallet state...');
            
            // Use recovery service to attempt connection recovery
            const recovered = await walletRecoveryService.attemptRecovery();
            
            if (recovered) {
              console.log('✅ Wallet: Connection recovered successfully');
              set({ 
                isConnected: true, 
                isLoading: false,
                isInitialized: true 
              });
            } else {
              console.log('❌ Wallet: Recovery failed, clearing state');
              get().disconnectWallet();
            }
          } else {
            console.log('ℹ️ Wallet: No stored connection found');
            set({ 
              isConnected: false, 
              walletInfo: null, 
              connectedWallets: [],
              isLoading: false,
              isInitialized: true 
            });
          }
        } catch (error) {
          console.error('❌ Wallet: Failed to initialize wallet state:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to initialize wallet',
            isLoading: false,
            isInitialized: true 
          });
        }
      },
      
      // Validate if stored connection is still valid
      validateConnection: async () => {
        try {
          const token = localStorage.getItem('jwtToken');
          const walletAddress = localStorage.getItem('walletAddress');
          
          if (!token || !walletAddress) {
            return false;
          }
          
          // Check if wallet is still connected to the browser
          if (typeof window !== 'undefined' && (window as any).ethereum) {
            try {
              const accounts = await (window as any).ethereum.request({
                method: 'eth_accounts'
              });
              
              if (accounts.length === 0) {
                console.log('❌ Wallet: No accounts found in browser');
                return false;
              }
              
              const isAccountConnected = accounts.some((account: string) => 
                account.toLowerCase() === walletAddress.toLowerCase()
              );
              
              if (!isAccountConnected) {
                console.log('❌ Wallet: Account not connected in browser');
                return false;
              }
              
              // Verify token is still valid by making a test request
              const response = await fetch('/api/v1/auth/verify', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (!response.ok) {
                console.log('❌ Wallet: Token validation failed');
                return false;
              }
              
              console.log('✅ Wallet: Connection validation successful');
              return true;
            } catch (error) {
              console.log('❌ Wallet: Connection validation failed:', error);
              return false;
            }
          }
          
          return false;
        } catch (error) {
          console.error('❌ Wallet: Error validating connection:', error);
          return false;
        }
      },
      
      // Track connection attempts to prevent hanging
      incrementConnectionAttempts: () => {
        const state = get();
        set({ connectionAttempts: state.connectionAttempts + 1 });
      },
      
      resetConnectionAttempts: () => {
        set({ connectionAttempts: 0 });
      },
      
      // Computed getters
      getEffectiveConnection: () => {
        const state = get();
        return state.isConnected && !!state.walletInfo?.address;
      },
      
      getWalletAddress: () => {
        const state = get();
        return state.walletInfo?.address || null;
      },
      
      getProvider: () => {
        const state = get();
        return state.walletInfo?.provider || null;
      },
      
      getAllConnectedWallets: () => {
        const state = get();
        return state.connectedWallets;
      },
    }),
    {
      name: 'wallet-storage',
      // Only persist essential wallet info, not loading states or connection attempts
      partialize: (state) => ({
        isConnected: state.isConnected,
        walletInfo: state.walletInfo,
        connectedWallets: state.connectedWallets,
        // Don't persist: isLoading, error, isInitialized, connectionAttempts
      }),
    }
  )
);

// Selectors for optimized re-renders
export const useWalletConnection = () => useWalletStore((state) => ({
  isConnected: state.isConnected,
  walletInfo: state.walletInfo,
  effectiveConnection: state.getEffectiveConnection(),
}));

export const useWalletActions = () => useWalletStore((state) => ({
  connectWallet: state.connectWallet,
  disconnectWallet: state.disconnectWallet,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
}));

export const useWalletLoading = () => useWalletStore((state) => ({
  isLoading: state.isLoading,
  error: state.error,
}));

export const useConnectedWallets = () => useWalletStore((state) => ({
  connectedWallets: state.connectedWallets,
  getAllConnectedWallets: state.getAllConnectedWallets,
  removeConnectedWallet: state.removeConnectedWallet,
}));
