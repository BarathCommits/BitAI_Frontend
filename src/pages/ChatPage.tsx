/**
 * Chat Page Component
 * 
 * Main AI chat interface - the landing page for the MVP.
 * 
 * Features:
 * - AI chat with multiple providers (OpenAI, Gemini, Claude, Cohere, HuggingFace)
 * - Wallet integration for authentication
 * - Transaction preview and signing
 * - Message history and session management
 * - Usage tracking and limits
 * - Code syntax highlighting
 * - Markdown rendering
 * 
 * This is the primary user-facing page in the MVP.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useBuiltInWallet } from '../hooks/useBuiltInWallet';
import { useAuthStore } from '../store/authStore';
import { STORAGE_KEYS } from '../constants/storage';
import { aiDAppIntegration } from '../services/AIDAppIntegrationService';
import { bitAppService } from '../services/BitAppService';
import { authService } from '../services/AuthService';
import { openDApp } from '../utils/tabManager';
import { Icons } from '../utils/iconUtils';
import { usageTrackingService } from '../services/UsageTrackingService';
// Session management commented out for MVP - to be released later
// import { chatSessionService, ChatSession, SessionWithMessages } from '../services/ChatSessionService';
// import { SessionListSidebar } from '../components/chat/SessionListSidebar';
import { MessageFeedback } from '../components/chat/MessageFeedback';
import { TransactionPreview } from '../components/chat/TransactionPreview';
import { TransactionSigningModal } from '../components/chat/TransactionSigningModal';
import { analyticsService } from '../services/AnalyticsService';
import { APP_CONFIG } from '../constants/app';
import { logger } from '../utils/logger';
import { sanitizeInput, validateMessageLength } from '../utils/sanitize';

const ALLOWED_AI_PROVIDERS = ['openai', 'gemini', 'claude', 'cohere', 'huggingface'] as const;
const GENERAL_SESSION_STORAGE_KEY = APP_CONFIG.CHAT.SESSION_STORAGE_KEY;
const DEFAULT_FREE_WALLET_LIMIT = APP_CONFIG.CHAT.DEFAULT_FREE_WALLET_LIMIT;

let cachedGeneralSessionId: string | null = null;

const sanitizeProvider = (raw?: string | null): string | null => {
  if (!raw) return null;
  const normalized = raw.toLowerCase().trim();
  return ALLOWED_AI_PROVIDERS.includes(normalized) ? normalized : null;
};

const generateGuestSessionId = (): string => {
  const randomId =
    typeof window !== 'undefined' &&
    window.crypto &&
    'randomUUID' in window.crypto
      ? window.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `guest-${randomId}`;
};

const getGeneralSessionId = (): string => {
  if (cachedGeneralSessionId) {
    return cachedGeneralSessionId;
  }

  if (typeof window === 'undefined') {
    cachedGeneralSessionId = generateGuestSessionId();
    return cachedGeneralSessionId;
  }

  let sessionId = '';
  try {
    sessionId = localStorage.getItem(GENERAL_SESSION_STORAGE_KEY) || '';
  } catch (error) {
    logger.warn('Unable to read general session ID from storage:', error);
  }

  if (!sessionId || sessionId.length < 12) {
    sessionId = generateGuestSessionId();
    try {
      localStorage.setItem(GENERAL_SESSION_STORAGE_KEY, sessionId);
    } catch (error) {
      logger.warn('Unable to persist general session ID:', error);
    }
  }

  cachedGeneralSessionId = sessionId;
  return sessionId;
};

const callGeneralAssistant = async (
  input: string,
  baseWithVersion: string,
  options: { isWalletConnected: boolean; isAuthenticated: boolean; walletAddress?: string; token?: string }
): Promise<{ message: string; actions: string[]; transaction?: import('../types').FunctionCallTransaction }> => {
  const { isWalletConnected, isAuthenticated, walletAddress, token } = options;
  const sessionId = getGeneralSessionId();
  const payload: any = {
    message: input,
    sessionId,
    context: {
      sessionId,
      source: 'bitai_frontend',
      initiatedAt: new Date().toISOString()
    }
  };

  // Include wallet address if available (enables function calling for authenticated users)
  if (walletAddress) {
    payload.walletAddress = walletAddress;
  }

  const endpoint = `${baseWithVersion}/ai/general-chat`;

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    const trimmed = responseText.trim();

    if (!response.ok) {
      return {
        message: '⚠️ I\'m having trouble connecting right now. Please try again in a moment, or check your internet connection.',
        actions: []
      };
    }

    if (!trimmed || !(trimmed.startsWith('{') || trimmed.startsWith('['))) {
      return {
        message: '⚠️ I\'m having trouble connecting right now. Please try again in a moment, or check your internet connection.',
        actions: []
      };
    }

    const data = JSON.parse(trimmed);
    const responseData = data?.data || data;
    const message = responseData?.response || responseData?.message || data?.message;

    if (!message) {
      return {
        message: '⚠️ I\'m having trouble connecting right now. Please try again in a moment, or check your internet connection.',
        actions: []
      };
    }

    // Parse transaction data if present (for function calling)
    let transaction: import('../types').FunctionCallTransaction | undefined;
    if (responseData?.transaction) {
      const tx = responseData.transaction;
      transaction = {
        id: tx.id || `tx-${Date.now()}`,
        type: tx.type || 'solana',
        operation: tx.operation || tx.functionName || 'unknown',
        rawTransaction: tx.rawTransaction || tx.transaction,
        transactionData: tx.transactionData || {
          from: tx.from,
          to: tx.to,
          amount: tx.amount,
          token: tx.token,
          contractAddress: tx.contractAddress,
          functionName: tx.functionName,
          parameters: tx.parameters
        },
        description: tx.description || tx.message,
        estimatedFee: tx.estimatedFee || tx.fee,
        requiresSigning: tx.requiresSigning !== false
      };
    }

    // Only include suggested actions from backend response, not automatic ones
    const actions: string[] = [];
    if (responseData?.suggestedActions && Array.isArray(responseData.suggestedActions)) {
      actions.push(...responseData.suggestedActions.filter((action: any) => typeof action === 'string'));
    } else if (data?.suggestedActions && Array.isArray(data.suggestedActions)) {
      actions.push(...data.suggestedActions.filter((action: any) => typeof action === 'string'));
    }

    return {
      message,
      actions,
      transaction
    };
  } catch (error) {
    // Silently handle connection errors - backend may be unavailable
    return {
      message: '⚠️ I\'m having trouble connecting right now. Please try again in a moment, or check your internet connection.',
      actions: []
    };
  }
};

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
  transaction?: import('../types').FunctionCallTransaction;
  transactionStatus?: import('../types').TransactionStatus;
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

  // Separate sessions: main session (no wallet) and wallet session (wallet connected)
  const [mainSessionMessages, setMainSessionMessages] = useState<Message[]>([
    {
      id: '1',
      content: '👋 Hello! I\'m bitAI, your intelligent Web3 companion.\n\n💬 You can ask me any questions and you will get the response from a Web3 perspective.\n\nWhat would you like to know about Web3?',
      role: 'assistant',
      timestamp: new Date()
    },
  ]);
  const [walletSessionMessages, setWalletSessionMessages] = useState<Message[]>([]);

  // Use the appropriate messages based on connection status
  const messages = isConnected ? walletSessionMessages : mainSessionMessages;
  const setMessages = isConnected ? setWalletSessionMessages : setMainSessionMessages;

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [dappsLoaded, setDappsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [signingTransaction, setSigningTransaction] = useState<{ transaction: import('../types').FunctionCallTransaction; messageId: string } | null>(null);
  
  // Session management state - Commented out for MVP - to be released later
  // const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  // const [sessions, setSessions] = useState<ChatSession[]>([]);
  // const [sessionLoading, setSessionLoading] = useState(false);
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollToBottom = useCallback((instant = false) => {
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: instant ? 'auto' : 'smooth',
          block: 'end'
        });
      }
    }, instant ? 0 : 100);
  }, []);

  // Initialize wallet session greeting when wallet connects
  useEffect(() => {
    if (isConnected && walletSessionMessages.length === 0) {
      setWalletSessionMessages([
        {
          id: '1',
          content: '👋 Hello! I\'m bitAI, your Web3 companion.\n\n💬 You can ask me any questions and you will get the response from a Web3 perspective.\n\nWhat would you like to explore?',
          role: 'assistant',
          timestamp: new Date()
        },
      ]);
    }
  }, [isConnected]);

  // Load dApps on mount (only if authenticated)
  useEffect(() => {
    const loadDApps = async () => {
      // Only load dApps if user is authenticated
      if (!isAuthenticated) {
        logger.debug('ChatPage: Skipping dApp loading - user not authenticated');
        return;
      }

      try {
        logger.debug('ChatPage: Loading dApps for AI...');
        const result = await bitAppService.getAllApps();
        logger.debug('ChatPage: Got result:', { success: result.success, count: result.data?.length });
        
        if (result.success && result.data) {
          aiDAppIntegration.setDApps(result.data);
          setDappsLoaded(true);
          logger.info('ChatPage: Loaded apps into AI service', { count: result.data.length });
        } else {
          // Silently handle - backend may be unavailable
        }
      } catch (error) {
        logger.error('ChatPage: Failed to load dApps', error);
      }
    };
    loadDApps();
    
    // Add debug helper to window for troubleshooting
    (window as any).debugAuth = () => {
      const token = localStorage.getItem('jwtToken');
      const wallet = localStorage.getItem('walletAddress');
      const user = localStorage.getItem('user');
      
      const debugInfo = {
        hasToken: !!token,
        hasWallet: !!wallet,
        hasUser: !!user,
        token: token ? 'Present' : 'Missing',
        wallet: wallet || 'Missing',
        user: user ? JSON.parse(user) : null,
        connectedWallets,
        walletInfo
      };
      
      logger.debug('Auth Debug Info:', debugInfo);
      
      return debugInfo;
    };
    
    // Add re-authentication helper
    (window as any).reauthWallet = async () => {
      if (connectedWallets.length === 0) {
        logger.warn('Re-authentication: No wallet connected');
        return;
      }
      
      const wallet = connectedWallets[0];
      logger.info('Re-authenticating wallet:', wallet.address);
      
      try {
        // Check if MetaMask is available
        if (!window.ethereum) {
          logger.error('Re-authentication: MetaMask not installed');
          return;
        }
        
        // Get nonce from backend
        const nonceResponse = await fetch('http://localhost:3001/api/auth/wallet/nonce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: wallet.address })
        });
        
        if (!nonceResponse.ok) {
          logger.error('Re-authentication: Failed to get nonce');
          return;
        }
        
        // Check content type before parsing
        const nonceContentType = nonceResponse.headers.get('content-type') || '';
        if (!nonceContentType.includes('application/json')) {
          logger.error('Re-authentication: Nonce endpoint returned non-JSON response');
          return;
        }
        
        const nonceData = await nonceResponse.json();
        if (!nonceData.success) {
          logger.error('Re-authentication: Nonce request failed', nonceData.error);
          return;
        }
        
        // Create message for signing
        const message = `BitAI Browser wants you to sign in with your Ethereum account:
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
          logger.error('Re-authentication: Authentication failed');
          return;
        }
        
        // Check content type before parsing
        const authContentType = authResponse.headers.get('content-type') || '';
        if (!authContentType.includes('application/json')) {
          logger.error('Re-authentication: Auth endpoint returned non-JSON response');
          return;
        }
        
        const authData = await authResponse.json();
        if (authData.success) {
          // Store auth data
          localStorage.setItem('jwtToken', authData.data.token);
          localStorage.setItem('user', JSON.stringify(authData.data.user));
          localStorage.setItem('walletAddress', wallet.address);
          
          logger.info('Re-authentication successful! Please refresh the page to update the chat');
        } else {
          logger.error('Re-authentication: Authentication failed', authData.error);
        }
      } catch (error) {
        logger.error('Re-authentication: Failed', error);
      }
    };
  }, [connectedWallets, walletInfo]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-scroll when loading state changes (AI response starts/ends)
  useEffect(() => {
    if (isLoading) {
      // Scroll when AI starts responding
      scrollToBottom(true);
    } else {
      // Scroll when AI finishes responding
      scrollToBottom();
    }
  }, [isLoading, scrollToBottom]);

  // Session management functions - Commented out for MVP - to be released later
  /*
  const loadSessions = async () => {
    // Check both store state and token validity
    if (!isAuthenticated || !authService.isAuthenticated()) return;
    
    setSessionLoading(true);
    try {
      const result = await chatSessionService.listSessions();
      if (result.success && result.data) {
        setSessions(result.data);
      }
    } catch (error) {
      logger.error('Failed to load sessions:', error);
    } finally {
      setSessionLoading(false);
    }
  };

  const initializeSession = async () => {
    // Check both store state and token validity
    if (!isAuthenticated || !authService.isAuthenticated()) return;

    setSessionLoading(true);
    try {
      // Try to get active session
      const activeResult = await chatSessionService.getActiveSession();
      if (activeResult.success && activeResult.data) {
        setCurrentSessionId(activeResult.data.id);
        // Convert backend messages to frontend format
        const convertedMessages: Message[] = activeResult.data.messages?.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.timestamp || Date.now()),
          suggestedActions: msg.metadata?.suggestedActions
        })) || [];
        setMessages(convertedMessages);
        // Scroll to bottom when loading session messages
        setTimeout(() => scrollToBottom(true), 100);
      } else {
        // No active session, create one on first message
        setCurrentSessionId(null);
      }
      
      // Load all sessions
      await loadSessions();
    } catch (error) {
      logger.error('Failed to initialize session:', error);
    } finally {
      setSessionLoading(false);
    }
  };

  const createNewSession = async () => {
    if (!isAuthenticated || !authService.isAuthenticated()) {
      toast.error('Please sign in to create sessions');
      return;
    }

    setSessionLoading(true);
    try {
      const result = await chatSessionService.createSession('New Chat');
      if (result.success && result.data) {
        setCurrentSessionId(result.data.id);
        setMessages([]);
        await loadSessions();
        
        // Track session creation
        analyticsService.trackSessionCreate(result.data.id);
        
        toast.success('New chat session created');
      } else {
        toast.error(result.error?.message || 'Failed to create session');
      }
    } catch (error) {
      toast.error('Failed to create session');
    } finally {
      setSessionLoading(false);
    }
  };

  const switchToSession = async (sessionId: string) => {
    if (!isAuthenticated || !authService.isAuthenticated()) return;

    setSessionLoading(true);
    try {
      const result = await chatSessionService.getSession(sessionId);
      if (result.success && result.data) {
        setCurrentSessionId(sessionId);
        // Convert backend messages to frontend format
        const convertedMessages: Message[] = result.data.messages?.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.timestamp || Date.now()),
          suggestedActions: msg.metadata?.suggestedActions
        })) || [];
        setMessages(convertedMessages);
        
        // Scroll to bottom when switching sessions
        setTimeout(() => scrollToBottom(true), 100);
        
        // Track session switch
        analyticsService.trackSessionSwitch(sessionId);
      } else {
        toast.error(result.error?.message || 'Failed to load session');
      }
    } catch (error) {
      toast.error('Failed to load session');
    } finally {
      setSessionLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!isAuthenticated || !authService.isAuthenticated()) return;

    setSessionLoading(true);
    try {
      const result = await chatSessionService.deleteSession(sessionId);
      if (result.success) {
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setMessages([]);
        }
        await loadSessions();
        toast.success('Session deleted');
      } else {
        toast.error(result.error?.message || 'Failed to delete session');
      }
    } catch (error) {
      toast.error('Failed to delete session');
    } finally {
      setSessionLoading(false);
    }
  };

  const archiveSession = async (sessionId: string) => {
    if (!isAuthenticated || !authService.isAuthenticated()) return;

    setSessionLoading(true);
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      const result = await chatSessionService.updateSession(sessionId, {
        isArchived: !session.isArchived
      });
      if (result.success) {
        await loadSessions();
        toast.success(session.isArchived ? 'Session unarchived' : 'Session archived');
      } else {
        toast.error(result.error?.message || 'Failed to update session');
      }
    } catch (error) {
      toast.error('Failed to archive session');
    } finally {
      setSessionLoading(false);
    }
  };

  const renameSession = async (sessionId: string, newTitle: string) => {
    if (!isAuthenticated || !authService.isAuthenticated()) return;

    setSessionLoading(true);
    try {
      const result = await chatSessionService.updateSession(sessionId, {
        title: newTitle
      });
      if (result.success) {
        await loadSessions();
        toast.success('Session renamed');
      } else {
        toast.error(result.error?.message || 'Failed to rename session');
      }
    } catch (error) {
      toast.error('Failed to rename session');
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && authService.isAuthenticated()) {
      initializeSession();
    } else {
      setCurrentSessionId(null);
      setSessions([]);
    }
  }, [isAuthenticated]);
  */

  // Helper to detect dApp queries
  const isDAppQuery = (input: string): boolean => {
    const lowerInput = input.toLowerCase();
    const dappKeywords = ['app', 'dapp', 'defi', 'nft', 'protocol', 'marketplace', 'uniswap', 'aave', 'opensea'];
    const searchWords = ['show', 'list', 'find', 'search'];
    
    const hasSearchWord = searchWords.some(word => lowerInput.includes(word));
    const hasDAppKeyword = dappKeywords.some(keyword => lowerInput.includes(keyword));
    
    return hasSearchWord && hasDAppKeyword;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Validate and sanitize input
    const sanitizedInput = sanitizeInput(inputValue.trim());
    if (!sanitizedInput) {
      toast.error('Invalid input. Please try again.');
      return;
    }

    if (!validateMessageLength(sanitizedInput, APP_CONFIG.CHAT.MAX_MESSAGE_LENGTH)) {
      toast.error(`Message too long. Maximum ${APP_CONFIG.CHAT.MAX_MESSAGE_LENGTH} characters allowed.`);
      return;
    }

    // Wallet connection check removed for MVP - to be released later
    // if (isDAppQuery(sanitizedInput) && !isConnected) {
    //   const dappWarningMessage: Message = {
    //     id: Date.now().toString(),
    //     content: '🔒 **Wallet Connection Required for dApp Interactions**\n\nTo interact with specific dApps or access the app store, please connect your wallet using the wallet icon in the header.\n\nHowever, I can still help you with general Web3 questions and explain dApps! What would you like to know about blockchain technology?',
    //     role: 'assistant',
    //     timestamp: new Date()
    //   };
    //   setMessages(prev => [...prev, dappWarningMessage]);
    //   return;
    // }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: sanitizedInput,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    
    // Scroll immediately when user sends a message
    scrollToBottom(true);

    try {

      const isDApp = isDAppQuery(currentInput);

      const rawApiUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1').trim().replace(/\/+$/, '');
      const hasApiPrefix = /\/api\/v1$/i.test(rawApiUrl);
      const baseWithVersion = hasApiPrefix ? rawApiUrl : `${rawApiUrl}/api/v1`;
      const token = authService.getToken();
      const tokenValid = token ? authService.isAuthenticated() : false;
      const selectedProvider = sanitizeProvider(localStorage.getItem(STORAGE_KEYS.SELECTED_AI_PROVIDER));
      
      // Session management removed for MVP - always use general session
      const sessionId = getGeneralSessionId();

      let aiResponse = '';
      let actions: string[] = [];
      let transaction: import('../types').FunctionCallTransaction | undefined;

      if (isDApp) {
        const { response, suggestedActions } = await aiDAppIntegration.parseIntent(
          currentInput,
          isConnected
        );
        aiResponse = response;
        actions = suggestedActions || [];
      } else {
        const primaryWallet = connectedWallets[0] || walletInfo;
        const walletAddress = primaryWallet?.address || authService.getWalletAddress();

        if (!token || !tokenValid) {
          const generalResult = await callGeneralAssistant(currentInput, baseWithVersion, {
            isWalletConnected: isConnected,
            isAuthenticated: false,
            walletAddress: walletAddress || undefined,
            token: token || undefined
          });
          // Use general response as-is (backend handles headers)
          aiResponse = generalResult.message;
          actions = generalResult.actions;
          transaction = generalResult.transaction;
        } else {
          const requestContext: Record<string, any> = {
            walletAddress: walletAddress || null,
            chainId: primaryWallet?.chainId || 101,
            source: 'bitai_frontend',
            initiatedAt: new Date().toISOString(),
            sessionId
          };

          const requestPayload: Record<string, any> = {
            message: currentInput,
            context: requestContext
          };

          if (selectedProvider) {
            requestPayload.provider = selectedProvider;
          }

          const endpoint = `${baseWithVersion}/ai/chat`;

          const callAuthenticatedChat = async (): Promise<void> => {
            const headers: HeadersInit = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            };

            try {
              const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestPayload),
              });

              const responseText = await response.text();
              const trimmed = responseText.trim();

              if (!response.ok) {
                let parsedError: any = null;
                try {
                  parsedError = trimmed ? JSON.parse(trimmed) : null;
                } catch {
                  // Ignore parse errors
                }

                if (response.status === 402 && parsedError) {
                  const upgradeMessage = parsedError?.message || parsedError?.error?.message || '�� Free tier limit reached. Please upgrade to continue.';
                  const freeLimit = typeof parsedError?.freeLimit === 'number' ? parsedError.freeLimit : DEFAULT_FREE_WALLET_LIMIT;
                  const attemptsUsed = typeof parsedError?.attemptsUsed === 'number' ? parsedError.attemptsUsed : undefined;
                  aiResponse = upgradeMessage;
                  if (typeof attemptsUsed === 'number') {
                    aiResponse += `\n\nFree attempts used: ${attemptsUsed}/${freeLimit}`;
                  }
                  // actions = ['Upgrade to Pro', 'Go to Vault']; // Commented out vault action for MVP
                  actions = ['Upgrade to Pro'];
                  return;
                }

                aiResponse = '⚠️ I\'m having trouble connecting right now. Please try again in a moment, or check your internet connection.';
                return;
              }

              if (!trimmed || !(trimmed.startsWith('{') || trimmed.startsWith('['))) {
                aiResponse = '⚠️ I\'m having trouble connecting right now. Please try again in a moment, or check your internet connection.';
                return;
              }

              let data: any;
              try {
                data = JSON.parse(trimmed);
              } catch (parseError) {
                aiResponse = '⚠️ I\'m having trouble connecting right now. Please try again in a moment, or check your internet connection.';
                return;
              }

              const payload = data?.data ?? data;
              const messageText = payload?.response || payload?.message || data?.message || data?.response;

              if (!messageText) {
                aiResponse = '⚠️ I\'m having trouble connecting right now. Please try again in a moment, or check your internet connection.';
                return;
              }

              // Use Web3 response as-is (backend already adds headers)
              aiResponse = messageText;

              // Parse transaction data if present (for function calling)
              if (payload?.transaction) {
                const tx = payload.transaction;
                transaction = {
                  id: tx.id || `tx-${Date.now()}`,
                  type: tx.type || 'solana',
                  operation: tx.operation || tx.functionName || 'unknown',
                  rawTransaction: tx.rawTransaction || tx.transaction,
                  transactionData: tx.transactionData || {
                    from: tx.from,
                    to: tx.to,
                    amount: tx.amount,
                    token: tx.token,
                    contractAddress: tx.contractAddress,
                    functionName: tx.functionName,
                    parameters: tx.parameters
                  },
                  description: tx.description || tx.message,
                  estimatedFee: tx.estimatedFee || tx.fee,
                  requiresSigning: tx.requiresSigning !== false
                };
              }

              if (Array.isArray(payload?.suggestedActions)) {
                actions = payload.suggestedActions
                  .filter((action: any) => typeof action === 'string' && action.trim().length > 0)
                  .map((action: string) => action);
              }

              const usageInfo = payload?.usage;
              if (usageInfo && typeof usageInfo.attemptsRemaining === 'number' && usageInfo.attemptsRemaining !== null) {
                const freeLimit = typeof usageInfo.freeLimit === 'number' ? usageInfo.freeLimit : DEFAULT_FREE_WALLET_LIMIT;
                const attemptsRemaining = Math.max(0, usageInfo.attemptsRemaining);
                aiResponse += `\n\n🔓 Free attempts remaining: ${attemptsRemaining}/${freeLimit}`;
              }
            } catch (endpointError: any) {
              aiResponse = '⚠️ I\'m having trouble connecting right now. Please try again in a moment, or check your internet connection.';
            }
          };

          await callAuthenticatedChat();
        }
      }

      if (isConnected && aiResponse) {
        const primaryWallet = connectedWallets[0] || walletInfo;
        if (primaryWallet?.address) {
          const walletInfoSuffix = `\n\n💼 Connected: ${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`;
          aiResponse += walletInfoSuffix;
        }
      }

      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
        suggestedActions: actions.map((action: string) => ({
          label: action,
          action: action.toLowerCase().replace(/\s+/g, '_')
        })),
        transaction,
        transactionStatus: transaction ? 'pending' : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Scroll when assistant message is added
      scrollToBottom();
      
      // Track AI chat activity (only if authenticated and has user ID)
      if (isAuthenticated && authService.isAuthenticated()) {
        try {
          analyticsService.trackAIChat(
            currentInput.length,
            sessionId,
            selectedProvider || undefined
          );
        } catch (error) {
          // Silently fail analytics - don't break user experience
          logger.warn('Analytics tracking failed:', error);
        }
      }
    } catch (error) {
      logger.error('Chat error:', error);
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
    // Non-MVP: dApp Store navigation commented out
    // if (action === 'browse_apps' || action === 'search_defi' || action === 'search_nft' || action === 'search_tools') {
    //   navigate('/bit-store');
    //   return;
    // }

    // Wallet connection action removed for MVP - to be released later
    // if (action === 'connect_wallet') {
    //   const message: Message = {
    //     id: Date.now().toString(),
    //     content: '🔐 Please use the "Connect Wallet" button to connect your wallet.',
    //     role: 'assistant',
    //     timestamp: new Date(),
    //   };
    //   setMessages(prev => [...prev, message]);
    //   return;
    // }

    if (action === 'upgrade_to_pro') {
      // Navigate to upgrade page when available
      // navigate('/vault'); // Commented out for MVP - vault feature disabled
      return;
    }
    
    // if (action === 'view_vault') { // Commented out for MVP - vault feature disabled
    //   navigate('/vault');
    //   return;
    // }

    if (action === 'view_dashboard') {
      navigate('/home');
      return;
    }

    // Non-MVP: Portfolio navigation commented out
    // if (action === 'view_portfolio') {
    //   navigate('/portfolio');
    //   return;
    // }

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
          response: `I understand you're asking about "${currentInput}". I can help you with general Web3 questions, DeFi protocols, NFT trading, and more. What would you like to know?`,
          suggestedActions: []
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
      logger.error('Failed to send AI message:', error);
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
      logger.error('Failed to copy text: ', err);
    }
  };

  const clearChat = () => {
    logger.debug('Clearing chat...');
    setMessages([
      {
        id: '1',
        content: '👋 Hello! I\'m bitAI, your intelligent Web3 companion.\n\n💬 You can ask me any questions and you will get the response from a Web3 perspective.\n\nWhat would you like to know about Web3?',
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
    logger.debug('Chat cleared successfully');
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
              <div className={`prose prose-sm max-w-none ${
                theme === 'cyberpunk' 
                  ? 'prose-invert text-white' 
                  : 'text-secondary-900'
              }`}>
                <ReactMarkdown
                  components={{
                    // Headers with proper hierarchy and spacing
                    h1: ({node, ...props}) => <h1 className={`text-2xl font-bold mb-3 mt-4 first:mt-0 ${
                      theme === 'cyberpunk' 
                        ? 'text-white cyberpunk-font cyberpunk-gradient-text' 
                        : 'text-secondary-900'
                    }`} {...props} />,
                    h2: ({node, ...props}) => <h2 className={`text-xl font-bold mb-2 mt-4 first:mt-0 ${
                      theme === 'cyberpunk' 
                        ? 'text-white cyberpunk-font' 
                        : 'text-secondary-900'
                    }`} {...props} />,
                    h3: ({node, ...props}) => <h3 className={`text-lg font-semibold mb-2 mt-3 first:mt-0 ${
                      theme === 'cyberpunk' 
                        ? 'text-white cyberpunk-font' 
                        : 'text-secondary-800'
                    }`} {...props} />,
                    h4: ({node, ...props}) => <h4 className={`text-base font-semibold mb-2 mt-3 first:mt-0 ${
                      theme === 'cyberpunk' 
                        ? 'text-white' 
                        : 'text-secondary-800'
                    }`} {...props} />,
                    h5: ({node, ...props}) => <h5 className={`text-sm font-semibold mb-1 mt-2 first:mt-0 ${
                      theme === 'cyberpunk' 
                        ? 'text-white' 
                        : 'text-secondary-700'
                    }`} {...props} />,
                    h6: ({node, ...props}) => <h6 className={`text-xs font-semibold mb-1 mt-2 first:mt-0 ${
                      theme === 'cyberpunk' 
                        ? 'text-white/90' 
                        : 'text-secondary-700'
                    }`} {...props} />,
                    
                    // Paragraphs with better spacing
                    p: ({node, ...props}) => <p className={`mb-3 last:mb-0 leading-relaxed ${
                      theme === 'cyberpunk' ? 'text-white/90' : 'text-secondary-700'
                    }`} {...props} />,
                    
                    // Lists with better spacing and indentation
                    ul: ({node, ...props}) => <ul className={`list-disc list-outside ml-6 mb-3 space-y-1 ${
                      theme === 'cyberpunk' ? 'text-white/90' : 'text-secondary-700'
                    }`} {...props} />,
                    ol: ({node, ...props}) => <ol className={`list-decimal list-outside ml-6 mb-3 space-y-1 ${
                      theme === 'cyberpunk' ? 'text-white/90' : 'text-secondary-700'
                    }`} {...props} />,
                    li: ({node, ...props}) => <li className={`leading-relaxed ${
                      theme === 'cyberpunk' ? 'text-white/90' : 'text-secondary-700'
                    }`} {...props} />,
                    
                    // Text formatting
                    strong: ({node, ...props}) => <strong className={`font-semibold ${
                      theme === 'cyberpunk' ? 'text-white' : 'text-secondary-900'
                    }`} {...props} />,
                    em: ({node, ...props}) => <em className={`italic ${
                      theme === 'cyberpunk' ? 'text-white/90' : 'text-secondary-700'
                    }`} {...props} />,
                    
                    // Inline code
                    code: ({node, inline, className, children, ...props}: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      
                      if (!inline && language) {
                        return (
                          <SyntaxHighlighter
                            language={language}
                            style={theme === 'cyberpunk' ? vscDarkPlus : oneLight}
                            PreTag="div"
                            className="rounded-lg mb-3 mt-2"
                            customStyle={{
                              margin: 0,
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              lineHeight: '1.5',
                            }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        );
                      }
                      
                      return (
                        <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                          theme === 'cyberpunk' 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`} {...props}>
                          {children}
                        </code>
                      );
                    },
                    
                    // Code blocks (pre) - handled by code component above
                    pre: ({node, ...props}) => <div className="my-3" {...props} />,
                    
                    // Blockquotes
                    blockquote: ({node, ...props}) => <blockquote className={`border-l-4 pl-4 my-3 italic ${
                      theme === 'cyberpunk' 
                        ? 'border-green-400/50 text-white/80 bg-green-500/5 py-2' 
                        : 'border-primary-300 text-secondary-600 bg-primary-50/50 py-2'
                    }`} {...props} />,
                    
                    // Links
                    a: ({node, ...props}: any) => <a 
                      className={`underline hover:no-underline transition-colors ${
                        theme === 'cyberpunk' 
                          ? 'text-green-400 hover:text-green-300' 
                          : 'text-primary-600 hover:text-primary-700'
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />,
                    
                    // Horizontal rules
                    hr: ({node, ...props}) => <hr className={`my-4 border-0 ${
                      theme === 'cyberpunk' 
                        ? 'border-t border-green-400/30' 
                        : 'border-t border-secondary-200'
                    }`} {...props} />,
                    
                    // Tables
                    table: ({node, ...props}) => <div className="overflow-x-auto my-3">
                      <table className={`min-w-full border-collapse ${
                        theme === 'cyberpunk' 
                          ? 'border border-green-400/30' 
                          : 'border border-secondary-200'
                      }`} {...props} />
                    </div>,
                    thead: ({node, ...props}) => <thead className={
                      theme === 'cyberpunk' 
                        ? 'bg-green-500/20' 
                        : 'bg-secondary-50'
                    } {...props} />,
                    tbody: ({node, ...props}) => <tbody {...props} />,
                    tr: ({node, ...props}) => <tr className={
                      theme === 'cyberpunk' 
                        ? 'border-b border-green-400/20' 
                        : 'border-b border-secondary-100'
                    } {...props} />,
                    th: ({node, ...props}) => <th className={`px-4 py-2 text-left font-semibold ${
                      theme === 'cyberpunk' 
                        ? 'text-white border-r border-green-400/20' 
                        : 'text-secondary-900 border-r border-secondary-200'
                    }`} {...props} />,
                    td: ({node, ...props}) => <td className={`px-4 py-2 ${
                      theme === 'cyberpunk' 
                        ? 'text-white/90 border-r border-green-400/20' 
                        : 'text-secondary-700 border-r border-secondary-100'
                    }`} {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
            
            {/* Transaction Preview */}
            {!isUser && message.transaction && (
              <TransactionPreview
                transaction={message.transaction}
                onSign={() => setSigningTransaction({ transaction: message.transaction!, messageId: message.id })}
                onCancel={() => {
                  setMessages(prev => prev.map(m => 
                    m.id === message.id 
                      ? { ...m, transactionStatus: 'failed' as const }
                      : m
                  ));
                }}
                theme={theme}
              />
            )}

            {/* Transaction Status Display */}
            {!isUser && message.transactionStatus && message.transaction && (
              <div className={`mt-2 px-3 py-2 rounded text-xs ${
                theme === 'cyberpunk'
                  ? message.transactionStatus === 'confirmed'
                    ? 'bg-green-500/20 border border-green-400/50 text-green-300'
                    : message.transactionStatus === 'failed'
                    ? 'bg-red-500/20 border border-red-400/50 text-red-300'
                    : 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-300'
                  : message.transactionStatus === 'confirmed'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : message.transactionStatus === 'failed'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              }`}>
                Status: {message.transactionStatus.charAt(0).toUpperCase() + message.transactionStatus.slice(1)}
              </div>
            )}
            
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
            
            {/* Feedback for assistant messages */}
            {!isUser && isAuthenticated && (
              <MessageFeedback
                messageId={message.id}
                onFeedbackSubmitted={() => {
                  // Optionally refresh session or show confirmation
                }}
              />
            )}
          </div>
      </div>
    </div>
  );
  };

  // Handle transaction signing
  const handleTransactionSigned = (signature: string, txHash?: string) => {
    if (!signingTransaction) return;
    
    setMessages(prev => prev.map(m => 
      m.id === signingTransaction.messageId 
        ? { 
            ...m, 
            transactionStatus: 'sent' as const,
            content: m.content + `\n\n✅ Transaction signed and sent!\n\nSignature: \`${signature.slice(0, 16)}...${signature.slice(-8)}\``
          }
        : m
    ));
    
    setSigningTransaction(null);
  };

  const handleTransactionError = (error: string) => {
    if (!signingTransaction) return;
    
    setMessages(prev => prev.map(m => 
      m.id === signingTransaction.messageId 
        ? { 
            ...m, 
            transactionStatus: 'failed' as const,
            content: m.content + `\n\n❌ Transaction failed: ${error}`
          }
        : m
    ));
    
    setSigningTransaction(null);
  };

  // Main component return
  return (
    <div className="max-w-4xl mx-auto">
      {/* Transaction Signing Modal */}
      {signingTransaction && (
        <TransactionSigningModal
          transaction={signingTransaction.transaction}
          isOpen={!!signingTransaction}
          onClose={() => setSigningTransaction(null)}
          onSigned={handleTransactionSigned}
          onError={handleTransactionError}
          theme={theme}
        />
      )}
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
              bitAI
            </h1>
            <p className={`${
              theme === 'cyberpunk' 
                ? 'text-white/80 cyberpunk-font cyberpunk-text-glow' 
                : 'text-secondary-600'
            }`}>
              {theme === 'cyberpunk' ? 'BIT INTERFACE ACTIVE' : 'Let\'s get started...'}
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
          {/* Sessions button - Commented out for MVP - to be released later */}
          {/* 
          {isAuthenticated && (
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Sessions
            </Button>
          )}
          */}
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

      {/* Session Sidebar - Commented out for MVP - to be released later */}
      {/* 
      {isAuthenticated && (
        <SessionListSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={switchToSession}
          onCreateNewSession={createNewSession}
          onDeleteSession={deleteSession}
          onArchiveSession={archiveSession}
          onRenameSession={renameSession}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      */}

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
            className={`h-[calc(100vh-280px)] overflow-y-auto p-6 space-y-4 transition-all duration-500 chat-messages-scrollbar ${
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
                  Welcome to bitAI
                </h3>
                <p className="text-secondary-500 max-w-md mb-6">
                  Your intelligent assistant for Web3. Ask me anything about blockchain, DeFi, NFTs, and get responses from a Web3 perspective.
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
                {/* Scroll anchor - invisible element at the bottom for auto-scrolling */}
                <div ref={messagesEndRef} className="h-1" />
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
                  placeholder={theme === 'cyberpunk' ? "I'm your Solana assistant, how can I help you?" : "Ask me anything..."}
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



