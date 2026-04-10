import React, { createContext, useContext, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ChatbotConfig, ChatContextValue } from '../types';
import { CoreState, selectCSRFToken, useCoreSelector } from '@gen3/core';
import { getCookie } from 'cookies-next';

// ─── Context ──────────────────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error(
      'useChatContext must be called inside a <ChatProvider>. ' +
        'Make sure your component is wrapped with withChatbot() or <ChatProvider>.',
    );
  }
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface ChatProviderProps {
  config: ChatbotConfig;
  children: React.ReactNode;
}

export function ChatProvider({ config, children }: ChatProviderProps) {
  // Build transport at once. `useMemo` with config as dep keeps it stable
  // unless the config reference changes. In practice, define config outside
  // the render function (module-level or via useMemo in the parent).

  const csrfToken = useCoreSelector((state: CoreState) =>
    selectCSRFToken(state),
  );

  console.log('ChatProvider config:', config);

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: config.api,
      headers: () => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (process.env.NODE_ENV === 'development') {
          // NOTE: This cookie can only be accessed from the client side
          // in development mode. Otherwise, the cookie is set as httpOnly
          const accessToken = getCookie('credentials_token');
          if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        }
        if (csrfToken) {
          headers['X-CSRF-Token'] = csrfToken;
        }
        return headers;
      },

      // Body function form for same reason — sessionId, preferences, etc.
      body: config.body ? () => config.body : undefined,

      // Custom fetch middleware slot — intercept, log, or retry here.
      fetch: config.auth?.fetchMiddleware,
      // Pass credentials so cookies are sent cross-origin if needed.
      credentials: 'include',
    });
  }, [config]);

  const {
    messages,
    status,
    error,
    sendMessage: sdkSendMessage,
    stop,
    regenerate,
    clearError,
  } = useChat({
    transport,
    messages: config.initialMessages,
    onFinish: config.onFinish,
    onError: config.onError,
    experimental_throttle: config.features?.throttleMs,
  });

  // Wrap sendMessage to accept plain text — the HOC consumers shouldn't
  // need to know about the UIMessage shape for basic usage.
  const sendMessage = async (text: string) => {
    await sdkSendMessage({ text });
  };

  const value: ChatContextValue = {
    messages,
    status,
    error,
    sendMessage,
    stop,
    regenerate,
    clearError,
    config,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
