import { default as DefaultInputArea } from './InputArea';
import { default as DefaultMessageRenderer } from './MessageRenderer';
import { default as DefaultToolRenderer } from './ToolRenderer';
import { default as DefaultEmptyState } from './EmptyState';

import React, { useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';

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
        // MessageRenderer receives ToolRenderer as a prop so it can call it
        // inline at each tool part's actual index in message.parts.
        // This preserves the model's emission order: reasoning → tool → text.
        <MessageRenderer
          key={message.id}
          message={message}
          ToolRenderer={
            config.features?.toolRendering !== false ? ToolRenderer : undefined
          }
        />
      ))}
    </div>
  );
}

// ─── ChatShell ────────────────────────────────────────────────────────────────
// The top-level layout. Composed from slots; knows nothing about transport or auth.

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
