/**
 * AI-Powered dApp Integration Service
 * 
 * Enables natural language interaction with dApps through the AI chat.
 * 
 * Features:
 * - Parse user intents (search, open, execute, query, info)
 * - Match dApps based on natural language queries
 * - Generate suggested actions for dApp interactions
 * - Handle wallet-related queries
 * 
 * Used in ChatPage for AI-powered dApp discovery and interaction.
 * 
 * Note: This service is actively used in the chat interface.
 */
import { BitApp } from './BitAppService';
import { logger } from '../utils/logger';

export interface DAppAction {
  dappId: string;
  dappName: string;
  action: string;
  parameters?: Record<string, any>;
  requiresWallet: boolean;
  requiresConfirmation: boolean;
  confidence: number; // 0-1
}

export interface AIIntent {
  type: 'search' | 'open' | 'execute' | 'query' | 'info';
  dappCategory?: string;
  dappName?: string;
  action?: DAppAction;
  query?: string;
  confidence: number;
}

class AIDAppIntegrationService {
  private dapps: BitApp[] = [];

  /**
   * Load available dApps
   */
  setDApps(dapps: BitApp[]) {
    this.dapps = dapps;
    logger.debug('🤖 AI Service: Loaded', dapps.length, 'apps. Sample:', dapps.slice(0, 3).map(d => d.name));
  }

  /**
   * Parse natural language input into actionable intent
   */
  async parseIntent(userInput: string, walletConnected: boolean): Promise<{
    intent: AIIntent;
    response: string;
    suggestedActions?: Array<{ label: string; action: string; dappId?: string }>;
  }> {
    const input = userInput.toLowerCase().trim();

    // Pattern 0: Wallet/Balance queries (highest priority)
    if (this.matchesPattern(input, ['balance', 'wallet', 'my account', 'my address', 'my tokens', 'my assets', 'portfolio', 'holdings'])) {
      return this.handleWalletIntent(input, walletConnected);
    }

    // Pattern 1: Search/List dApps (only if dApp-related)
    if (this.isDAppSearchQuery(input)) {
      return this.handleSearchIntent(input);
    }

    // Pattern 2: Open/Launch dApp
    if (this.matchesPattern(input, ['open', 'launch', 'start', 'go to', 'take me to'])) {
      return this.handleOpenIntent(input, walletConnected);
    }

    // Pattern 3: Execute Action (swap, lend, borrow, buy, sell)
    if (this.matchesPattern(input, ['swap', 'trade', 'exchange', 'lend', 'borrow', 'stake', 'buy', 'sell'])) {
      return this.handleExecuteIntent(input, walletConnected);
    }

    // Pattern 4: Query/Info
    if (this.matchesPattern(input, ['what is', 'tell me about', 'explain', 'how does', 'info about'])) {
      return this.handleInfoIntent(input);
    }

    // Default: Pass to backend AI for general queries (confidence < 0.6)
    return this.handleGeneralIntent(input);
  }

  /**
   * Handle wallet/balance queries
   */
  private handleWalletIntent(input: string, walletConnected: boolean): {
    intent: AIIntent;
    response: string;
    suggestedActions?: Array<{ label: string; action: string; dappId?: string }>;
  } {
    if (!walletConnected) {
      return {
        intent: { type: 'query', confidence: 0.9 },
        response: '🔒 **Wallet Not Connected**\n\nTo check your balance and manage your assets, please connect your wallet first.\n\nOnce connected, I can help you:\n• View your token balances\n• Check portfolio value\n• Track transaction history\n• Manage your assets',
        suggestedActions: [
          { label: 'Connect Wallet', action: 'connect_wallet' },
          { label: 'View Dashboard', action: 'view_dashboard' }
        ]
      };
    }

    return {
      intent: { type: 'query', confidence: 0.9 },
      response: '💼 **Wallet Connected**\n\nI can help you check your wallet information. What would you like to see?\n\n• View your token balances on the **Dashboard**\n• Check detailed portfolio on the **Portfolio page**\n• View recent transactions\n• Check specific token balances',
      suggestedActions: [
        { label: 'View Dashboard', action: 'view_dashboard' },
        { label: 'View Portfolio', action: 'view_portfolio' },
        { label: 'Recent Transactions', action: 'view_transactions' }
      ]
    };
  }

