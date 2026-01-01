import React, { useState } from 'react';
import { Hash, Plus, Bot, ChevronDown, Settings, Search } from 'lucide-react';
import { cn } from '@/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MOCK_WORKSPACES } from '@/lib/workspace-utils';
import { ChannelBrowser } from './ChannelBrowser';
import type { SessionInfo } from '../../../worker/types';
interface WorkspaceSidebarProps {
  activeWorkspaceId: string;
  channels: SessionInfo[];
  activeSessionId: string | null;
  onChannelSelect: (id: string) => void;
  onChannelCreate: (title: string) => void;
}
export function WorkspaceSidebar({
  activeWorkspaceId,
  channels,
  activeSessionId,
  onChannelSelect,
  onChannelCreate
}: WorkspaceSidebarProps) {
  const [newChannelName, setNewChannelName] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const workspace = MOCK_WORKSPACES.find(w => w.id === activeWorkspaceId);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelName.trim()) {
      onChannelCreate(newChannelName.startsWith('#') ? newChannelName : `#${newChannelName}`);
      setNewChannelName('');
      setIsCreateOpen(false);
    }
  };
  return (
    <div className="flex flex-col h-full select-none">
      <div className="p-4 flex items-center justify-between h-14 border-b border-white/5 shrink-0 bg-[#350d36]">
        <div className="flex items-center gap-1.5 font-black tracking-tight text-white cursor-pointer hover:bg-white/5 px-2 py-1 rounded transition-colors truncate">
          {workspace?.name || 'Workspace'}
          <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-6">
          <section>
            <div className="px-2 py-1 flex items-center justify-between text-slate-400 group">
              <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
                <ChevronDown className="w-3 h-3" />
                <span>Channels</span>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setIsBrowserOpen(true)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <button className="p-1 hover:bg-white/10 rounded">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a channel</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Channels are where your team communicates. They’re best when organized around a topic — #marketing, for example.</p>
                        <Input
                          placeholder="e.g. general"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Channel</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="mt-1 space-y-[1px]">
              {channels.length > 0 ? (
                channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => onChannelSelect(channel.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all font-medium active:scale-[0.98]",
                      activeSessionId === channel.id
                        ? "bg-[#1164A3] text-white shadow-sm"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Hash className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    <span className="truncate">{channel.title}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center">
                  <p className="text-[11px] text-slate-500 italic">No channels yet</p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-slate-300 text-xs mt-1"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    Create your first channel
                  </Button>
                </div>
              )}
              <button 
                onClick={() => setIsBrowserOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all font-medium"
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0 bg-white/10 rounded-sm">
                  <Plus className="w-2.5 h-2.5" />
                </div>
                <span>Add channels</span>
              </button>
            </div>
          </section>
          <section>
            <div className="px-2 py-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <ChevronDown className="w-3 h-3" />
              <span>Direct Messages</span>
            </div>
            <div className="mt-1 space-y-[1px]">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer active:scale-[0.98] transition-all bg-white/5 border border-white/5">
                <div className="relative">
                  <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center text-[10px] text-white font-black shadow-lg">AI</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 ring-2 ring-[#3F0E40]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold leading-none">Nexus AI</span>
                  <span className="text-[10px] opacity-40 truncate">Active Assistant</span>
                </div>
                <Bot className="w-3.5 h-3.5 opacity-60 ml-auto" />
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
      <ChannelBrowser 
        open={isBrowserOpen} 
        onOpenChange={setIsBrowserOpen}
        channels={channels}
        onSelect={onChannelSelect}
      />
      <div className="p-3 border-t border-white/10 bg-[#350d36] shrink-0">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-md bg-[#E8912D] flex items-center justify-center font-bold text-white text-xs shadow-md">
                U
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#350d36]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate text-white">User</p>
              <p className="text-[10px] text-slate-400 leading-none">Online</p>
            </div>
          </div>
          <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded transition-opacity">
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
}