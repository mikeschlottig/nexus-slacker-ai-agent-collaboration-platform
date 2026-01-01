import React, { useState, useMemo } from 'react';
import { Search, Hash, Clock, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatSlackDate } from '@/lib/workspace-utils';
import type { SessionInfo } from '../../../worker/types';
interface ChannelBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels: SessionInfo[];
  onSelect: (id: string) => void;
}
export function ChannelBrowser({ open, onOpenChange, channels, onSelect }: ChannelBrowserProps) {
  const [search, setSearch] = useState('');
  const filteredChannels = useMemo(() => {
    return channels.filter(c => 
      c.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [channels, search]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-black">Channel Browser</DialogTitle>
          <DialogDescription>
            Search and join existing conversations in this workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or description..."
              className="pl-9 bg-muted/50 focus:bg-background transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border">
            {filteredChannels.length > 0 ? (
              filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors group"
                  onClick={() => {
                    onSelect(channel.id);
                    onOpenChange(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Hash className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{channel.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last active {formatSlackDate(channel.lastActive)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                </div>
              ))
            ) : (
              <div className="p-10 text-center space-y-2">
                <p className="text-sm font-medium">No channels found</p>
                <p className="text-xs text-muted-foreground">Try a different search term or create a new channel.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="bg-muted/30 p-4 text-[11px] text-muted-foreground flex justify-between items-center border-t">
          <span>{filteredChannels.length} channels available</span>
          <span>Click to jump to channel</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}