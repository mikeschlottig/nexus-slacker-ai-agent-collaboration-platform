import React, { useEffect, useState } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Hash, Plus, Settings, User, Bot, Search } from 'lucide-react';
import { SessionInfo } from '../../../worker/types';
import { Workspace } from '@/lib/chat';
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
      <CommandInput placeholder="Search channels, workspaces, or actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Channels">
          {channels.map((channel) => (
            <CommandItem
              key={channel.id}
              onSelect={() => {
                onChannelSelect(channel.id);
                setOpen(false);
              }}
              className="gap-2"
            >
              <Hash className="w-4 h-4 opacity-70" />
              <span>{channel.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Workspaces">
          {workspaces.map((ws) => (
            <CommandItem
              key={ws.id}
              onSelect={() => {
                onWorkspaceSelect(ws.id);
                setOpen(false);
              }}
              className="gap-2"
            >
              <div className={cn("w-4 h-4 rounded-sm", ws.color)} />
              <span>{ws.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => { onChannelCreate(); setOpen(false); }} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Create New Channel</span>
          </CommandItem>
          <CommandItem className="gap-2">
            <Settings className="w-4 h-4" />
            <span>Workspace Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
// Utility to fix missing cn in this file scope if needed
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}