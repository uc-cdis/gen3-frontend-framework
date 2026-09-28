// Streaming LLM client — OpenAI, Anthropic, Gemini, Ollama
// All requests go directly from the browser to provider APIs (no backend proxy).

export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama';

export type LLMConfig = {
  provider: LLMProvider;
  apiKey?: string;
  model: string;
  ollamaUrl?: string; // default: http://localhost:11434
};

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const DEFAULT_OLLAMA_URL = 'http://localhost:11434';

// ── OpenAI ──────────────────────────────────────────────────────────────

async function* streamOpenAI(
  config: LLMConfig,
  messages: ChatMessage[],
  systemPrompt?: string,
): AsyncGenerator<string> {
  const allMessages: ChatMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI ${res.status}: ${text || res.statusText}`);
  }

  yield* readSSEStream(res, (json) => {
    return json.choices?.[0]?.delta?.content ?? '';
  });
}

// ── Anthropic ───────────────────────────────────────────────────────────

async function* streamAnthropic(
  config: LLMConfig,
  messages: ChatMessage[],
  systemPrompt?: string,
): AsyncGenerator<string> {
  const userMessages = messages.filter((m) => m.role !== 'system');

  const body: Record<string, unknown> = {
    model: config.model,
    max_tokens: 4096,
    stream: true,
    messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
  };
  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey ?? '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Anthropic ${res.status}: ${text || res.statusText}`);
  }

  yield* readSSEStream(res, (json) => {
    if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
      return json.delta.text ?? '';
    }
    return '';
  });
}

// ── Gemini ──────────────────────────────────────────────────────────────

async function* streamGemini(
  config: LLMConfig,
  messages: ChatMessage[],
  systemPrompt?: string,
): AsyncGenerator<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(config.apiKey ?? '')}`;

  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  for (const m of messages) {
    if (m.role === 'system') continue;
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    });
  }

  const body: Record<string, unknown> = { contents };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini ${res.status}: ${text || res.statusText}`);
  }

  yield* readSSEStream(res, (json) => {
    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  });
}

// ── Ollama ──────────────────────────────────────────────────────────────

async function* streamOllama(
  config: LLMConfig,
  messages: ChatMessage[],
  systemPrompt?: string,
): AsyncGenerator<string> {
  const ollamaUrl = (config.ollamaUrl || DEFAULT_OLLAMA_URL).replace(/\/+$/, '');

  const allMessages: ChatMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama ${res.status}: ${text || res.statusText}`);
  }

  // Ollama streams newline-delimited JSON (not SSE)
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          const text = json.message?.content ?? '';
          if (text) yield text;
        } catch {
          // skip malformed lines
        }
      }
    }
    // process remaining buffer
    if (buffer.trim()) {
      try {
        const json = JSON.parse(buffer);
        const text = json.message?.content ?? '';
        if (text) yield text;
      } catch {
        // skip
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ── SSE stream reader (shared by OpenAI, Anthropic, Gemini) ─────────

async function* readSSEStream(
  res: Response,
  extractText: (json: Record<string, any>) => string,
): AsyncGenerator<string> {
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;
          try {
            const json = JSON.parse(data);
            const text = extractText(json);
            if (text) yield text;
          } catch {
            // skip malformed JSON chunks
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ── Public API ──────────────────────────────────────────────────────────

export async function* sendMessage(
  config: LLMConfig,
  messages: ChatMessage[],
  systemPrompt?: string,
): AsyncGenerator<string> {
  switch (config.provider) {
    case 'openai':
      yield* streamOpenAI(config, messages, systemPrompt);
      break;
    case 'anthropic':
      yield* streamAnthropic(config, messages, systemPrompt);
      break;
    case 'gemini':
      yield* streamGemini(config, messages, systemPrompt);
      break;
    case 'ollama':
      yield* streamOllama(config, messages, systemPrompt);
      break;
    default:
      throw new Error(`Unknown provider: ${(config as any).provider}`);
  }
}

// ── Default model per provider ──────────────────────────────────────────

export const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
  gemini: 'gemini-3.1-pro',
  ollama: 'llama3',
};

/** Well-known models per provider for the settings selector. */
export const MODEL_OPTIONS: Record<LLMProvider, Array<{ id: string; label: string }>> = {
  openai: [
    { id: 'gpt-4o', label: 'GPT-4o' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { id: 'o3-mini', label: 'o3-mini' },
    { id: 'o1', label: 'o1' },
    { id: 'o1-mini', label: 'o1-mini' },
  ],
  anthropic: [
    { id: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
    { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    { id: 'claude-haiku-3-5-20241022', label: 'Claude Haiku 3.5' },
  ],
  gemini: [
    { id: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro' },
    { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview' },
  ],
  ollama: [
    { id: 'llama3', label: 'Llama 3' },
    { id: 'codellama', label: 'Code Llama' },
    { id: 'mistral', label: 'Mistral' },
    { id: 'deepseek-coder', label: 'DeepSeek Coder' },
  ],
};
