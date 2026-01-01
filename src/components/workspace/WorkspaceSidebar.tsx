import React, { useState } from 'react';
import { Hash, Plus, MessageSquare, Bot, ChevronDown, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SessionInfo } from '../../../worker/types';
interface WorkspaceSidebarProps {
  channels: SessionInfo[];
  activeSessionId: string | null;
  onChannelSelect: (id: string) => void;
  onChannelCreate: (title: string) => void;
}
export function WorkspaceSidebar({ channels, activeSessionId, onChannelSelect, onChannelCreate }: WorkspaceSidebarProps) {
  const [newChannelName, setNewChannelName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelName.trim()) {
      onChannelCreate(newChannelName.startsWith('#') ? newChannelName : `#${newChannelName}`);
      setNewChannelName('');
      setIsDialogOpen(false);
    }
  };
  return (
    <div className="flex flex-col h-full select-none">
      <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <h1 className="font-black text-xl tracking-tight">Nexus</h1>
        <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
          <Monitor className="w-4 h-4" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-6">
          <section>
            <div className="px-2 py-1 flex items-center justify-between text-slate-400 hover:text-slate-100 transition-colors cursor-pointer group">
              <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                <ChevronDown className="w-3 h-3" />
                <span>Channels</span>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-opacity">
                    <Plus className="w-4 h-4" />
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
            <div className="mt-1 space-y-[2px]">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                    activeSessionId === channel.id 
                      ? "bg-[#1164A3] text-white" 
                      : "text-slate-300 hover:bg-white/10"
                  )}
                >
                  <Hash className="w-4 h-4 shrink-0 opacity-60" />
                  <span className="truncate">{channel.title}</span>
                </button>
              ))}
            </div>
          </section>
          <section>
            <div className="px-2 py-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              <ChevronDown className="w-3 h-3" />
              <span>Direct Messages</span>
            </div>
            <div className="mt-1 space-y-[2px]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-slate-300 hover:bg-white/10 cursor-pointer">
                <div className="w-4 h-4 rounded-sm bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">A</div>
                <span>Nexus AI</span>
                <Bot className="w-3 h-3 opacity-40 ml-auto" />
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-white/10 bg-[#350d36] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#E8912D] flex items-center justify-center font-bold text-white">
            U
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">User</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-xs text-slate-400">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}