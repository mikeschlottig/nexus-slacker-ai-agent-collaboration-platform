import React from 'react';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { WorkspaceRail } from './WorkspaceRail';
import { ChatInterface } from './ChatInterface';
import { ThreadPanel } from './ThreadPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import type { SessionInfo, Message } from '../../../worker/types';
interface WorkspaceLayoutProps {
  channels: SessionInfo[];
  activeSessionId: string | null;
  activeWorkspaceId: string;
  onWorkspaceSelect: (id: string) => void;
  onChannelSelect: (id: string) => void;
  onChannelCreate: (title: string) => void;
  threadMessage: Message | null;
  onThreadSelect: (msg: Message) => void;
  onThreadClose: () => void;
}
export function WorkspaceLayout({
  channels,
  activeSessionId,
  activeWorkspaceId,
  onWorkspaceSelect,
  onChannelSelect,
  onChannelCreate,
  threadMessage,
  onThreadClose,
  onThreadSelect
}: WorkspaceLayoutProps) {
  const isMobile = useIsMobile();
  const activeChannel = channels.find(c => c.id === activeSessionId);
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {!isMobile && (
        <WorkspaceRail
          activeWorkspaceId={activeWorkspaceId}
          onWorkspaceSelect={onWorkspaceSelect}
        />
      )}
      {!isMobile && (
        <div className="w-64 flex-shrink-0 border-r border-border/5 h-full">
          <WorkspaceSidebar
            activeWorkspaceId={activeWorkspaceId}
            channels={channels}
            activeSessionId={activeSessionId}
            onChannelSelect={onChannelSelect}
            onChannelCreate={onChannelCreate}
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
                    onWorkspaceSelect={onWorkspaceSelect}
                  />
                  <div className="flex-1 h-full overflow-hidden">
                    <WorkspaceSidebar
                      activeWorkspaceId={activeWorkspaceId}
                      channels={channels}
                      activeSessionId={activeSessionId}
                      onChannelSelect={onChannelSelect}
                      onChannelCreate={onChannelCreate}
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
              <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Menu className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Welcome to Nexus</h2>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Select a channel from the sidebar or browse available channels to start collaborating.
                  </p>
                </div>
              </div>
            )}
          </div>
          {isMobile && (
            <Sheet open={!!threadMessage} onOpenChange={(open) => !open && onThreadClose()}>
              <SheetContent side="right" className="p-0 w-full sm:max-w-md border-none flex flex-col h-full bg-background">
                {threadMessage && (
                  <ThreadPanel
                    parentMessage={threadMessage}
                    onClose={onThreadClose}
                    channelName={activeChannel?.title}
                  />
                )}
              </SheetContent>
            </Sheet>
          )}
        </main>
        <AnimatePresence>
          {threadMessage && !isMobile && (
            <div className="h-full shrink-0">
               <ThreadPanel
                parentMessage={threadMessage}
                onClose={onThreadClose}
                channelName={activeChannel?.title}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}