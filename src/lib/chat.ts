import type { Message, ChatState, SessionInfo } from '../../worker/types';
export interface ChatResponse<T = ChatState> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface Workspace {
  id: string;
  name: string;
  initials: string;
  color: string;
  createdAt: number;
}
export interface UserProfile {
  name: string;
  avatarColor: string;
  status: string;
  updatedAt: number;
}
export const MODELS = [
  { id: 'google-ai-studio/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'google-ai-studio/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'google-ai-studio/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
];
class ChatService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  private async request<T>(path: string, options?: RequestInit): Promise<ChatResponse<T>> {
    try {
      const response = await fetch(path, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      if (!response.ok) {
        let errBody;
        try {
          errBody = await response.clone().json();
        } catch {
          errBody = await response.clone().text().catch(() => response.statusText);
        }
        console.error(`HTTP ${response.status} ${path}:`, {status:response.status, statusText:response.statusText, body:errBody});
        return { success: false, error: errBody?.error || errBody || `Server responded ${response.status}` };
      }
      const rawData = await response.json();
      return { success: true, data: rawData.data ?? rawData };
    } catch (error) {
      console.error(`Network/Fetch error on ${path}:`, error, {message: error?.message, stack: error?.stack, stringified: String(error)});
      return { success: false, error: error instanceof Error ? error.message : 'Network request failed' };
    }
  }
  async sendMessage(
    message: string,
    model?: string,
    onChunk?: (chunk: string) => void,
    threadId?: string
  ): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, stream: !!onChunk, threadId }),
      });
      if (!response.ok) {
        let errBody;
        try {
          errBody = await response.clone().json();
        } catch {
          errBody = await response.clone().text().catch(() => response.statusText);
        }
        console.error(`HTTP ${response.status} ${this.baseUrl}/chat:`, {status:response.status, statusText:response.statusText, body:errBody});
        return { success: false, error: errBody?.error || errBody || `Server responded ${response.status}` };
      }
      if (onChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            if (chunk) onChunk(chunk);
          }
        } finally {
          reader.releaseLock();
        }
        return { success: true };
      }
      const rawData = await response.json();
      return { success: true, data: rawData.data ?? rawData };
    } catch (error) {
      console.error(`Send message failed:`, error);
      return { success: false, error: 'Failed to connect to agent service' };
    }
  }
  async getMessages(): Promise<ChatResponse> {
    return this.request<ChatState>(`${this.baseUrl}/messages`);
  }
  async listWorkspaces(): Promise<ChatResponse<Workspace[]>> {
    return this.request<Workspace[]>('/api/workspaces');
  }
  async createWorkspace(name: string, color: string): Promise<ChatResponse<Workspace>> {
    return this.request<Workspace>('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name, color })
    });
  }
  async getUserProfile(): Promise<ChatResponse<UserProfile>> {
    return this.request<UserProfile>('/api/user/profile');
  }
  async updateUserProfile(profile: Partial<UserProfile>): Promise<ChatResponse<UserProfile>> {
    return this.request<UserProfile>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
  }
  async listSessions(workspaceId?: string): Promise<ChatResponse<SessionInfo[]>> {
    const url = workspaceId ? `/api/sessions?workspaceId=${encodeURIComponent(workspaceId)}` : '/api/sessions';
    return this.request<SessionInfo[]>(url);
  }
  async createSession(title?: string, sessionId?: string, firstMessage?: string, workspaceId?: string): Promise<ChatResponse<{ sessionId: string; title: string }>> {
    return this.request<{ sessionId: string; title: string }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ title, sessionId, firstMessage, workspaceId })
    });
  }
  async updateModel(model: string): Promise<ChatResponse> {
    return this.request(`${this.baseUrl}/model`, {
      method: 'POST',
      body: JSON.stringify({ model })
    });
  }
  switchSession(sessionId: string): void {
    if (!sessionId || typeof sessionId !== 'string') return;
    this.sessionId = sessionId;
    this.baseUrl = `/api/chat/${sessionId}`;
  }
}
export const chatService = new ChatService();
export const formatTime = (timestamp: number): string => {
  if (!timestamp) return '--:--';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};