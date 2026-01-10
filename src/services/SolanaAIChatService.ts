/**
 * Solana AI Chat Service
 * Handles natural language commands and translates them to wallet operations
 */

import { solanaBackendService } from './SolanaBackendService';

// Alias for consistency
const walletOnlySolanaService = solanaBackendService;

interface ChatCommand {
  intent: string;
  parameters: Record<string, any>;
  confidence: number;
}

interface ChatResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  suggestedActions?: string[];
}

class SolanaAIChatService {
  private walletAddress: string | null = null;

  /**
   * Set the wallet address for operations
   */
  setWalletAddress(address: string) {
    this.walletAddress = address;
  }

  /**
   * Process natural language command
   */
  async processCommand(userInput: string): Promise<ChatResponse> {
    try {
      const command = this.parseCommand(userInput);
      
      if (!command) {
        return {
          success: false,
          message: "I didn't understand that command. Try asking me to check your balance, send SOL, or show your tokens.",
          suggestedActions: [
            'Check my balance',
            'Send 1 SOL to [address]',
            'Show my tokens',
            'Sign this message'
          ]
        };
      }

      return await this.executeCommand(command);
    } catch (error) {
      return {
        success: false,
        message: `Sorry, I encountered an error: ${error}`,
        error: error.toString()
      };
    }
  }

  /**
   * Parse natural language into structured command
   */
  private parseCommand(input: string): ChatCommand | null {
    const lowerInput = input.toLowerCase().trim();

    // Balance commands
    if (lowerInput.includes('balance') || lowerInput.includes('how much')) {
      return {
        intent: 'getBalance',
        parameters: {},
        confidence: 0.9
      };
    }

    // Send SOL commands
    const sendMatch = lowerInput.match(/send\s+(\d+(?:\.\d+)?)\s*sol\s+to\s+([a-zA-Z0-9]{32,44})/i);
    if (sendMatch) {
      return {
        intent: 'sendSOL',
        parameters: {
          amount: parseFloat(sendMatch[1]),
          recipient: sendMatch[2]
        },
        confidence: 0.9
      };
    }

    // Token commands
    if (lowerInput.includes('token') || lowerInput.includes('tokens')) {
      return {
        intent: 'getTokenAccounts',
        parameters: {},
        confidence: 0.8
      };
    }

    // Sign message commands
    if (lowerInput.includes('sign') && lowerInput.includes('message')) {
      const messageMatch = lowerInput.match(/sign\s+(?:message\s+)?["']?([^"']+)["']?/i);
      if (messageMatch) {
        return {
          intent: 'signMessage',
          parameters: {
            message: messageMatch[1]
          },
          confidence: 0.8
        };
      }
    }

    // Transaction history commands
    if (lowerInput.includes('history') || lowerInput.includes('transactions')) {
      return {
        intent: 'getTransactionHistory',
        parameters: { limit: 10 },
        confidence: 0.8
      };
    }

    // Account info commands
    if (lowerInput.includes('account') || lowerInput.includes('info')) {
      return {
        intent: 'getAccountInfo',
        parameters: {},
        confidence: 0.7
      };
    }

    // Program commands
    if (lowerInput.includes('program') && lowerInput.includes('accounts')) {
      const programMatch = lowerInput.match(/program\s+([a-zA-Z0-9]{32,44})\s+accounts/i);
      if (programMatch) {
        return {
          intent: 'getProgramAccounts',
          parameters: {
            programId: programMatch[1]
          },
          confidence: 0.8
        };
      }
    }

    // Account data commands
    if (lowerInput.includes('account') && lowerInput.includes('data')) {
      const accountMatch = lowerInput.match(/account\s+([a-zA-Z0-9]{32,44})\s+data/i);
      if (accountMatch) {
        return {
          intent: 'getAccountData',
          parameters: {
            accountAddress: accountMatch[1]
          },
          confidence: 0.8
        };
      }
    }

    // Network info commands
    if (lowerInput.includes('slot') || lowerInput.includes('epoch')) {
      return {
        intent: 'getNetworkInfo',
        parameters: {},
        confidence: 0.7
      };
    }

    return null;
  }

