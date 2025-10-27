import { useNotificationStore } from '../store/notificationStore';
import { NotificationType } from '../types/notifications';

class NotificationService {
  /**
   * Add a notification
   */
  notify(
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      actionUrl?: string;
      actionText?: string;
      metadata?: any;
    }
  ) {
    const addNotification = useNotificationStore.getState().addNotification;
    
    addNotification({
      type,
      title,
      message,
      actionUrl: options?.actionUrl,
      actionText: options?.actionText,
      metadata: options?.metadata,
    });
  }

  /**
   * Notification helpers for common scenarios
   */
  
  // Wallet notifications
  walletConnected(walletName: string, address: string) {
    this.notify('wallet', 'Wallet Connected', `${walletName} connected successfully`, {
      metadata: { walletAddress: address }
    });
  }

  walletDisconnected(walletName: string) {
    this.notify('wallet', 'Wallet Disconnected', `${walletName} has been disconnected`);
  }

  // Transaction notifications
  transactionPending(hash: string, amount?: string) {
    this.notify('transaction', 'Transaction Pending', 'Your transaction is being processed', {
      actionUrl: `https://etherscan.io/tx/${hash}`,
      actionText: 'View on Explorer',
      metadata: { transactionHash: hash, amount }
    });
  }

  transactionSuccess(hash: string, amount?: string) {
    this.notify('success', 'Transaction Confirmed', 'Your transaction was successful!', {
      actionUrl: `https://etherscan.io/tx/${hash}`,
      actionText: 'View on Explorer',
      metadata: { transactionHash: hash, amount }
    });
  }

  transactionFailed(hash?: string, reason?: string) {
    this.notify('error', 'Transaction Failed', reason || 'Your transaction could not be completed', {
      actionUrl: hash ? `https://etherscan.io/tx/${hash}` : undefined,
      actionText: hash ? 'View Details' : undefined,
      metadata: { transactionHash: hash }
    });
  }

  // Security notifications
  securityAlert(title: string, message: string) {
    this.notify('security', title, message);
  }

  suspiciousActivity(details: string) {
    this.notify('security', 'Suspicious Activity Detected', details);
  }

  // DApp notifications
  dappConnected(dappName: string) {
    this.notify('dapp', 'DApp Connected', `Connected to ${dappName}`);
  }

  dappDisconnected(dappName: string) {
    this.notify('dapp', 'DApp Disconnected', `Disconnected from ${dappName}`);
  }

  newDappAvailable(dappName: string) {
    this.notify('dapp', 'New DApp Available', `${dappName} is now available in the store`, {
      actionUrl: '/safe-store',
      actionText: 'Browse Store'
    });
  }

  // AI notifications
  aiResponse(message: string) {
    this.notify('ai', 'AI Assistant', message);
  }

  aiSuggestion(suggestion: string) {
    this.notify('ai', 'AI Suggestion', suggestion);
  }

  // Vault notifications
  vaultItemAdded(label: string) {
    this.notify('vault', 'Item Added to Vault', `${label} has been securely stored`, {
      actionUrl: '/vault',
      actionText: 'View Vault'
    });
  }

  vaultItemUpdated(label: string) {
    this.notify('vault', 'Vault Item Updated', `${label} has been updated`);
  }

  vaultItemDeleted(label: string) {
    this.notify('vault', 'Item Removed', `${label} has been removed from vault`);
  }

  // System notifications
  systemUpdate(version: string) {
    this.notify('system', 'Update Available', `Version ${version} is now available`);
  }

  maintenanceScheduled(time: string) {
    this.notify('warning', 'Scheduled Maintenance', `System maintenance scheduled for ${time}`);
  }

  // Generic notifications
  success(title: string, message: string) {
    this.notify('success', title, message);
  }

  error(title: string, message: string) {
    this.notify('error', title, message);
  }

  warning(title: string, message: string) {
    this.notify('warning', title, message);
  }

  info(title: string, message: string) {
    this.notify('info', title, message);
  }

  /**
   * Request desktop notification permission
   */
  async requestDesktopPermission(): Promise<boolean> {
    if (typeof Notification === 'undefined') {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }
}

export const notificationService = new NotificationService();


