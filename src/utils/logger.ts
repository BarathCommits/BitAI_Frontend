/**
 * Production-Safe Logger Utility
 * Automatically disables debug logs in production
 */

import { isDevelopment, isProduction } from '../config/api';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
  prefix?: string;
  enableInProduction?: boolean;
  colors?: {
    log?: string;
    info?: string;
    warn?: string;
    error?: string;
    debug?: string;
  };
}

class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      prefix: '',
      enableInProduction: false,
      colors: {
        log: '#2196F3',
        info: '#4CAF50',
        warn: '#FF9800',
        error: '#F44336',
        debug: '#9C27B0',
      },
      ...config,
    };
  }

  /**
   * Check if logging should be enabled
   */
  private shouldLog(level: LogLevel): boolean {
    // Always log errors
    if (level === 'error') return true;
    
    // In production, only log if explicitly enabled
    if (isProduction && !this.config.enableInProduction) {
      return level === 'error' || level === 'warn';
    }
    
    // In development, log everything
    return true;
  }

  /**
   * Format log message with prefix and styling
   */
  private format(level: LogLevel, ...args: any[]): any[] {
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const color = this.config.colors?.[level] || '#000';
    
    if (isDevelopment && typeof args[0] === 'string') {
      return [
        `%c${timestamp} ${prefix} ${args[0]}`,
        `color: ${color}; font-weight: bold`,
        ...args.slice(1),
      ];
    }
    
    return [`${timestamp} ${prefix}`, ...args];
  }

  /**
   * Standard log (disabled in production)
   */
  log(...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log(...this.format('log', ...args));
    }
  }

  /**
   * Info log (disabled in production)
   */
  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(...this.format('info', ...args));
    }
  }

  /**
   * Warning log (enabled in production)
   */
  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...this.format('warn', ...args));
    }
  }

  /**
   * Error log (always enabled)
   */
  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(...this.format('error', ...args));
    }
  }

  /**
   * Debug log (only in development)
   */
  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(...this.format('debug', ...args));
    }
  }

  /**
   * Group logs together
   */
  group(label: string, collapsed: boolean = false): void {
    if (this.shouldLog('log')) {
      if (collapsed) {
        console.groupCollapsed(label);
      } else {
        console.group(label);
      }
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (this.shouldLog('log')) {
      console.groupEnd();
    }
  }

  /**
   * Log table data
   */
  table(data: any): void {
    if (this.shouldLog('log')) {
      console.table(data);
    }
  }

  /**
   * Time a operation
   */
  time(label: string): void {
    if (this.shouldLog('debug')) {
      console.time(label);
    }
  }

  /**
   * End timing operation
   */
  timeEnd(label: string): void {
    if (this.shouldLog('debug')) {
      console.timeEnd(label);
    }
  }
}

// Create specialized loggers for different modules
export const logger = new Logger();

export const authLogger = new Logger({ prefix: '🔐 Auth' });
export const vaultLogger = new Logger({ prefix: '🔒 Vault' });
export const walletLogger = new Logger({ prefix: '👛 Wallet' });
export const apiLogger = new Logger({ prefix: '🌐 API' });
export const aiLogger = new Logger({ prefix: '🤖 AI' });

// Export default logger
export default logger;