  /**
   * Handle search/list dApps intent
   */
  private handleSearchIntent(input: string): {
    intent: AIIntent;
    response: string;
    suggestedActions?: Array<{ label: string; action: string; dappId?: string }>;
  } {
    logger.debug('🔍 AI Search: Query:', input, '| Available apps:', this.dapps.length);
    
    // Detect category
    let category: string | undefined;
    if (input.includes('defi') || input.includes('finance')) category = 'DeFi';
    if (input.includes('nft')) category = 'NFT';
    if (input.includes('tool') || input.includes('utility')) category = 'Tools';

    logger.debug('📁 AI Search: Detected category:', category || 'none');

    // Filter dApps
    let filteredDApps = this.dapps;
    if (category) {
      // Case-insensitive category matching
      filteredDApps = this.dapps.filter(d => d.category?.toLowerCase() === category.toLowerCase());
      logger.debug('📁 AI Search: After category filter:', filteredDApps.length, 'apps');
    }

    // Search by name/tag - but only if there are meaningful keywords
    const keywords = this.extractKeywords(input);
    logger.debug('🔑 AI Search: Extracted keywords:', keywords);
    
    // Only apply keyword filter if we have keywords AND either have a category already or keywords are specific
    if (keywords.length > 0 && !input.includes('all') && !input.includes('show me') && !input.includes('list')) {
      const beforeFilter = filteredDApps.length;
      filteredDApps = filteredDApps.filter(d => 
        keywords.some(k => 
          d.name.toLowerCase().includes(k) ||
          d.description.toLowerCase().includes(k) ||
          d.tags?.some(t => t.toLowerCase().includes(k))
        )
      );
      logger.debug('🔍 AI Search: Keyword filter reduced from', beforeFilter, 'to', filteredDApps.length);
    }

    logger.debug('🎯 AI Search: Final filtered count:', filteredDApps.length, 'apps');

    const response = filteredDApps.length > 0
      ? `I found ${filteredDApps.length} app${filteredDApps.length > 1 ? 's' : ''} ${category ? `in ${category}` : ''}:\n\n${filteredDApps.slice(0, 5).map((d, i) => `${i + 1}. **${d.name}** - ${d.description}`).join('\n')}`
      : `I couldn't find any apps matching "${input}". Try searching for "DeFi apps", "NFT marketplaces", or specific app names like "Uniswap".`;

    const suggestedActions = filteredDApps.slice(0, 3).map(d => ({
      label: `Open ${d.name}`,
      action: 'open_dapp',
      dappId: d.id
    }));

    logger.debug('💬 AI Search: Response generated with', suggestedActions.length, 'actions');

    return {
      intent: {
        type: 'search',
        dappCategory: category,
        confidence: 0.9
      },
      response,
      suggestedActions
    };
  }

  /**
   * Handle open/launch dApp intent
   */
  private handleOpenIntent(input: string, walletConnected: boolean): {
    intent: AIIntent;
    response: string;
    suggestedActions?: Array<{ label: string; action: string; dappId?: string }>;
  } {
    // Extract dApp name
    const dapp = this.findDAppByName(input);

    if (!dapp) {
      return {
        intent: { type: 'open', confidence: 0.5 },
        response: `I couldn't find that app. Here are some popular options:\n\n${this.dapps.slice(0, 5).map((d, i) => `${i + 1}. ${d.name}`).join('\n')}`,
        suggestedActions: this.dapps.slice(0, 3).map(d => ({
          label: `Open ${d.name}`,
          action: 'open_dapp',
          dappId: d.id
        }))
      };
    }

    const walletWarning = !walletConnected 
      ? '\n\n⚠️ **Note:** Connect your wallet first for full functionality.' 
      : '';

    return {
      intent: {
        type: 'open',
        dappName: dapp.name,
        confidence: 0.95
      },
      response: `Opening **${dapp.name}**...\n\n${dapp.description}${walletWarning}`,
      suggestedActions: [
        { label: `Launch ${dapp.name}`, action: 'open_dapp', dappId: dapp.id },
        { label: 'View Details', action: 'view_details', dappId: dapp.id }
      ]
    };
  }

