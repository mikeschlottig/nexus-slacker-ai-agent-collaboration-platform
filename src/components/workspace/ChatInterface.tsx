import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChannelHeader } from './ChannelHeader';
import { MessageList } from './MessageList';
import { chatService } from '@/lib/chat';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Smile, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '../../../worker/types';
interface ChatInterfaceProps {
  sessionId: string | null;
  channelName: string;
  onThreadSelect: (msg: Message) => void;
}
export function ChatInterface({ sessionId, channelName, onThreadSelect }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [currentModel, setCurrentModel] = useState('');
  const streamingRef = useRef('');
  const fetchMessages = useCallback(async (isBackground = false) => {
    if (!sessionId) return;
    if (streamingRef.current && isBackground) return;
    try {
      if (!isBackground) setIsRetrying(false);
      const res = await chatService.getMessages();
      if (res.success && res.data) {
        setMessages(res.data.messages || []);
        setCurrentModel(res.data.model || '');
        setIsRetrying(false);
      } else if (res.error) {
        if (!isBackground) setIsRetrying(true);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (!isBackground) setIsRetrying(true);
    } finally {
      if (!isBackground) setIsLoadingHistory(false);
    }
  }, [sessionId]);
  useEffect(() => {
    if (!sessionId) return;
    setIsLoadingHistory(true);
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(interval);
  }, [sessionId, fetchMessages]);
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !sessionId) return;
    const userMessageContent = input.trim();
    setInput('');
    setIsSending(true);
    setStreamingMessage('');
    streamingRef.current = '';
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
          streamingRef.current += chunk;
          setStreamingMessage(streamingRef.current);
        }
      );
      if (!res.success) {
        console.error('Failed to send message');
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      streamingRef.current = '';
      setStreamingMessage('');
      setIsSending(false);
      fetchMessages(true);
    }
  };
  if (!sessionId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-4 opacity-20" />
        <p className="text-sm font-medium">Initializing Workspace Session...</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full min-w-0 overflow-hidden relative">
      <ChannelHeader
        channelName={channelName}
        sessionId={sessionId}
        currentModel={currentModel}
        onModelUpdate={() => fetchMessages(true)}
      />
      <div className="flex-1 overflow-hidden relative">
        {isRetrying && (
          <div className="absolute top-2 inset-x-0 z-20 flex justify-center pointer-events-none">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-3 py-1 rounded-full flex items-center gap-2 shadow-sm pointer-events-auto animate-in slide-in-from-top-2">
              <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Reconnecting to Agent...</span>
            </div>
          </div>
        )}
        <MessageList
          messages={messages}
          isLoading={isLoadingHistory}
          streamingMessage={streamingMessage}
          onThreadSelect={onThreadSelect}
        />
      </div>
      <div className="p-4 pt-0">
        <form
          onSubmit={handleSendMessage}
          className="relative group border rounded-lg bg-white dark:bg-zinc-900 focus-within:ring-1 focus-within:ring-ring transition-shadow"
        >
          <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><Smile className="w-4 h-4 text-muted-foreground" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><Paperclip className="w-4 h-4 text-muted-foreground" /></Button>
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
              autoFocus
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