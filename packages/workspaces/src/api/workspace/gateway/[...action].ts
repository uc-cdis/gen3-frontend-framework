import type { NextApiRequest, NextApiResponse } from 'next';

// Allowed path prefixes — keeps proxying scoped to the Jupyter Gateway API surface
const ALLOWED_PREFIXES = ['/api/kernels', '/api/sessions', '/api/kernelspecs'];

function buildUpstreamPath(segments: string[]): string {
  const clean = segments
    .filter(Boolean)
    .map((s) => s.replace(/^\/+|\/+$/g, ''));

  if (clean.some((s) => s === '..' || s === '.')) {
    throw new Error('Invalid path segment');
  }

  return `/${clean.join('/')}`;
}

function isAllowedPath(path: string): boolean {
  return ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function buildQueryString(
  rawUrl: string | undefined,
  excludeKey: string,
): string {
  if (!rawUrl) return '';
  const queryPart = rawUrl.split('?')[1];
  if (!queryPart) return '';

  const params = new URLSearchParams(queryPart);
  params.delete(excludeKey);

  const result = params.toString();
  return result ? `?${result}` : '';
}

function readBody(req: NextApiRequest): Promise<Buffer | undefined> {
  return new Promise((resolve, reject) => {
    if (!req.method || ['GET', 'HEAD'].includes(req.method.toUpperCase())) {
      resolve(undefined);
      return;
    }
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () =>
      resolve(chunks.length ? Buffer.concat(chunks) : undefined),
    );
    req.on('error', reject);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const gatewayUrl = process.env.JUPYTER_GATEWAY_URL;
  if (!gatewayUrl) {
    res.status(500).json({ error: 'JUPYTER_GATEWAY_URL is not configured' });
    return;
  }

  const gatewayBase = gatewayUrl.replace(/\/+$/, '');

  const actionSegments = Array.isArray(req.query.action)
    ? req.query.action
    : req.query.action
      ? [req.query.action]
      : [];

  let upstreamPath: string;
  try {
    upstreamPath = buildUpstreamPath(actionSegments);
  } catch {
    res.status(400).json({ error: 'Invalid path' });
    return;
  }

  if (!isAllowedPath(upstreamPath)) {
    res.status(403).json({ error: 'Forbidden path' });
    return;
  }

  const queryString = buildQueryString(req.url, 'action');
  const targetUrl = `${gatewayBase}${upstreamPath}${queryString}`;

  const forwardHeaders = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue;
    const lower = key.toLowerCase();
    if (
      lower === 'host' ||
      lower === 'content-length' ||
      lower === 'transfer-encoding'
    )
      continue;
    forwardHeaders.set(key, Array.isArray(value) ? value.join(',') : value);
  }

  let body: Buffer | undefined;
  try {
    body = await readBody(req);
  } catch {
    res.status(500).json({ error: 'Failed to read request body' });
    return;
  }

  if (body) {
    forwardHeaders.set('content-length', String(body.byteLength));
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body ? new Uint8Array(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError';
    res.status(isTimeout ? 504 : 502).json({
      error: isTimeout ? 'Gateway timeout' : 'Gateway unreachable',
    });
    return;
  }

  res.status(upstream.status);
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === 'transfer-encoding') return;
    res.setHeader(key, value);
  });

  if (upstream.body) {
    const reader = upstream.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    } finally {
      reader.releaseLock();
    }
    res.end();
  } else {
    res.end();
  }
}

export const config = { api: { bodyParser: false } };
