/**
 * Shared HTTP proxy utility for server-side proxy handlers.
 * Streams request body through and forwards response status + body.
 *
 * Also exports two token helpers used by the proxy factories:
 *  - extractTokenFallback: minimal cookie/header extraction used when the host
 *    app has not injected its own getToken (standalone / test use).
 *  - decodeJwtClaims: base64url decode of the JWT payload for REMOTE_USER header.
 *    Crypto verification is Ambassador's job — we only need the sub/username claim.
 */

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Minimal JWT extraction fallback — used only when the host app does not inject
 * its own getToken. Prefers Authorization: Bearer, then access_token cookie.
 * In gen3-vectis production this is never reached — getAccessToken is always wired.
 */
export function extractTokenFallback(req: NextApiRequest): string | null {
  const auth = req.headers['authorization'];
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim() || null;
  }
  const cookie = req.headers['cookie'] ?? '';
  const m = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]).trim() || null : null;
}

/**
 * Decode JWT payload claims without cryptographic verification.
 * Ambassador has already verified the RS256 signature — we just need the sub claim
 * to set the REMOTE_USER header for per-user isolation enforcement downstream.
 */
// Maximum JWT string length accepted before base64 decoding.
// GA4GH RAS Passport JWTs embed multiple signed Visa JWTs as claims, so the
// outer passport can easily exceed 8 KiB (50 visas × ~2 KB each ≈ 136 KB encoded).
// 512 KiB covers the most complex real-world passports while still guarding against
// crafted JWTs designed to exhaust server memory.  Ambassador has already verified
// the RS256 signature — this cap only defends the local base64/JSON decode step.
const MAX_JWT_LENGTH = 524288; // 512 KiB

export function decodeJwtClaims(jwt: string): Record<string, unknown> | null {
  if (jwt.length > MAX_JWT_LENGTH) return null;
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return null;
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

export interface ProxyRequestOptions {
  req: NextApiRequest;
  res: NextApiResponse;
  targetUrl: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  extraHeaders?: Record<string, string>;
  /** Whether to stream the incoming request body to the target. */
  forwardBody?: boolean;
}

export async function createProxyRequest({
  req,
  res,
  targetUrl,
  method,
  extraHeaders = {},
  forwardBody = false,
}: ProxyRequestOptions): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  let body: BodyInit | undefined;
  if (
    forwardBody &&
    (method === 'POST' || method === 'PUT' || method === 'PATCH')
  ) {
    let buf: Buffer;
    try {
      buf = await bufferBody(req);
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode ?? 400;
      const msg = err instanceof Error ? err.message : 'Bad request';
      res.status(statusCode).json({ error: msg });
      return;
    }
    // Node.js Buffer is a Uint8Array subclass; cast to silence DOM BodyInit mismatch
    body = buf as unknown as BodyInit;
    if (buf.length > 0) {
      headers['Content-Length'] = String(buf.length);
    }
  }

  let upRes: Response;
  try {
    upRes = await fetch(targetUrl, { method, headers, body });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: `Upstream unreachable: ${msg}` });
    return;
  }

  // Forward status and content-type
  const contentType = upRes.headers.get('content-type') || 'application/json';
  res.setHeader('Content-Type', contentType);

  if (upRes.status === 204 || upRes.status === 304) {
    res.status(upRes.status).end();
    return;
  }

  // Do not forward raw upstream error bodies — they may contain stack traces or
  // internal hostnames. Log them server-side (CloudWatch) and return a generic message.
  if (upRes.status >= 500) {
    const errBody = await upRes.text().catch(() => '');
    console.error(
      `[proxy] upstream ${upRes.status} from ${targetUrl}:`,
      errBody,
    );
    res.status(502).json({ error: 'Upstream service error.' });
    return;
  }

  const responseBody = await upRes.text();
  res.status(upRes.status).send(responseBody);
}

// Maximum request body size accepted by the proxy (1 MiB).
// Prevents memory exhaustion from oversized payloads before any business logic runs.
const MAX_BODY_BYTES = 1 * 1024 * 1024;

function bufferBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(
          Object.assign(new Error('Request body too large'), {
            statusCode: 413,
          }),
        );
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
