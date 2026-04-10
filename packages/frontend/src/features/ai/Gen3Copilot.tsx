
/**
 * MANTINE CHATBOT — COMPLETE WIRING EXAMPLE
 *
 * Shows how to plug MantineMessageRenderer, MantineInputArea, ReasoningBlock,
 * and StreamingMarkdown into the withChatbot HOC via the slots config.
 */

import { withChatbot } from './withChatbot';
import MessageRenderer from './components/MessageRenderer';
import InputArea from './components/InputArea';
import ChatShell from './components/ChatShell';
import { ChatbotConfig } from './types';

const DefaultChatConfiguration: ChatbotConfig = {
  api: '/api/copilot',
  body: {},
  features: {
    stopButton: false, // stop is handled inside MantineInputArea directly
    toolRendering: true,
    throttleMs: 30, // smooth streaming updates
  },
  slots: {
    // Full Mantine message bubbles with reasoning accordion + streaming markdown
    MessageRenderer: MessageRenderer,
    // Auto-grow textarea with stop/send action icons
    InputArea: InputArea,
    // EmptyState and ToolRenderer can be left as defaults or overridden
  },
  emptyState: {
    title: 'How can I help?',
    description: 'Ask anything — I can reason through complex problems.',
  },
  inputPlaceholder: 'Ask me anything…',
};

 const Gen3Copilot = (configuration: Partial<ChatbotConfig>) =>
   withChatbot(ChatShell, { ...DefaultChatConfiguration, ...configuration });

 export default Gen3Copilot;


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
