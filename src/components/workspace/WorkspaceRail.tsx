import React, { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Workspace } from '@/lib/chat';
interface WorkspaceRailProps {
  activeWorkspaceId: string;
  workspaces: Workspace[];
  onWorkspaceSelect: (id: string) => void;
  onWorkspaceCreate: (name: string, color: string) => void;
}
const COLORS = [
  'bg-indigo-600', 'bg-teal-600', 'bg-rose-600', 'bg-amber-600', 
  'bg-emerald-600', 'bg-blue-600', 'bg-purple-600'
];
export function WorkspaceRail({ activeWorkspaceId, workspaces, onWorkspaceSelect, onWorkspaceCreate }: WorkspaceRailProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onWorkspaceCreate(newName.trim(), selectedColor);
      setNewName('');
      setIsCreateOpen(false);
    }
  };
  return (
    <div className="w-[68px] flex-shrink-0 bg-[#2C092D] flex flex-col items-center py-4 gap-4 z-20">
      <TooltipProvider>
        {workspaces.map((ws) => (
          <Tooltip key={ws.id} delayDuration={0}>
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
        ))}
      </TooltipProvider>
      <div className="flex-1" />
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rounded-[12px] hover:scale-105 active:scale-95">
                  <Plus className="w-5 h-5" />
                </button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">Create Workspace</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Workspace Name</label>
              <Input 
                placeholder="e.g. Acme Corp" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-lg transition-all",
                      color,
                      selectedColor === color ? "ring-4 ring-white ring-offset-2 ring-offset-background" : "opacity-70 hover:opacity-100"
                    )}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit">Create Workspace</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rounded-[12px] hover:scale-105 active:scale-95">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}