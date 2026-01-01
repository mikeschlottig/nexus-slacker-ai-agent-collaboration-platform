import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChannelHeader } from './ChannelHeader';
import { MessageList } from './MessageList';
import { chatService } from '@/lib/chat';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Smile, RefreshCw, Bold, Italic, Link2, List, Type, AtSign } from 'lucide-react';
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
        console.error('Failed to send message:', res.error);
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
        <div className="relative group border rounded-xl bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all shadow-sm">
          <div className="flex items-center gap-0.5 p-1 border-b bg-muted/20 overflow-x-auto no-scrollbar">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><Type className="w-3.5 h-3.5" /></Button>
            <div className="w-[1px] h-4 bg-border mx-1" />
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><Bold className="w-3.5 h-3.5" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><Italic className="w-3.5 h-3.5" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><Link2 className="w-3.5 h-3.5" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><List className="w-3.5 h-3.5" /></Button>
          </div>
          <form onSubmit={handleSendMessage}>
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-sm min-h-[80px] max-h-60 outline-none"
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
            <div className="flex items-center justify-between p-2 pt-0">
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Paperclip className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Smile className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><AtSign className="w-4 h-4" /></Button>
              </div>
              <div className="flex items-center gap-3">
                {isSending && (
                  <span className="text-[10px] font-bold text-indigo-500 animate-pulse flex items-center gap-1.5 uppercase tracking-wider">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Nexus is thinking
                  </span>
                )}
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isSending}
                  className={cn(
                    "h-8 w-8 transition-all shrink-0 rounded-lg",
                    input.trim() ? "bg-[#007a5a] hover:bg-[#005a44] text-white shadow-lg" : "bg-transparent text-muted-foreground"
                  )}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
        <div className="mt-2 text-[10px] text-center text-muted-foreground">
          <b>Nexus AI</b> may occasionally provide inaccurate info. Verify important code or facts.
        </div>
      </div>
    </div>
  );
}