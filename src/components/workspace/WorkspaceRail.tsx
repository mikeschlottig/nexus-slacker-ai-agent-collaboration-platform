import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { MOCK_WORKSPACES } from '@/lib/workspace-utils';
interface WorkspaceRailProps {
  activeWorkspaceId: string;
  onWorkspaceSelect: (id: string) => void;
}
export function WorkspaceRail({ activeWorkspaceId, onWorkspaceSelect }: WorkspaceRailProps) {
  return (
    <div className="w-[68px] flex-shrink-0 bg-[#2C092D] flex flex-col items-center py-4 gap-4 z-20">
      {MOCK_WORKSPACES.map((ws) => (
        <TooltipProvider key={ws.id}>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div
                className="relative group cursor-pointer flex flex-col items-center w-full"
                onClick={() => onWorkspaceSelect(ws.id)}
              >
                {activeWorkspaceId === ws.id && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg transition-all duration-200 shadow-lg group-active:scale-95",
                  activeWorkspaceId === ws.id 
                    ? "rounded-[12px] ring-2 ring-white/20" 
                    : "hover:rounded-[12px] hover:scale-105 group-hover:bg-opacity-90",
                  ws.color
                )}>
                  {ws.initials}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold border-none bg-black text-white">{ws.name}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      <div className="flex-1" />
      <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rounded-[12px] hover:scale-105 active:scale-95">
        <Plus className="w-5 h-5" />
      </button>
      <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rounded-[12px] hover:scale-105 active:scale-95">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}