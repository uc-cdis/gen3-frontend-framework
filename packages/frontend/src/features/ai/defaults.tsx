'use client';

import React, { useEffect, useRef, useState } from 'react';
import type {
  EmptyStateProps,
  InputAreaProps,
  MessageRendererProps,
  ToolRendererProps,
} from '../types/chatbot.types';

// ─── DefaultMessageRenderer ───────────────────────────────────────────────────
// Renders text parts. Tool call parts are delegated to ToolRenderer
// via the parent MessageList (so the slot override works per-tool).

export function DefaultMessageRenderer({ message }: MessageRendererProps) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          maxWidth: '75%',
          padding: '10px 14px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? '#228be6' : '#f1f3f5',
          color: isUser ? '#fff' : '#1a1a1a',
          fontSize: '14px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            return <span key={i}>{part.text}</span>;
          }
          // Non-text parts (tool calls) are rendered by MessageList
          // using the ToolRenderer slot — skip them here.
          return null;
        })}
      </div>
    </div>
  );
}

// ─── DefaultToolRenderer ──────────────────────────────────────────────────────
// Generic fallback for any tool call part. Override per-instance via slots.

export function DefaultToolRenderer({ part }: ToolRendererProps) {
  const isLoading = part.state === 'input-available';
  const isError = part.state === 'output-error';

  return (
    <div
      style={{
        margin: '8px 0',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        background: '#f8f9fa',
        fontSize: '13px',
        color: '#495057',
        fontFamily: 'monospace',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        🔧 {part.type.replace('tool-', '')}
        {isLoading && ' …'}
        {isError && ' ⚠️'}
      </div>
      {part.input && (
        <pre style={{ margin: 0, overflow: 'auto' }}>
          {JSON.stringify(part.input, null, 2)}
        </pre>
      )}
      {part.state === 'output-available' && part.output && (
        <pre style={{ margin: '4px 0 0', overflow: 'auto', color: '#2f9e44' }}>
          {JSON.stringify(part.output, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ─── DefaultInputArea ─────────────────────────────────────────────────────────

export function DefaultInputArea({
  onSend,
  disabled,
  placeholder,
}: InputAreaProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 16px',
        borderTop: '1px solid #dee2e6',
        background: '#fff',
        alignItems: 'flex-end',
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'Type a message… (Shift+Enter for newline)'}
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          resize: 'none',
          border: '1px solid #ced4da',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '14px',
          lineHeight: '1.5',
          outline: 'none',
          fontFamily: 'inherit',
          background: disabled ? '#f1f3f5' : '#fff',
        }}
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          background: disabled || !value.trim() ? '#adb5bd' : '#228be6',
          color: '#fff',
          fontWeight: 600,
          fontSize: '14px',
          cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
          flexShrink: 0,
          height: '38px',
        }}
      >
        Send
      </button>
    </div>
  );
}

// ─── DefaultEmptyState ────────────────────────────────────────────────────────

export function DefaultEmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '8px',
        color: '#868e96',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <div style={{ fontSize: '36px' }}>💬</div>
      <div style={{ fontWeight: 600, fontSize: '16px', color: '#495057' }}>
        {title ?? 'Start a conversation'}
      </div>
      {description && (
        <div style={{ fontSize: '14px', maxWidth: '300px' }}>{description}</div>
      )}
    </div>
  );
}
