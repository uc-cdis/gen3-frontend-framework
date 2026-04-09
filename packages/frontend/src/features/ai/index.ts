// HOC — primary entry point
export { withChatbot } from './hoc/withChatbot';

// Context + hook — for consuming chat state anywhere in the tree
export { ChatProvider, useChatContext } from './context/ChatContext';

// Shell — the default full layout; pass as WrappedComponent to withChatbot
export { ChatShell } from './components/ChatShell';

// Default slot components — import to use directly or as fallback references
export {
  DefaultMessageRenderer,
  DefaultToolRenderer,
  DefaultInputArea,
  DefaultEmptyState,
} from './components/defaults';

// Types — everything a consumer needs to type their config and slots
export type {
  ChatbotConfig,
  ChatbotAuth,
  ChatbotFeatures,
  ChatbotSlots,
  ChatContextValue,
  MessageRendererProps,
  ToolRendererProps,
  InputAreaProps,
  EmptyStateProps,
  KnownToolPart,
  ToolCallState,
} from './types/chatbot.types';
