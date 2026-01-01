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
  { id: 'google-ai-studio/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'google-ai-studio/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'google-ai-studio/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
];
class ChatService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
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
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to send message' };
    }
  }
  async getMessages(): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to load messages' };
    }
  }
  // Workspace APIs
  async listWorkspaces(): Promise<ChatResponse<Workspace[]>> {
    try {
      const response = await fetch('/api/workspaces');
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to list workspaces' };
    }
  }
  async createWorkspace(name: string, color: string): Promise<ChatResponse<Workspace>> {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to create workspace' };
    }
  }
  // Profile APIs
  async getUserProfile(): Promise<ChatResponse<UserProfile>> {
    try {
      const response = await fetch('/api/user/profile');
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to get profile' };
    }
  }
  async updateUserProfile(profile: Partial<UserProfile>): Promise<ChatResponse<UserProfile>> {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  }
  // Session APIs
  async listSessions(workspaceId?: string): Promise<ChatResponse<SessionInfo[]>> {
    try {
      const url = workspaceId ? `/api/sessions?workspaceId=${encodeURIComponent(workspaceId)}` : '/api/sessions';
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to list sessions' };
    }
  }
  async createSession(title?: string, sessionId?: string, firstMessage?: string, workspaceId?: string): Promise<ChatResponse<{ sessionId: string; title: string }>> {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, sessionId, firstMessage, workspaceId })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to create session' };
    }
  }
  async updateModel(model: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to update model' };
    }
  }
  switchSession(sessionId: string): void {
    if (!sessionId) return;
    this.sessionId = sessionId;
    this.baseUrl = `/api/chat/${sessionId}`;
  }
}
export const chatService = new ChatService();
export const formatTime = (timestamp: number): string => {
  if (!timestamp) return '--:--';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};