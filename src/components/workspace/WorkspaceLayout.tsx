import React from 'react';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { ChatInterface } from './ChatInterface';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import type { SessionInfo } from '../../../worker/types';
interface WorkspaceLayoutProps {
  channels: SessionInfo[];
  activeSessionId: string | null;
  onChannelSelect: (id: string) => void;
  onChannelCreate: (title: string) => void;
}
export function WorkspaceLayout({ channels, activeSessionId, onChannelSelect, onChannelCreate }: WorkspaceLayoutProps) {
  const isMobile = useIsMobile();
  const activeChannel = channels.find(c => c.id === activeSessionId);
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {!isMobile && (
        <div className="w-64 flex-shrink-0 border-r bg-[#3F0E40] text-slate-100">
          <WorkspaceSidebar 
            channels={channels}
            activeSessionId={activeSessionId}
            onChannelSelect={onChannelSelect}
            onChannelCreate={onChannelCreate}
          />
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950">
        {isMobile && (
          <div className="h-12 border-b flex items-center px-4 gap-3 bg-[#3F0E40] text-white">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-1 hover:bg-white/10 rounded">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-[#3F0E40] border-none text-slate-100">
                <WorkspaceSidebar 
                  channels={channels}
                  activeSessionId={activeSessionId}
                  onChannelSelect={onChannelSelect}
                  onChannelCreate={onChannelCreate}
                />
              </SheetContent>
            </Sheet>
            <span className="font-bold truncate">Nexus</span>
          </div>
        )}
        {activeSessionId ? (
          <ChatInterface 
            sessionId={activeSessionId} 
            channelName={activeChannel?.title || 'Unknown Channel'} 
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a channel to start collaborating
          </div>
        )}
      </div>
    </div>
  );
}