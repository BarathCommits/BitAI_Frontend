/**
 * API Endpoints Configuration
 * 
 * PURPOSE: Centralized storage of all API endpoint documentation.
 * 
 * BEST PRACTICE - Data Separation:
 * Separating data from components makes the codebase:
 * - Easier to maintain (update API docs without touching UI code)
 * - Easier to test (test data structure separately)
 * - Easier to reuse (other components can import this data)
 * - Easier to version control (see what changed in API docs)
 * 
 * FILE ORGANIZATION BEST PRACTICE:
 * - Keep data files simple (just data, no logic)
 * - Use TypeScript interfaces for type safety
 * - Export everything needed by other files
 * - Document what each endpoint does
 * 
 * WHEN TO SPLIT DATA FILES:
 * If this file grows beyond ~500 lines, consider splitting by category:
 * - apiEndpoints/auth.ts
 * - apiEndpoints/ai.ts
 * - apiEndpoints/dapps.ts
 * etc.
 */

/**
 * ApiEndpoint Interface - TypeScript Best Practice
 * 
 * This defines the structure of an API endpoint object.
 * Think of it like a blueprint: "Every endpoint MUST have these properties."
 * 
 * Benefits:
 * - TypeScript catches errors if structure is wrong
 * - IDE autocomplete shows available properties
 * - Self-documenting (you can see what data is expected)
 * 
 * The "?" means optional (not required):
 * - params?: optional (some endpoints don't have query params)
 * - body?: optional (GET requests don't have a body)
 * - response?: optional (not all endpoints have example responses)
 */
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
  body?: { name: string; type: string; required: boolean; description: string }[];
  response?: string;
  example?: {
    request: string;
    response: string;
  };
}

