import type { UIMessage } from '@ai-sdk/react';

// ─── Tool Part Types ──────────────────────────────────────────────────────────
// Extend this discriminated union with your domain-specific tool names.
// Each tool call part from useChat will have a `type` of `tool-{toolName}`.
export type ToolCallState =
  | 'input-available'
  | 'output-available'
  | 'output-error';

export interface KnownToolPart {
  type: `tool-${string}`; // e.g. 'tool-field_lookup_tool'
  toolCallId: string;
  state: ToolCallState;
  input?: unknown;
  output?: unknown;
}

// Per-tool component type for the registry.
// Uses the same props so registered components are drop-in replacements.
export type ToolRendererComponent = React.ComponentType<ToolRendererProps>;

// Registry: tool type suffix → component
// e.g. { 'field_lookup_tool': FieldLookupToolRenderer }
export type ToolRegistry = Record<string, ToolRendererComponent>;

// ─── Slot Component Props ─────────────────────────────────────────────────────

export interface MessageRendererProps {
  message: UIMessage;
}

export interface ToolRendererProps {
  part: KnownToolPart;
  messageId: string;
}

export interface InputAreaProps {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
}

// ─── Features Flags ───────────────────────────────────────────────────────────

export interface ChatbotFeatures {
  /** Show a stop button while streaming. Default: true */
  stopButton?: boolean;
  /** Show a regenerate chat button on the last assistant message. Default: true */
  regenerate?: boolean;
  /** Enable tool call part rendering via ToolRenderer slot. Default: true */
  toolRendering?: boolean;
  /** Throttle UI re-renders (ms). Undefined = no throttle. */
  throttleMs?: number;
}

// ─── UI Slots ─────────────────────────────────────────────────────────────────

export interface ChatbotSlots {
  /** Renders a single message bubble. Falls back to DefaultMessageRenderer. */
  MessageRenderer?: React.ComponentType<MessageRendererProps>;
  /** Renders the input area at the bottom. Falls back to DefaultInputArea. */
  InputArea?: React.ComponentType<InputAreaProps>;
  /** Renders when the message list is empty. Falls back to DefaultEmptyState. */
  EmptyState?: React.ComponentType<EmptyStateProps>;
}

// ─── Transport / Auth ─────────────────────────────────────────────────────────

export interface ChatbotAuth {
  /** Optional custom fetch — useful for middleware, logging, retry logic. */
  fetchMiddleware?: typeof fetch;
}

// ─── Main Config ──────────────────────────────────────────────────────────────

export interface ChatbotConfig {
  /** API endpoint. Default: '/api/chat' */
  api: string;
  /** Auth / transport configuration. */
  auth?: ChatbotAuth;
  /** Extra static body properties sent with every request. */
  body?: Record<string, unknown>;
  /** Seed messages pre-loaded into the conversation. */
  initialMessages?: UIMessage[];
  /** Lifecycle: called when the assistant finishes a response. */
  onFinish?: (options: { message: UIMessage; messages: UIMessage[] }) => void;
  /** Lifecycle: called on request/stream error. */
  onError?: (error: Error) => void;
  /** Feature flags. */
  features?: ChatbotFeatures;
  /** Component overrides. */
  slots?: ChatbotSlots;
  /** Passed through to EmptyState slot. */
  emptyState?: Pick<EmptyStateProps, 'title' | 'description'>;
  /** Passed through to InputArea slot. */
  inputPlaceholder?: string;
  tools?: ToolRegistry; // 👈 replaces slots.ToolRenderer
}

// ─── Context Value ────────────────────────────────────────────────────────────

export interface ChatContextValue {
  messages: UIMessage[];
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  error: Error | undefined;
  sendMessage: (text: string) => Promise<void>;
  stop: () => void;
  regenerate: () => Promise<void>;
  clearError: () => void;
  config: ChatbotConfig;
  tools: ToolRegistry;
}
