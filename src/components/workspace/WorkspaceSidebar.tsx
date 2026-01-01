import React, { useState } from 'react';
import { Hash, Plus, Bot, ChevronDown, Settings, Search, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChannelBrowser } from './ChannelBrowser';
import { UserProfileDialog } from './UserProfileDialog';
import { UserProfile, Workspace } from '@/lib/chat';
import type { SessionInfo } from '../../../worker/types';
interface WorkspaceSidebarProps {
  activeWorkspaceId: string;
  workspaces: Workspace[];
  channels: SessionInfo[];
  activeSessionId: string | null;
  userProfile: UserProfile;
  onChannelSelect: (id: string) => void;
  onChannelCreate: (title: string) => void;
  onProfileUpdate: (profile: UserProfile) => void;
}
export function WorkspaceSidebar({
  activeWorkspaceId,
  workspaces,
  channels,
  activeSessionId,
  userProfile,
  onChannelSelect,
  onChannelCreate,
  onProfileUpdate
}: WorkspaceSidebarProps) {
  const [newChannelName, setNewChannelName] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const workspace = workspaces.find(w => w.id === activeWorkspaceId);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelName.trim()) {
      onChannelCreate(newChannelName.startsWith('#') ? newChannelName : `#${newChannelName}`);
      setNewChannelName('');
      setIsCreateOpen(false);
    }
  };
  return (
    <div className="flex flex-col h-full select-none bg-[#3F0E40]">
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
                <button onClick={() => setIsBrowserOpen(true)} className="p-1 hover:bg-white/10 rounded">
                  <Search className="w-3.5 h-3.5" />
                </button>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <button className="p-1 hover:bg-white/10 rounded">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create a channel</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                      <Input
                        placeholder="e.g. general"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        autoFocus
                      />
                      <DialogFooter><Button type="submit">Create Channel</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="mt-1 space-y-[1px]">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all font-medium",
                    activeSessionId === channel.id ? "bg-[#1164A3] text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Hash className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  <span className="truncate">{channel.title}</span>
                </button>
              ))}
            </div>
          </section>
          <section>
            <div className="px-2 py-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <ChevronDown className="w-3 h-3" />
              <span>Direct Messages</span>
            </div>
            <div className="mt-1 space-y-[1px]">
              <div 
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer transition-colors group"
                onClick={() => onChannelCreate('Nexus Assistant DM')}
              >
                <div className="relative shrink-0">
                  <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center text-[10px] text-white font-black shadow-lg">AI</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 ring-2 ring-[#3F0E40] animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold leading-none text-slate-100">Nexus AI</span>
                  <span className="text-[10px] text-slate-400 truncate mt-0.5">Online Assistant</span>
                </div>
                <MessageSquare className="w-3.5 h-3.5 opacity-40 ml-auto group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
      <ChannelBrowser open={isBrowserOpen} onOpenChange={setIsBrowserOpen} channels={channels} onSelect={onChannelSelect} />
      <UserProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} profile={userProfile} onUpdate={onProfileUpdate} />
      <div className="p-3 border-t border-white/10 bg-[#350d36] shrink-0">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
            <div className="relative shrink-0">
              <div className={cn("w-8 h-8 rounded-md flex items-center justify-center font-bold text-white text-xs shadow-md", userProfile.avatarColor)}>
                {userProfile.name[0]}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#350d36]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate text-white">{userProfile.name}</p>
              <p className="text-[10px] text-slate-400 leading-none truncate">{userProfile.status}</p>
            </div>
          </div>
          <button onClick={() => setIsProfileOpen(true)} className="opacity-40 hover:opacity-100 p-1.5 hover:bg-white/10 rounded transition-opacity shrink-0">
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
}