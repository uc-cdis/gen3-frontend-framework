import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import {
  authorizeUrl,
  fenceConfig,
  pkceChallenge,
  randomString,
} from '../../../lib/auth/fenceAuth';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const state = randomString();
  const verifier = randomString();
  const challenge = pkceChallenge(verifier);

  const params = new URLSearchParams({
    client_id: fenceConfig.clientId ?? '',
    response_type: 'code',
    redirect_uri: fenceConfig.redirectUri ?? '',
    scope: fenceConfig.scope,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  const opts = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  };

  res.setHeader('Set-Cookie', [
    serialize('oauth_state', state, opts),
    serialize('oauth_verifier', verifier, opts),
  ]);

  res.redirect(`${authorizeUrl}?${params}`);
}
