import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Select, Textarea, TextInput } from '@mantine/core';
import { IoSettingsSharp as SettingsIcon } from 'react-icons/io5';
import { BsFillInfoCircleFill as InfoIcon } from 'react-icons/bs';
import {
  type ChatMessage,
  DEFAULT_MODELS,
  type LLMConfig,
  type LLMProvider,
  MODEL_OPTIONS,
  sendMessage,
} from '../../lib/llmClient';
import {
  buildDictionaryContext,
  buildKBContext,
  buildSystemPrompt,
  parseSchemaNodes,
} from '../../lib/ragContext';
import { useCodeInjector } from '../../hooks/useCodeInjector';
import MessageBubble from './MessageBubble';
import { UIMessage } from './types';

export interface CodingAssistantPanelProps {
  schemaUrl?: string;
  kbUrl?: string;
  onInsertCode?: (code: string) => void;
}

// ── Persistence helpers ─────────────────────────────────────────────────

const STORAGE_PREFIX = 'gen3-ai-';

function loadSetting<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveSetting(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ── Component ───────────────────────────────────────────────────────────

const CodingAssistantPanel = ({
  schemaUrl,
  kbUrl,
  onInsertCode,
}: CodingAssistantPanelProps) => {
  // Settings state
  const [provider, setProvider] = useState<LLMProvider>(
    () => loadSetting('provider', 'openai') as LLMProvider,
  );
  const [apiKey, setApiKey] = useState(() => loadSetting('apiKey', ''));
  const [model, setModel] = useState(() =>
    loadSetting('model', DEFAULT_MODELS[provider]),
  );
  const [ollamaUrl, setOllamaUrl] = useState(() =>
    loadSetting('ollamaUrl', 'http://localhost:11434'),
  );
  const [showSettings, setShowSettings] = useState(() => {
    // Show settings on first use (no key/model configured)
    return !loadSetting('provider', '');
  });

  // Chat state
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // RAG context
  const [dictContext, setDictContext] = useState('');
  const { insertCode, iframeReady } = useCodeInjector();

  // Load dictionary context once
  useEffect(() => {
    if (!schemaUrl) return;
    let cancelled = false;
    (async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        const res = await fetch(schemaUrl, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) return;
        const schema = await res.json();
        const nodes = parseSchemaNodes(schema);
        if (!cancelled) setDictContext(buildDictionaryContext(nodes));
      } catch {
        // Silently skip — dictionary RAG is best-effort
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [schemaUrl]);

  // Persist settings on change
  useEffect(() => {
    saveSetting('provider', provider);
    saveSetting('model', model);
    saveSetting('ollamaUrl', ollamaUrl);
    // Only persist key if non-empty (user explicitly entered one)
    if (apiKey) saveSetting('apiKey', apiKey);
  }, [provider, apiKey, model, ollamaUrl]);

  // Auto-update default model when switching providers
  useEffect(() => {
    setModel(DEFAULT_MODELS[provider]);
  }, [provider]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const llmConfig = useMemo<LLMConfig>(
    () => ({
      provider,
      apiKey: provider === 'ollama' ? undefined : apiKey, // pragma: allowlist-secret;
      model,
      ollamaUrl: provider === 'ollama' ? ollamaUrl : undefined,
    }),
    [provider, apiKey, model, ollamaUrl],
  );

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    const userMsg: UIMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const assistantMsg: UIMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setStreaming(true);

    const chatHistory: ChatMessage[] = [
      ...messages
        .filter((m) => !m.streaming)
        .map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: trimmed },
    ];

    // Build system prompt with RAG context
    let kbCtx = '';
    if (kbUrl) {
      try {
        kbCtx = await buildKBContext(kbUrl, trimmed);
      } catch {
        // ignore KB errors
      }
    }
    const systemPrompt = buildSystemPrompt(dictContext, kbCtx);

    try {
      let fullText = '';
      for await (const chunk of sendMessage(
        llmConfig,
        chatHistory,
        systemPrompt,
      )) {
        fullText += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: fullText } : m,
          ),
        );
      }

      // Mark streaming complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id ? { ...m, streaming: false } : m,
        ),
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content: `⚠️ ${err.message || 'Request failed'}`,
                streaming: false,
              }
            : m,
        ),
      );
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, messages, llmConfig, dictContext, kbUrl]);

  const handleInsert = useCallback(
    (code: string) => {
      if (onInsertCode) {
        onInsertCode(code);
      } else {
        insertCode(code);
      }
    },
    [onInsertCode, insertCode],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const needsApiKey = provider !== 'ollama'; // pragma: allowlist-secret;
  const isConfigured = provider === 'ollama' || !!apiKey;

  // ── Settings form (shared between onboarding and collapsible) ─────
  const settingsForm = (
    <div className="flex flex-col gap-2">
      <Select
        label="Provider"
        data={[
          { value: 'openai', label: 'OpenAI' },
          { value: 'anthropic', label: 'Anthropic' },
          { value: 'gemini', label: 'Gemini' },
          { value: 'ollama', label: 'Ollama (local)' },
        ]}
        value={provider}
        onChange={(value) => setProvider(value as LLMProvider)}
      />

      {needsApiKey && (
        <>
          <TextInput
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Paste your ${provider} API key`}
            label="API Key"
          />
          <span className="text-xs text-base-dark">
            Stored in this tab only — never sent to our servers
          </span>
        </>
      )}

      {provider === 'ollama' && (
        <TextInput
          label={'Ollama URL'}
          value={ollamaUrl}
          onChange={(e) => setOllamaUrl(e.target.value)}
          placeholder="http://localhost:11434"
        />
      )}

      <Select
        value={
          MODEL_OPTIONS[provider].some((m) => m.id === model)
            ? model
            : '__custom'
        }
        onChange={(value) => {
          if (value !== '__custom') setModel(value as string);
        }}
        label="Model"
        data={[
          ...MODEL_OPTIONS[provider].map((m) => ({
            value: m.id,
            label: m.label,
          })),
          !(MODEL_OPTIONS?.[provider] || []).some((m) => m.id === model)
            ? { value: '__custom', label: '(custom)' }
            : undefined,
        ].filter((v) => v != undefined)}
      />
      <TextInput
        value={model || ''}
        onChange={(e) => setModel(e.target.value)}
        placeholder="Or type a custom model ID"
      />

      <div className="flex flex-wrap gap-2 text-xs">
        {dictContext && (
          <span className="rounded bg-utility-category4 bg-opacity-20 px-1.5 py-0.5 text-utility-category4">
            Dictionary RAG active
          </span>
        )}
        {kbUrl && (
          <span className="rounded bg-utility-category1 bg-opacity-20 px-1.5 py-0.5 text-utility-category1">
            KB RAG active
          </span>
        )}
        {iframeReady && (
          <span className="rounded bg-utility-category3 bg-opacity-20 px-1.5 py-0.5 text-utility-category3">
            Code injection ready
          </span>
        )}
      </div>
    </div>
  );

  // ── Onboarding (no API key yet) ──────────────────────────────────
  if (!isConfigured) {
    return (
      <div className="flex h-full flex-col gap-3">
        <div className="rounded-lg border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-3">
          <div className="mb-2 flex items-center gap-2">
            <InfoIcon className="text-utility-info" aria-hidden="true" />
            <span className="text-xs font-semibold text-base-darkest">
              AI Coding Assistant
            </span>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-base-darker">
            Get help writing Python code, querying data, and exploring the data
            dictionary — powered by your own API key. Choose a provider and
            paste your key below to start.
          </p>
          {settingsForm}
        </div>
        <div className="mt-1 text-center text-sm text-base-darker">
          Your key stays in this browser tab and is never stored on our servers.
        </div>
      </div>
    );
  }

  // ── Configured: normal chat UI ───────────────────────────────────
  return (
    <div className="flex h-full flex-col gap-2 w-full">
      {/* Compact header with settings toggle + clear */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          className="flex items-center gap-1 text-sm font-medium text-base-darker hover:text-base-darkest"
          aria-label={
            showSettings ? 'Hide provider settings' : 'Show provider settings'
          }
        >
          <SettingsIcon aria-hidden="true" />
          {showSettings ? 'Hide' : provider}
        </button>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            className="text-sm text-base-darker hover:text-accentWarm-dark"
          >
            Clear
          </button>
        )}
      </div>

      {showSettings && (
        <div className="rounded-lg border border-base-lighter bg-base-slightest bg-opacity-50 p-2.5">
          {settingsForm}
        </div>
      )}

      {/* Messages */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {messages.length === 0 && !showSettings && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <span className="text-sm text-base-darker">
              Ready — using <strong>{provider}</strong> ({model})
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-base-darker">Try asking:</span>
              {[
                'Write a pandas query to count rows by category',
                'How do I read a TSV file from the Gen3 workspace?',
                'Plot a histogram of ages using matplotlib',
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setInput(q);
                  }}
                  className="rounded-md border border-base-lighter bg-white px-2 py-1 text-left text-sm text-base-darker hover:border-utility-link hover:text-utility-link"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onInsert={handleInsert} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-1.5">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            streaming ? 'Generating…' : 'Ask a question… (Enter to send)'
          }
          rows={2}
          disabled={streaming}
          className="w-full"
        />
        <Button
          onClick={handleSend}
          disabled={streaming || !input.trim()}
          className="shrink-0 self-end"
        >
          {streaming ? '…' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

export default CodingAssistantPanel;
