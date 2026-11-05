// RAG context builder — dictionary context stuffing + external KB search
// No vector DB: dictionary is directly injected into system prompt (~3-8K tokens).
// External KB articles are fetched, chunked, keyword-matched, and top-N injected.

export type SchemaNode = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  properties: Record<string, { type?: string; description?: string; enum?: string[] }>;
  required: string[];
  links: Array<{ name: string; target_type: string; multiplicity: string }>;
};

// ── Parse /schema.json into structured nodes ────────────────────────────

export function parseSchemaNodes(schema: Record<string, any>): SchemaNode[] {
  // The schema may be a JSON Schema with top-level keys as node IDs,
  // or wrapped in a "properties" or "definitions" envelope.
  const raw: Record<string, any> = schema.properties ?? schema.definitions ?? schema;
  const nodes: SchemaNode[] = [];

  for (const [id, def] of Object.entries(raw)) {
    if (!def || typeof def !== 'object') continue;
    // Skip meta-fields like $schema, _definitions, etc.
    if (id.startsWith('$') || id.startsWith('_')) continue;

    const props: SchemaNode['properties'] = {};
    const defProps = def.properties ?? {};
    for (const [k, v] of Object.entries(defProps)) {
      if (typeof v !== 'object' || v === null) continue;
      const vTyped = v as Record<string, any>;
      props[k] = {
        type: vTyped.type ?? vTyped.oneOf?.[0]?.type ?? undefined,
        description: vTyped.description ?? undefined,
        enum: Array.isArray(vTyped.enum) ? vTyped.enum.slice(0, 10) : undefined,
      };
    }

    const links: SchemaNode['links'] = [];
    if (Array.isArray(def.links)) {
      for (const link of def.links) {
        links.push({
          name: link.name ?? link.label ?? link.backref ?? '?',
          target_type: link.target_type ?? link.targetType ?? '?',
          multiplicity: link.multiplicity ?? link.label ?? '',
        });
      }
    }

    nodes.push({
      id,
      title: (def.title as string) ?? id,
      description: (def.description as string) ?? undefined,
      category: (def.category as string) ?? (def.namespace as string) ?? undefined,
      properties: props,
      required: Array.isArray(def.required) ? def.required : [],
      links,
    });
  }

  return nodes.sort((a, b) => a.id.localeCompare(b.id));
}

// ── Build compact dictionary context for system prompt ──────────────────

export function buildDictionaryContext(nodes: SchemaNode[]): string {
  if (!nodes.length) return '';

  const lines: string[] = ['## Data Dictionary\n'];
  for (const node of nodes) {
    lines.push(`### ${node.title}${node.category ? ` (${node.category})` : ''}`);
    if (node.description) lines.push(node.description);

    const fieldLines: string[] = [];
    for (const [name, info] of Object.entries(node.properties)) {
      const parts = [name];
      if (info.type) parts.push(`: ${info.type}`);
      if (node.required.includes(name)) parts.push(' *required*');
      if (info.enum) parts.push(` [${info.enum.join(', ')}]`);
      fieldLines.push(`  - ${parts.join('')}`);
    }
    if (fieldLines.length) {
      lines.push('Fields:');
      lines.push(...fieldLines);
    }

    if (node.links.length) {
      lines.push('Links:');
      for (const link of node.links) {
        lines.push(`  - ${link.name} → ${link.target_type} (${link.multiplicity})`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ── External KB context (fetch → chunk → keyword search) ────────────────

const KB_CACHE_KEY = 'gen3-kb-cache';

type KBCache = {
  url: string;
  passages: string[];
  fetchedAt: number;
};

function getKBCache(): KBCache | null {
  try {
    const raw = sessionStorage.getItem(KB_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as KBCache;
  } catch {
    return null;
  }
}

function setKBCache(cache: KBCache): void {
  try {
    sessionStorage.setItem(KB_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // sessionStorage full — ignore
  }
}

function chunkText(text: string, maxLen = 800): string[] {
  // Split on double-newlines (paragraphs) first, then by sentences if needed
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if (trimmed.length <= maxLen) {
      chunks.push(trimmed);
    } else {
      // Split long paragraphs by sentences
      const sentences = trimmed.split(/(?<=[.!?])\s+/);
      let current = '';
      for (const sentence of sentences) {
        if (current.length + sentence.length > maxLen && current) {
          chunks.push(current.trim());
          current = '';
        }
        current += (current ? ' ' : '') + sentence;
      }
      if (current.trim()) chunks.push(current.trim());
    }
  }
  return chunks;
}

function scorePassage(passage: string, queryWords: string[]): number {
  const lower = passage.toLowerCase();
  let score = 0;
  for (const word of queryWords) {
    if (lower.includes(word)) score++;
  }
  return score;
}

export async function buildKBContext(kbUrl: string, query: string, topN = 5): Promise<string> {
  if (!kbUrl) return '';

  // Check cache
  const cached = getKBCache();
  let passages: string[];

  if (cached && cached.url === kbUrl && Date.now() - cached.fetchedAt < 30 * 60 * 1000) {
    passages = cached.passages;
  } else {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(kbUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return '';
      const text = await res.text();
      passages = chunkText(text);
      setKBCache({ url: kbUrl, passages, fetchedAt: Date.now() });
    } catch {
      return '';
    }
  }

  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  if (!queryWords.length) return '';

  const scored = passages
    .map((p, i) => ({ passage: p, score: scorePassage(p, queryWords), index: i }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, topN);

  if (!scored.length) return '';
  return '## Knowledge Base Context\n\n' + scored.map((s) => s.passage).join('\n\n---\n\n');
}

// ── Assemble full system prompt ─────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are a data science coding assistant embedded in a Jupyter notebook workspace.
You help users write Python code for data analysis, bioinformatics, and genomics.
When generating code, prefer clear and concise solutions.
Always wrap code in fenced code blocks with the language specified (e.g. \`\`\`python).
If you reference data fields, use the exact names from the data dictionary when available.`;

export function buildSystemPrompt(dictionaryContext: string, kbContext?: string): string {
  const parts = [BASE_SYSTEM_PROMPT];
  if (dictionaryContext) parts.push(dictionaryContext);
  if (kbContext) parts.push(kbContext);
  return parts.join('\n\n');
}
