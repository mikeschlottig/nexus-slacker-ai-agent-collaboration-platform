import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { formatTime } from '@/lib/chat';
import { cn } from '@/lib/utils';
import { Bot, Wrench, ChevronRight, ChevronDown, Reply, SmilePlus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Message, ToolCall } from '../../../worker/types';
interface MessageItemProps {
  message: Message;
  isFirstInGroup: boolean;
  isStreaming?: boolean;
  onReplyClick?: (msg: Message) => void;
}
function ToolCallCard({ tool }: { tool: ToolCall }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasResult = !!tool.result;
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full max-w-2xl my-2">
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 text-[11px] bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40 transition-colors w-fit px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 group">
          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />}
          <Wrench className="w-3 h-3" />
          <span className="font-mono font-bold uppercase tracking-tighter">call: {tool.name}</span>
          <span className={cn(
            "ml-2 px-1.5 rounded-[4px] text-[9px] uppercase font-black",
            hasResult ? "bg-green-100 text-green-700 dark:bg-green-900/40" : "bg-amber-100 text-amber-700 animate-pulse"
          )}>
            {hasResult ? 'Success' : 'Active'}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        <div className="bg-[#1e1e1e] rounded-xl border border-border shadow-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
             <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Input Parameters</span>
             <Wrench className="w-3 h-3 text-zinc-600" />
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus as any}
            language="json"
            customStyle={{ margin: 0, padding: 0, background: 'transparent', fontSize: '11px', borderRadius: '8px' }}
          >
            {JSON.stringify(tool.arguments || {}, null, 2)}
          </SyntaxHighlighter>
          {hasResult && (
            <>
              <div className="h-px bg-zinc-800 my-4" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-black text-emerald-500 tracking-widest">Execution Result</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <SyntaxHighlighter
                style={vscDarkPlus as any}
                language="json"
                customStyle={{ margin: 0, padding: 0, background: 'transparent', fontSize: '11px', borderRadius: '8px' }}
              >
                {JSON.stringify(tool.result, null, 2)}
              </SyntaxHighlighter>
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
export function MessageItem({ message, isFirstInGroup, isStreaming, onReplyClick }: MessageItemProps) {
  const isAssistant = message.role === 'assistant';
  const hasReplies = (message.replyCount || 0) > 0;
  const isThreadContext = !!message.threadId;
  return (
    <div className={cn(
      "group flex gap-4 px-4 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all relative",
      !isFirstInGroup && "py-0.5",
      isThreadContext && "bg-indigo-50/10 dark:bg-indigo-500/5 border-l-2 border-indigo-500/20"
    )}>
      <div className="absolute right-4 top-1 opacity-0 group-hover:opacity-100 transition-all z-20 bg-background border border-border rounded-lg shadow-xl p-0.5 flex items-center">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors">
                <SmilePlus className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px] font-bold">Add reaction</TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => onReplyClick?.(message)}
              >
                <Reply className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px] font-bold">Reply in thread</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="w-9 shrink-0 flex justify-center">
        {isFirstInGroup ? (
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white uppercase shadow-sm select-none transition-transform group-hover:scale-105",
            isAssistant ? "bg-indigo-600" : "bg-[#E8912D]"
          )}>
            {isAssistant ? <Bot className="w-5 h-5" /> : (message.role?.[0] || 'U')}
          </div>
        ) : (
          <div className="opacity-0 group-hover:opacity-100 text-[10px] text-muted-foreground/60 mt-1 cursor-default transition-opacity font-medium select-none">
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {isFirstInGroup && (
          <div className="flex items-baseline gap-2 mb-0.5 select-none">
            <span className="font-black text-sm hover:underline cursor-pointer text-foreground">
              {isAssistant ? 'Nexus AI' : 'Human'}
            </span>
            {isAssistant && (
              <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[9px] font-black rounded uppercase tracking-wider border border-indigo-200/50 dark:border-indigo-800/50">Agent</span>
            )}
            <span className="text-[11px] text-muted-foreground/70 font-medium">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
        <div className={cn(
          "text-sm leading-relaxed prose prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent",
          isStreaming && "after:content-['●'] after:ml-1 after:animate-pulse after:text-indigo-500"
        )}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="rounded-xl overflow-hidden my-3 border border-border shadow-lg bg-[#1e1e1e]">
                    <div className="bg-zinc-800 px-3 py-1.5 text-[10px] font-mono text-zinc-400 border-b border-zinc-700 flex justify-between items-center uppercase font-black tracking-widest">
                      <span>{match[1]}</span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-zinc-600" />
                        <div className="w-2 h-2 rounded-full bg-zinc-600" />
                      </div>
                    </div>
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={cn("bg-muted px-1.5 py-0.5 rounded text-[12px] font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-border/50", className)} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content || ''}
          </ReactMarkdown>
        </div>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.toolCalls.map((tool, i) => (
              <ToolCallCard key={tool.id || i} tool={tool} />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          {isAssistant && !isStreaming && (
            <div className="flex items-center gap-1.5">
              <button className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50 hover:bg-muted text-[10px] font-bold transition-colors border border-transparent hover:border-border">
                <span>����</span>
                <span className="text-muted-foreground">1</span>
              </button>
              <button className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50 hover:bg-muted text-[10px] font-bold transition-colors border border-transparent hover:border-border">
                <span>✅</span>
                <span className="text-muted-foreground">1</span>
              </button>
            </div>
          )}
          {hasReplies && !message.threadId && (
            <button
              onClick={() => onReplyClick?.(message)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 group/thread transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 w-fit"
            >
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center text-[8px] text-white border-2 border-background font-black shadow-sm">AI</div>
                <div className="w-5 h-5 rounded-md bg-[#E8912D] flex items-center justify-center text-[8px] text-white border-2 border-background font-black shadow-sm">U</div>
              </div>
              <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 group-hover/thread:underline">
                {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
              </span>
              <ChevronRight className="w-3 h-3 text-indigo-400 group-hover/thread:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}