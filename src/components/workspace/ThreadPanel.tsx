import React, { useState, useEffect, useRef } from 'react';
import { X, Hash, Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { chatService } from '@/lib/chat';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '../../../worker/types';
interface ThreadPanelProps {
  parentMessage: Message;
  onClose: () => void;
  channelName?: string;
}
export function ThreadPanel({ parentMessage, onClose, channelName = 'general' }: ThreadPanelProps) {
  const [replies, setReplies] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [streamingReply, setStreamingReply] = useState('');
  const streamingRef = useRef('');
  const fetchThread = async () => {
    const res = await chatService.getMessages();
    if (res.success && res.data) {
      const threadReplies = res.data.messages.filter(m => m.threadId === parentMessage.id);
      setReplies(threadReplies);
    }
  };
  useEffect(() => {
    fetchThread();
    const interval = setInterval(fetchThread, 4000);
    return () => clearInterval(interval);
  }, [parentMessage.id]);
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const content = input.trim();
    setInput('');
    setIsSending(true);
    setStreamingReply('');
    streamingRef.current = '';
    // Optimistic UI for user message
    const tempId = crypto.randomUUID();
    const optimisticMsg: Message = {
      id: tempId,
      role: 'user',
      content: content,
      timestamp: Date.now(),
      threadId: parentMessage.id
    };
    setReplies(prev => [...prev, optimisticMsg]);
    try {
      await chatService.sendMessage(
        content,
        undefined,
        (chunk) => {
          streamingRef.current += chunk;
          setStreamingReply(streamingRef.current);
        },
        parentMessage.id
      );
    } catch (err) {
      console.error('Thread send error:', err);
    } finally {
      streamingRef.current = '';
      setStreamingReply('');
      setIsSending(false);
      fetchThread();
    }
  };
  return (
    <motion.div 
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-[400px] flex-shrink-0 flex flex-col border-l bg-white dark:bg-zinc-950 h-full shadow-xl z-30"
    >
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-white dark:bg-zinc-950">
        <div className="flex flex-col">
          <h2 className="font-black text-sm">Thread</h2>
          <div className="flex items-center text-[11px] text-muted-foreground font-medium">
             <Hash className="w-3 h-3 mr-0.5" />
             {channelName}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </header>
      <ScrollArea className="flex-1">
        <div className="py-4 space-y-4">
          <div className="pb-2">
            <MessageItem
              message={parentMessage}
              isFirstInGroup={true}
            />
          </div>
          <div className="px-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background px-2">
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-0.5">
            {replies.map((msg, idx) => (
              <MessageItem
                key={msg.id}
                message={msg}
                isFirstInGroup={idx === 0 || replies[idx-1].role !== msg.role}
              />
            ))}
            <AnimatePresence>
              {streamingReply && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2"
                >
                  <MessageItem
                    message={{
                      id: 'streaming-thread',
                      role: 'assistant',
                      content: streamingReply,
                      timestamp: Date.now(),
                      threadId: parentMessage.id
                    }}
                    isFirstInGroup={true}
                    isStreaming={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>
      <div className="p-4 bg-white dark:bg-zinc-950 border-t">
        <form 
          onSubmit={handleSendReply}
          className="border rounded-lg bg-white dark:bg-zinc-900 focus-within:ring-1 focus-within:ring-ring transition-shadow"
        >
          <div className="flex items-end p-2 gap-2">
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-1 px-1 text-xs min-h-[40px] max-h-32 outline-none"
              placeholder="Reply to thread..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply(e);
                }
              }}
            />
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><Paperclip className="w-3.5 h-3.5 text-muted-foreground" /></Button>
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || isSending}
                className={cn(
                  "h-7 w-7 transition-all shrink-0",
                  input.trim() ? "bg-[#007a5a] hover:bg-[#005a44] text-white" : "bg-transparent text-muted-foreground"
                )}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}