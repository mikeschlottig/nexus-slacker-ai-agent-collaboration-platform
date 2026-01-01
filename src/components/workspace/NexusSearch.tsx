import React, { useEffect, useState } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Hash, Plus, Settings, Search, Globe, FileText, Bookmark } from 'lucide-react';
import { SessionInfo } from '../../../worker/types';
import { Workspace } from '@/lib/chat';
import { cn } from '@/lib/utils';
interface NexusSearchProps {
  channels: SessionInfo[];
  workspaces: Workspace[];
  onChannelSelect: (id: string) => void;
  onWorkspaceSelect: (id: string) => void;
  onChannelCreate: () => void;
}
export function NexusSearch({ channels, workspaces, onChannelSelect, onWorkspaceSelect, onChannelCreate }: NexusSearchProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search channels, files, or actions... (Cmd+K)" />
      <CommandList className="max-h-[450px]">
        <CommandEmpty className="py-12 text-center">
          <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No matches found in this workspace.</p>
        </CommandEmpty>
        <CommandGroup heading="Active Channels">
          {channels.map((channel) => (
            <CommandItem
              key={channel.id}
              onSelect={() => {
                onChannelSelect(channel.id);
                setOpen(false);
              }}
              className="gap-3 py-2.5 px-4 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-indigo-900/50">
                <Hash className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm truncate">{channel.title}</span>
                <span className="text-[10px] text-muted-foreground truncate uppercase font-black tracking-widest">Channel</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Switch Workspace">
          {workspaces.map((ws) => (
            <CommandItem
              key={ws.id}
              onSelect={() => {
                onWorkspaceSelect(ws.id);
                setOpen(false);
              }}
              className="gap-3 py-2.5 px-4 cursor-pointer"
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm", ws.color)}>
                {ws.initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm truncate">{ws.name}</span>
                <span className="text-[10px] text-muted-foreground truncate uppercase font-black tracking-widest">Workspace</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => { onChannelCreate(); setOpen(false); }} className="gap-3 py-2.5 px-4 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900">
              <Plus className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-bold text-sm">Create New Channel</span>
          </CommandItem>
          <CommandItem className="gap-3 py-2.5 px-4 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900">
              <Settings className="w-4 h-4 text-amber-600" />
            </div>
            <span className="font-bold text-sm">Workspace Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Exploration">
           <CommandItem className="gap-3 py-2.5 px-4 cursor-pointer opacity-50">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="font-bold text-sm">Browse Public Directory</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="p-3 border-t bg-muted/20 flex justify-between items-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-4">
        <span>{channels.length + workspaces.length} items searchable</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><kbd className="bg-muted px-1 rounded border">Enter</kbd> to select</span>
          <span className="flex items-center gap-1"><kbd className="bg-muted px-1 rounded border">Esc</kbd> to close</span>
        </div>
      </div>
    </CommandDialog>
  );
}