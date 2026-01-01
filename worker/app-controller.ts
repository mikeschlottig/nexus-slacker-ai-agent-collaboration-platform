import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo } from './types';
import type { Env } from './core-utils';
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
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private workspaces = new Map<string, Workspace>();
  private userProfile: UserProfile = {
    name: 'Nexus User',
    avatarColor: 'bg-[#E8912D]',
    status: 'Active',
    updatedAt: Date.now()
  };
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const [storedSessions, storedWorkspaces, storedProfile] = await Promise.all([
        this.ctx.storage.get<Record<string, SessionInfo>>('sessions'),
        this.ctx.storage.get<Record<string, Workspace>>('workspaces'),
        this.ctx.storage.get<UserProfile>('userProfile')
      ]);
      this.sessions = new Map(Object.entries(storedSessions || {}));
      this.workspaces = new Map(Object.entries(storedWorkspaces || {}));
      if (storedProfile) this.userProfile = storedProfile;
      this.loaded = true;
    }
  }
  private async persist(): Promise<void> {
    await Promise.all([
      this.ctx.storage.put('sessions', Object.fromEntries(this.sessions)),
      this.ctx.storage.put('workspaces', Object.fromEntries(this.workspaces)),
      this.ctx.storage.put('userProfile', this.userProfile)
    ]);
  }
  // Workspace Methods
  async addWorkspace(workspace: Workspace): Promise<void> {
    await this.ensureLoaded();
    this.workspaces.set(workspace.id, workspace);
    await this.persist();
  }
  async listWorkspaces(): Promise<Workspace[]> {
    await this.ensureLoaded();
    return Array.from(this.workspaces.values()).sort((a, b) => a.createdAt - b.createdAt);
  }
  // Profile Methods
  async getUserProfile(): Promise<UserProfile> {
    await this.ensureLoaded();
    return this.userProfile;
  }
  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    await this.ensureLoaded();
    this.userProfile = { ...this.userProfile, ...profile, updatedAt: Date.now() };
    await this.persist();
    return this.userProfile;
  }
  // Session Methods
  async addSession(sessionId: string, title?: string, workspaceId?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now,
      workspaceId: workspaceId || 'nexus'
    });
    await this.persist();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persist();
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persist();
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.persist();
      return true;
    }
    return false;
  }
  async listSessions(workspaceId?: string): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    let sessionsList = Array.from(this.sessions.values());
    if (workspaceId) {
      sessionsList = sessionsList.filter(s => s.workspaceId === workspaceId);
    }
    return sessionsList.sort((a, b) => b.lastActive - a.lastActive);
  }
  async getSessionCount(): Promise<number> {
    await this.ensureLoaded();
    return this.sessions.size;
  }
  async getSession(sessionId: string): Promise<SessionInfo | null> {
    await this.ensureLoaded();
    return this.sessions.get(sessionId) || null;
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    this.sessions.clear();
    await this.persist();
    return count;
  }
}