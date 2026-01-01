import React, { useEffect, useState, useCallback } from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { chatService } from '@/lib/chat';
import type { SessionInfo, Message } from '../../worker/types';
import { Toaster, toast } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
export const MOCK_WORKSPACES = [
  { id: 'nexus', name: 'Nexus', initials: 'N', color: 'bg-indigo-600' },
  { id: 'dev', name: 'Development', initials: 'D', color: 'bg-[#E8912D]' },
  { id: 'marketing', name: 'Marketing', initials: 'M', color: 'bg-teal-600' },
];
export function HomePage() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('nexus');
  const [channels, setChannels] = useState<SessionInfo[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const fetchSessions = useCallback(async () => {
    try {
      const response = await chatService.listSessions();
      if (response.success && response.data) {
        // In a real app, we'd filter by workspaceId on the server
        // For this phase, we'll simulate it by prefixing or just listing all
        const sessionData = response.data;
        setChannels(sessionData);
        if (!activeSessionId && sessionData.length > 0) {
          setActiveSessionId(sessionData[0].id);
          chatService.switchSession(sessionData[0].id);
        } else if (sessionData.length === 0) {
          const newSession = await chatService.createSession('#general', undefined, undefined, activeWorkspaceId);
          if (newSession.success && newSession.data) {
            const created: SessionInfo = {
              id: newSession.data.sessionId,
              title: newSession.data.title,
              createdAt: Date.now(),
              lastActive: Date.now()
            };
            setChannels([created]);
            setActiveSessionId(created.id);
            chatService.switchSession(created.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load workspace:', err);
      toast.error('Failed to load workspace channels');
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId, activeWorkspaceId]);
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  const handleWorkspaceSelect = (id: string) => {
    setActiveWorkspaceId(id);
    setActiveSessionId(null);
    setThreadMessage(null);
    setIsLoading(true);
    // fetchSessions will trigger via dependency
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
      await fetchSessions();
      setActiveSessionId(res.data.sessionId);
      chatService.switchSession(res.data.sessionId);
    }
  };
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#3F0E40] text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20" />
          <p className="text-sm font-medium opacity-70">Loading {MOCK_WORKSPACES.find(w => w.id === activeWorkspaceId)?.name}...</p>
        </div>
      </div>
    );
  }
  return (
    <TooltipProvider>
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-background">
        <WorkspaceLayout
          channels={channels}
          activeSessionId={activeSessionId}
          activeWorkspaceId={activeWorkspaceId}
          onWorkspaceSelect={handleWorkspaceSelect}
          onChannelSelect={handleChannelSelect}
          onChannelCreate={handleChannelCreated}
          threadMessage={threadMessage}
          onThreadSelect={setThreadMessage}
          onThreadClose={() => setThreadMessage(null)}
        />
        <Toaster richColors position="top-center" />
        <div className="fixed bottom-4 right-4 text-[10px] text-muted-foreground/50 z-50 pointer-events-none">
          Nexus AI • Workspace: {activeWorkspaceId} • Usage Limits Apply
        </div>
      </div>
    </TooltipProvider>
  );
}