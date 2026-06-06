// Hatchery proxy — strict allowlist: /options, /status, /launch, /terminate
// Injects Authorization + REMOTE_USER headers; sanitizes id param (SSRF prevention).
// getToken reuses this app's cookie extraction — no JWT reinvention.
import { createHatcheryProxyHandler } from '../server/hatcheryProxy';
import { getAccessToken } from '@gen3/frontend/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenWorkspace } from './utils';

const defaultHatcheryUrl = process.env.KUBERNETES_SERVICE_HOST
  ? 'http://hatchery-service.gen3.svc.cluster.local'
  : undefined;

const upstreamHandler = createHatcheryProxyHandler({
  hatcheryUrl: process.env.HATCHERY_URL ?? defaultHatcheryUrl,
  getToken: (req) => getAccessToken(req.headers['cookie'] ?? '') ?? null,
});

function decodeJwtUsername(jwt: string): string {
  try {
    const payload = jwt.split('.')[1];
    const claims = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as Record<string, unknown>;
    const raw = claims.sub ?? claims.preferred_username ?? claims.username;
    return typeof raw === 'string'
      ? raw
      : `<non-string:${JSON.stringify(raw)}>`;
  } catch {
    return '<decode-error>';
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const action = req.query.action?.[0];

  // Intercept res.send to capture response body for logging
  let capturedBody = '';
  const originalSend = res.send.bind(res) as typeof res.send;
  res.send = (body: unknown) => {
    capturedBody = (
      typeof body === 'string' ? body : JSON.stringify(body)
    ).slice(0, 300);
    return originalSend(body);
  };

  await upstreamHandler(req, res);

  if (action === 'launch' || action === 'status') {
    const jwt = getAccessTokenWorkspace(req.headers['cookie'] ?? '');
    console.log('>[workspace-hatchery] JWT:', jwt);
    const username = jwt ? decodeJwtUsername(jwt) : '<no-token>';
    console.log(
      `[workspace-hatchery] ${action} HTTP=${res.statusCode} id=${req.query.id ?? '(none)'} user=${username} body=${capturedBody}`,
    );
  }
}

export const config = { api: { bodyParser: false } };
