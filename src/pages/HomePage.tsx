import React, { useEffect, useState, useCallback, useRef } from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { chatService, Workspace, UserProfile } from '@/lib/chat';
import type { SessionInfo, Message } from '../../worker/types';
import { Toaster, toast } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Bot } from 'lucide-react';
export function HomePage() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [channels, setChannels] = useState<SessionInfo[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const initRef = useRef(false);
  const fetchEverything = useCallback(async () => {
    try {
      const [wsRes, profRes] = await Promise.all([
        chatService.listWorkspaces(),
        chatService.getUserProfile()
      ]);
      if (wsRes.success && wsRes.data) {
        let activeWs = wsRes.data;
        if (activeWs.length === 0) {
          const newWs = await chatService.createWorkspace('Nexus', 'bg-indigo-600');
          if (newWs.success && newWs.data) activeWs = [newWs.data];
        }
        setWorkspaces(activeWs);
        const initialWsId = activeWs[0].id;
        setActiveWorkspaceId(initialWsId);
        // Fetch sessions for initial workspace
        const sessRes = await chatService.listSessions(initialWsId);
        if (sessRes.success && sessRes.data) {
          setChannels(sessRes.data);
          if (sessRes.data.length > 0) {
            setActiveSessionId(sessRes.data[0].id);
            chatService.switchSession(sessRes.data[0].id);
          }
        }
      }
      if (profRes.success && profRes.data) {
        setUserProfile(profRes.data);
      }
    } catch (err) {
      console.error('Initialization error:', err);
      toast.error('Failed to initialize Nexus');
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
      <div className="fixed inset-0 z-[100] bg-[#3F0E40] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin opacity-20" />
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