  /**
   * Handle execute action intent (swap, lend, etc.)
   */
  private handleExecuteIntent(input: string, walletConnected: boolean): {
    intent: AIIntent;
    response: string;
    suggestedActions?: Array<{ label: string; action: string; dappId?: string }>;
  } {
    if (!walletConnected) {
      return {
        intent: { type: 'execute', confidence: 0.8 },
        response: '🔒 **Wallet Required**\n\nTo execute blockchain transactions, please connect your wallet first.',
        suggestedActions: [
          { label: 'Connect Wallet', action: 'connect_wallet' }
        ]
      };
    }

    // Detect action type
    let actionType = '';
    let suggestedDApp: BitApp | undefined;

    if (input.includes('swap') || input.includes('trade') || input.includes('exchange')) {
      actionType = 'swap';
      suggestedDApp = this.findDAppByName('uniswap') || this.findDAppByName('1inch');
    } else if (input.includes('lend') || input.includes('supply')) {
      actionType = 'lend';
      suggestedDApp = this.findDAppByName('aave') || this.findDAppByName('compound');
    } else if (input.includes('borrow')) {
      actionType = 'borrow';
      suggestedDApp = this.findDAppByName('aave') || this.findDAppByName('compound');
    } else if (input.includes('stake')) {
      actionType = 'stake';
      suggestedDApp = this.findDAppByName('lido');
    } else if (input.includes('buy') && input.includes('nft')) {
      actionType = 'buy_nft';
      suggestedDApp = this.findDAppByName('opensea');
    }

    if (!suggestedDApp) {
      return {
        intent: { type: 'execute', confidence: 0.6 },
        response: 'I understand you want to perform a transaction. Which protocol would you like to use?',
        suggestedActions: this.dapps.filter(d => d.category === 'DeFi').slice(0, 3).map(d => ({
          label: `Use ${d.name}`,
          action: 'open_dapp',
          dappId: d.id
        }))
      };
    }

    // Extract parameters (amount, tokens, etc.)
    const params = this.extractTransactionParams(input);

    const response = `I'll help you ${actionType} using **${suggestedDApp.name}**.\n\n` +
      (params.amount ? `Amount: ${params.amount}\n` : '') +
      (params.tokenFrom ? `From: ${params.tokenFrom}\n` : '') +
      (params.tokenTo ? `To: ${params.tokenTo}\n` : '') +
      `\n🔐 This will require your wallet signature.`;

    return {
      intent: {
        type: 'execute',
        dappName: suggestedDApp.name,
        action: {
          dappId: suggestedDApp.id,
          dappName: suggestedDApp.name,
          action: actionType,
          parameters: params,
          requiresWallet: true,
          requiresConfirmation: true,
          confidence: 0.85
        },
        confidence: 0.85
      },
      response,
      suggestedActions: [
        { label: `Execute on ${suggestedDApp.name}`, action: 'execute_action', dappId: suggestedDApp.id },
        { label: 'Review Details', action: 'review_transaction' }
      ]
    };
  }

  /**
   * Handle info/explanation intent
   */
  private handleInfoIntent(input: string): {
    intent: AIIntent;
    response: string;
    suggestedActions?: Array<{ label: string; action: string; dappId?: string }>;
  } {
    const dapp = this.findDAppByName(input);

    if (dapp) {
      return {
        intent: {
          type: 'info',
          dappName: dapp.name,
          confidence: 0.9
        },
        response: `**${dapp.name}**\n\n${dapp.description}\n\n` +
          `📊 Rating: ${dapp.rating}★\n` +
          `👥 Users: ${dapp.users}\n` +
          `🏷️ Category: ${dapp.category}\n` +
          (dapp.isVerified ? `✅ Verified\n` : '') +
          (dapp.tags ? `\nTags: ${dapp.tags.join(', ')}` : ''),
        suggestedActions: [
          { label: `Open ${dapp.name}`, action: 'open_dapp', dappId: dapp.id },
          { label: 'View Similar Apps', action: 'search_category' }
        ]
      };
    }

    // General Web3 info
    return {
      intent: { type: 'info', confidence: 0.7 },
      response: `I can explain Web3 concepts, dApps, and help you navigate the ecosystem. What would you like to know more about?`,
      suggestedActions: [
        { label: 'Explore DeFi Apps', action: 'search_category' },
        { label: 'Browse NFT Marketplaces', action: 'search_nft' },
        { label: 'Learn About Tools', action: 'search_tools' }
      ]
    };
  }

