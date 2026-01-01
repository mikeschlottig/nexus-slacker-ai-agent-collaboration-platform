import React from 'react';
import { Plus, Hash, Settings, Bot, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export function WorkspaceRail() {
  const workspaces = [
    { id: 'nexus', name: 'Nexus', initials: 'N', color: 'bg-indigo-600', active: true },
    { id: 'dev', name: 'Development', initials: 'D', color: 'bg-[#E8912D]', active: false },
    { id: 'marketing', name: 'Marketing', initials: 'M', color: 'bg-teal-600', active: false },
  ];
  return (
    <div className="w-[68px] flex-shrink-0 bg-[#2C092D] flex flex-col items-center py-4 gap-4 z-20">
      {workspaces.map((ws) => (
        <TooltipProvider key={ws.id}>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="relative group cursor-pointer">
                {ws.active && (
                  <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-2 h-8 bg-white rounded-r-full" />
                )}
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg transition-all duration-200",
                  ws.active ? "rounded-lg" : "hover:rounded-lg group-hover:bg-opacity-90",
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
      <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rounded-lg mt-auto">
        <Plus className="w-5 h-5" />
      </button>
      <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rounded-lg">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}