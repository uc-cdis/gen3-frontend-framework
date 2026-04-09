import React from 'react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
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
