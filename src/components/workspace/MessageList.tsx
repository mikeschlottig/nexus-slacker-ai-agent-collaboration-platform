import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { groupMessages } from '@/lib/workspace-utils';
import { Bot } from 'lucide-react';
import type { Message } from '../../../worker/types';
interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  streamingMessage?: string;
}
export function MessageList({ messages, isLoading, streamingMessage }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const grouped = groupMessages(messages);
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior
        });
      }
    }
  };
  useEffect(() => {
    scrollToBottom(streamingMessage ? 'auto' : 'smooth');
  }, [messages, streamingMessage]);
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
        {grouped.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shadow-sm">
              <Bot className="w-10 h-10 text-indigo-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-xl tracking-tight">Welcome to Nexus AI</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                This is the very beginning of the history. You can collaborate with Humans and AI Agents here.
              </p>
            </div>
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
        {streamingMessage && (
          <div className="mt-4">
            <MessageItem 
              message={{
                id: 'streaming-temp',
                role: 'assistant',
                content: streamingMessage,
                timestamp: Date.now()
              }}
              isFirstInGroup={messages.length === 0 || messages[messages.length - 1].role !== 'assistant'}
              isStreaming={true}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}