'use client';

/**
 * MANTINE CHATBOT — COMPLETE WIRING EXAMPLE
 *
 * Shows how to plug MantineMessageRenderer, MantineInputArea, ReasoningBlock,
 * and StreamingMarkdown into the withChatbot HOC via the slots config.
 */

import React from 'react';
import { MantineProvider } from '@mantine/core';
import { withChatbot } from './withChatbot';
import { MessageRenderer } from './components/MessageRenderer';
import { MantineInputArea } from './components/InputArea';
import ChatShell from './components/ChatShell';

// ─── 1. Fully Mantine-themed copilot ─────────────────────────────────────────
// Drop-in replacement for the default ChatShell with all Mantine components.

export const MantineCopilot = withChatbot(ChatShell, {
  api: '/api/copilot',
  features: {
    stopButton: false, // stop is handled inside MantineInputArea directly
    toolRendering: true,
    throttleMs: 30, // smooth streaming updates
  },
  slots: {
    // Full Mantine message bubbles with reasoning accordion + streaming markdown
    MessageRenderer: MessageRenderer,
    // Auto-grow textarea with stop/send action icons
    InputArea: MantineInputArea,
    // EmptyState and ToolRenderer can be left as defaults or overridden
  },
  emptyState: {
    title: 'How can I help?',
    description: 'Ask anything — I can reason through complex problems.',
  },
  inputPlaceholder: 'Ask me anything…',
});

// ─── 2. Usage in a page ───────────────────────────────────────────────────────
// Wrap with MantineProvider if not already at the layout level.

export default function CopilotPage() {
  return (
    <MantineProvider>
      <div style={{ height: '600px', width: '480px' }}>
        <MantineCopilot />
      </div>
    </MantineProvider>
  );
}

// ─── 3. How parts flow through the message ────────────────────────────────────
//
// A single UIMessage from useChat with extended thinking looks like:
//
// {
//   id: 'msg_01...',
//   role: 'assistant',
//   parts: [
//     { type: 'reasoning', reasoning: 'Let me think about...' },  ← ReasoningBlock
//     { type: 'text', text: '# Answer\n\nHere is...' },           ← StreamingMarkdown
//     { type: 'tool-geneQuery', state: 'output-available', ... }, ← ToolRenderer slot
//   ]
// }
//
// MantineMessageRenderer maps each part.type to the right component:
//   'reasoning'        → <ReasoningBlock>   (Accordion, auto open/close)
//   'text'             → <StreamingMarkdown> (react-markdown + Mantine overrides)
//   'tool-*'           → skipped here, rendered by ToolRenderer slot in ChatShell
//   'file' (image/*)   → <img> inline
//
// The streaming cursor (blinking |) is injected at the end of <p> tags
// inside StreamingMarkdown while status === 'streaming' | 'submitted'.
//
// The ReasoningBlock auto-opens when streaming starts and auto-collapses
// when the reasoning part finishes — user can always re-expand it.

// ─── 4. Packages to install ──────────────────────────────────────────────────
//
// npm install react-markdown remark-gfm
// npm install react-syntax-highlighter @types/react-syntax-highlighter
// npm install @tabler/icons-react
//
// All Mantine packages (@mantine/core, @mantine/hooks) assumed already installed.
