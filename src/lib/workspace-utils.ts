import type { Message } from '../../worker/types';
export const MOCK_WORKSPACES = [
  { id: 'nexus', name: 'Nexus', initials: 'N', color: 'bg-indigo-600' },
  { id: 'dev', name: 'Development', initials: 'D', color: 'bg-[#E8912D]' },
  { id: 'marketing', name: 'Marketing', initials: 'M', color: 'bg-teal-600' },
];
export interface MessageGroup {
  senderId: string;
  role: 'user' | 'assistant' | 'system';
  messages: Message[];
}
/**
 * Groups messages by sender and timestamp to mimic Slack's layout
 */
export function groupMessages(messages: Message[]): MessageGroup[] {
  if (!messages || messages.length === 0) return [];
  const groups: MessageGroup[] = [];
  let currentGroup: MessageGroup | null = null;
  messages.forEach((msg) => {
    const senderId = msg.role === 'assistant' ? 'assistant' : 'user';
    const shouldGroup =
      currentGroup &&
      currentGroup.senderId === senderId &&
      (msg.timestamp - currentGroup.messages[currentGroup.messages.length - 1].timestamp < 300000);
    if (shouldGroup) {
      currentGroup!.messages.push(msg);
    } else {
      currentGroup = {
        senderId,
        role: msg.role,
        messages: [msg]
      };
      groups.push(currentGroup);
    }
  });
  return groups;
}
/**
 * Formats dates into Slack-like strings
 */
export function formatSlackDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today at ${timeStr}`;
  if (isYesterday) return `Yesterday at ${timeStr}`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` at ${timeStr}`;
}