  /**
   * Handle general/fallback intent
   */
  private handleGeneralIntent(input: string): {
    intent: AIIntent;
    response: string;
    suggestedActions?: Array<{ label: string; action: string; dappId?: string }>;
  } {
    // Return low confidence so it gets passed to backend AI
    return {
      intent: { type: 'query', query: input, confidence: 0.4 },
      response: `I'm here to help you with Web3 apps and blockchain interactions. I currently have access to ${this.dapps.length} apps.\n\nYou can ask me to:\n• "Show me DeFi apps"\n• "Check my wallet balance"\n• "Open Uniswap"\n• "What is DeFi?"\n\nWhat would you like to know?`,
      suggestedActions: [
        { label: 'Browse All Apps', action: 'browse_apps' },
        { label: 'Check Balance', action: 'view_dashboard' },
        { label: 'View NFT Apps', action: 'search_nft' }
      ]
    };
  }

  /**
   * Check if query is actually about dApps (not just using "show"/"list")
   */
  private isDAppSearchQuery(input: string): boolean {
    const dappKeywords = ['app', 'dapp', 'defi', 'nft', 'protocol', 'marketplace', 'uniswap', 'aave', 'opensea', 'token', 'swap', 'exchange', 'lending', 'gaming'];
    const searchWords = ['show', 'list', 'find', 'search'];
    
    // Check if it has search words AND dapp-related keywords
    const hasSearchWord = searchWords.some(word => input.includes(word));
    const hasDAppKeyword = dappKeywords.some(keyword => input.includes(keyword));
    
    return hasSearchWord && hasDAppKeyword;
  }

  /**
   * Helper: Match input against patterns
   */
  private matchesPattern(input: string, patterns: string[]): boolean {
    return patterns.some(p => input.includes(p));
  }

  /**
   * Helper: Extract keywords from input
   */
  private extractKeywords(input: string): string[] {
    const stopWords = ['show', 'me', 'list', 'find', 'search', 'what', 'are', 'the', 'all', 'some', 'a', 'an'];
    return input
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w));
  }

  /**
   * Helper: Find dApp by name (fuzzy match)
   */
  private findDAppByName(input: string): BitApp | undefined {
    const normalized = input.toLowerCase();
    
    // Exact match
    let match = this.dapps.find(d => normalized.includes(d.name.toLowerCase()));
    if (match) return match;

    // Tag match
    match = this.dapps.find(d => 
      d.tags?.some(t => normalized.includes(t.toLowerCase()))
    );
    if (match) return match;

    // Partial match
    return this.dapps.find(d => 
      d.name.toLowerCase().split(' ').some(w => normalized.includes(w))
    );
  }

  /**
   * Helper: Extract transaction parameters from input
   */
  private extractTransactionParams(input: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Extract amount (e.g., "100", "0.5", "1000")
    const amountMatch = input.match(/(\d+\.?\d*)\s*(eth|usdc|usdt|dai|btc|matic|bnb)?/i);
    if (amountMatch) {
      params.amount = amountMatch[1];
      if (amountMatch[2]) params.tokenFrom = amountMatch[2].toUpperCase();
    }

    // Extract "from X to Y" or "X for Y"
    const swapMatch = input.match(/(from|of)\s+(\w+)\s+(to|for|into)\s+(\w+)/i);
    if (swapMatch) {
      params.tokenFrom = swapMatch[2].toUpperCase();
      params.tokenTo = swapMatch[4].toUpperCase();
    }

    return params;
  }

  /**
   * Execute a dApp action
   */
  async executeDAppAction(action: DAppAction, walletAddress?: string): Promise<{
    success: boolean;
    message: string;
    transactionHash?: string;
  }> {
    if (!walletAddress) {
      return {
        success: false,
        message: 'Wallet not connected'
      };
    }

    // This would integrate with actual dApp contracts
    // Return error until backend integration is ready
    logger.debug('Executing action:', action);

    return {
      success: false,
      message: 'dApp execution not yet implemented',
      error: 'Backend integration required'
    };
  }
}

export const aiDAppIntegration = new AIDAppIntegrationService();

