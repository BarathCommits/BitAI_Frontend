/**
 * Compliance Verification Configuration
 * 
 * Configuration for automated compliance verification APIs
 */

export const COMPLIANCE_CONFIG = {
  // API Endpoints
  endpoints: {
    etherscan: 'https://api.etherscan.io/api',
    polygonscan: 'https://api.polygonscan.com/api',
    bscscan: 'https://api.bscscan.com/api',
    defisafety: 'https://api.defisafety.com/v1',
    certik: 'https://api.certik.com/v1',
    slowmist: 'https://api.slowmist.com/v1'
  },

  // API Keys (set in environment variables)
  apiKeys: {
    etherscan: process.env.REACT_APP_ETHERSCAN_API_KEY || '',
    polygonscan: process.env.REACT_APP_POLYGONSCAN_API_KEY || '',
    bscscan: process.env.REACT_APP_BSCSCAN_API_KEY || '',
    defisafety: process.env.REACT_APP_DEFISAFETY_API_KEY || '',
    certik: process.env.REACT_APP_CERTIK_API_KEY || '',
    slowmist: process.env.REACT_APP_SLOWMIST_API_KEY || ''
  },

  // Verification Settings
  settings: {
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    batchSize: 10,
    cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Risk Level Thresholds
  riskThresholds: {
    low: 80,
    medium: 60,
    high: 40,
    critical: 0
  },

  // Score Weights
  scoreWeights: {
    contractVerification: 30,
    auditResults: 40,
    securityScores: 30
  },

  // Supported Chains
  supportedChains: [
    { id: 1, name: 'Ethereum Mainnet', explorer: 'etherscan.io' },
    { id: 137, name: 'Polygon', explorer: 'polygonscan.com' },
    { id: 56, name: 'BSC', explorer: 'bscscan.com' },
    { id: 42161, name: 'Arbitrum', explorer: 'arbiscan.io' },
    { id: 10, name: 'Optimism', explorer: 'optimistic.etherscan.io' }
  ],

  // Trusted Auditors
  trustedAuditors: [
    {
      name: 'CertiK',
      website: 'https://www.certik.com',
      specialties: ['Smart Contract Audits', 'Security Analysis'],
      apiAvailable: true
    },
    {
      name: 'ConsenSys Diligence',
      website: 'https://consensys.net/diligence/',
      specialties: ['Smart Contract Audits', 'Protocol Analysis'],
      apiAvailable: false
    },
    {
      name: 'OpenZeppelin',
      website: 'https://openzeppelin.com/security-audits/',
      specialties: ['Smart Contract Audits', 'Security Libraries'],
      apiAvailable: false
    },
    {
      name: 'Trail of Bits',
      website: 'https://www.trailofbits.com',
      specialties: ['Security Audits', 'Penetration Testing'],
      apiAvailable: false
    },
    {
      name: 'Quantstamp',
      website: 'https://quantstamp.com',
      specialties: ['Smart Contract Audits', 'Security Automation'],
      apiAvailable: false
    },
    {
      name: 'Hacken',
      website: 'https://hacken.io',
      specialties: ['Security Audits', 'Penetration Testing'],
      apiAvailable: false
    },
    {
      name: 'SlowMist',
      website: 'https://slowmist.com',
      specialties: ['Security Audits', 'Blockchain Security'],
      apiAvailable: true
    },
    {
      name: 'DeFiSafety',
      website: 'https://defisafety.com',
      specialties: ['Community Audits', 'Security Scores'],
      apiAvailable: true
    }
  ],

  // Compliance Requirements
  requirements: [
    {
      id: 'contract-verification',
      name: 'Contract Source Verification',
      description: 'Smart contract source code verified on blockchain explorer',
      required: true,
      weight: 30
    },
    {
      id: 'security-audit',
      name: 'Security Audit',
      description: 'Professional security audit by trusted auditor',
      required: true,
      weight: 40
    },
    {
      id: 'security-score',
      name: 'Security Score',
      description: 'Security score from trusted security platforms',
      required: false,
      weight: 30
    },
    {
      id: 'vulnerability-check',
      name: 'Vulnerability Check',
      description: 'Check against known vulnerability databases',
      required: false,
      weight: 10
    }
  ]
};

/**
 * Get API key for a specific service
 */
export const getApiKey = (service: keyof typeof COMPLIANCE_CONFIG.apiKeys): string => {
  return COMPLIANCE_CONFIG.apiKeys[service];
};

/**
 * Check if API key is available for a service
 */
export const hasApiKey = (service: keyof typeof COMPLIANCE_CONFIG.apiKeys): boolean => {
  return !!COMPLIANCE_CONFIG.apiKeys[service];
};

/**
 * Get explorer URL for a contract address
 */
export const getExplorerUrl = (address: string, chainId: number): string => {
  const chain = COMPLIANCE_CONFIG.supportedChains.find(c => c.id === chainId);
  if (!chain) {
    return `https://etherscan.io/address/${address}`;
  }
  
  return `https://${chain.explorer}/address/${address}`;
};

/**
 * Get chain name by ID
 */
export const getChainName = (chainId: number): string => {
  const chain = COMPLIANCE_CONFIG.supportedChains.find(c => c.id === chainId);
  return chain?.name || 'Unknown Chain';
};

/**
 * Check if chain is supported
 */
export const isChainSupported = (chainId: number): boolean => {
  return COMPLIANCE_CONFIG.supportedChains.some(c => c.id === chainId);
};




