import React from 'react';
import { X, MessageSquare, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import type { Message } from '../../../worker/types';
interface ThreadPanelProps {
  parentMessage: Message;
  onClose: () => void;
}
export function ThreadPanel({ parentMessage, onClose }: ThreadPanelProps) {
  return (
    <div className="w-[400px] flex-shrink-0 flex flex-col border-l bg-white dark:bg-zinc-950 h-full">
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0">
        <div className="flex flex-col">
          <h2 className="font-black text-sm">Thread</h2>
          <div className="flex items-center text-[11px] text-muted-foreground">
             <Hash className="w-3 h-3 mr-0.5" />
             general
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </header>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <MessageItem 
            message={parentMessage} 
            isFirstInGroup={true} 
          />
          <div className="flex items-center gap-2 py-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Replies</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <MessageSquare className="w-8 h-8 opacity-20 mb-2" />
            <p className="text-xs">No replies yet. Start the conversation!</p>
          </div>
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="border rounded-md p-2 bg-muted/30">
          <textarea 
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-xs outline-none min-h-[60px]"
            placeholder="Reply..."
          />
          <div className="flex justify-end mt-2">
            <Button size="sm" className="bg-[#007a5a] hover:bg-[#005a44] text-white h-7 text-[11px]">Send Reply</Button>
          </div>
        </div>
      </div>
    </div>
  );
}