  /**
   * Execute parsed command
   */
  private async executeCommand(command: ChatCommand): Promise<ChatResponse> {
    if (!this.walletAddress) {
      return {
        success: false,
        message: '🔒 **Wallet Not Connected**\n\nPlease connect your wallet first to use Solana commands.',
        suggestedActions: ['Connect Wallet']
      };
    }

    switch (command.intent) {
      case 'getBalance':
        return await this.handleGetBalance();
      
      case 'sendSOL':
        return await this.handleSendSOL(command.parameters);
      
      case 'getTokenAccounts':
        return await this.handleGetTokenAccounts();
      
      case 'signMessage':
        return await this.handleSignMessage(command.parameters);
      
      case 'getTransactionHistory':
        return await this.handleGetTransactionHistory(command.parameters);
      
      case 'getAccountInfo':
        return await this.handleGetAccountInfo();
      
      case 'getProgramAccounts':
        return await this.handleGetProgramAccounts(command.parameters);
      
      case 'getAccountData':
        return await this.handleGetAccountData(command.parameters);
      
      case 'getNetworkInfo':
        return await this.handleGetNetworkInfo();
      
      default:
        return {
          success: false,
          message: 'Command not implemented yet.',
          error: 'Unknown command'
        };
    }
  }

  /**
   * Handle get balance command
   */
  private async handleGetBalance(): Promise<ChatResponse> {
    const result = await solanaBackendService.getBalance(this.walletAddress!);
    
    if (result.success) {
      return {
        success: true,
        message: `💰 **Your SOL Balance**\n\n**${result.data!.formatted}**\n\n*${result.data!.lamports} lamports*${result.cached ? '\n\n*📦 Cached response*' : ''}`,
        data: result.data,
        suggestedActions: [
          'Send SOL to [address]',
          'Show my tokens',
          'Transaction history'
        ]
      };
    } else {
      return {
        success: false,
        message: `❌ **Failed to get balance**\n\n${result.error}`,
        error: result.error
      };
    }
  }

  /**
   * Handle send SOL command
   */
  private async handleSendSOL(params: { amount: number; recipient: string }): Promise<ChatResponse> {
    // Validate recipient address using backend
    const validationResult = await solanaBackendService.validateAddress(params.recipient);
    if (!validationResult.success || !validationResult.data!.valid) {
      return {
        success: false,
        message: `❌ **Invalid Address**\n\nThe recipient address \`${params.recipient}\` is not a valid Solana address.`,
        error: 'Invalid address'
      };
    }

    // Note: SOL sending requires wallet signing, so this would need to be handled differently
    // For now, we'll return a message explaining this limitation
    return {
      success: false,
      message: `⚠️ **SOL Transfer Not Available via Chat**\n\nSOL transfers require wallet signing and cannot be performed through chat for security reasons.\n\nPlease use your wallet extension directly for transfers.\n\n**Amount:** ${params.amount} SOL\n**To:** \`${params.recipient}\``,
      suggestedActions: [
        'Check my balance',
        'Transaction history',
        'Show my tokens'
      ]
    };
  }

