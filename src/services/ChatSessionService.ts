/**
 * Chat Session Service
 * Handles all session-related API calls for chat management
 */

import { API_CONFIG } from '../config/api';
import { authService } from './AuthService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export interface ChatSession {
  id: string;
  title: string;
  messageCount: number;
  lastActivity: string;
  createdAt: string;
  isArchived: boolean;
  chainId?: number;
  chainName?: string;
  walletAddress?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
  metadata?: any;
}

export interface SessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

export interface SessionAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class ChatSessionService {
  private getAuthHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get active session for current user
   */
  async getActiveSession(): Promise<SessionAPIResponse<SessionWithMessages>> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/sessions/active`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || 'FETCH_ERROR',
            message: data.error?.message || 'Failed to get active session',
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  /**
   * Create a new chat session
   */
  async createSession(title?: string): Promise<SessionAPIResponse<ChatSession>> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/sessions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          title: title || 'New Chat',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || 'FETCH_ERROR',
            message: data.error?.message || 'Failed to create session',
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  /**
   * List all sessions for current user
   */
  async listSessions(): Promise<SessionAPIResponse<ChatSession[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/sessions`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || 'FETCH_ERROR',
            message: data.error?.message || 'Failed to list sessions',
          },
        };
      }

      return {
        success: true,
        data: Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  /**
   * Get a specific session with messages
   */
  async getSession(sessionId: string): Promise<SessionAPIResponse<SessionWithMessages>> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/sessions/${sessionId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || 'FETCH_ERROR',
            message: data.error?.message || 'Failed to get session',
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  /**
   * Update a session (title, archive status, etc.)
   */
  async updateSession(
    sessionId: string,
    updates: { title?: string; isArchived?: boolean }
  ): Promise<SessionAPIResponse<ChatSession>> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/sessions/${sessionId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || 'FETCH_ERROR',
            message: data.error?.message || 'Failed to update session',
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<SessionAPIResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          success: false,
          error: {
            code: data.error?.code || 'FETCH_ERROR',
            message: data.error?.message || 'Failed to delete session',
          },
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  /**
   * Submit feedback for a message
   */
  async submitFeedback(
    messageId: string,
    rating: number,
    feedback?: string
  ): Promise<SessionAPIResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/feedback`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          messageId,
          rating,
          feedback,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          success: false,
          error: {
            code: data.error?.code || 'FETCH_ERROR',
            message: data.error?.message || 'Failed to submit feedback',
          },
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }
}

export const chatSessionService = new ChatSessionService();
export default chatSessionService;
