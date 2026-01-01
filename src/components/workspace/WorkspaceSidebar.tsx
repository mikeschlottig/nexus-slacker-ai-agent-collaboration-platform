import React, { useState } from 'react';
import { Hash, Plus, Bot, ChevronDown, Settings, Search, MessageSquare, Files, Bookmark, Send, Sparkles } from 'lucide-react';
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
    <div className="flex flex-col h-full select-none bg-[#3F0E40] border-r border-black/20 shadow-2xl">
      <div className="p-4 flex items-center justify-between h-14 border-b border-white/5 shrink-0 bg-[#350d36] shadow-sm relative z-10">
        <div className="flex items-center gap-1.5 font-black tracking-tight text-white cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-all truncate group active:scale-95">
          <span className="truncate">{workspace?.name || 'Workspace'}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-5">
          <section className="space-y-[1px]">
             {[
               { icon: Send, label: 'Drafts & Sent', color: 'text-rose-400' },
               { icon: Bookmark, label: 'Saved Items', color: 'text-amber-400' },
               { icon: Files, label: 'Files', color: 'text-blue-400' },
               { icon: Sparkles, label: 'Nexus AI Directory', color: 'text-indigo-400' }
             ].map((item, idx) => (
               <button
                 key={idx}
                 className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all font-medium opacity-60 hover:opacity-100"
               >
                 <item.icon className={cn("w-4 h-4 shrink-0", item.color)} />
                 <span className="truncate">{item.label}</span>
               </button>
             ))}
          </section>
          <section>
            <div className="px-2 py-1 flex items-center justify-between text-slate-400 group">
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest opacity-60">
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
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all font-medium border border-transparent",
                    activeSessionId === channel.id ? "bg-[#1164A3] text-white shadow-lg" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Hash className="w-4 h-4 shrink-0 opacity-40" />
                  <span className="truncate">{channel.title}</span>
                </button>
              ))}
            </div>
          </section>
          <section>
            <div className="px-2 py-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">
              <ChevronDown className="w-3 h-3" />
              <span>Direct Messages</span>
            </div>
            <div className="mt-1 space-y-[1px]">
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer transition-all group relative active:scale-95"
                onClick={() => onChannelCreate('Nexus Assistant DM')}
              >
                <div className="relative shrink-0 transition-transform group-hover:scale-105">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-[10px] text-white font-black shadow-lg">AI</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-[#3F0E40] animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black leading-none text-slate-100 group-hover:text-white transition-colors">Nexus AI</span>
                  <span className="text-[10px] text-slate-400 truncate mt-1">Online Assistant</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
      <ChannelBrowser open={isBrowserOpen} onOpenChange={setIsBrowserOpen} channels={channels} onSelect={onChannelSelect} />
      <UserProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} profile={userProfile} onUpdate={onProfileUpdate} />
      <div className="p-3 border-t border-white/5 bg-[#350d36] shrink-0">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
            <div className="relative shrink-0 transition-transform group-hover:scale-105">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-md border border-white/10", userProfile.avatarColor)}>
                {userProfile.name[0]}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#350d36]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black truncate text-white leading-none">{userProfile.name}</p>
              <p className="text-[10px] text-slate-400 truncate mt-1.5 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                {userProfile.status}
              </p>
            </div>
          </div>
          <button onClick={() => setIsProfileOpen(true)} className="opacity-40 hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all shrink-0">
            <Settings className="w-4.5 h-4.5 text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
}