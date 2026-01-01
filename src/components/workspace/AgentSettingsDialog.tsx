import React, { useState } from 'react';
import { Settings, Bot, Cpu, CheckCircle2, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { chatService, MODELS } from '@/lib/chat';
import { toast } from 'sonner';
interface AgentSettingsDialogProps {
  sessionId: string;
  currentModel: string;
  onUpdate: () => void;
}
export function AgentSettingsDialog({ sessionId, currentModel, onUpdate }: AgentSettingsDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const handleModelChange = async (value: string) => {
    setIsUpdating(true);
    try {
      const res = await chatService.updateModel(value);
      if (res.success) {
        toast.success("Agent configuration updated", {
          description: `Active model changed to ${MODELS.find(m => m.id === value)?.name}`,
          icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
        });
        onUpdate();
      } else {
        toast.error("Failed to update agent");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            Agent Configuration
          </DialogTitle>
          <DialogDescription>
            Configure the AI personality and model for this specific channel.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" />
              Intelligence Model
            </Label>
            <Select 
              value={currentModel} 
              onValueChange={handleModelChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Different models have varying capabilities for speed, reasoning, and tool usage accuracy.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Info className="w-3.5 h-3.5" />
              Channel Persistence
            </div>
            <div className="text-[11px] text-muted-foreground space-y-1">
              <p>• Unique Session ID: <code className="bg-muted px-1 rounded">{sessionId.slice(0, 8)}...</code></p>
              <p>• History is stored locally in a dedicated Cloudflare Durable Object.</p>
              <p>• Memory is persistent across sessions and multiple participants.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}