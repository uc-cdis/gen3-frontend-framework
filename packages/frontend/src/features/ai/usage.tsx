'use client';

/**
 * USAGE EXAMPLES
 * Three instantiations showing how to configure the chatbot HOC
 * for different use cases in the Gen3 / MMRF context.
 */

import React from 'react';
import {
  ChatProvider,
  ChatShell,
  ChatShell as Shell,
  type ToolRendererProps,
  useChatContext,
  withChatbot,
} from './index';

// ─── Example 1: Basic copilot with auth ───────────────────────────────────────
// Zero custom slots — uses all defaults. Just wire up auth + endpoint.

export const BasicCopilot = withChatbot(ChatShell, {
  api: '/api/copilot',
  auth: {
    getToken: () => window.__auth?.accessToken ?? '',
    getCsrfToken: () => document.cookie.match(/csrftoken=([^;]+)/)?.[1] ?? '',
  },
  emptyState: {
    title: 'How can I help?',
    description: 'Ask anything about your data.',
  },
});

// ─── Example 2: Genomics copilot with custom tool renderer ────────────────────
// Overrides only the ToolRenderer slot for gene-specific tool call display.

function GenomicsToolRenderer({ part, messageId }: ToolRendererProps) {
  if (part.type === 'tool-geneQuery') {
    const geneId = part.input?.geneId ?? '—';
    const isLoading = part.state === 'input-available';
    return (
      <div
        style={{
          padding: '8px 12px',
          border: '1px solid #74c0fc',
          borderRadius: 8,
          margin: '6px 0',
          background: '#e7f5ff',
          fontSize: 13,
        }}
      >
        <strong>🧬 Gene Query</strong>: {geneId}
        {isLoading && (
          <span style={{ color: '#868e96' }}> — querying Elasticsearch…</span>
        )}
        {part.state === 'output-available' && (
          <pre style={{ margin: '4px 0 0', fontSize: 12 }}>
            {JSON.stringify(part.output, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (part.type === 'tool-navigateIGV') {
    return (
      <div
        style={{
          padding: '8px 12px',
          border: '1px solid #b2f2bb',
          borderRadius: 8,
          margin: '6px 0',
          background: '#ebfbee',
          fontSize: 13,
        }}
      >
        <strong>🔬 IGV Navigation</strong>: <code>{part.input?.locus}</code>
      </div>
    );
  }

  // Fallback for unknown tools
  return (
    <div style={{ fontSize: 12, color: '#868e96', margin: '4px 0' }}>
      Tool: {part.type}
    </div>
  );
}

export const GenomicsCopilot = withChatbot(ChatShell, {
  api: '/api/genomics-copilot',
  auth: {
    getToken: () => window.__auth?.accessToken ?? '',
    getCsrfToken: () => document.cookie.match(/csrftoken=([^;]+)/)?.[1] ?? '',
  },
  body: {
    // Injected server-side into the system prompt by the API route
    domain: 'genomics',
  },
  features: {
    stopButton: true,
    toolRendering: true,
    throttleMs: 50, // smooth streaming for long gene data responses
  },
  slots: {
    ToolRenderer: GenomicsToolRenderer,
  },
  emptyState: {
    title: 'Genomics Assistant',
    description:
      'Ask about genes, variants, BRAF/KRAS mutations, or navigate to a locus.',
  },
  inputPlaceholder: 'Ask about a gene, variant, or case…',
});

// ─── Example 3: Custom shell (if ChatShell doesn't fit your Mantine layout) ───
// Build your own shell component and use useChatContext() directly.

function MantineChatShell() {
  // All chat state comes from context — no props needed.
  const { messages, sendMessage, status, stop, config } = useChatContext();
  const isStreaming = status === 'streaming' || status === 'submitted';

  // You'd swap these for Mantine's Stack, ScrollArea, Textarea, Button, etc.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 12 }}>
            <strong>{m.role === 'user' ? 'You' : 'Assistant'}</strong>
            {m.parts.map((p, i) =>
              p.type === 'text' ? (
                <p key={i} style={{ margin: '4px 0' }}>
                  {p.text}
                </p>
              ) : null,
            )}
          </div>
        ))}
      </div>
      {isStreaming && (
        <div
          style={{
            padding: '4px 16px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Responding…</span>
          <button onClick={stop}>Stop</button>
        </div>
      )}
      {/* Your Mantine Textarea + Button here, calling sendMessage(text) */}
    </div>
  );
}

export const MantineCopilot = withChatbot(MantineChatShell, {
  api: '/api/copilot',
  auth: {
    getToken: () => window.__auth?.accessToken ?? '',
  },
  features: { stopButton: false }, // handled manually above
});

// ─── Example 4: Runtime config (auth token from React state/context) ──────────
// If your auth token lives in React context (e.g. Redux, Zustand, React Query),
// build the config inside a component and pass it to ChatProvider directly
// instead of withChatbot (which requires static config).

interface RuntimeCopilotProps {
  token: string;
  csrfToken: string;
}

export function RuntimeCopilot({ token, csrfToken }: RuntimeCopilotProps) {
  // Config defined inside component — picks up fresh token each render.
  // DefaultChatTransport uses function-form headers so it reads at request time.
  const config = React.useMemo(
    () => ({
      api: '/api/copilot',
      auth: {
        getToken: () => token, // closure over prop — always current
        getCsrfToken: () => csrfToken,
      },
    }),
    [token, csrfToken],
  );

  return (
    <ChatProvider config={config}>
      <Shell />
    </ChatProvider>
  );
}
