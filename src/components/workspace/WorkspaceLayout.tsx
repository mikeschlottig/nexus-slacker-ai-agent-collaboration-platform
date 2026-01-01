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
  onThreadSelect,
  onThreadClose
}: WorkspaceLayoutProps) {
  const isMobile = useIsMobile();
  const activeChannel = channels.find(c => c.id === activeSessionId);
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {!isMobile && (
        <WorkspaceRail
          activeWorkspaceId={activeWorkspaceId}
          onWorkspaceSelect={onWorkspaceSelect}
        />
      )}
      {!isMobile && (
        <div className="w-64 flex-shrink-0 border-r bg-[#3F0E40] text-slate-100">
          <WorkspaceSidebar
            activeWorkspaceId={activeWorkspaceId}
            channels={channels}
            activeSessionId={activeSessionId}
            onChannelSelect={onChannelSelect}
            onChannelCreate={onChannelCreate}
          />
        </div>
      )}
      <div className="flex-1 flex min-w-0 bg-white dark:bg-zinc-950">
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {isMobile && (
            <div className="h-12 border-b flex items-center px-4 gap-3 bg-[#3F0E40] text-white shrink-0">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-1 hover:bg-white/10 rounded">
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[328px] bg-[#3F0E40] border-none text-slate-100 flex">
                  <WorkspaceRail
                    activeWorkspaceId={activeWorkspaceId}
                    onWorkspaceSelect={onWorkspaceSelect}
                  />
                  <div className="flex-1">
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
              <span className="font-bold truncate">{activeChannel?.title || 'Nexus'}</span>
            </div>
          )}
          {activeSessionId ? (
            <ChatInterface
              sessionId={activeSessionId}
              channelName={activeChannel?.title || 'Unknown Channel'}
              onThreadSelect={onThreadSelect}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a channel to start collaborating
            </div>
          )}
          {/* Mobile Thread Sheet */}
          {isMobile && (
            <Sheet open={!!threadMessage} onOpenChange={(open) => !open && onThreadClose()}>
              <SheetContent side="right" className="p-0 w-full sm:max-w-md border-none">
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
        </div>
        <AnimatePresence>
          {threadMessage && !isMobile && (
            <ThreadPanel
              parentMessage={threadMessage}
              onClose={onThreadClose}
              channelName={activeChannel?.title}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}