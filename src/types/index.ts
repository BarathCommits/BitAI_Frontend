// Core types for the Web3 Browser with Hybrid AI

export interface User {
  id: string;
  walletAddress: string; // Primary identifier - wallet address
  chainId?: number; // Chain ID of the connected wallet
  email?: string; // Optional - not required for wallet-based auth
  username?: string; // Optional display name
  avatar?: string;
  walletProvider?: string; // MetaMask, Phantom, etc.
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  dappUpdates: boolean;
  portfolioAlerts: boolean;
  aiSuggestions: boolean;
}

export interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  personalizedAds: boolean;
  shareUsageData: boolean;
}

export interface Wallet {
  id: string;
  address: string;
  type: WalletType;
  chainId: number;
  isConnected: boolean;
  balance: string;
  tokens: Token[];
  lastUsed: Date;
}

export type WalletType = 'metamask' | 'coinbase' | 'walletconnect' | 'phantom' | 'rainbow';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  price: number;
  value: number;
  logo?: string;
  chainId: number;
}

export interface DApp {
  id: string;
  name: string;
  description: string;
  category: DAppCategory;
  url: string;
  logo: string;
  banner?: string;
  tags: string[];
  rating: number;
  users: number;
  isVerified: boolean;
  isConnected: boolean;
  features: DAppFeature[];
  supportedChains: number[];
  createdAt: Date;
  updatedAt: Date;
}

export type DAppCategory = 
  | 'defi' 
  | 'nft' 
  | 'gaming' 
  | 'social' 
  | 'storage' 
  | 'identity' 
  | 'tools' 
  | 'other';

export interface DAppFeature {
  name: string;
  description: string;
  isEnabled: boolean;
  requiresAuth: boolean;
}

export interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  dappId?: string;
  action?: AIAction;
  metadata?: Record<string, any>;
}

export interface AIAction {
  type: 'swap' | 'stake' | 'transfer' | 'query' | 'execute';
  dappId: string;
  parameters: Record<string, any>;
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
}

export interface AIProvider {
  name: string;
  priority: number;
  freeLimit: number;
  cost: number;
  setup: string;
  reliability: 'Low' | 'Medium' | 'High' | 'Very High';
  isActive: boolean;
  usage: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  walletAddress: string; // Wallet address of the session owner
  title: string;
  messages: AIMessage[];
  connectedDApps: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Portfolio {
  totalValue: number;
  totalValueChange: number;
  totalValueChangePercent: number;
  assets: PortfolioAsset[];
  chains: ChainPortfolio[];
  performance: PerformanceData;
}

export interface PortfolioAsset {
  token: Token;
  balance: string;
  value: number;
  valueChange: number;
  valueChangePercent: number;
  allocation: number;
}

export interface ChainPortfolio {
  chainId: number;
  chainName: string;
  totalValue: number;
  assets: PortfolioAsset[];
}

export interface PerformanceData {
  daily: number[];
  weekly: number[];
  monthly: number[];
  yearly: number[];
  labels: string[];
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  token: Token;
  type: TransactionType;
  status: TransactionStatus;
  gasUsed: string;
  gasPrice: string;
  timestamp: Date;
  blockNumber: number;
  dappId?: string;
}

export type TransactionType = 
  | 'send' 
  | 'receive' 
  | 'swap' 
  | 'stake' 
  | 'unstake' 
  | 'mint' 
  | 'burn' 
  | 'approve' 
  | 'contract_interaction';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'signing' | 'sent';

// Function calling transaction data from AI responses
export interface FunctionCallTransaction {
  id: string;
  type: 'solana' | 'ethereum';
  operation: string; // e.g., 'transfer', 'swap', 'stake', etc.
  rawTransaction?: string; // Base64 encoded transaction for Solana, hex for Ethereum
  transactionData?: {
    from?: string;
    to?: string;
    amount?: string;
    token?: string;
    contractAddress?: string;
    functionName?: string;
    parameters?: Record<string, any>;
  };
  description?: string;
  estimatedFee?: string;
  requiresSigning: boolean;
}

export interface Analytics {
  userMetrics: UserMetrics;
  dappMetrics: DAppMetrics;
  aiMetrics: AIMetrics;
  portfolioMetrics: PortfolioMetrics;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  averageSessionTime: number;
}

export interface DAppMetrics {
  totalDApps: number;
  connectedDApps: number;
  popularDApps: DApp[];
  categoryDistribution: Record<DAppCategory, number>;
}

export interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  averageResponseTime: number;
  providerUsage: Record<string, number>;
  costSavings: number;
}

export interface PortfolioMetrics {
  totalPortfolioValue: number;
  averagePortfolioSize: number;
  topPerformingAssets: Token[];
  chainDistribution: Record<number, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchFilters {
  query?: string;
  category?: DAppCategory;
  chainId?: number;
  isVerified?: boolean;
  minRating?: number;
  sortBy?: 'name' | 'rating' | 'users' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'transaction' 
  | 'portfolio' 
  | 'dapp' 
  | 'ai' 
  | 'system' 
  | 'security';

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    border: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
}

export interface AppConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  wsUrl: string;
  supportedChains: number[];
  defaultChain: number;
  aiProviders: AIProvider[];
  features: Record<string, boolean>;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event types
export interface WalletConnectedEvent {
  wallet: Wallet;
  user: User;
}

export interface DAppConnectedEvent {
  dapp: DApp;
  user: User;
}

export interface TransactionEvent {
  transaction: Transaction;
  user: User;
}

export interface AIMessageEvent {
  message: AIMessage;
  session: ChatSession;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Form types
// Legacy forms kept for backward compatibility but wallet auth is primary
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

// Wallet-based authentication (primary auth method)
export interface WalletAuthForm {
  address: string;
  message: string;
  signature: string;
  chainId?: number;
  provider?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface FeedbackForm {
  rating: number;
  category: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  attachments?: File[];
}

// Personal Vault Types
export interface PersonalInfo {
  id: string;
  _id?: string; // MongoDB ID from backend
  infoId?: string; // Additional ID from backend
  userId?: string; // User ID from backend
  walletAddress?: string; // Wallet address - primary owner identifier
  type: 'id_card' | 'credit_card' | 'bank_account' | 'passport' | 'license' | 'social_security' | 'insurance' | 'other';
  label: string;
  value: string;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt?: string; // Updated timestamp from backend
  category: 'personal' | 'financial' | 'identity' | 'documents';
  fields: Record<string, string>; // Additional fields based on type
  metadata?: {
    isArchived?: boolean;
    isStarred?: boolean;
    tags?: string[];
    accessCount?: number;
    lastAccessedAt?: Date;
  };
}

export interface VaultStats {
  totalItems: number;
  categories: {
    personal: number;
    financial: number;
    identity: number;
    documents: number;
  };
  lastUpdated: string;
}

export interface QRCodeData {
  qrCodeDataURL: string;
  qrType: 'master' | 'individual';
  metadata: {
    itemId?: string;
    itemType?: string;
    createdAt: string;
    expiresAt?: string;
  };
}
