import React, { useEffect, useState, useCallback, useRef } from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { chatService, Workspace, UserProfile } from '@/lib/chat';
import type { SessionInfo, Message } from '../../worker/types';
import { Toaster, toast } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
const crypto = typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto;
export function HomePage() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [channels, setChannels] = useState<SessionInfo[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const initRef = useRef(false);
  const fetchEverything = useCallback(async () => {
    setIsLoading(true);
    setInitError(null);
    let fallbackUsed = false;

    // List Workspaces
    let workspacesData: Workspace[] = [];
    try {
      const wsRes = await chatService.listWorkspaces();
      if (wsRes.success && wsRes.data && wsRes.data.length > 0) {
        workspacesData = wsRes.data;
      } else {
        console.error(`✉ List Workspaces failed (${wsRes.error || 'unknown'}):`, 'Response:', wsRes);
        fallbackUsed = true;
      }
    } catch (err) {
      console.error(`✉ List Workspaces crashed:`, err);
      fallbackUsed = true;
    }

    // Create default workspace if needed
    if (workspacesData.length === 0) {
      try {
        const newWs = await chatService.createWorkspace('Nexus', 'bg-indigo-600');
        if (newWs.success && newWs.data) {
          workspacesData = [newWs.data];
        } else {
          console.error(`✉ Create Workspace failed (${newWs.error || 'unknown'}):`, 'Response:', newWs);
          fallbackUsed = true;
        }
      } catch (err) {
        console.error(`✉ Create Workspace crashed:`, err);
        fallbackUsed = true;
      }
    }

    // Fallback workspace
    if (workspacesData.length === 0) {
      workspacesData = [{
        id: 'nexus',
        name: 'Nexus',
        initials: 'NX',
        color: 'bg-indigo-600',
        createdAt: Date.now()
      }];
      fallbackUsed = true;
    }

    const initialWsId = workspacesData[0]?.id || 'nexus';
    setWorkspaces(workspacesData);
    setActiveWorkspaceId(initialWsId);

    // Get User Profile
    let userProfileData: UserProfile | null = null;
    try {
      const profRes = await chatService.getUserProfile();
      if (profRes.success && profRes.data) {
        userProfileData = profRes.data;
      } else {
        console.error(`✉ Get User Profile failed (${profRes.error || 'unknown'}):`, 'Response:', profRes);
        fallbackUsed = true;
      }
    } catch (err) {
      console.error(`✉ Get User Profile crashed:`, err);
      fallbackUsed = true;
    }
    userProfileData = userProfileData || {
      name: 'Anonymous User',
      avatarColor: '#3B82F6',
      status: 'online',
      updatedAt: Date.now()
    };
    setUserProfile(userProfileData);

    // List Sessions
    let channelsData: SessionInfo[] = [];
    try {
      const sessRes = await chatService.listSessions(initialWsId);
      if (sessRes.success && sessRes.data && sessRes.data.length > 0) {
        channelsData = sessRes.data;
      } else {
        console.error(`✉ List Sessions failed (${sessRes.error || 'unknown'}):`, 'Response:', sessRes);
        fallbackUsed = true;
      }
    } catch (err) {
      console.error(`✉ List Sessions crashed:`, err);
      fallbackUsed = true;
    }

    // Fallback sessions
    if (channelsData.length === 0) {
      channelsData = [{
        id: crypto.randomUUID(),
        title: 'Welcome to Nexus',
        createdAt: Date.now(),
        lastActive: Date.now(),
        workspaceId: initialWsId
      }];
      fallbackUsed = true;
    }

    setChannels(channelsData);
    const activeSessionId = channelsData[0]?.id;
    setActiveSessionId(activeSessionId || null);
    if (activeSessionId) {
      chatService.switchSession(activeSessionId);
    }

    if (fallbackUsed) {
      const fallbackMsg = 'Some backend services unavailable - using defaults. Retrying in background may help.';
      setInitError(fallbackMsg);
      toast.warning(fallbackMsg);
    }

    setIsInitializing(false);
    setIsLoading(false);
  }, []);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchEverything();
  }, []);
  const handleWorkspaceSelect = async (id: string) => {
    if (id === activeWorkspaceId) return;
    setActiveWorkspaceId(id);
    setActiveSessionId(null);
    setChannels([]);
    setIsLoading(true);
    const res = await chatService.listSessions(id);
    if (res.success && res.data) {
      setChannels(res.data);
      if (res.data.length > 0) {
        setActiveSessionId(res.data[0].id);
        chatService.switchSession(res.data[0].id);
      }
    }
    setIsLoading(false);
  };
  const handleWorkspaceCreate = async (name: string, color: string) => {
    const res = await chatService.createWorkspace(name, color);
    if (res.success && res.data) {
      setWorkspaces(prev => [...prev, res.data!]);
      handleWorkspaceSelect(res.data.id);
      toast.success(`Workspace ${name} created`);
    }
  };
  const handleChannelSelect = useCallback((id: string) => {
    setActiveSessionId(id);
    chatService.switchSession(id);
    setThreadMessage(null);
  }, []);
  const handleChannelCreated = async (title: string) => {
    const res = await chatService.createSession(title, undefined, undefined, activeWorkspaceId);
    if (res.success && res.data) {
      toast.success(`Channel ${title} created`);
      const updated = await chatService.listSessions(activeWorkspaceId);
      if (updated.success && updated.data) {
        setChannels(updated.data);
        setActiveSessionId(res.data.sessionId);
        chatService.switchSession(res.data.sessionId);
      }
    }
  };
  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#3F0E40] flex flex-col items-center justify-center text-white p-6 text-center">
        {initError ? (
          <div className="max-w-md space-y-4 animate-in fade-in zoom-in-95">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h1 className="text-xl font-black">Initialization Failed</h1>
            <p className="text-slate-300 text-sm leading-relaxed">{initError}</p>
            <Button
              onClick={() => { initRef.current = false; setInitError(null); setIsLoading(true); fetchEverything(); }}
              variant="outline"
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 animate-spin opacity-20 mx-auto" />
            <p className="text-slate-400 text-sm font-medium animate-pulse">Establishing Nexus Connection...</p>
          </div>
        )}
      </div>
    );
  }
  return (
    <TooltipProvider>
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-background">
        <WorkspaceLayout
          workspaces={workspaces}
          channels={channels}
          activeSessionId={activeSessionId}
          activeWorkspaceId={activeWorkspaceId}
          userProfile={userProfile}
          onWorkspaceSelect={handleWorkspaceSelect}
          onWorkspaceCreate={handleWorkspaceCreate}
          onChannelSelect={handleChannelSelect}
          onChannelCreate={handleChannelCreated}
          threadMessage={threadMessage}
          onThreadSelect={setThreadMessage}
          onThreadClose={() => setThreadMessage(null)}
          onProfileUpdate={setUserProfile}
        />
        <Toaster richColors position="top-center" />
      </div>
    </TooltipProvider>
  );
}