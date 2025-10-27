import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useBuiltInWallet } from '../hooks/useBuiltInWallet';
import { useAuthStore } from '../store/authStore';
import { STORAGE_KEYS } from '../constants/storage';
import { aiDAppIntegration } from '../services/AIDAppIntegrationService';
import { safeAppService } from '../services/SafeAppService';
import { solanaAIChatService } from '../services/SolanaAIChatService';
import { openDApp } from '../utils/tabManager';
import { Icons } from '../utils/iconUtils';
const { 
  Send, 
  Bot, 
  User, 
  Plus, 
  MessageSquare,
  Trash2,
  Copy,
  Check,
  Wallet,
  AlertCircle,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Search,
  BookOpen
} = Icons;

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  dappId?: string;
  suggestedActions?: Array<{ label: string; action: string; dappId?: string }>;
}

export const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  // Authentication status
  const { isAuthenticated } = useAuthStore();
  // Wallet connection status from built-in wallet system
  const { connectedWallets } = useBuiltInWallet();
  const isConnected = connectedWallets.length > 0;
  const walletInfo = connectedWallets.length > 0 ? { address: connectedWallets[0].address } : null;

  // Theme state based on wallet connection
  const theme = isConnected ? 'cyberpunk' : 'modern';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '👋 Hello! I\'m Safe AI, your intelligent Web3 companion.\n\n💬 **Chat Available:** You can ask me questions about Web3, DeFi, NFTs, and blockchain technology right now!\n\n🔒 **Wallet Features:** Connect your wallet using the wallet icon in the header to access:\n• Safe Vault management\n• dApp Store\n• Advanced Web3 interactions\n\nWhat would you like to know about Web3?',
      role: 'assistant',
      timestamp: new Date()
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [dappsLoaded, setDappsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load dApps on mount (only if authenticated)
  useEffect(() => {
    const loadDApps = async () => {
      // Only load dApps if user is authenticated
      if (!isAuthenticated) {
        console.log('⏭️ ChatPage: Skipping dApp loading - user not authenticated');
        return;
      }

      try {
        console.log('🔄 ChatPage: Loading dApps for AI...');
        const result = await safeAppService.getAllApps();
        console.log('📦 ChatPage: Got result:', result.success, 'Apps count:', result.data?.length);
        
        if (result.success && result.data) {
          aiDAppIntegration.setDApps(result.data);
          setDappsLoaded(true);
          console.log('✅ ChatPage: Loaded', result.data.length, 'apps into AI service');
        } else {
          console.warn('⚠️ ChatPage: Failed to load apps, result:', result);
        }
      } catch (error) {
        console.error('❌ ChatPage: Failed to load dApps:', error);
      }
    };
    loadDApps();
    
    // Add debug helper to window for troubleshooting
    (window as any).debugAuth = () => {
      const token = localStorage.getItem('jwtToken');
      const wallet = localStorage.getItem('walletAddress');
      const user = localStorage.getItem('user');
      
      console.log('🔍 Auth Debug Info:');
      console.log('JWT Token:', token ? 'Present' : 'Missing');
      console.log('Wallet Address:', wallet || 'Missing');
      console.log('User Data:', user ? JSON.parse(user) : 'Missing');
      console.log('Connected Wallets:', connectedWallets);
      console.log('Wallet Info:', walletInfo);
      
      return {
        hasToken: !!token,
        hasWallet: !!wallet,
        hasUser: !!user,
        token,
        wallet,
        user: user ? JSON.parse(user) : null
      };
    };
    
    // Add re-authentication helper
    (window as any).reauthWallet = async () => {
      if (connectedWallets.length === 0) {
        console.log('❌ No wallet connected');
        return;
      }
      
      const wallet = connectedWallets[0];
      console.log('🔄 Re-authenticating wallet:', wallet.address);
      
      try {
        // Check if MetaMask is available
        if (!window.ethereum) {
          console.error('❌ MetaMask not installed');
          return;
        }
        
        // Get nonce from backend
        const nonceResponse = await fetch('http://localhost:3001/api/auth/wallet/nonce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: wallet.address })
        });
        
        if (!nonceResponse.ok) {
          console.error('❌ Failed to get nonce');
          return;
        }
        
        const nonceData = await nonceResponse.json();
        if (!nonceData.success) {
          console.error('❌ Nonce request failed:', nonceData.error);
          return;
        }
        
        // Create message for signing
        const message = `Safe Browser wants you to sign in with your Ethereum account:
${wallet.address}

This is a secure authentication request.
URI: ${window.location.origin}
Version: 1
Chain ID: ${wallet.chainId}
Nonce: ${nonceData.data.nonce}
Issued At: ${new Date().toISOString()}`;
        
        // Request signature
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, wallet.address]
        });
        
        // Verify with backend
        const authResponse = await fetch('http://localhost:3001/api/auth/wallet/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: wallet.address,
            message,
            signature,
            chainId: wallet.chainId,
            provider: wallet.provider
          })
        });
        
        if (!authResponse.ok) {
          console.error('❌ Authentication failed');
          return;
        }
        
        const authData = await authResponse.json();
        if (authData.success) {
          // Store auth data
          localStorage.setItem('jwtToken', authData.data.token);
          localStorage.setItem('user', JSON.stringify(authData.data.user));
          localStorage.setItem('walletAddress', wallet.address);
          
          console.log('✅ Re-authentication successful!');
          console.log('🔄 Please refresh the page to update the chat');
        } else {
          console.error('❌ Authentication failed:', authData.error);
        }
      } catch (error) {
        console.error('❌ Re-authentication failed:', error);
      }
    };
  }, [connectedWallets, walletInfo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper to detect dApp queries
  const isDAppQuery = (input: string): boolean => {
    const lowerInput = input.toLowerCase();
    const dappKeywords = ['app', 'dapp', 'defi', 'nft', 'protocol', 'marketplace', 'uniswap', 'aave', 'opensea'];
    const searchWords = ['show', 'list', 'find', 'search'];
    
    const hasSearchWord = searchWords.some(word => lowerInput.includes(word));
    const hasDAppKeyword = dappKeywords.some(keyword => lowerInput.includes(keyword));
    
    return hasSearchWord && hasDAppKeyword;
  };

  // Helper to detect Solana commands
  const isSolanaQuery = (input: string): boolean => {
    const lowerInput = input.toLowerCase();
    const solanaKeywords = [
      'balance', 'token', 'tokens', 'history', 'transactions', 'account', 'info', 
      'wallet', 'slot', 'epoch', 'network'
    ];
    
    return solanaKeywords.some(keyword => lowerInput.includes(keyword));
  };

  // Generate general Web3 responses for users without wallet connection
  const generateGeneralResponse = async (input: string): Promise<string> => {
    const lowerInput = input.toLowerCase();
    
    // Web3 Education Responses
    if (lowerInput.includes('what is') || lowerInput.includes('explain')) {
      if (lowerInput.includes('blockchain')) {
        return `**Blockchain** is a distributed ledger technology that maintains a continuously growing list of records (blocks) that are linked and secured using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.

Key features:
• **Decentralized**: No single point of control
• **Immutable**: Records cannot be altered once added
• **Transparent**: All transactions are visible
• **Secure**: Cryptographically protected

Popular blockchains include Ethereum, Bitcoin, Polygon, and Solana. Each has unique features and use cases!`;
      }
      
      if (lowerInput.includes('defi') || lowerInput.includes('decentralized finance')) {
        return `**DeFi (Decentralized Finance)** refers to financial services built on blockchain networks that operate without traditional intermediaries like banks.

Key DeFi concepts:
• **DEXs**: Decentralized exchanges like Uniswap
• **Lending**: Platforms like Aave and Compound
• **Yield Farming**: Earning rewards by providing liquidity
• **Staking**: Locking tokens to secure networks
• **AMMs**: Automated Market Makers for trading

DeFi offers higher yields but also higher risks compared to traditional finance. Always do your research!`;
      }
      
      if (lowerInput.includes('nft')) {
        return `**NFTs (Non-Fungible Tokens)** are unique digital assets that represent ownership of specific items on the blockchain.

NFT characteristics:
• **Unique**: Each NFT is one-of-a-kind
• **Verifiable**: Ownership is provable on-chain
• **Tradeable**: Can be bought/sold on marketplaces
• **Programmable**: Can have built-in features

Popular NFT use cases:
• Digital art and collectibles
• Gaming items and characters
• Virtual real estate
• Identity and credentials
• Music and media

Notable marketplaces include OpenSea, Rarible, and Magic Eden!`;
      }
    }
    
    // General Web3 questions
    if (lowerInput.includes('wallet')) {
      return `**Crypto Wallets** are tools that allow you to interact with blockchain networks. They store your private keys and enable you to send, receive, and manage cryptocurrencies.

Types of wallets:
• **Hot Wallets**: Connected to internet (MetaMask, Coinbase Wallet)
• **Cold Wallets**: Offline storage (Ledger, Trezor)
• **Custodial**: Third-party manages keys (Coinbase, Binance)
• **Non-custodial**: You control keys (MetaMask, Trust Wallet)

**Security Tips:**
• Never share your seed phrase
• Use hardware wallets for large amounts
• Enable 2FA when available
• Keep software updated

Connect your wallet to access advanced features like vault management and dApp interactions!`;
    }
    
    if (lowerInput.includes('gas') || lowerInput.includes('transaction fee')) {
      return `**Gas fees** are the costs required to execute transactions on blockchain networks like Ethereum.

Gas basics:
• **Gas Price**: Amount you pay per unit of gas
• **Gas Limit**: Maximum gas you're willing to use
• **Total Cost**: Gas Price × Gas Limit

Factors affecting gas fees:
• Network congestion
• Transaction complexity
• Time of day
• Network upgrades

**Tips to save on gas:**
• Use Layer 2 solutions (Polygon, Arbitrum)
• Time transactions during low activity
• Use gas estimation tools
• Consider batch transactions

Gas fees vary by network - some chains like Polygon have much lower fees!`;
    }
    
    // Default response for general questions
    return `I'd be happy to help you learn about Web3! Here are some topics I can explain:

**Core Concepts:**
• Blockchain technology
• Cryptocurrencies and tokens
• Smart contracts
• Consensus mechanisms

**DeFi Topics:**
• Decentralized exchanges (DEXs)
• Yield farming and staking
• Liquidity pools
• Lending protocols

**NFTs & Digital Assets:**
• How NFTs work
• NFT marketplaces
• Digital collectibles
• Gaming NFTs

**Security & Best Practices:**
• Wallet security
• Avoiding scams
• Gas optimization
• Risk management

**Connect your wallet** to access advanced features like vault management, dApp interactions, and personalized portfolio tracking!

What specific Web3 topic interests you most?`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check if this is a dApp-related query that requires wallet connection
    if (isDAppQuery(inputValue) && !isConnected) {
      const dappWarningMessage: Message = {
        id: Date.now().toString(),
        content: '🔒 **Wallet Connection Required for dApp Interactions**\n\nTo interact with specific dApps, access the app store, or use vault features, please connect your wallet using the wallet icon in the header.\n\nHowever, I can still help you with general Web3 questions and explain dApps! What would you like to know about blockchain technology?',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, dappWarningMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if it's a Solana command first
      const isSolanaCommand = isSolanaQuery(currentInput);
      
      if (isSolanaCommand && isConnected) {
        // Handle Solana commands with wallet address
        const wallet = connectedWallets[0];
        if (wallet) {
          solanaAIChatService.setWalletAddress(wallet.address);
          const response = await solanaAIChatService.processCommand(currentInput);
          
          const assistantMessage: Message = {
            id: Date.now().toString(),
            content: response.message,
            role: 'assistant',
            timestamp: new Date(),
            suggestedActions: response.suggestedActions?.map(action => ({ 
              label: action, 
              action: action.toLowerCase().replace(/\s+/g, '_') 
            }))
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        }
      }

      // Check if it's a dApp search query (only case where we use local)
      const isDApp = isDAppQuery(currentInput);
      
      let aiResponse = '';
      let actions: any[] = [];

      if (isDApp) {
        // Only dApp searches use local data
        const { response, suggestedActions } = await aiDAppIntegration.parseIntent(
          currentInput,
          isConnected
        );
        aiResponse = response;
        actions = suggestedActions || [];
      } else {
        // ALL other queries go to backend AI - no wallet required for general chat
        try {
          const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1').replace('/api/v1', '');
          const primaryWallet = connectedWallets[0] || walletInfo;
          const token = localStorage.getItem('jwtToken');
          
          console.log('Making AI request to:', `${API_BASE_URL}/api/ai/chat/public`);
          console.log('Request body:', {
            message: currentInput,
            provider: localStorage.getItem(STORAGE_KEYS.SELECTED_AI_PROVIDER) || 'openai',
            context: {
              walletAddress: primaryWallet?.address || null,
              userId: 'anonymous'
            }
          });
          
          // Try backend AI first (works without authentication for general questions)
          const backendResponse = await fetch(`${API_BASE_URL}/api/ai/chat/public`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: currentInput,
              provider: localStorage.getItem(STORAGE_KEYS.SELECTED_AI_PROVIDER) || 'openai', // Use vault's selected provider
              context: {
                walletAddress: primaryWallet?.address || null,
                userId: 'anonymous'
              }
            }),
          });

          if (backendResponse.ok) {
            const data = await backendResponse.json();
            if (data.success && data.data?.message) {
              aiResponse = data.data.message;
            } else {
              aiResponse = 'Sorry, I encountered an issue processing your request. Please try again.';
            }
          } else if (backendResponse.status === 401) {
            // If backend requires auth, fall back to local AI response
            const generalResponse = await generateGeneralResponse(currentInput);
            aiResponse = generalResponse;
          } else {
            // If backend is down, fall back to local AI response
            const generalResponse = await generateGeneralResponse(currentInput);
            aiResponse = generalResponse;
          }
        } catch (backendError) {
          console.error('Backend AI error:', backendError);
          // Fall back to local AI response if backend is unavailable
          const generalResponse = await generateGeneralResponse(currentInput);
          aiResponse = generalResponse;
        }
      }

      // Add wallet context if connected
      if (isConnected && aiResponse) {
        const primaryWallet = connectedWallets[0] || walletInfo;
        if (primaryWallet?.address) {
          const walletInfo_ = `\n\n💼 Connected: ${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`;
          aiResponse += walletInfo_;
        }
      }

      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
        suggestedActions: actions
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        content: '❌ Sorry, I encountered an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = async (action: string, dappId?: string) => {
    if (action === 'browse_apps' || action === 'search_defi' || action === 'search_nft' || action === 'search_tools') {
      navigate('/safe-store');
      return;
    }

    if (action === 'connect_wallet') {
      navigate('/vault');
      const message: Message = {
        id: Date.now().toString(),
        content: '🔐 Please use the "Connect Wallet" button to connect your wallet.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, message]);
      return;
    }

    if (action === 'view_dashboard') {
      navigate('/home');
      return;
    }

    if (action === 'view_portfolio') {
      navigate('/portfolio');
      return;
    }

    if (action === 'view_transactions') {
      navigate('/home');
      const message: Message = {
        id: Date.now().toString(),
        content: '📊 Opening dashboard with your recent transactions...',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, message]);
      return;
    }

    if (action === 'open_dapp' && dappId) {
      // Define dApp URLs directly (no need to fetch from backend)
      const dappUrls: Record<string, { name: string; url: string }> = {
        'uniswap': { name: 'Uniswap', url: 'https://app.uniswap.org' },
        'aave': { name: 'Aave', url: 'https://app.aave.com' },
        'opensea': { name: 'OpenSea', url: 'https://opensea.io' },
        'curve': { name: 'Curve Finance', url: 'https://curve.fi' },
        'lido': { name: 'Lido', url: 'https://lido.fi' },
        'compound': { name: 'Compound', url: 'https://app.compound.finance' },
        '1inch': { name: '1inch', url: 'https://app.1inch.io' },
        'sushiswap': { name: 'SushiSwap', url: 'https://www.sushi.com' },
        'rarible': { name: 'Rarible', url: 'https://rarible.com' },
        'balancer': { name: 'Balancer', url: 'https://app.balancer.fi' },
        'snapshot': { name: 'Snapshot', url: 'https://snapshot.org' },
        'gnosis-safe': { name: 'Gnosis Safe', url: 'https://app.safe.global' }
      };

      const dapp = dappUrls[dappId];
      
      if (dapp) {
        const success = await openDApp(dapp.url, dapp.name);
        
        const confirmMessage: Message = {
          id: Date.now().toString(),
          content: success 
            ? `✅ Opened **${dapp.name}** in a new tab!`
            : `❌ Unable to open **${dapp.name}**. Please allow popups for this site.`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, confirmMessage]);
      } else {
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: `❌ Could not find app with ID: ${dappId}`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      return;
    }

    if (action === 'execute_action') {
      const confirmMessage: Message = {
        id: Date.now().toString(),
        content: '🔐 Transaction prepared. Please confirm in your wallet...',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMessage]);
      return;
    }

    // Fallback: Send action as text
    setInputValue(action.replace(/_/g, ' '));
  };

  const handleOldSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      let aiResponse;
      
      if (isConnected && walletInfo?.address) {
        // Use wallet-integrated AI if wallet is connected
        aiResponse = {
          response: `I can see you're connected with wallet ${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}. I understand you're asking about "${currentInput}". I can help you with wallet management, DeFi protocols, NFT trading, and more. What would you like to do?`,
          suggestedActions: [
            {
              action: 'view_balance',
              label: 'View Balance',
              description: 'Check your current wallet balance'
            },
            {
              action: 'explore_defi',
              label: 'Explore DeFi',
              description: 'Discover DeFi protocols and opportunities'
            },
            {
              action: 'nft_trading',
              label: 'NFT Trading',
              description: 'Browse and trade NFTs'
            }
          ]
        };
      } else {
        // Fallback to basic AI response
        aiResponse = {
          response: `I understand you're asking about "${currentInput}". To provide you with wallet-specific assistance, please connect your wallet first. I can help you with general Web3 questions, DeFi protocols, NFT trading, and more once you're connected.`,
          suggestedActions: [
            {
              action: 'connect_wallet',
              label: 'Connect Wallet',
              description: 'Connect your wallet to enable AI-assisted transactions'
            }
          ]
        };
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send AI message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const clearChat = () => {
    console.log('Clearing chat...');
    setMessages([
      {
        id: '1',
        content: '👋 Hello! I\'m Safe AI, your intelligent Web3 companion.\n\n💬 **AI Chat Available:** You can chat with me about Web3 topics without connecting a wallet!\n\n🔒 **Wallet Features:** Connect your wallet to access:\n• Personal vault management\n• dApp store interactions\n• Wallet-specific AI assistance\n\nWhat would you like to know about Web3?',
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
    console.log('Chat cleared successfully');
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? (isUser 
                    ? 'cyberpunk-gradient-bg cyberpunk-text-glow' 
                    : 'bg-green-500/20 border border-green-400/50 cyberpunk-text-glow')
                : (isUser ? 'bg-primary-600' : 'bg-secondary-100')
            }`}>
              {isUser ? (
                <User className={`w-4 h-4 ${theme === 'cyberpunk' ? 'text-white' : 'text-white'}`} />
              ) : (
                <Bot className={`w-4 h-4 ${
                  theme === 'cyberpunk' 
                    ? 'text-green-400' 
                    : 'text-secondary-600'
                }`} />
              )}
            </div>
          </div>
          
          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}>
            <div className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              theme === 'cyberpunk'
                ? (isUser 
                    ? 'cyberpunk-message-user' 
                    : 'cyberpunk-message-assistant')
                : (isUser 
                    ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                    : 'bg-white border border-secondary-200 text-secondary-900')
            }`}>
              <div className={`text-sm prose prose-sm max-w-none ${
                theme === 'cyberpunk' ? 'text-white' : ''
              }`}>
                <ReactMarkdown
                  components={{
                    // Custom rendering for better styling
                    p: ({node, ...props}) => <p className={`mb-2 last:mb-0 ${
                      theme === 'cyberpunk' ? 'text-white' : ''
                    }`} {...props} />,
                    ul: ({node, ...props}) => <ul className={`list-disc list-inside mb-2 ${
                      theme === 'cyberpunk' ? 'text-white' : ''
                    }`} {...props} />,
                    ol: ({node, ...props}) => <ol className={`list-decimal list-inside mb-2 ${
                      theme === 'cyberpunk' ? 'text-white' : ''
                    }`} {...props} />,
                    li: ({node, ...props}) => <li className={`mb-1 ${
                      theme === 'cyberpunk' ? 'text-white' : ''
                    }`} {...props} />,
                    strong: ({node, ...props}) => <strong className={`font-semibold ${
                      theme === 'cyberpunk' ? 'text-white' : ''
                    }`} {...props} />,
                    code: ({node, ...props}) => <code className={`px-1 py-0.5 rounded text-sm ${
                      theme === 'cyberpunk' 
                        ? 'bg-blue-500/20 text-white border border-blue-400/30' 
                        : 'bg-gray-100'
                    }`} {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
            
            {/* Suggested Action Buttons */}
            {!isUser && message.suggestedActions && message.suggestedActions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {message.suggestedActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleActionClick(action.action, action.dappId)}
                    className={`text-xs flex items-center gap-1 transition-all duration-300 ${
                      theme === 'cyberpunk' 
                        ? 'cyberpunk-button border-green-400/50 text-green-400 hover:border-green-400 hover:text-white' 
                        : ''
                    }`}
                  >
                    {action.label}
                    {action.dappId && <ExternalLink className="w-3 h-3" />}
                  </Button>
                ))}
              </div>
            )}
            
            {/* Message Actions */}
            <div className={`flex items-center space-x-2 mt-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className={`text-xs ${
                theme === 'cyberpunk' 
                  ? 'text-white/60 cyberpunk-font' 
                  : 'text-secondary-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </span>
              {!isUser && (
                <button
                  onClick={() => copyToClipboard(message.content, message.id)}
                  className="text-xs text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  {copiedMessageId === message.id ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          </div>
      </div>
    </div>
  );
  };

  // Main component return
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 mt-8 ${theme === 'cyberpunk' ? 'cyberpunk-card p-6' : ''}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            theme === 'cyberpunk' 
              ? 'cyberpunk-gradient-bg cyberpunk-text-glow' 
              : 'blue-purple-icon-gradient shadow-glow'
          }`}>
            <MessageSquare className={`w-5 h-5 ${
              theme === 'cyberpunk' 
                ? 'text-white' 
                : 'text-primary-600'
            }`} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${
              theme === 'cyberpunk' 
                ? 'cyberpunk-font cyberpunk-gradient-text cyberpunk-text-glow' 
                : 'text-gradient bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent'
            }`}>
              Safe AI
            </h1>
            <p className={`${
              theme === 'cyberpunk' 
                ? 'text-white/80 cyberpunk-font cyberpunk-text-glow' 
                : 'text-secondary-600'
            }`}>
              {theme === 'cyberpunk' ? 'SAFE INTERFACE ACTIVE' : 'Let\'s get started...'}
            </p>
            {isConnected && walletInfo?.address && (
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  theme === 'cyberpunk' 
                    ? 'bg-green-400 cyberpunk-text-glow' 
                    : 'bg-green-500'
                }`}></div>
                <span className={`text-xs ${
                  theme === 'cyberpunk' 
                    ? 'text-green-400 cyberpunk-font' 
                    : 'text-green-600'
                }`}>
                  {theme === 'cyberpunk' ? 'SAFE LINK: ' : 'Wallet Connected: '}
                  {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <Button
              onClick={clearChat}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      <Card className={`shadow-lg transition-all duration-500 ${
        theme === 'cyberpunk' 
          ? 'cyberpunk-card' 
          : ''
      }`}>
        <CardContent className={`p-0 ${
          theme === 'cyberpunk' 
            ? 'bg-transparent' 
            : ''
        }`}>
          {/* Messages Container */}
          <div 
            ref={messagesContainerRef}
            className={`h-[calc(100vh-280px)] overflow-y-auto p-6 space-y-4 transition-all duration-500 ${
              theme === 'cyberpunk' 
                ? 'bg-transparent' 
                : 'bg-gradient-to-br from-white to-primary-50/30'
            }`}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 blue-purple-icon-gradient rounded-full flex items-center justify-center mb-4 shadow-glow">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-700 mb-2">
                  Welcome to Safe AI
                </h3>
                <p className="text-secondary-500 max-w-md mb-6">
                  Your intelligent assistant for Web3. Ask me anything about blockchain, DeFi, NFTs, or connect your wallet for personalized insights.
                </p>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                  <button
                    onClick={() => setInputValue("What can you help me with?")}
                    className="p-4 text-left border-2 border-primary-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all"
                  >
                    <HelpCircle className="w-5 h-5 text-primary-600 mb-2" />
                    <p className="text-sm font-medium text-secondary-700">What can you do?</p>
                  </button>
                  <button
                    onClick={() => setInputValue("Find DeFi apps for lending")}
                    className="p-4 text-left border-2 border-primary-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all"
                  >
                    <Search className="w-5 h-5 text-primary-600 mb-2" />
                    <p className="text-sm font-medium text-secondary-700">Find DeFi Apps</p>
                  </button>
                  <button
                    onClick={() => setInputValue("Explain blockchain technology")}
                    className="p-4 text-left border-2 border-primary-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all"
                  >
                    <BookOpen className="w-5 h-5 text-primary-600 mb-2" />
                    <p className="text-sm font-medium text-secondary-700">Learn About Web3</p>
                  </button>
                  <button
                    onClick={() => setInputValue("Show my wallet balance")}
                    className="p-4 text-left border-2 border-primary-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all"
                  >
                    <Wallet className="w-5 h-5 text-primary-600 mb-2" />
                    <p className="text-sm font-medium text-secondary-700">Check Balance</p>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="flex max-w-3xl">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary-100">
                          <Bot className="w-5 h-5 text-secondary-600" />
                        </div>
                      </div>
                      <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-secondary-100">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input Area */}
          <div className={`border-t p-4 transition-all duration-500 ${
            theme === 'cyberpunk' 
              ? 'border-green-400/30 bg-transparent' 
              : 'border-secondary-200 bg-white'
          }`}>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={theme === 'cyberpunk' ? "Enter Safe command..." : "Ask me anything about Web3, DeFi, NFTs..."}
                  disabled={isLoading}
                  className={`resize-none transition-all duration-300 ${
                    theme === 'cyberpunk' 
                      ? 'cyberpunk-input' 
                      : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="md"
                className={`transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'cyberpunk-button' 
                    : ''
                }`}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
