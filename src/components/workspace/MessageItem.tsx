import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { formatTime } from '@/lib/chat';
import { cn } from '@/lib/utils';
import { Bot, Wrench } from 'lucide-react';
import type { Message } from '../../../worker/types';
interface MessageItemProps {
  message: Message;
  isFirstInGroup: boolean;
}
export function MessageItem({ message, isFirstInGroup }: MessageItemProps) {
  const isAssistant = message.role === 'assistant';
  return (
    <div className={cn(
      "group flex gap-4 px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-md transition-colors",
      !isFirstInGroup && "mt-0"
    )}>
      <div className="w-9 shrink-0 flex justify-center">
        {isFirstInGroup ? (
          <div className={cn(
            "w-9 h-9 rounded-md flex items-center justify-center font-bold text-white uppercase shadow-sm",
            isAssistant ? "bg-indigo-600" : "bg-[#E8912D]"
          )}>
            {isAssistant ? <Bot className="w-5 h-5" /> : message.role[0]}
          </div>
        ) : (
          <div className="opacity-0 group-hover:opacity-100 text-[10px] text-muted-foreground mt-1 cursor-default">
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {isFirstInGroup && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-black text-sm hover:underline cursor-pointer">
              {isAssistant ? 'Nexus AI' : 'Human'}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
        <div className="text-sm leading-relaxed prose prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="rounded-md overflow-hidden my-2 border border-border">
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
                  <code className={cn("bg-muted px-1 rounded text-xs font-mono", className)} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.toolCalls.map((tool, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] bg-muted/50 w-fit px-2 py-1 rounded border border-border text-muted-foreground italic">
                <Wrench className="w-3 h-3" />
                <span>Executed: {tool.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}