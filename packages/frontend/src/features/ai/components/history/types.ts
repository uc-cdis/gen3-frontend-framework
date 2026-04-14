import type { UIMessage } from '@ai-sdk/react';

// A session thread is one useChat instance. Created when the user sends
// the first message; the title is derived from that first message.
export interface SessionThread {
  id: string;
  title: string; // first ~60 chars of first user message
  preview: string; // first ~80 chars of last assistant text
  startedAt: number; // Date.now() — used for sort order
  messages: UIMessage[];
}