  /**
   * Handle get token accounts command
   */
  private async handleGetTokenAccounts(): Promise<ChatResponse> {
    const result = await solanaBackendService.getTokenAccounts(this.walletAddress!);
    
    if (result.success) {
      const tokens = result.data!;
      
      if (tokens.length === 0) {
        return {
          success: true,
          message: '📭 **No Token Accounts**\n\nYou don\'t have any SPL token accounts yet.\n\nTo receive tokens, you\'ll need to create token accounts first.',
          data: tokens,
          suggestedActions: [
            'Create token account',
            'Check SOL balance',
            'Transaction history'
          ]
        };
      }

      let message = `🪙 **Your Token Accounts**\n\n`;
      tokens.forEach((token, index) => {
        message += `**${index + 1}.** \`${token.mint}\`\n`;
        message += `   Amount: ${token.amount}\n`;
        message += `   Decimals: ${token.decimals}\n\n`;
      });

      return {
        success: true,
        message,
        data: tokens,
        suggestedActions: [
          'Transfer tokens',
          'Create token account',
          'Check SOL balance'
        ]
      };
    } else {
      return {
        success: false,
        message: `❌ **Failed to get token accounts**\n\n${result.error}`,
        error: result.error
      };
    }
  }

  /**
   * Handle sign message command
   */
  private async handleSignMessage(params: { message: string }): Promise<ChatResponse> {
    // Message signing requires wallet interaction, so this cannot be done via backend
    return {
      success: false,
      message: `⚠️ **Message Signing Not Available via Chat**\n\nMessage signing requires direct wallet interaction and cannot be performed through chat for security reasons.\n\nPlease use your wallet extension directly to sign messages.\n\n**Message to sign:** \`${params.message}\``,
      suggestedActions: [
        'Check my balance',
        'Transaction history',
        'Show my tokens'
      ]
    };
  }

  /**
   * Handle get transaction history command
   */
  private async handleGetTransactionHistory(params: { limit: number }): Promise<ChatResponse> {
    const result = await solanaBackendService.getTransactionHistory(this.walletAddress!, params.limit);
    
    if (result.success) {
      const transactions = result.data!;
      
      if (transactions.length === 0) {
        return {
          success: true,
          message: '📭 **No Transactions**\n\nYou don\'t have any transaction history yet.',
          data: transactions,
          suggestedActions: [
            'Send SOL',
            'Check my balance',
            'Show my tokens'
          ]
        };
      }

      let message = `📜 **Recent Transactions**\n\n`;
      transactions.forEach((tx, index) => {
        const status = tx.success ? '✅' : '❌';
        const date = new Date(tx.blockTime * 1000).toLocaleString();
        message += `**${index + 1}.** ${status} [${tx.signature.substring(0, 8)}...]\n`;
        message += `   Date: ${date}\n`;
        message += `   Fee: ${tx.fee} lamports\n`;
        if (tx.explorerUrl) {
          message += `   [View on Explorer](${tx.explorerUrl})\n`;
        }
        message += '\n';
      });

      if (result.cached) {
        message += '*📦 Cached response*';
      }

      return {
        success: true,
        message,
        data: transactions,
        suggestedActions: [
          'Get transaction details',
          'Check my balance',
          'Send SOL'
        ]
      };
    } else {
      return {
        success: false,
        message: `❌ **Failed to get transaction history**\n\n${result.error}`,
        error: result.error
      };
    }
  }

  /**
   * Handle get account info command
   */
  private async handleGetAccountInfo(): Promise<ChatResponse> {
    const result = await solanaBackendService.getAccountInfo(this.walletAddress!);
    
    if (result.success) {
      return {
        success: true,
        message: `ℹ️ **Account Information**\n\n**Address:** \`${result.data!.address}\`\n**Balance:** ${result.data!.balance} SOL\n**Owner:** \`${result.data!.owner}\`\n**Space:** ${result.data!.space} bytes\n**Executable:** ${result.data!.executable ? 'Yes' : 'No'}`,
        data: result.data,
        suggestedActions: [
          'Check my balance',
          'Transaction history',
          'Show my tokens'
        ]
      };
    } else {
      return {
        success: false,
        message: `❌ **Failed to get account info**\n\n${result.error}`,
        error: result.error
      };
    }
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): string[] {
    return [
      'Check my balance',
      'Show my tokens',
      'Transaction history',
      'Account info',
      'Network info (slot/epoch)'
    ];
  }

