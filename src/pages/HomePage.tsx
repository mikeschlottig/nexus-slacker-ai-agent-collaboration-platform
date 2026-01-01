import React, { useEffect, useState } from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { chatService } from '@/lib/chat';
import type { SessionInfo } from '../../worker/types';
import { Toaster, toast } from '@/components/ui/sonner';
export function HomePage() {
  const [channels, setChannels] = useState<SessionInfo[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchSessions = async () => {
    try {
      const response = await chatService.listSessions();
      if (response.success && response.data) {
        setChannels(response.data);
        if (response.data.length > 0 && !activeSessionId) {
          setActiveSessionId(response.data[0].id);
        } else if (response.data.length === 0) {
          // Create default channel if none exist
          const newSession = await chatService.createSession('#general');
          if (newSession.success && newSession.data) {
            setChannels([newSession.data as any]);
            setActiveSessionId(newSession.data.sessionId);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load workspace:', err);
      toast.error('Failed to load workspace channels');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchSessions();
  }, []);
  const handleChannelSelect = (id: string) => {
    setActiveSessionId(id);
    chatService.switchSession(id);
  };
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
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background">
      <WorkspaceLayout 
        channels={channels}
        activeSessionId={activeSessionId}
        onChannelSelect={handleChannelSelect}
        onChannelCreate={handleChannelCreated}
      />
      <Toaster richColors position="top-center" />
      <div className="fixed bottom-4 right-4 text-[10px] text-muted-foreground/50 z-50 pointer-events-none">
        Nexus AI • Usage Limits Apply
      </div>
    </div>
  );
}