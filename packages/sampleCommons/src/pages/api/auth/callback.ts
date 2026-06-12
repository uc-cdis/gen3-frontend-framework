import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { fenceConfig, tokenUrl } from '../../../lib/auth/fenceAuth.ts';

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { code, state, error } = req.query as Record<
    string,
    string | undefined
  >;

  if (error) {
    return res.redirect(`/login?error=${encodeURIComponent(error)}`);
  }

  const storedState = req.cookies.oauth_state;
  const verifier = req.cookies.oauth_verifier;

  if (!code || !state || !verifier || state !== storedState) {
    return res.redirect('/login?error=invalid_state');
  }

  const basic = Buffer.from(
    `${fenceConfig.clientId}:${fenceConfig.clientSecret}`,
  ).toString('base64');

  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: fenceConfig.redirectUri,
      code_verifier: verifier,
    }),
    cache: 'no-store',
  });

  if (!tokenRes.ok) {
    console.error(
      'Fence token exchange failed',
      tokenRes.status,
      await tokenRes.text(),
    );
    return res.redirect('/login?error=token_exchange');
  }

  const tokens = (await tokenRes.json()) as TokenResponse;
  const secure = process.env.NODE_ENV === 'production';

  const cookies = [
    serialize('access_token', tokens.access_token, {
      httpOnly: process.env.NODE_ENV === 'production', // dev: client-readable
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: tokens.expires_in ?? 1200,
    }),
    serialize('oauth_state', '', { path: '/', maxAge: 0 }),
    serialize('oauth_verifier', '', { path: '/', maxAge: 0 }),
  ];

  if (tokens.refresh_token) {
    cookies.push(
      serialize('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      }),
    );
  }

  res.setHeader('Set-Cookie', cookies);
  res.redirect('/');
}
