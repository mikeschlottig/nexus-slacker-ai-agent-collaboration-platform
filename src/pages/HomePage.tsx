import React, { useEffect, useState, useCallback, useRef } from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { chatService } from '@/lib/chat';
import { MOCK_WORKSPACES } from '@/lib/workspace-utils';
import type { SessionInfo, Message } from '../../worker/types';
import { Toaster, toast } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Bot } from 'lucide-react';
export function HomePage() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('nexus');
  const [channels, setChannels] = useState<SessionInfo[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const initRef = useRef(false);
  const fetchSessions = useCallback(async (workspaceId: string, isInitial = false) => {
    try {
      const response = await chatService.listSessions(workspaceId);
      if (response.success && response.data) {
        setChannels(response.data);
        return response.data;
      }
    } catch (err) {
      console.error('Failed to load workspace:', err);
      if (!isInitial) toast.error('Failed to load workspace channels');
    } finally {
      if (isInitial) {
        // Minimum visible delay for UX feel
        setTimeout(() => setIsInitializing(false), 800);
      }
      setIsLoading(false);
    }
    return [];
  }, []);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchSessions(activeWorkspaceId, true);
  }, [activeWorkspaceId, fetchSessions]);
  // Handle auto-selection and #general creation logic
  useEffect(() => {
    const manageSessions = async () => {
      if (isLoading || isInitializing) return;
      if (!activeSessionId && channels.length > 0) {
        const firstId = channels[0].id;
        setActiveSessionId(firstId);
        chatService.switchSession(firstId);
      } else if (channels.length === 0 && activeWorkspaceId === 'nexus') {
        setIsLoading(true);
        const res = await chatService.createSession('#general', undefined, undefined, activeWorkspaceId);
        if (res.success && res.data) {
          const updated = await fetchSessions(activeWorkspaceId);
          if (updated.length > 0) {
            setActiveSessionId(updated[0].id);
            chatService.switchSession(updated[0].id);
          }
        }
        setIsLoading(false);
      }
    };
    manageSessions();
  }, [channels, activeSessionId, isLoading, isInitializing, activeWorkspaceId, fetchSessions]);
  const handleWorkspaceSelect = (id: string) => {
    if (id === activeWorkspaceId) return;
    setActiveWorkspaceId(id);
    setActiveSessionId(null);
    setThreadMessage(null);
    setChannels([]);
    setIsLoading(true);
    fetchSessions(id);
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
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-background text-foreground selection:bg-indigo-100 dark:selection:bg-indigo-900">
        <AnimatePresence>
          {isInitializing && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-[#3F0E40] flex flex-col items-center justify-center text-white"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="w-20 h-20 rounded-[2.5rem] bg-white flex items-center justify-center shadow-2xl relative">
                   <Bot className="w-10 h-10 text-[#3F0E40]" />
                   <div className="absolute inset-0 rounded-[2.5rem] border-4 border-white animate-ping opacity-20" />
                </div>
                <div className="space-y-2 text-center">
                  <h1 className="text-2xl font-black tracking-tighter">Nexus Agent Workspace</h1>
                  <div className="flex items-center justify-center gap-2 text-indigo-200/60 font-black text-xs uppercase tracking-widest">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Synchronizing Durable Objects
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {!isInitializing && (
            <motion.div
              key={activeWorkspaceId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
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
          )}
        </AnimatePresence>
        <Toaster richColors position="top-center" closeButton />
        <div className="fixed bottom-4 right-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 z-50 pointer-events-none hidden md:block select-none">
          Nexus v2.0 • Session: {activeSessionId?.slice(0, 8) || 'Init'} • Active
        </div>
      </div>
    </TooltipProvider>
  );
}