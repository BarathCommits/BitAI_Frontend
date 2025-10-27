export type NotificationType = 
  | 'transaction'
  | 'wallet'
  | 'security'
  | 'dapp'
  | 'ai'
  | 'system'
  | 'vault'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    transactionHash?: string;
    walletAddress?: string;
    dappName?: string;
    amount?: string;
    chainId?: number;
  };
}

export interface NotificationPreferences {
  enabled: boolean;
  types: {
    transaction: boolean;
    wallet: boolean;
    security: boolean;
    dapp: boolean;
    ai: boolean;
    system: boolean;
    vault: boolean;
  };
  sound: boolean;
  desktop: boolean;
}

