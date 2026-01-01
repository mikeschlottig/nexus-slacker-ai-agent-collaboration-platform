import React, { useEffect, useState, useCallback } from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { chatService } from '@/lib/chat';
import type { SessionInfo, Message } from '../../worker/types';
import { Toaster, toast } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
export function HomePage() {
  const [channels, setChannels] = useState<SessionInfo[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const fetchSessions = useCallback(async () => {
    try {
      const response = await chatService.listSessions();
      if (response.success && response.data) {
        const sessionData = response.data;
        setChannels(sessionData);
        // Only set active if none is selected or if current active is gone
        setActiveSessionId(current => {
          if (!current && sessionData.length > 0) return sessionData[0].id;
          if (current && !sessionData.find(s => s.id === current)) return sessionData[0]?.id || null;
          return current;
        });
        if (sessionData.length === 0) {
          const newSession = await chatService.createSession('#general');
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
  }, []);
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  const handleChannelSelect = useCallback((id: string) => {
    setActiveSessionId(id);
    chatService.switchSession(id);
    setThreadMessage(null); // Clear thread when switching channels
  }, []);
  const handleChannelCreated = async (title: string) => {
    const res = await chatService.createSession(title);
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
          <p className="text-sm font-medium opacity-70">Loading Nexus...</p>
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
          onChannelSelect={handleChannelSelect}
          onChannelCreate={handleChannelCreated}
          threadMessage={threadMessage}
          onThreadSelect={setThreadMessage}
          onThreadClose={() => setThreadMessage(null)}
        />
        <Toaster richColors position="top-center" />
        <div className="fixed bottom-4 right-4 text-[10px] text-muted-foreground/50 z-50 pointer-events-none">
          Nexus AI • Usage Limits Apply
        </div>
      </div>
    </TooltipProvider>
  );
}