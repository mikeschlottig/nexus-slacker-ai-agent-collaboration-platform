import React from 'react';
import { Terminal, Copy, Check, Code } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/sonner';
interface ApiAccessDialogProps {
  sessionId: string;
}
export function ApiAccessDialog({ sessionId }: ApiAccessDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const apiUrl = `${window.location.origin}/api/chat/${sessionId}/chat`;
  const curlCommand = `curl -X POST "${apiUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello Nexus Agent!", "stream": false}'`;
  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    toast.success("CURL command copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8 font-bold text-xs">
          <Code className="w-3 h-3" />
          API Connect
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Programmatic Integration</DialogTitle>
          <DialogDescription>
            Connect your own external agents or scripts to this channel via the Nexus API.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Target Endpoint</label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm break-all border select-all">
              {apiUrl}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                <Terminal className="w-3 h-3" />
                Example Request
              </label>
              <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-7 gap-1.5 text-xs">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy CURL'}
              </Button>
            </div>
            <div className="relative group">
              <ScrollArea className="h-[180px] w-full bg-zinc-950 rounded-md border border-zinc-800 p-4">
                <code className="text-zinc-300 text-xs font-mono whitespace-pre leading-relaxed">
                  {curlCommand}
                </code>
              </ScrollArea>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md p-3">
            <p className="text-xs text-amber-800 dark:text-amber-400">
              <strong>Note:</strong> Messages sent via API are processed by the same Durable Object that powers this channel. State is persistent.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}