import React, { useEffect, useState, useCallback, useRef } from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { chatService, Workspace, UserProfile } from '@/lib/chat';
import type { SessionInfo, Message } from '../../worker/types';
import { Toaster, toast } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    try {
      const [wsRes, profRes] = await Promise.all([
        chatService.listWorkspaces(),
        chatService.getUserProfile()
      ]);
      if (!wsRes.success) throw new Error(wsRes.error || 'Failed to fetch workspaces');
      if (!profRes.success) throw new Error(profRes.error || 'Failed to fetch profile');
      let activeWs = wsRes.data || [];
      if (activeWs.length === 0) {
        const newWs = await chatService.createWorkspace('Nexus', 'bg-indigo-600');
        if (newWs.success && newWs.data) activeWs = [newWs.data];
      }
      setWorkspaces(activeWs);
      const initialWsId = activeWs[0]?.id || 'nexus';
      setActiveWorkspaceId(initialWsId);
      setUserProfile(profRes.data || null);
      const sessRes = await chatService.listSessions(initialWsId);
      if (sessRes.success && sessRes.data) {
        setChannels(sessRes.data);
        if (sessRes.data.length > 0) {
          const firstSession = sessRes.data[0];
          setActiveSessionId(firstSession.id);
          chatService.switchSession(firstSession.id);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Initialization error details:', err);
      setInitError(msg);
      toast.error('Initialization failed: ' + msg);
    } finally {
      setIsInitializing(false);
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchEverything();
  }, [fetchEverything]);
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
  if (isInitializing || !userProfile) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#3F0E40] flex flex-col items-center justify-center text-white p-6 text-center">
        {initError ? (
          <div className="max-w-md space-y-4 animate-in fade-in zoom-in-95">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h1 className="text-xl font-black">Initialization Failed</h1>
            <p className="text-slate-300 text-sm leading-relaxed">{initError}</p>
            <Button 
              onClick={() => { initRef.current = false; fetchEverything(); }}
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