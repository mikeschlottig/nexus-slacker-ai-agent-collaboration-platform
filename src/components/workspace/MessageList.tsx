import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { groupMessages } from '@/lib/workspace-utils';
import type { Message } from '../../../worker/types';
interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}
export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const grouped = groupMessages(messages);
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col gap-6 p-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 rounded bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <ScrollArea ref={scrollRef} className="h-full px-4 md:px-6">
      <div className="flex flex-col py-6">
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">#</div>
            <h3 className="font-bold text-lg">This is the very beginning of the history.</h3>
            <p className="text-muted-foreground text-sm max-w-sm">Use this channel to chat with humans and AI agents. Try typing "Hello" to get started.</p>
          </div>
        )}
        {grouped.map((group, idx) => (
          <div key={idx} className="space-y-1 mt-4 first:mt-0">
            {group.messages.map((msg, mIdx) => (
              <MessageItem 
                key={msg.id} 
                message={msg} 
                isFirstInGroup={mIdx === 0} 
              />
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}