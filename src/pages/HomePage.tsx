import React, { useEffect, useState, useCallback } from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { chatService } from '@/lib/chat';
import { MOCK_WORKSPACES } from '@/lib/workspace-utils';
import type { SessionInfo, Message } from '../../worker/types';
import { Toaster, toast } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
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
        setChannels(response.data);
      }
    } catch (err) {
      console.error('Failed to load workspace:', err);
      toast.error('Failed to load workspace channels');
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions, activeWorkspaceId]);
  // Handle auto-selection of first channel if none active
  useEffect(() => {
    if (!activeSessionId && channels.length > 0) {
      const firstId = channels[0].id;
      setActiveSessionId(firstId);
      chatService.switchSession(firstId);
    } else if (!isLoading && channels.length === 0) {
      // Create a default #general if no channels exist
      const createDefault = async () => {
        const res = await chatService.createSession('#general', undefined, undefined, activeWorkspaceId);
        if (res.success && res.data) {
          fetchSessions();
        }
      };
      createDefault();
    }
  }, [channels, activeSessionId, isLoading, activeWorkspaceId, fetchSessions]);
  const handleWorkspaceSelect = (id: string) => {
    setActiveWorkspaceId(id);
    setActiveSessionId(null);
    setThreadMessage(null);
    setIsLoading(true);
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
      const newId = res.data.sessionId;
      setActiveSessionId(newId);
      chatService.switchSession(newId);
    }
  };
  if (isLoading && channels.length === 0) {
    const wsName = MOCK_WORKSPACES.find(w => w.id === activeWorkspaceId)?.name || 'Workspace';
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#3F0E40] text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20" />
          <p className="text-sm font-medium opacity-70">Loading {wsName}...</p>
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