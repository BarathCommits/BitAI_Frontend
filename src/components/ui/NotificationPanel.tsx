import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { useBuiltInWallet } from '../../hooks/useBuiltInWallet';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  ExternalLink,
  Wallet,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  MessageSquare,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationType, AppNotification } from '../../types/notifications';

export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { connectedWallets } = useBuiltInWallet();
  const theme = connectedWallets.length > 0 ? 'cyberpunk' : 'modern';
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const getNotificationIcon = (type: NotificationType) => {
    const iconMap = {
      transaction: Zap,
      wallet: Wallet,
      security: Shield,
      dapp: ExternalLink,
      ai: MessageSquare,
      system: Settings,
      vault: Shield,
      success: CheckCircle,
      warning: AlertCircle,
      error: AlertCircle,
      info: Info,
    };
    return iconMap[type] || Info;
  };

  const getNotificationColor = (type: NotificationType) => {
    const colorMap = {
      transaction: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      wallet: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
      security: 'text-red-600 bg-red-50 dark:bg-red-900/20',
      dapp: 'text-green-600 bg-green-50 dark:bg-green-900/20',
      ai: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
      system: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
      vault: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
      success: 'text-green-600 bg-green-50 dark:bg-green-900/20',
      warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
      error: 'text-red-600 bg-red-50 dark:bg-red-900/20',
      info: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    };
    return colorMap[type] || colorMap.info;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="relative z-50">
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setIsOpen(false)}
            style={{ zIndex: 99998 }}
          />
          
          {/* Panel */}
          <div 
            className={`fixed right-4 top-16 w-96 max-h-[600px] rounded-lg shadow-2xl border overflow-hidden flex flex-col transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'cyberpunk-card border-green-400/30' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
            style={{ zIndex: 99999 }}
          >
            {/* Header */}
            <div className={`p-4 border-b transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'border-green-400/30' 
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-semibold transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'text-white cyberpunk-font' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {theme === 'cyberpunk' ? 'SAFE ALERTS' : 'Notifications'}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchNotifications}
                    disabled={isLoading}
                    title="Refresh notifications"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                {notification.title}
                                {!notification.read && (
                                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full ml-2" />
                                )}
                              </h4>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {notification.message}
                            </p>

                            {/* Metadata */}
                            {notification.metadata && (
                              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                {notification.metadata.transactionHash && (
                                  <span 
                                    key="transaction-hash"
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 font-mono"
                                  >
                                    {notification.metadata.transactionHash.slice(0, 10)}...
                                  </span>
                                )}
                                {notification.metadata.amount && (
                                  <span 
                                    key="amount"
                                    className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium"
                                  >
                                    {notification.metadata.amount}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Action Button */}
                            {notification.actionUrl && notification.actionText && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = notification.actionUrl!;
                                }}
                              >
                                {notification.actionText}
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-600 p-1 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-center text-gray-500">
                  Showing {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
                </p>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

