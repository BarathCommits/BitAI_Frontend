import { useAuthStore } from '../store/authStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  provider?: string;
  metadata?: {
    tokensUsed?: number;
    responseTime?: number;
    cached?: boolean;
  };
}

export interface ChatSession {
  sessionId: string;
  title: string;
  messages?: ChatMessage[];
  context?: {
    connectedDApps?: string[];
    walletAddress?: string;
    chainId?: number;
  };
  isActive: boolean;
  lastMessageAt: Date;
  messageCount?: number;
  createdAt: Date;
}

class ChatSessionService {
  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  private async handleResponse<T>(response: Response): Promise<{ success: boolean; data?: T; error?: string }> {
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'An error occurred' };
    }
    return { success: true, data: data.data };
  }

  /**
   * Get all chat sessions
   */
  async getSessions(params?: { limit?: number; skip?: number; includeArchived?: boolean }): Promise<{ success: boolean; data?: { sessions: ChatSession[]; pagination: any }; error?: string }> {
    try {
      const query = new URLSearchParams();
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.skip) query.append('skip', params.skip.toString());
      if (params?.includeArchived) query.append('includeArchived', params.includeArchived.toString());

      const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions?${query}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Get specific session with messages
   */
  async getSession(sessionId: string): Promise<{ success: boolean; data?: ChatSession; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions/${sessionId}`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Create new session
   */
  async createSession(title?: string, context?: any): Promise<{ success: boolean; data?: { sessionId: string; title: string }; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ title, context })
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Add message to session
   */
  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    provider?: string,
    metadata?: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ role, content, provider, metadata })
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Update session title
   */
  async updateTitle(sessionId: string, title: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions/${sessionId}/title`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ title })
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Clear session messages
   */
  async clearMessages(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions/${sessionId}/clear`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Archive session
   */
  async archiveSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions/${sessionId}/archive`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  /**
   * Get session statistics
   */
  async getStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions/stats`, {
        headers: this.getAuthHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }
}

export const chatSessionService = new ChatSessionService();


