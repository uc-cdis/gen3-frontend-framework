import type { NextApiRequest, NextApiResponse } from 'next';

function joinPath(parts: string[]): string {
  const clean = parts.filter(Boolean).map((p) => p.replace(/^\/+|\/+$/g, ''));
  return `/${clean.join('/')}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const gatewayUrl = process.env.JUPYTER_GATEWAY_URL;
  if (!gatewayUrl) {
    res.status(500).json({
      error: 'JUPYTER_GATEWAY_URL is not configured',
    });
    return;
  }

  const gatewayBase = gatewayUrl.replace(/\/+$/, '');
  const action = Array.isArray(req.query.action)
    ? req.query.action
    : req.query.action
      ? [req.query.action]
      : [];

  const upstreamPath = joinPath(action);
  const queryString = req.url?.split('?')[1];
  const targetUrl = `${gatewayBase}${upstreamPath}${queryString ? `?${queryString}` : ''}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue;
    const lower = key.toLowerCase();
    if (lower === 'host' || lower === 'content-length') continue;
    headers.set(key, Array.isArray(value) ? value.join(',') : value);
  }

  let body: Buffer | undefined;
  if (req.method && !['GET', 'HEAD'].includes(req.method.toUpperCase())) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    body = chunks.length ? Buffer.concat(chunks) : undefined;
  }

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: body ? new Uint8Array(body) : undefined,
  });

  res.status(upstream.status);
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'transfer-encoding') return;
    res.setHeader(key, value);
  });

  const buf = Buffer.from(await upstream.arrayBuffer());
  res.send(buf);
}

export const config = { api: { bodyParser: false } };
