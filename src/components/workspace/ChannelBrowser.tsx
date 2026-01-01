import React, { useState, useMemo } from 'react';
import { Search, Hash, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
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
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0 bg-background border-border">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black tracking-tight">Channel Browser</DialogTitle>
          <DialogDescription className="text-sm">
            Search and join existing conversations in the Nexus workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              placeholder="Search by name..."
              className="pl-9 bg-background border-input ring-offset-background placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-ring"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border/40">
            {channels.length === 0 ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChannels.length > 0 ? (
              <div className="px-2 py-2">
                {filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="p-3 mx-2 my-1 flex items-center justify-between hover:bg-muted/60 rounded-xl cursor-pointer transition-all group active:scale-[0.99]"
                    onClick={() => {
                      onSelect(channel.id);
                      onOpenChange(false);
                    }}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100/50 dark:border-indigo-900/50">
                        <Hash className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm truncate text-foreground">{channel.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-muted-foreground/70 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Active {formatSlackDate(channel.lastActive)}
                          </span>
                          <span className="text-[11px] text-muted-foreground/50 font-bold uppercase tracking-wider">
                            Public
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 shadow-sm border border-border/50">
                      <ArrowRight className="w-4 h-4 text-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center space-y-3">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black">No channels matching "{search}"</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different name or create a new channel.</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="bg-muted/30 px-6 py-4 text-[11px] font-bold text-muted-foreground/60 flex justify-between items-center border-t border-border/50 uppercase tracking-widest">
          <span>{filteredChannels.length} results</span>
          <div className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin opacity-20" />
            <span>Workspace: Nexus</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}