  /**
   * Handle get program accounts command
   */
  private async handleGetProgramAccounts(params: { programId: string }): Promise<ChatResponse> {
    const result = await walletOnlySolanaService.getProgramAccounts(params.programId);
    
    if (result.success) {
      const accounts = result.data;
      
      if (accounts.length === 0) {
        return {
          success: true,
          message: `📭 **No Program Accounts**\n\nProgram \`${params.programId}\` has no accounts.`,
          data: accounts,
          suggestedActions: [
            'Check another program',
            'Account info',
            'Network info'
          ]
        };
      }

      let message = `🔍 **Program Accounts**\n\n**Program:** \`${params.programId}\`\n**Total Accounts:** ${accounts.length}\n\n`;
      accounts.slice(0, 10).forEach((account, index) => {
        message += `**${index + 1}.** \`${account.pubkey}\`\n`;
        message += `   Owner: \`${account.owner}\`\n`;
        message += `   Space: ${account.space} bytes\n\n`;
      });

      if (accounts.length > 10) {
        message += `*... and ${accounts.length - 10} more accounts*`;
      }

      return {
        success: true,
        message,
        data: accounts,
        suggestedActions: [
          'Get account data',
          'Check another program',
          'Network info'
        ]
      };
    } else {
      return {
        success: false,
        message: `❌ **Failed to get program accounts**\n\n${result.error}`,
        error: result.error
      };
    }
  }

  /**
   * Handle get account data command
   */
  private async handleGetAccountData(params: { accountAddress: string }): Promise<ChatResponse> {
    const result = await walletOnlySolanaService.getAccountData(params.accountAddress);
    
    if (result.success) {
      return {
        success: true,
        message: `📊 **Account Data**\n\n**Address:** \`${result.data.address}\`\n**Owner:** \`${result.data.owner}\`\n**Executable:** ${result.data.executable ? 'Yes' : 'No'}\n**Lamports:** ${result.data.lamports}\n**Space:** ${result.data.space} bytes\n**Data Length:** ${result.data.dataLength} bytes`,
        data: result.data,
        suggestedActions: [
          'Get program accounts',
          'Account info',
          'Network info'
        ]
      };
    } else {
      return {
        success: false,
        message: `❌ **Failed to get account data**\n\n${result.error}`,
        error: result.error
      };
    }
  }

  /**
   * Handle get network info command
   */
  private async handleGetNetworkInfo(): Promise<ChatResponse> {
    const result = await solanaBackendService.getNetworkInfo();

    if (result.success) {
      return {
        success: true,
        message: `🌐 **Network Information**\n\n**Current Slot:** ${result.data!.slot}\n**Epoch:** ${result.data!.epoch}\n**Epoch Progress:** ${result.data!.epochProgress}\n**Cluster Version:** ${result.data!.clusterVersion}\n**RPC Endpoint:** \`${result.data!.rpcEndpoint}\``,
        data: result.data,
        suggestedActions: [
          'Account info',
          'Transaction history',
          'Check my balance'
        ]
      };
    } else {
      return {
        success: false,
        message: `❌ **Failed to get network info**\n\n${result.error}`,
        error: result.error
      };
    }
  }

  /**
   * Get help message
   */
  getHelpMessage(): string {
    return `🤖 **Solana AI Assistant**\n\nI can help you with Solana operations using your connected wallet:\n\n${this.getAvailableCommands().map(cmd => `• \`${cmd}\``).join('\n')}\n\n**Examples:**\n• \`Check my balance\`\n• \`Show my tokens\`\n• \`Transaction history\`\n• \`Account info\`\n• \`Network info\`\n\n**Note:** SOL transfers and message signing require direct wallet interaction and are not available through chat for security reasons.\n\n*Make sure your wallet is connected to use these commands.*`;
  }
}

// Export singleton instance
export const solanaAIChatService = new SolanaAIChatService();
export default solanaAIChatService;
