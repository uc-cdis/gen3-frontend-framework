'use client';

import React from 'react';
import { ChatProvider } from './context/ChatContext';
import type { ChatbotConfig } from './types';

/**
 * withChatbot — Higher Order Component
 *
 * Wraps any component with a ChatProvider configured by `config`.
 * The wrapped component and all its descendants can call `useChatContext()`
 * to access messages, sendMessage, status, stop, regenerate, etc.
 *
 * @example
 * ```tsx
 * // One-liner instantiation for a specific use case:
 * const GenomicsCopilot = withChatbot(ChatShell, {
 *   api: '/api/copilot',
 *   auth: {
 *     getToken: () => authStore.getToken(),
 *     getCsrfToken: () => csrfStore.getToken(),
 *   },
 *   body: { systemPrompt: 'You are a genomics assistant...' },
 *   slots: {
 *     ToolRenderer: GenomicsToolRenderer,
 *     EmptyState: GenomicsEmptyState,
 *   },
 *   features: { stopButton: true, toolRendering: true },
 *   emptyState: { title: 'Ask about genes, variants, or cases' },
 * });
 *
 * // Usage:
 * <GenomicsCopilot />
 * ```
 */
export function withChatbot<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: ChatbotConfig,
): React.ComponentType<P> {
  const displayName =
    WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component';

  function ChatbotHOC(props: P) {
    return (
      <ChatProvider config={config}>
        <WrappedComponent {...props} />
      </ChatProvider>
    );
  }

  ChatbotHOC.displayName = `withChatbot(${displayName})`;
  return ChatbotHOC;
}
