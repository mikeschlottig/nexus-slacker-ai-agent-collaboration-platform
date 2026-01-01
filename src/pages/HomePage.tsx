import React, { useEffect, useState, useCallback } from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { chatService } from '@/lib/chat';
import { MOCK_WORKSPACES } from '@/lib/workspace-utils';
import type { SessionInfo, Message } from '../../worker/types';
import { Toaster, toast } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
export function HomePage() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('nexus');
  const [channels, setChannels] = useState<SessionInfo[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const fetchSessions = useCallback(async (workspaceId: string) => {
    setIsLoading(true);
    try {
      const response = await chatService.listSessions(workspaceId);
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
    fetchSessions(activeWorkspaceId);
  }, [fetchSessions, activeWorkspaceId]);
  // Handle auto-selection logic
  useEffect(() => {
    if (!isLoading) {
      if (!activeSessionId && channels.length > 0) {
        const firstId = channels[0].id;
        setActiveSessionId(firstId);
        chatService.switchSession(firstId);
      } else if (channels.length === 0) {
        // Only auto-create #general for the default 'nexus' workspace if empty
        if (activeWorkspaceId === 'nexus') {
          const createDefault = async () => {
            const res = await chatService.createSession('#general', undefined, undefined, activeWorkspaceId);
            if (res.success && res.data) {
              fetchSessions(activeWorkspaceId);
            }
          };
          createDefault();
        }
      }
    }
  }, [channels, activeSessionId, isLoading, activeWorkspaceId, fetchSessions]);
  const handleWorkspaceSelect = (id: string) => {
    if (id === activeWorkspaceId) return;
    setActiveWorkspaceId(id);
    setActiveSessionId(null);
    setThreadMessage(null);
    setChannels([]); // Clear current view
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
      await fetchSessions(activeWorkspaceId);
      const newId = res.data.sessionId;
      setActiveSessionId(newId);
      chatService.switchSession(newId);
    }
  };
  return (
    <TooltipProvider>
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeWorkspaceId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 h-full w-full"
          >
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
          </motion.div>
        </AnimatePresence>
        <Toaster richColors position="top-center" />
        <div className="fixed bottom-4 right-4 text-[10px] text-muted-foreground/50 z-50 pointer-events-none hidden md:block">
          Nexus AI • Workspace: {activeWorkspaceId} • Usage Limits Apply
        </div>
      </div>
    </TooltipProvider>
  );
}