export const apiEndpoints: { [key: string]: ApiEndpoint[] } = {
  authentication: [
    {
      method: 'POST',
      path: '/api/v1/auth/wallet/nonce',
      description: 'Generate a nonce for wallet signature authentication',
      auth: false,
      body: [
        { name: 'address', type: 'string', required: true, description: 'Ethereum wallet address' }
      ],
      example: {
        request: `fetch('http://localhost:3000/api/v1/auth/wallet/nonce', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' 
  })
});`,
        response: `{
  "success": true,
  "data": { "nonce": "0xa1b2c3d4e5f6..." }
}`
      }
    },
    {
      method: 'POST',
      path: '/api/v1/auth/wallet/verify',
      description: 'Verify wallet signature and get JWT token',
      auth: false,
      body: [
        { name: 'address', type: 'string', required: true, description: 'Ethereum wallet address' },
        { name: 'message', type: 'string', required: true, description: 'Signed message containing nonce' },
        { name: 'signature', type: 'string', required: true, description: 'Wallet signature' }
      ],
      example: {
        request: `fetch('http://localhost:3000/api/v1/auth/wallet/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    message: 'Sign in to Safe - Nonce: 0xa1b2c3d4e5f6...',
    signature: '0x123abc...'
  })
});`,
        response: `{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    }
  }
}`
      }
    }
  ],
  ai: [
    {
      method: 'POST',
      path: '/api/v1/ai/chat',
      description: 'Chat with AI assistant',
      auth: true,
      body: [
        { name: 'message', type: 'string', required: true, description: 'User message' },
        { name: 'userId', type: 'string', required: true, description: 'User ID or "anonymous"' },
        { name: 'walletAddress', type: 'string', required: false, description: 'User wallet address for balance queries' }
      ],
      example: {
        request: `fetch('http://localhost:3000/api/v1/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGc...'
  },
  body: JSON.stringify({
    message: 'What is my ETH balance?',
    userId: 'user123',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  })
});`,
        response: `{
  "success": true,
  "data": {
    "message": "Your current ETH balance is 2.5 ETH",
    "provider": "gemini"
  }
}`
      }
    }
  ],
  dapps: [
    {
      method: 'GET',
      path: '/api/v1/dapps',
      description: 'List all dApps in the bitAppStore',
      auth: false,
      params: [
        { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
        { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 20)' },
        { name: 'category', type: 'string', required: false, description: 'Filter by category' }
      ],
      example: {
        request: `fetch('http://localhost:3000/api/v1/dapps?page=1&limit=20&category=defi');`,
        response: `{
  "success": true,
  "data": [{
    "id": "uniswap",
    "name": "Uniswap",
    "category": "defi",
    "url": "https://app.uniswap.org"
  }]
}`
      }
    },
    {
      method: 'POST',
      path: '/api/v1/dapps/submit',
      description: 'Submit a new dApp to the bitAppStore',
      auth: true,
      body: [
        { name: 'name', type: 'string', required: true, description: 'dApp name' },
        { name: 'url', type: 'string', required: true, description: 'dApp URL' },
        { name: 'category', type: 'string', required: true, description: 'Category' },
        { name: 'description', type: 'string', required: true, description: 'Short description' }
      ],
      example: {
        request: `fetch('http://localhost:3000/api/v1/dapps/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGc...'
  },
  body: JSON.stringify({
    name: 'My DeFi App',
    url: 'https://mydefi.app',
    category: 'defi',
    description: 'Yield farming platform'
  })
});`,
        response: `{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "status": "pending"
  }
}`
      }
    }
  ],
  wallet: [
    {
      method: 'POST',
      path: '/api/v1/wallet/connect',
      description: 'Connect a wallet to user account',
      auth: true,
      body: [
        { name: 'address', type: 'string', required: true, description: 'Wallet address' },
        { name: 'provider', type: 'string', required: true, description: 'Wallet provider (e.g., "MetaMask")' },
        { name: 'chainId', type: 'number', required: true, description: 'Chain ID' }
      ],
      example: {
        request: `fetch('http://localhost:3000/api/v1/wallet/connect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGc...'
  },
  body: JSON.stringify({
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    provider: 'MetaMask',
    chainId: 1
  })
});`,
        response: `{
  "success": true,
  "data": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "isPrimary": true
  }
}`
      }
    }
  ],
  solana: [
    {
      method: 'GET',
      path: '/api/solana/balance/:address',
      description: 'Get Solana account balance',
      auth: false,
      params: [
        { name: 'address', type: 'string', required: true, description: 'Solana wallet address' }
      ],
      example: {
        request: `fetch('http://localhost:3007/api/solana/balance/9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');`,
        response: `{
  "success": true,
  "data": {
    "lamports": 1000000000,
    "sol": 1.0,
    "formatted": "1.0 SOL"
  }
}`
      }
    },
    {
      method: 'GET',
      path: '/api/solana/account/:address',
      description: 'Get Solana account information',
      auth: false,
      params: [
        { name: 'address', type: 'string', required: true, description: 'Solana account address' }
      ],
      example: {
        request: `fetch('http://localhost:3007/api/solana/account/9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');`,
        response: `{
  "success": true,
  "data": {
    "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "balance": 1.0,
    "executable": false,
    "owner": "11111111111111111111111111111111",
    "space": 0
  }
}`
      }
    },
    {
      method: 'GET',
      path: '/api/solana/tokens/:address',
      description: 'Get token accounts for a Solana address',
      auth: false,
      params: [
        { name: 'address', type: 'string', required: true, description: 'Solana wallet address' }
      ],
      example: {
        request: `fetch('http://localhost:3007/api/solana/tokens/9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');`,
        response: `{
  "success": true,
  "data": [
    {
      "pubkey": "TokenAccountPubkey...",
      "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "amount": 1000000,
      "decimals": 6
    }
  ]
}`
      }
    },
    {
      method: 'GET',
      path: '/api/solana/transactions/:address',
      description: 'Get transaction history for a Solana address',
      auth: false,
      params: [
        { name: 'address', type: 'string', required: true, description: 'Solana wallet address' },
        { name: 'limit', type: 'number', required: false, description: 'Number of transactions to return (default: 10)' }
      ],
      example: {
        request: `fetch('http://localhost:3007/api/solana/transactions/9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM?limit=10');`,
        response: `{
  "success": true,
  "data": [
    {
      "signature": "5j7s8...",
      "slot": 123456789,
      "blockTime": 1699123456,
      "fee": 5000,
      "success": true,
      "type": "transfer",
      "amount": 0.5,
      "explorerUrl": "https://solscan.io/tx/5j7s8..."
    }
  ]
}`
      }
    },
    {
      method: 'GET',
      path: '/api/solana/network',
      description: 'Get Solana network information',
      auth: false,
      example: {
        request: `fetch('http://localhost:3007/api/solana/network');`,
        response: `{
  "success": true,
  "data": {
    "slot": 123456789,
    "epoch": 123,
    "epochProgress": "45.2%",
    "clusterVersion": "1.16.0",
    "rpcEndpoint": "https://api.mainnet-beta.solana.com"
  }
}`
      }
    },
    {
      method: 'POST',
      path: '/api/solana/validate',
      description: 'Validate a Solana address',
      auth: false,
      body: [
        { name: 'address', type: 'string', required: true, description: 'Solana address to validate' }
      ],
      example: {
        request: `fetch('http://localhost:3007/api/solana/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
  })
});`,
        response: `{
  "success": true,
  "data": {
    "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "valid": true
  }
}`
      }
    }
  ]
};

