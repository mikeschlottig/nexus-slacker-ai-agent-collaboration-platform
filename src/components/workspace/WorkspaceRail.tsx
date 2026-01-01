import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { MOCK_WORKSPACES } from '@/pages/HomePage';
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
                className="relative group cursor-pointer"
                onClick={() => onWorkspaceSelect(ws.id)}
              >
                {activeWorkspaceId === ws.id && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-2 h-8 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg transition-all duration-200",
                  activeWorkspaceId === ws.id ? "rounded-lg" : "hover:rounded-lg group-hover:bg-opacity-90",
                  ws.color
                )}>
                  {ws.initials}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold">{ws.name}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      <div className="flex-1" />
      <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rounded-lg">
        <Plus className="w-5 h-5" />
      </button>
      <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rounded-lg">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}