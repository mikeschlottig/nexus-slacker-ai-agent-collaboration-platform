import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { groupMessages, formatSlackDate } from '@/lib/workspace-utils';
import { Bot, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Message } from '../../../worker/types';
interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  streamingMessage?: string;
  onThreadSelect: (msg: Message) => void;
  isThreadView?: boolean;
}
function MessageSkeleton() {
  return (
    <div className="flex gap-4 px-4 py-4">
      <Skeleton className="w-9 h-9 rounded-md shrink-0 bg-muted/60" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32 bg-muted/60" />
          <Skeleton className="h-3 w-16 bg-muted/40" />
        </div>
        <Skeleton className="h-4 w-full bg-muted/30" />
        <Skeleton className="h-4 w-2/3 bg-muted/20" />
      </div>
    </div>
  );
}
export function MessageList({ messages, isLoading, streamingMessage, onThreadSelect, isThreadView = false }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const filteredMessages = isThreadView ? messages : messages.filter(m => !m.threadId);
  const grouped = groupMessages(filteredMessages);
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior
          });
        }
      }
    });
  };
  useEffect(() => {
    if (messages.length > 0 || streamingMessage) {
      scrollToBottom(streamingMessage ? 'auto' : 'smooth');
    }
  }, [messages.length, streamingMessage]);
  if (isLoading && filteredMessages.length === 0) {
    return (
      <div className="flex-1 flex flex-col py-6 max-w-7xl mx-auto w-full">
        {[1, 2, 3, 4, 5].map(i => (
          <MessageSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <ScrollArea ref={scrollRef} className="h-full">
      <div className="flex flex-col py-6 max-w-7xl mx-auto w-full">
        {grouped.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 px-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shadow-sm relative">
              <Bot className="w-10 h-10 text-indigo-500" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-indigo-900 border-2 border-indigo-100 flex items-center justify-center shadow-sm">
                <ChevronDown className="w-4 h-4 text-indigo-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black text-2xl tracking-tight text-foreground">
                {isThreadView ? "Thread History" : "Nexus Agent Channel"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                {isThreadView
                  ? "Replies in this thread are contextually isolated but share the agent's memory of the root message."
                  : "This channel is managed by a stateful AI Agent. Type a message to begin the collaboration."}
              </p>
            </div>
          </div>
        )}
        {grouped.map((group, idx) => {
          const firstMsg = group.messages[0];
          const prevGroup = idx > 0 ? grouped[idx - 1] : null;
          const showDateDivider = !prevGroup || 
            new Date(firstMsg.timestamp).toDateString() !== new Date(prevGroup.messages[0].timestamp).toDateString();
          return (
            <div key={idx} className="space-y-0.5">
              {showDateDivider && (
                <div className="flex items-center gap-4 px-4 py-6">
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 bg-background px-3 whitespace-nowrap">
                    {formatSlackDate(firstMsg.timestamp).split(' at ')[0]}
                  </span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>
              )}
              <div className="mt-4 first:mt-0">
                {group.messages.map((msg, mIdx) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    isFirstInGroup={mIdx === 0}
                    onReplyClick={onThreadSelect}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {streamingMessage && (
          <div className="mt-4 animate-in fade-in duration-300">
            <MessageItem
              message={{
                id: 'streaming-temp',
                role: 'assistant',
                content: streamingMessage,
                timestamp: Date.now()
              }}
              isFirstInGroup={true}
              isStreaming={true}
              onReplyClick={onThreadSelect}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}