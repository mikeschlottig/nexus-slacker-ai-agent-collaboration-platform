import React from 'react';
import { Hash, Users, Info, Star, ChevronDown } from 'lucide-react';
import { ApiAccessDialog } from './ApiAccessDialog';
import { Button } from '@/components/ui/button';
interface ChannelHeaderProps {
  channelName: string;
  sessionId: string;
}
export function ChannelHeader({ channelName, sessionId }: ChannelHeaderProps) {
  return (
    <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-white dark:bg-zinc-950">
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="flex items-center gap-1 hover:bg-accent px-2 py-1 rounded-md cursor-pointer transition-colors min-w-0">
          <Hash className="w-4 h-4 shrink-0 opacity-70" />
          <h2 className="font-black text-base truncate">{channelName}</h2>
          <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
        </div>
        <button className="p-1 hover:bg-accent rounded-md opacity-40 hover:opacity-100 transition-all">
          <Star className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center -space-x-1 mr-2 cursor-pointer hover:bg-accent p-1 rounded-md transition-colors">
          <div className="w-5 h-5 rounded-sm bg-indigo-500 border-2 border-background flex items-center justify-center text-[8px] text-white">A</div>
          <div className="w-5 h-5 rounded-sm bg-amber-500 border-2 border-background flex items-center justify-center text-[8px] text-white">U</div>
          <span className="text-xs font-bold ml-2 text-muted-foreground">2</span>
        </div>
        <div className="h-6 w-[1px] bg-border mx-1" />
        <ApiAccessDialog sessionId={sessionId} />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Info className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}