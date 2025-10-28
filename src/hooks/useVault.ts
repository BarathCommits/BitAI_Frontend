import { useState, useEffect, useCallback, useRef } from 'react';
import { PersonalInfo, VaultStats, QRCodeData } from '../types';
import { vaultService, VaultAPIResponse } from '../services/VaultService';
import { notificationService } from '../services/NotificationService';

export interface UseVaultReturn {
  // State
  personalInfo: PersonalInfo[];
  stats: VaultStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  addInfo: (info: Omit<PersonalInfo, 'id' | 'createdAt' | 'isEncrypted'>) => Promise<boolean>;
  updateInfo: (id: string, info: Partial<PersonalInfo>) => Promise<boolean>;
  deleteInfo: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  
  // QR Code
  generateMasterQR: () => Promise<QRCodeData | null>;
  generateInfoQR: (infoId: string) => Promise<QRCodeData | null>;
  
  // Search
  searchInfo: (query: string, category?: string) => Promise<PersonalInfo[]>;
  
  // Backup/Restore
  backupVault: () => Promise<string | null>;
  restoreVault: (backupData: string) => Promise<boolean>;
  
  // Note: clearAllData removed - vault data should persist
}

export const useVault = (): UseVaultReturn => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo[]>([]);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);
  const retryCountRef = useRef(0);
  const VAULT_RATE_LIMIT_MS = 5000; // 5 seconds between vault API calls (increased)
  const MAX_RETRIES = 3;

  // Load initial data with better rate limiting
  const loadData = useCallback(async () => {
    // Prevent multiple simultaneous loads using ref
    if (isLoadingRef.current) {
      console.log('Rate limiting: skipping data load - already loading');
      return;
    }

    // Rate limiting: prevent too frequent API calls
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    if (timeSinceLastLoad < VAULT_RATE_LIMIT_MS) {
      const waitTime = Math.ceil((VAULT_RATE_LIMIT_MS - timeSinceLastLoad) / 1000);
      console.log(`⏳ Rate limiting: Please wait ${waitTime} second(s) before loading vault data again`);
      return;
    }

    // Check if user is authenticated (has token)
    const token = localStorage.getItem('jwtToken');
    const walletAddress = localStorage.getItem('walletAddress');
    
    console.log('🔍 loadData called with:', { 
      hasToken: !!token, 
      hasWalletAddress: !!walletAddress,
      token: token ? 'present' : 'missing',
      walletAddress: walletAddress || 'missing'
    });

    if (!token || !walletAddress) {
      console.log('❌ No auth token or wallet address found - cannot load vault data from backend');
      console.log('⚠️ Requiring wallet authentication to access vault');
      setPersonalInfo([]);
      setStats(null);
      isLoadingRef.current = false;
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    console.log('✅ Auth check passed - proceeding with data load');
    isLoadingRef.current = true;
    lastLoadTimeRef.current = now; // Update last load time
    setLoading(true);
    setError(null);

    try {
      // Load personal info first
      console.log('🔄 useVault: Calling vaultService.getAllPersonalInfo()');
      const infoResponse = await vaultService.getAllPersonalInfo();
      console.log('🔄 useVault: Response from getAllPersonalInfo:', { 
        success: infoResponse.success, 
        hasData: !!infoResponse.data,
        dataType: typeof infoResponse.data,
        dataLength: Array.isArray(infoResponse.data) ? infoResponse.data.length : 'not array',
        error: infoResponse.error 
      });

      if (infoResponse.success && infoResponse.data) {
        console.log('✅ useVault: Setting personalInfo:', Array.isArray(infoResponse.data) ? `Array with ${infoResponse.data.length} items` : 'Not an array:', typeof infoResponse.data);
        setPersonalInfo(infoResponse.data);
        retryCountRef.current = 0; // Reset retry count on success
      } else {
        const errorMessage = typeof infoResponse.error === 'string' ? infoResponse.error : 
                           ((infoResponse.error as any)?.message || 'Failed to load personal information');
        console.log('❌ useVault: Error loading personal info:', errorMessage);
        
        // No local storage - require backend authentication
        if (infoResponse.error && infoResponse.error.code === 'AUTH_UNAUTHORIZED') {
          console.log('❌ Backend authentication required - no local data fallback');
          setError('Wallet authentication required. Please reconnect your wallet.');
        }
        
        // Handle rate limiting errors specifically
        if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests') || errorMessage.includes('RATE_LIMITED')) {
          console.log('⏳ Rate limited - will retry automatically');
          
          // Retry with exponential backoff
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            const retryDelay = Math.pow(2, retryCountRef.current) * 1000; // 2s, 4s, 8s
            console.log(`🔄 Retrying vault data load in ${retryDelay/1000} seconds (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
            
            setTimeout(() => {
              isLoadingRef.current = false;
              lastLoadTimeRef.current = 0; // Reset rate limiting for retry
              loadData();
            }, retryDelay);
            
            return; // Don't set error state for rate limiting
          } else {
            console.log('❌ Max retries reached for vault data load');
            setError('Unable to load vault data after multiple attempts. Please try again later.');
          }
        } else {
          setError(errorMessage);
        }
      }

      // TODO: Enable stats once backend endpoint is ready
      // For now, set default stats to avoid 404 errors in console
      setStats({
        totalItems: Array.isArray(infoResponse.data) ? infoResponse.data.length : 0,
        categories: {
          personal: 0,
          financial: 0,
          identity: 0,
          documents: 0
        },
        lastUpdated: new Date().toISOString()
      });
      
      // Mark as initialized after successful data load
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []); // Remove dependencies to prevent re-creation

  // Listen for wallet connection/disconnection events
  useEffect(() => {
    const handleWalletChange = () => {
      // Add a small delay to ensure localStorage is fully updated
      setTimeout(() => {
        const token = localStorage.getItem('jwtToken');
        const walletAddress = localStorage.getItem('walletAddress');
        const walletStorage = localStorage.getItem('wallet-storage');
        
        console.log('🔄 Vault: Wallet change detected', { 
          hasToken: !!token, 
          hasWalletAddress: !!walletAddress,
          hasWalletStorage: !!walletStorage,
          token: token ? 'present' : 'missing',
          walletAddress: walletAddress || 'missing'
        });
        
        if (!token || !walletAddress || !walletStorage) {
          // Wallet disconnected - clear vault data immediately
          console.log('🚫 Vault: Wallet disconnected - clearing vault data');
          setPersonalInfo([]);
          setStats(null);
          setIsInitialized(false);
          setError(null);
        } else {
          // Wallet connected - refresh vault data
          console.log('✅ Vault: Wallet connected - refreshing vault data');
          setIsInitialized(false);
          loadData();
        }
      }, 100); // Small delay to ensure localStorage is updated
    };

    // Listen for storage changes (wallet connect/disconnect)
    window.addEventListener('storage', handleWalletChange);
    
    // Also listen for custom wallet events
    window.addEventListener('walletConnected', handleWalletChange);
    window.addEventListener('walletDisconnected', handleWalletChange);

    return () => {
      window.removeEventListener('storage', handleWalletChange);
      window.removeEventListener('walletConnected', handleWalletChange);
      window.removeEventListener('walletDisconnected', handleWalletChange);
    };
  }, [loadData]);

  // Load initial data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data
  const refreshData = useCallback(async () => {
    // Rate limiting for manual refresh
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    if (timeSinceLastLoad < VAULT_RATE_LIMIT_MS) {
      const waitTime = Math.ceil((VAULT_RATE_LIMIT_MS - timeSinceLastLoad) / 1000);
      console.log(`⏳ Rate limiting: Please wait ${waitTime} second(s) before refreshing vault data`);
      return;
    }

    setIsInitialized(false); // Reset initialization flag to allow reload
    isLoadingRef.current = false; // Reset loading ref
    await loadData();
  }, [loadData]);

  // Add personal information
  const addInfo = useCallback(async (info: Omit<PersonalInfo, 'id' | 'createdAt' | 'isEncrypted'>): Promise<boolean> => {
    console.log('🔄 useVault: Adding info:', info);

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useVault: Calling vaultService.addPersonalInfo()');
      const response = await vaultService.addPersonalInfo(info);
      console.log('🔄 useVault: Response from addPersonalInfo:', { 
        success: response.success, 
        hasData: !!response.data,
        data: response.data,
        error: response.error 
      });
      
      if (response.success && response.data) {
        console.log('✅ useVault: Successfully added info, updating state');
        setPersonalInfo(prev => {
          // Check if this exact info already exists to prevent duplicates
          const exists = prev.some(item => 
            (item._id || item.id || item.infoId) === (response.data!._id || response.data!.id || response.data!.infoId)
          );
          
          if (exists) {
            console.log('ℹ️ Info already exists in state, skipping add');
            return prev;
          }
          
          return [...prev, response.data!];
        });
        
        // Update stats manually instead of refreshing all data
        setStats(prev => prev ? {
          ...prev,
          totalItems: prev.totalItems + 1,
          categories: {
            ...prev.categories,
            [info.category]: (prev.categories[info.category] || 0) + 1
          },
          lastUpdated: new Date().toISOString()
        } : null);
        
        // Notify success
        notificationService.vaultItemAdded(info.label);
        
        return true;
      } else {
        // Extract error message from the error object
        let errorMessage = 'Failed to add personal information';
        
        if (response.error) {
          if (typeof response.error === 'string') {
            errorMessage = response.error;
          } else if (response.error.message) {
            errorMessage = response.error.message;
          } else if (response.error.code) {
            errorMessage = `Error (${response.error.code}): ${response.error.message || 'Unknown error'}`;
          }
        }
        
        console.error('❌ useVault: Failed to add info. Full error:', JSON.stringify(response.error, null, 2));
        console.error('❌ useVault: Response:', JSON.stringify(response, null, 2));
        
        // No local storage fallback - all data must go to backend
        if (response.error && response.error.code === 'AUTH_UNAUTHORIZED') {
          console.log('❌ Cannot save to vault - backend authentication required');
          const authErrorMessage = 'Please authenticate with your wallet to save vault data to the backend.';
          setError(authErrorMessage);
          notificationService.error('Authentication Required', authErrorMessage);
          return false;
        }
        
        setError(errorMessage);
        
        // Notify error
        notificationService.error('Failed to Add Item', errorMessage);
        
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add personal information');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update personal information
  const updateInfo = useCallback(async (id: string, info: Partial<PersonalInfo>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await vaultService.updatePersonalInfo(id, info);
      
      if (response.success && response.data) {
        setPersonalInfo(prev => 
          prev.map(item => (item._id || item.id || item.infoId) === id ? response.data! : item)
        );
        // Update stats manually
        setStats(prev => prev ? {
          ...prev,
          lastUpdated: new Date().toISOString()
        } : null);
        return true;
      } else {
        const errorMessage = typeof response.error === 'string' ? response.error : 
                           ((response.error as any)?.message || 'Failed to update personal information');
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update personal information');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // Delete personal information
  const deleteInfo = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await vaultService.deletePersonalInfo(id);
      
      if (response.success) {
        // Find the item being deleted to update stats
        const deletedItem = personalInfo.find(item => (item._id || item.id || item.infoId) === id);
        setPersonalInfo(prev => prev.filter(item => (item._id || item.id || item.infoId) !== id));
        
        // Update stats manually
        if (deletedItem) {
          setStats(prev => prev ? {
            ...prev,
            totalItems: prev.totalItems - 1,
            categories: {
              ...prev.categories,
              [deletedItem.category]: Math.max(0, (prev.categories[deletedItem.category] || 0) - 1)
            },
            lastUpdated: new Date().toISOString()
          } : null);
        }
        return true;
      } else {
        // Handle case where item doesn't exist (404) - still remove from local state
        if (response.error && response.error.message && response.error.message.includes('not found')) {
          console.log('Item not found in database, removing from local state');
          setPersonalInfo(prev => prev.filter(item => (item._id || item.id || item.infoId) !== id));
          return true; // Consider it successful since it's removed from local state
        }
        const errorMessage = typeof response.error === 'string' ? response.error : 
                           ((response.error as any)?.message || 'Failed to delete personal information');
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete personal information');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // Generate master QR code
  const generateMasterQR = useCallback(async (): Promise<QRCodeData | null> => {
    setError(null);

    try {
      const response = await vaultService.generateMasterQRCode();
      
      if (response.success && response.data) {
        return response.data;
      } else {
        const errorMessage = typeof response.error === 'string' ? response.error : 
                           ((response.error as any)?.message || 'Failed to generate master QR code');
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate master QR code');
      return null;
    }
  }, []);

  // Generate info QR code
  const generateInfoQR = useCallback(async (infoId: string): Promise<QRCodeData | null> => {
    setError(null);

    try {
      const response = await vaultService.generateInfoQRCode(infoId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        const errorMessage = typeof response.error === 'string' ? response.error : 
                           ((response.error as any)?.message || 'Failed to generate QR code');
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      return null;
    }
  }, []);

  // Search personal information
  const searchInfo = useCallback(async (query: string, category?: string): Promise<PersonalInfo[]> => {
    setError(null);

    try {
      const response = await vaultService.searchPersonalInfo(query, category);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        const errorMessage = typeof response.error === 'string' ? response.error : 
                           ((response.error as any)?.message || 'Failed to search personal information');
        setError(errorMessage);
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search personal information');
      return [];
    }
  }, []);

  // Backup vault
  const backupVault = useCallback(async (): Promise<string | null> => {
    setError(null);

    try {
      const response = await vaultService.backupVault();
      
      if (response.success && response.data) {
        return response.data.backupData;
      } else {
        const errorMessage = typeof response.error === 'string' ? response.error : 
                           ((response.error as any)?.message || 'Failed to backup vault');
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to backup vault');
      return null;
    }
  }, []);

  // Restore vault
  const restoreVault = useCallback(async (backupData: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await vaultService.restoreVault(backupData);
      
      if (response.success) {
        await refreshData(); // Refresh all data
        return true;
      } else {
        const errorMessage = typeof response.error === 'string' ? response.error : 
                           ((response.error as any)?.message || 'Failed to restore vault');
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore vault');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // Note: clearAllData function removed - vault data should persist across sessions
  
  // Load data on mount - only if wallet is connected (FIXED)
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const walletAddress = localStorage.getItem('walletAddress');
    const walletStorage = localStorage.getItem('wallet-storage');
    
    if (token && walletAddress && walletStorage) {
      console.log('Vault: Initial load - wallet is connected');
      loadData();
    } else {
      console.log('Vault: Initial load - wallet not connected, skipping data load');
      // Ensure vault is empty on initial load if wallet not connected
      setPersonalInfo([]);
      setStats(null);
      setIsInitialized(false);
      setError(null);
    }
  }, [loadData]);

  return {
    // State
    personalInfo,
    stats,
    loading,
    error,
    
    // Actions
    addInfo,
    updateInfo,
    deleteInfo,
    refreshData,
    
    // QR Code
    generateMasterQR,
    generateInfoQR,
    
    // Search
    searchInfo,
    
    // Backup/Restore
    backupVault,
    restoreVault,
  };
};
