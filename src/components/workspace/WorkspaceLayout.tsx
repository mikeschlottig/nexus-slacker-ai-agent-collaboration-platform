import React from 'react';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { WorkspaceRail } from './WorkspaceRail';
import { ChatInterface } from './ChatInterface';
import { ThreadPanel } from './ThreadPanel';
import { NexusSearch } from './NexusSearch';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { UserProfile, Workspace } from '@/lib/chat';
import type { SessionInfo, Message } from '../../../worker/types';
interface WorkspaceLayoutProps {
  workspaces: Workspace[];
  channels: SessionInfo[];
  activeSessionId: string | null;
  activeWorkspaceId: string;
  userProfile: UserProfile;
  onWorkspaceSelect: (id: string) => void;
  onWorkspaceCreate: (name: string, color: string) => void;
  onChannelSelect: (id: string) => void;
  onChannelCreate: (title: string) => void;
  threadMessage: Message | null;
  onThreadSelect: (msg: Message) => void;
  onThreadClose: () => void;
  onProfileUpdate: (profile: UserProfile) => void;
}
export function WorkspaceLayout({
  workspaces,
  channels,
  activeSessionId,
  activeWorkspaceId,
  userProfile,
  onWorkspaceSelect,
  onWorkspaceCreate,
  onChannelSelect,
  onChannelCreate,
  threadMessage,
  onThreadClose,
  onThreadSelect,
  onProfileUpdate
}: WorkspaceLayoutProps) {
  const isMobile = useIsMobile();
  const activeChannel = channels.find(c => c.id === activeSessionId);
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <NexusSearch 
        channels={channels} 
        workspaces={workspaces} 
        onChannelSelect={onChannelSelect} 
        onWorkspaceSelect={onWorkspaceSelect}
        onChannelCreate={() => onChannelCreate('#new-channel')}
      />
      {!isMobile && (
        <WorkspaceRail
          activeWorkspaceId={activeWorkspaceId}
          workspaces={workspaces}
          onWorkspaceSelect={onWorkspaceSelect}
          onWorkspaceCreate={onWorkspaceCreate}
        />
      )}
      {!isMobile && (
        <div className="w-64 flex-shrink-0 border-r border-border/5 h-full">
          <WorkspaceSidebar
            activeWorkspaceId={activeWorkspaceId}
            workspaces={workspaces}
            channels={channels}
            activeSessionId={activeSessionId}
            userProfile={userProfile}
            onChannelSelect={onChannelSelect}
            onChannelCreate={onChannelCreate}
            onProfileUpdate={onProfileUpdate}
          />
        </div>
      )}
      <div className="flex-1 flex min-w-0 bg-background relative h-full">
        <main className="flex-1 flex flex-col min-w-0 h-full relative">
          {isMobile && (
            <div className="h-14 border-b flex items-center px-4 gap-3 bg-[#3F0E40] text-white shrink-0 z-10">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[320px] bg-[#3F0E40] border-none text-slate-100 flex overflow-hidden">
                  <WorkspaceRail
                    activeWorkspaceId={activeWorkspaceId}
                    workspaces={workspaces}
                    onWorkspaceSelect={onWorkspaceSelect}
                    onWorkspaceCreate={onWorkspaceCreate}
                  />
                  <div className="flex-1 h-full overflow-hidden">
                    <WorkspaceSidebar
                      activeWorkspaceId={activeWorkspaceId}
                      workspaces={workspaces}
                      channels={channels}
                      activeSessionId={activeSessionId}
                      userProfile={userProfile}
                      onChannelSelect={onChannelSelect}
                      onChannelCreate={onChannelCreate}
                      onProfileUpdate={onProfileUpdate}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <div className="flex items-center gap-2 truncate">
                <span className="font-black truncate">{activeChannel?.title || 'Nexus'}</span>
              </div>
            </div>
          )}
          <div className="flex-1 min-h-0 relative">
            {activeSessionId ? (
              <ChatInterface
                sessionId={activeSessionId}
                channelName={activeChannel?.title || 'Unknown Channel'}
                onThreadSelect={onThreadSelect}
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-xl font-black">Welcome to {workspaces.find(w => w.id === activeWorkspaceId)?.name}</h2>
                <p className="text-muted-foreground text-sm mt-2">Select a channel to begin.</p>
              </div>
            )}
          </div>
          {isMobile && threadMessage && (
            <Sheet open={!!threadMessage} onOpenChange={(open) => !open && onThreadClose()}>
              <SheetContent side="right" className="p-0 w-full sm:max-w-md border-none flex flex-col h-full bg-background">
                <ThreadPanel parentMessage={threadMessage} onClose={onThreadClose} channelName={activeChannel?.title} />
              </SheetContent>
            </Sheet>
          )}
        </main>
        <AnimatePresence>
          {threadMessage && !isMobile && (
            <div className="h-full shrink-0">
               <ThreadPanel parentMessage={threadMessage} onClose={onThreadClose} channelName={activeChannel?.title} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}