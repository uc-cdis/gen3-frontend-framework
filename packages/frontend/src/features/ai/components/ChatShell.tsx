'use client';

import React, { useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';
import type { KnownToolPart } from '../types';
import type { UIMessage } from '@ai-sdk/react';
import { default as DefaultInputArea } from './InputArea';
import { default as DefaultMessageRenderer } from './MessageRenderer';
import { default as DefaultToolRenderer } from './ToolRenderer';
import { default as DefaultEmptyState } from './EmptyState';

// ─── StatusBar ────────────────────────────────────────────────────────────────

function StatusBar() {
  const { status, error, stop, regenerate, clearError, config } =
    useChatContext();
  const { stopButton = true, regenerate: canRegenerate = true } =
    config.features ?? {};

  if (status === 'error' && error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 16px',
          background: '#fff5f5',
          borderTop: '1px solid #ffc9c9',
          fontSize: '13px',
          color: '#c92a2a',
        }}
      >
        <span>⚠️ {error.message}</span>
        <button
          onClick={clearError}
          style={{
            border: 'none',
            background: 'none',
            color: '#c92a2a',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (status === 'streaming' || status === 'submitted') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 16px',
          background: '#f8f9fa',
          borderTop: '1px solid #dee2e6',
          fontSize: '13px',
          color: '#868e96',
        }}
      >
        <span>{status === 'submitted' ? 'Thinking…' : 'Responding…'}</span>
        {stopButton && (
          <button
            onClick={stop}
            style={{
              border: '1px solid #ced4da',
              borderRadius: '6px',
              background: '#fff',
              padding: '2px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#495057',
            }}
          >
            Stop
          </button>
        )}
      </div>
    );
  }

  if (status === 'ready' && canRegenerate) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '4px 16px',
          borderTop: '1px solid #f1f3f5',
          background: '#fff',
        }}
      >
        <button
          onClick={() => regenerate()}
          style={{
            border: 'none',
            background: 'none',
            fontSize: '12px',
            color: '#868e96',
            cursor: 'pointer',
          }}
        >
          ↺ Regenerate
        </button>
      </div>
    );
  }

  return null;
}

// ─── MessageList ──────────────────────────────────────────────────────────────

function MessageList() {
  const { messages, config } = useChatContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    MessageRenderer = DefaultMessageRenderer,
    ToolRenderer = DefaultToolRenderer,
    EmptyState = DefaultEmptyState,
  } = config.slots ?? {};

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <EmptyState
          title={config.emptyState?.title}
          description={config.emptyState?.description}
        />
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages.map((message) => (
        <MessageWithTools
          key={message.id}
          message={message}
          MessageRenderer={MessageRenderer}
          ToolRenderer={ToolRenderer}
          toolRendering={config.features?.toolRendering ?? true}
        />
      ))}
    </div>
  );
}

// ─── MessageWithTools ─────────────────────────────────────────────────────────
// Splits a UIMessage into text parts (→ MessageRenderer) and tool parts
// (→ ToolRenderer). This keeps each slot focused on one responsibility.

interface MessageWithToolsProps {
  message: UIMessage;
  MessageRenderer: React.ComponentType<{ message: UIMessage }>;
  ToolRenderer: React.ComponentType<{ part: KnownToolPart; messageId: string }>;
  toolRendering: boolean;
}

function MessageWithTools({
  message,
  MessageRenderer,
  ToolRenderer,
  toolRendering,
}: MessageWithToolsProps) {
  const toolParts = toolRendering
    ? (message.parts.filter((p) =>
        p.type.startsWith('tool-'),
      ) as KnownToolPart[])
    : [];

  return (
    <div>
      {/* Render the message bubble (text parts handled inside) */}
      <MessageRenderer message={message} />

      {/* Render each tool call part via the swappable ToolRenderer slot */}
      {toolParts.map((part, i) => (
        <ToolRenderer
          key={`${message.id}-tool-${i}`}
          part={part}
          messageId={message.id}
        />
      ))}
    </div>
  );
}

// ─── ChatShell ────────────────────────────────────────────────────────────────
// The top-level layout. Composed of slots; knows nothing about transport or auth.

const ChatShell = () => {
  const { sendMessage, status, config } = useChatContext();
  const { InputArea = DefaultInputArea } = config.slots ?? {};

  const isDisabled = status === 'submitted' || status === 'streaming';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #dee2e6',
      }}
    >
      <MessageList />
      <StatusBar />
      <InputArea
        onSend={sendMessage}
        disabled={isDisabled}
        placeholder={config.inputPlaceholder}
      />
    </div>
  );
};

export default ChatShell;
