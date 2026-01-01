import React from 'react';
import { Hash, Info, Star, ChevronDown, UserPlus } from 'lucide-react';
import { ApiAccessDialog } from './ApiAccessDialog';
import { AgentSettingsDialog } from './AgentSettingsDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
interface ChannelHeaderProps {
  channelName: string;
  sessionId: string;
  currentModel: string;
  onModelUpdate: () => void;
}
export function ChannelHeader({ channelName, sessionId, currentModel, onModelUpdate }: ChannelHeaderProps) {
  return (
    <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-white dark:bg-zinc-950 z-10">
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="flex items-center gap-1 hover:bg-accent px-2 py-1 rounded-md cursor-pointer transition-colors min-w-0 group">
          <Hash className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100" />
          <h2 className="font-black text-base truncate">{channelName}</h2>
          <ChevronDown className="w-3 h-3 shrink-0 opacity-40 group-hover:opacity-100" />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1 hover:bg-accent rounded-md opacity-40 hover:opacity-100 transition-all">
                <Star className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Star this channel</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1 cursor-pointer hover:bg-accent px-2 py-1 rounded-md transition-colors mr-2">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-md bg-indigo-500 border-2 border-background flex items-center justify-center text-[8px] text-white font-bold">AI</div>
            <div className="w-6 h-6 rounded-md bg-[#E8912D] border-2 border-background flex items-center justify-center text-[8px] text-white font-bold">U</div>
          </div>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold bg-muted-foreground/10 text-muted-foreground border-none">
            2
          </Badge>
        </div>
        <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />
        <div className="flex items-center gap-1">
          <ApiAccessDialog sessionId={sessionId} />
          <AgentSettingsDialog 
            sessionId={sessionId} 
            currentModel={currentModel} 
            onUpdate={onModelUpdate} 
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Info className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Channel Details</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}