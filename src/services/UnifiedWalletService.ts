/**
 * Unified Wallet Service - Solana Only
 * Provides a unified interface for Solana wallets only (for hackathon)
 */

export interface WalletInfo {
  id: string;
  name: string;
  type: 'solana';
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
  walletInfo?: WalletInfo;
  error?: string;
}

class UnifiedWalletService {
  private wallets: Map<string, WalletInfo> = new Map();

  constructor() {
    this.initializeWallets();
  }

  private initializeWallets(): void {
    // Initialize Solana-only wallets for hackathon
    const availableWallets: WalletInfo[] = [
      // Popular Solana Wallets for Hackathon
      {
        id: 'phantom',
        name: 'Phantom',
        type: 'solana',
        icon: '👻',
        isAvailable: true, // Show all wallets for hackathon
        isConnected: false,
        isBundled: true
      },
      {
        id: 'solflare',
        name: 'Solflare',
        type: 'solana',
        icon: '☀️',
        isAvailable: true, // Show all wallets for hackathon
        isConnected: false,
        isBundled: true
      },
      {
        id: 'backpack',
        name: 'Backpack',
        type: 'solana',
        icon: '🎒',
        isAvailable: true, // Show all wallets for hackathonbackpack !== 'undefined',
        isConnected: false,
        isBundled: true
      },
      {
        id: 'glow',
        name: 'Glow',
        type: 'solana',
        icon: '✨',
        isAvailable: true, // Show all wallets for hackathonglow !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'slope',
        name: 'Slope',
        type: 'solana',
        icon: '📊',
        isAvailable: true, // Show all wallets for hackathonSlope !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'coin98',
        name: 'Coin98',
        type: 'solana',
        icon: '💰',
        isAvailable: true, // Show all wallets for hackathoncoin98 !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'clover',
        name: 'Clover',
        type: 'solana',
        icon: '🍀',
        isAvailable: true, // Show all wallets for hackathonclover !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'mathwallet',
        name: 'Math Wallet',
        type: 'solana',
        icon: '📐',
        isAvailable: true, // Show all wallets for hackathonmathwallet !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'exodus',
        name: 'Exodus',
        type: 'solana',
        icon: '🚀',
        isAvailable: true, // Show all wallets for hackathonexodus !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'solong',
        name: 'Solong',
        type: 'solana',
        icon: '🌙',
        isAvailable: true, // Show all wallets for hackathonsolong !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      // Additional Solana Wallets for Hackathon
      {
        id: 'sollet',
        name: 'Sollet',
        type: 'solana',
        icon: '🔗',
        isAvailable: true, // Show all wallets for hackathonsollet !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'bitpie',
        name: 'Bitpie',
        type: 'solana',
        icon: '🥧',
        isAvailable: true, // Show all wallets for hackathonbitpie !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'tokenpocket',
        name: 'TokenPocket',
        type: 'solana',
        icon: '💳',
        isAvailable: true, // Show all wallets for hackathontokenpocket !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'safepal',
        name: 'SafePal',
        type: 'solana',
        icon: '🛡️',
        isAvailable: true, // Show all wallets for hackathonsafepal !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'trustwallet',
        name: 'Trust Wallet',
        type: 'solana',
        icon: '🔒',
        isAvailable: true, // Show all wallets for hackathontrustwallet !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'ledger',
        name: 'Ledger',
        type: 'solana',
        icon: '🔐',
        isAvailable: true, // Show all wallets for hackathonledger !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'torus',
        name: 'Torus',
        type: 'solana',
        icon: '🌐',
        isAvailable: true, // Show all wallets for hackathontorus !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'fortmatic',
        name: 'Fortmatic',
        type: 'solana',
        icon: '🏰',
        isAvailable: true, // Show all wallets for hackathonfortmatic !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'portis',
        name: 'Portis',
        type: 'solana',
        icon: '🚪',
        isAvailable: true, // Show all wallets for hackathonportis !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'walletconnect',
        name: 'WalletConnect',
        type: 'solana',
        icon: '🔌',
        isAvailable: true, // Show all wallets for hackathonwalletconnect !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'blocto',
        name: 'Blocto',
        type: 'solana',
        icon: '🎯',
        isAvailable: true, // Show all wallets for hackathonblocto !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'sollet-extension',
        name: 'Sollet Extension',
        type: 'solana',
        icon: '🔗',
        isAvailable: true, // Show all wallets for hackathonsolletExtension !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'solong-extension',
        name: 'Solong Extension',
        type: 'solana',
        icon: '🌙',
        isAvailable: true, // Show all wallets for hackathonsolongExtension !== 'undefined',
        isConnected: false,
        isBundled: false
      },
      {
        id: 'math-wallet',
        name: 'Math Wallet',
        type: 'solana',
        icon: '📐',
        isAvailable: true, // Show all wallets for hackathonmathWallet !== 'undefined',
        isConnected: false,
        isBundled: false
      }
    ];

    availableWallets.forEach(wallet => {
      this.wallets.set(wallet.id, wallet);
    });
  }

  public getAvailableWallets(): WalletInfo[] {
    // For hackathon purposes, show all Solana wallets regardless of detection
    // This allows users to see all options and attempt connection
    return Array.from(this.wallets.values());
  }

  public getConnectedWallets(): WalletInfo[] {
    return Array.from(this.wallets.values()).filter(wallet => wallet.isConnected);
  }

  public async connectWallet(walletId: string): Promise<WalletConnectionResult> {
    const wallet = this.wallets.get(walletId);
    
    if (!wallet) {
      return {
        success: false,
        error: 'Wallet not found'
      };
    }

    if (!wallet.isAvailable) {
      return {
        success: false,
        error: `${wallet.name} is not available`
      };
    }

    try {
      // Handle Solana wallet connections
      const solanaWallets = ['phantom', 'solflare', 'slope', 'glow', 'backpack', 'coin98', 'clover', 'mathwallet', 'exodus', 'solong', 'sollet', 'bitpie', 'tokenpocket', 'safepal', 'trustwallet', 'ledger', 'torus', 'fortmatic', 'portis', 'walletconnect', 'blocto', 'sollet-extension', 'solong-extension', 'math-wallet'];
      
      if (solanaWallets.includes(walletId)) {
        let solanaProvider = null;
        
        if (walletId === 'phantom' && (window as any).solana?.isPhantom) {
          solanaProvider = (window as any).solana;
        } else if (walletId === 'solflare' && (window as any).solflare) {
          solanaProvider = (window as any).solflare;
        } else if (walletId === 'slope' && (window as any).Slope) {
          solanaProvider = (window as any).Slope;
        } else if (walletId === 'glow' && (window as any).glow) {
          solanaProvider = (window as any).glow;
        } else if (walletId === 'backpack' && (window as any).backpack) {
          solanaProvider = (window as any).backpack;
        } else if (walletId === 'coin98' && (window as any).coin98) {
          solanaProvider = (window as any).coin98;
        } else if (walletId === 'clover' && (window as any).clover) {
          solanaProvider = (window as any).clover;
        } else if (walletId === 'mathwallet' && (window as any).mathwallet) {
          solanaProvider = (window as any).mathwallet;
        } else if (walletId === 'exodus' && (window as any).exodus) {
          solanaProvider = (window as any).exodus;
        } else if (walletId === 'solong' && (window as any).solong) {
          solanaProvider = (window as any).solong;
        } else if (walletId === 'sollet' && (window as any).sollet) {
          solanaProvider = (window as any).sollet;
        } else if (walletId === 'bitpie' && (window as any).bitpie) {
          solanaProvider = (window as any).bitpie;
        } else if (walletId === 'tokenpocket' && (window as any).tokenpocket) {
          solanaProvider = (window as any).tokenpocket;
        } else if (walletId === 'safepal' && (window as any).safepal) {
          solanaProvider = (window as any).safepal;
        } else if (walletId === 'trustwallet' && (window as any).trustwallet) {
          solanaProvider = (window as any).trustwallet;
        } else if (walletId === 'ledger' && (window as any).ledger) {
          solanaProvider = (window as any).ledger;
        } else if (walletId === 'torus' && (window as any).torus) {
          solanaProvider = (window as any).torus;
        } else if (walletId === 'fortmatic' && (window as any).fortmatic) {
          solanaProvider = (window as any).fortmatic;
        } else if (walletId === 'portis' && (window as any).portis) {
          solanaProvider = (window as any).portis;
        } else if (walletId === 'walletconnect' && (window as any).walletconnect) {
          solanaProvider = (window as any).walletconnect;
        } else if (walletId === 'blocto' && (window as any).blocto) {
          solanaProvider = (window as any).blocto;
        } else if (walletId === 'sollet-extension' && (window as any).solletExtension) {
          solanaProvider = (window as any).solletExtension;
        } else if (walletId === 'solong-extension' && (window as any).solongExtension) {
          solanaProvider = (window as any).solongExtension;
        } else if (walletId === 'math-wallet' && (window as any).mathWallet) {
          solanaProvider = (window as any).mathWallet;
        }

        if (!solanaProvider) {
          console.log(`Wallet provider not found for ${wallet.name}`);
          console.log('Available window objects:', Object.keys(window).filter(key => key.toLowerCase().includes('sol')));
          
          // Provide helpful installation links for popular wallets
          if (walletId === 'phantom') {
            throw new Error(`Phantom wallet not detected. Please install Phantom extension from: https://phantom.app/`);
          } else if (walletId === 'solflare') {
            throw new Error(`Solflare wallet not detected. Please install Solflare extension from: https://solflare.com/`);
          } else if (walletId === 'backpack') {
            throw new Error(`Backpack wallet not detected. Please install Backpack extension from: https://backpack.app/`);
          } else {
            throw new Error(`${wallet.name} not detected. Please install ${wallet.name} extension.`);
          }
        }

        // Debug log the provider structure
        console.log('Solana provider:', solanaProvider);
        console.log('Provider methods:', Object.getOwnPropertyNames(solanaProvider));
        console.log('Provider publicKey:', solanaProvider.publicKey);

        // Connect to Solana wallet
        const response = await solanaProvider.connect();
        
        if (!response) {
          throw new Error('Failed to connect to wallet');
        }

        // Handle different response structures from different wallets
        let publicKey: string;
        
        // Debug log the response structure
        console.log('Wallet response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'null');
        
        // Try multiple ways to extract the public key
        if (response === true || response === false) {
          // Handle boolean response - this means the wallet connection was successful/failed
          // but we need to get the public key from the wallet provider directly
          if (response === true) {
            // Connection was successful, try to get the public key from the provider
            if (solanaProvider.publicKey) {
              publicKey = solanaProvider.publicKey.toString();
            } else if (solanaProvider.getPublicKey) {
              const pk = await solanaProvider.getPublicKey();
              publicKey = pk.toString();
            } else {
              throw new Error('Connection successful but unable to retrieve public key');
            }
          } else {
            throw new Error('Wallet connection was rejected by user');
          }
        } else if (response && typeof response === 'object') {
          // Check for direct publicKey property
          if (response.publicKey) {
            if (typeof response.publicKey === 'string') {
              publicKey = response.publicKey;
            } else if (response.publicKey.toString) {
              publicKey = response.publicKey.toString();
            } else {
              publicKey = String(response.publicKey);
            }
          }
          // Check for nested publicKey in account
          else if (response.account && response.account.publicKey) {
            publicKey = response.account.publicKey.toString();
          }
          // Check for nested publicKey in user
          else if (response.user && response.user.publicKey) {
            publicKey = response.user.publicKey.toString();
          }
          // Check for address property (some wallets use this)
          else if (response.address) {
            publicKey = response.address.toString();
          }
          // Check for key property
          else if (response.key) {
            publicKey = response.key.toString();
          }
          // Check for id property
          else if (response.id) {
            publicKey = response.id.toString();
          }
          // If no publicKey found, log the full response and try to extract manually
          else {
            const responseStr = JSON.stringify(response, null, 2);
            console.log('Full response structure:', responseStr);
            
            // Try to find any property that looks like a public key (base58 string)
            const possibleKeys = Object.keys(response).filter(key => 
              typeof response[key] === 'string' && response[key].length > 32
            );
            
            if (possibleKeys.length > 0) {
              console.log('Possible public key fields:', possibleKeys);
              publicKey = response[possibleKeys[0]];
            } else {
              throw new Error(`No publicKey found in response. Available keys: ${Object.keys(response).join(', ')}. Response: ${responseStr}`);
            }
          }
        } else if (typeof response === 'string') {
          publicKey = response;
        } else {
          throw new Error(`Invalid response format from wallet. Expected object or string, got ${typeof response}`);
        }

        wallet.isConnected = true;
        wallet.address = publicKey;
        wallet.chainId = 101; // Solana mainnet chain ID
        this.wallets.set(walletId, wallet);

        return {
          success: true,
          address: wallet.address,
          chainId: wallet.chainId,
          walletInfo: wallet
        };
      }

      return {
        success: false,
        error: 'Unsupported wallet type'
      };
    } catch (error) {
      console.error(`Failed to connect ${wallet.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  public async connectWalletWithAuth(walletId: string): Promise<WalletConnectionResult> {
    // First connect the wallet
    const connectionResult = await this.connectWallet(walletId);
    
    // If connection successful, authenticate with backend
    if (connectionResult.success && connectionResult.address) {
      try {
        console.log('🔄 Authenticating wallet with backend...');
        
        // Try to get a nonce first (Solana wallet authentication)
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';
        
        // Step 1: Get nonce from backend
        const nonceResponse = await fetch(`${API_URL}/auth/wallet/nonce`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: connectionResult.address,
            walletType: 'solana',
            chainId: connectionResult.chainId || 101
          })
        }).catch(err => {
          console.log('⚠️ Nonce request failed, using default message:', err);
          return null;
        });
        
        let authMessage = `Welcome to BitAI!\n\nPlease sign this message to authenticate your wallet.\n\nThis request will not trigger any blockchain transaction or cost any fees.\n\nAddress: ${connectionResult.address}`;
        let savedNonce = null;
        
        if (nonceResponse && nonceResponse.ok) {
          try {
            const nonceData = await nonceResponse.json();
            if (nonceData.data?.authMessage) {
              authMessage = nonceData.data.authMessage;
            }
            if (nonceData.data?.nonce) {
              savedNonce = nonceData.data.nonce;
            }
            console.log('✅ Got nonce for authentication:', savedNonce);
          } catch (parseError) {
            console.log('⚠️ Could not parse nonce response, using default message');
          }
        } else {
          console.log('⚠️ Could not get nonce, using default message');
        }
        
        // Step 2: Sign message with Solana wallet
        let signature: string | null = null;
        try {
          const wallet = this.wallets.get(walletId);
          if (wallet && (window as any).solana) {
            // Use the proper Solana message signing API with proper message structure
            const message = new TextEncoder().encode(authMessage);
            const signedMessage = await (window as any).solana.signMessage(message, 'utf8');
            
            if (signedMessage && signedMessage.signature) {
              // Signature is already Uint8Array
              signature = Array.from(signedMessage.signature).join(',');
              console.log('✅ Message signed successfully');
            }
          }
        } catch (signError) {
          console.error('❌ Failed to sign message:', signError);
          console.log('ℹ️ Skipping authentication, wallet connected locally only');
        }
        
        // Step 3: Verify signature and get JWT token
        if (signature) {
          try {
            const verifyResponse = await fetch(`${API_URL}/auth/wallet/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                walletAddress: connectionResult.address,
                authMessage: authMessage,
                signature: signature,
                nonce: savedNonce || 'generated',
                walletType: 'solana',
                chainId: connectionResult.chainId || 101
              })
            });
          
            if (verifyResponse.ok) {
              const data = await verifyResponse.json();
              console.log('✅ Wallet authenticated with backend:', data);
              
              // Handle both direct token and nested token formats
              let token = null;
              if (data.token) {
                token = data.token;
              } else if (data.data?.token) {
                token = data.data.token;
              } else if (data.data?.authToken) {
                token = data.data.authToken;
              }
              
              if (token) {
                localStorage.setItem('jwtToken', token);
                console.log('✅ JWT token stored');
                
                // Also store user data if available
                if (data.data?.user || data.user) {
                  localStorage.setItem('user', JSON.stringify(data.data?.user || data.user));
                }
              } else {
                console.warn('⚠️ Backend did not return a token');
              }
            } else {
              const errorText = await verifyResponse.text();
              console.warn(`⚠️ Backend returned status ${verifyResponse.status}:`, errorText);
            }
          } catch (verifyError) {
            console.log('⚠️ Verify request failed:', verifyError);
          }
        }
      } catch (backendError) {
        console.log('ℹ️ Backend authentication unavailable, wallet connected locally');
      }
    }
    
    return connectionResult;
  }

  public async disconnectWallet(walletId: string): Promise<WalletConnectionResult> {
    const wallet = this.wallets.get(walletId);
    
    if (!wallet) {
        return {
        success: false,
        error: 'Wallet not found'
      };
    }

    try {
      // Handle Solana wallet disconnection
      const solanaWallets = ['phantom', 'solflare', 'slope', 'glow', 'backpack', 'coin98', 'clover', 'mathwallet', 'exodus', 'solong', 'sollet', 'bitpie', 'tokenpocket', 'safepal', 'trustwallet', 'ledger', 'torus', 'fortmatic', 'portis', 'walletconnect', 'blocto', 'sollet-extension', 'solong-extension', 'math-wallet'];
      
      if (solanaWallets.includes(walletId)) {
        let solanaProvider = null;
        
        if (walletId === 'phantom' && (window as any).solana?.isPhantom) {
          solanaProvider = (window as any).solana;
        } else if (walletId === 'solflare' && (window as any).solflare) {
          solanaProvider = (window as any).solflare;
        } else if (walletId === 'slope' && (window as any).Slope) {
          solanaProvider = (window as any).Slope;
        } else if (walletId === 'glow' && (window as any).glow) {
          solanaProvider = (window as any).glow;
        } else if (walletId === 'backpack' && (window as any).backpack) {
          solanaProvider = (window as any).backpack;
        } else if (walletId === 'coin98' && (window as any).coin98) {
          solanaProvider = (window as any).coin98;
        } else if (walletId === 'clover' && (window as any).clover) {
          solanaProvider = (window as any).clover;
        } else if (walletId === 'mathwallet' && (window as any).mathwallet) {
          solanaProvider = (window as any).mathwallet;
        } else if (walletId === 'exodus' && (window as any).exodus) {
          solanaProvider = (window as any).exodus;
        } else if (walletId === 'solong' && (window as any).solong) {
          solanaProvider = (window as any).solong;
        }

        if (solanaProvider && solanaProvider.disconnect) {
          await solanaProvider.disconnect();
        }

        wallet.isConnected = false;
        wallet.address = undefined;
        wallet.chainId = undefined;
        this.wallets.set(walletId, wallet);

        return {
          success: true,
          walletInfo: wallet
        };
      }

      return {
        success: false,
        error: 'Unsupported wallet type'
      };
    } catch (error) {
      console.error(`Failed to disconnect ${wallet.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Disconnection failed'
      };
    }
  }

  public getWalletInfo(walletId: string): WalletInfo | undefined {
    return this.wallets.get(walletId);
  }

  public async getBalance(walletId: string): Promise<string | null> {
    const wallet = this.wallets.get(walletId);
    
    if (!wallet || !wallet.isConnected || !wallet.address) {
      return null;
    }

    try {
      // For Solana, we would need to implement balance fetching
      // This is a placeholder implementation
      return '0 SOL';
    } catch (error) {
      console.error(`Failed to get balance for ${wallet.name}:`, error);
      return null;
    }
  }

  public async signMessage(walletId: string, message: string): Promise<string | null> {
    const wallet = this.wallets.get(walletId);
    
    if (!wallet || !wallet.isConnected) {
      return null;
    }

    try {
      // Handle Solana message signing
      const solanaWallets = ['phantom', 'solflare', 'slope', 'glow', 'backpack', 'coin98', 'clover', 'mathwallet', 'exodus', 'solong', 'sollet', 'bitpie', 'tokenpocket', 'safepal', 'trustwallet', 'ledger', 'torus', 'fortmatic', 'portis', 'walletconnect', 'blocto', 'sollet-extension', 'solong-extension', 'math-wallet'];
      
      if (solanaWallets.includes(walletId)) {
        let solanaProvider = null;
        
        if (walletId === 'phantom' && (window as any).solana?.isPhantom) {
          solanaProvider = (window as any).solana;
        } else if (walletId === 'solflare' && (window as any).solflare) {
          solanaProvider = (window as any).solflare;
        } else if (walletId === 'slope' && (window as any).Slope) {
          solanaProvider = (window as any).Slope;
        } else if (walletId === 'glow' && (window as any).glow) {
          solanaProvider = (window as any).glow;
        } else if (walletId === 'backpack' && (window as any).backpack) {
          solanaProvider = (window as any).backpack;
        } else if (walletId === 'coin98' && (window as any).coin98) {
          solanaProvider = (window as any).coin98;
        } else if (walletId === 'clover' && (window as any).clover) {
          solanaProvider = (window as any).clover;
        } else if (walletId === 'mathwallet' && (window as any).mathwallet) {
          solanaProvider = (window as any).mathwallet;
        } else if (walletId === 'exodus' && (window as any).exodus) {
          solanaProvider = (window as any).exodus;
        } else if (walletId === 'solong' && (window as any).solong) {
          solanaProvider = (window as any).solong;
        }

        if (solanaProvider && solanaProvider.signMessage) {
          const encodedMessage = new TextEncoder().encode(message);
          const signedMessage = await solanaProvider.signMessage(encodedMessage);
          return Buffer.from(signedMessage.signature).toString('base64');
        }
      }

      return null;
    } catch (error) {
      console.error(`Failed to sign message with ${wallet.name}:`, error);
      return null;
    }
  }

  public refreshWallets(): void {
    this.initializeWallets();
  }
}

// Export singleton instance
export const unifiedWalletService = new UnifiedWalletService();