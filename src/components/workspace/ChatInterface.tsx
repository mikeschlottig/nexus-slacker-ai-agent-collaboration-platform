import React, { useState, useEffect, useRef } from 'react';
import { ChannelHeader } from './ChannelHeader';
import { MessageList } from './MessageList';
import { chatService } from '@/lib/chat';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '../../../worker/types';
interface ChatInterfaceProps {
  sessionId: string;
  channelName: string;
}
export function ChatInterface({ sessionId, channelName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [currentModel, setCurrentModel] = useState('');
  const fetchMessages = async (isBackground = false) => {
    // Pause polling if we are currently streaming a response
    if (streamingMessage && isBackground) return;
    const res = await chatService.getMessages();
    if (res.success && res.data) {
      setMessages(res.data.messages || []);
      setCurrentModel(res.data.model || '');
    }
    if (!isBackground) setIsLoadingHistory(false);
  };
  useEffect(() => {
    setIsLoadingHistory(true);
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(interval);
  }, [sessionId]);
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const userMessageContent = input.trim();
    setInput('');
    setIsSending(true);
    setStreamingMessage('');
    // Optimistic update for user message
    const tempId = crypto.randomUUID();
    const optimisticMsg: Message = {
      id: tempId,
      role: 'user',
      content: userMessageContent,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    try {
      const res = await chatService.sendMessage(
        userMessageContent,
        undefined, 
        (chunk) => {
          setStreamingMessage(prev => prev + chunk);
        }
      );
      if (!res.success) {
        console.error('Failed to send message');
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setStreamingMessage('');
      setIsSending(false);
      fetchMessages(true);
    }
  };
  return (
    <div className="flex flex-col h-full min-w-0 overflow-hidden relative">
      <ChannelHeader 
        channelName={channelName} 
        sessionId={sessionId} 
        currentModel={currentModel}
        onModelUpdate={() => fetchMessages(true)}
      />
      <div className="flex-1 overflow-hidden relative">
        <MessageList 
          messages={messages} 
          isLoading={isLoadingHistory} 
          streamingMessage={streamingMessage}
        />
      </div>
      <div className="p-4 pt-0">
        <form
          onSubmit={handleSendMessage}
          className="relative group border rounded-lg bg-white dark:bg-zinc-900 focus-within:ring-1 focus-within:ring-ring transition-shadow"
        >
          <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><Smile className="w-4 h-4" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><Paperclip className="w-4 h-4" /></Button>
          </div>
          <div className="flex items-end p-2 gap-2">
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-1 text-sm min-h-[44px] max-h-48 outline-none"
              placeholder={`Message ${channelName}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isSending}
              className={cn(
                "h-8 w-8 transition-all shrink-0",
                input.trim() ? "bg-[#007a5a] hover:bg-[#005a44] text-white" : "bg-transparent text-muted-foreground"
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}