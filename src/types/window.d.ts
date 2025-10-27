// Web3 Wallet Types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_URL: string;
      REACT_APP_AUTH_URL: string;
      REACT_APP_WS_URL: string;
      REACT_APP_DEFAULT_CHAIN_ID: string;
      REACT_APP_SUPPORTED_CHAINS: string;
      REACT_APP_ENABLE_AI_CHAT: string;
      REACT_APP_ENABLE_DAPP_STORE: string;
      REACT_APP_ENABLE_PORTFOLIO: string;
      REACT_APP_ENVIRONMENT: string;
      REACT_APP_DEBUG: string;
      REACT_APP_USE_REAL_API: string;
      WDS_SOCKET_HOST: string;
      WDS_SOCKET_PORT: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }

  var process: {
    env: NodeJS.ProcessEnv;
  };

  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isRabby?: boolean;
      isBraveWallet?: boolean;
      isTrust?: boolean;
      isTokenPocket?: boolean;
      isBitKeep?: boolean;
      isOKXWallet?: boolean;
      isGateWallet?: boolean;
      isKuCoinWallet?: boolean;
      isMathWallet?: boolean;
      isTokenary?: boolean;
      isFrame?: boolean;
      isAlpha?: boolean;
      isOpera?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
    solana?: {
      isPhantom?: boolean;
      isSolflare?: boolean;
      isBackpack?: boolean;
      isGlow?: boolean;
      isSlope?: boolean;
      isSollet?: boolean;
      isSolong?: boolean;
      isTorus?: boolean;
      isCoin98?: boolean;
      isBlocto?: boolean;
      isBitpie?: boolean;
      isClover?: boolean;
      isCoinbase?: boolean;
      isCoinhub?: boolean;
      isHuobiWallet?: boolean;
      isHyperPay?: boolean;
      isKeystone?: boolean;
      isKrystal?: boolean;
      isMathWallet?: boolean;
      isNabox?: boolean;
      isNeko?: boolean;
      isNufi?: boolean;
      isONTO?: boolean;
      isParticle?: boolean;
      isSafePal?: boolean;
      isSky?: boolean;
      isSpot?: boolean;
      isTokenPocket?: boolean;
      isTronLink?: boolean;
      isWalletConnect?: boolean;
      isXDEFI?: boolean;
      isZerion?: boolean;
      connect: () => Promise<any>;
      signMessage: (message: Uint8Array) => Promise<{ signature: string }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
    // Individual Solana wallet providers
    solflare?: {
      connect: () => Promise<any>;
      signMessage: (message: Uint8Array) => Promise<{ signature: string }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
    Slope?: {
      connect: () => Promise<any>;
      signMessage: (message: Uint8Array) => Promise<{ signature: string }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
    glow?: {
      connect: () => Promise<any>;
      signMessage: (message: Uint8Array) => Promise<{ signature: string }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
    backpack?: {
      connect: () => Promise<any>;
      signMessage: (message: Uint8Array) => Promise<{ signature: string }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

export {};
