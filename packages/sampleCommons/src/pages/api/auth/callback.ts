import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { fenceConfig, tokenUrl } from '../../../lib/auth/fenceAuth';

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type: string;
};

/**
 * Exchange the OAuth access token for a user-level token without the OAuth
 * client ID in the `aud`/`azp` claims.  OAuth tokens are client-bound and
 * services like Hatchery reject them.  The credentials API issues clean
 * user-level tokens that all Gen3 services accept.
 *
 * Flow: create temporary API key → exchange it for an access token → delete key.
 */
async function exchangeForUserToken(
  oauthAccessToken: string,
  fenceBaseUrl: string,
): Promise<{ token: string; lifetime: number } | null> {
  try {
    // 1. Create temporary API credentials
    const credRes = await fetch(`${fenceBaseUrl}/credentials/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${oauthAccessToken}`,
      },
      body: JSON.stringify({
        scope: ['user', 'data', 'fence', 'credentials', 'ga4gh_passport_v1'],
      }),
      cache: 'no-store',
    });

    if (!credRes.ok) {
      console.error(
        '[auth/callback] temp credential creation failed',
        credRes.status,
        await credRes.text(),
      );
      return null;
    }

    const creds = (await credRes.json()) as {
      api_key: string;
      key_id: string;
    };

    // 2. Exchange the temp key for a clean access token
    const accessRes = await fetch(
      `${fenceBaseUrl}/credentials/api/access_token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: creds.api_key, // pragma: allowlist secret
          key_id: creds.key_id,
        }),
        cache: 'no-store',
      },
    );

    if (!accessRes.ok) {
      console.error(
        '[auth/callback] temp credential token exchange failed',
        accessRes.status,
        await accessRes.text(),
      );
      return null;
    }

    const { access_token } = (await accessRes.json()) as {
      access_token: string;
    };

    // 3. Clean up — best-effort delete the temp key
    fetch(`${fenceBaseUrl}/credentials/api/${creds.key_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${oauthAccessToken}` },
    }).catch(() => {
      console.warn(
        '[auth/callback] failed to clean up temp credential',
        creds.key_id,
      );
    });

    // Derive cookie maxAge from the token's own exp/iat
    let lifetime = 3600;
    try {
      const payload = JSON.parse(
        Buffer.from(access_token.split('.')[1], 'base64url').toString(),
      ) as { exp?: number; iat?: number };
      if (payload.exp && payload.iat) {
        lifetime = payload.exp - payload.iat;
      }
    } catch {
      /* use default */
    }

    return { token: access_token, lifetime };
  } catch (err) {
    console.error('[auth/callback] token exchange failed:', err);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { code, state, error } = req.query as Record<
    string,
    string | undefined
  >;

  if (error) {
    res.redirect(`/Login?error=${encodeURIComponent(error)}`);
    return;
  }

  const storedState = req.cookies.oauth_state;
  const verifier = req.cookies.oauth_verifier;

  if (!code || !state || !verifier || state !== storedState) {
    res.redirect('/Login?error=invalid_state');
    return;
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
      code: code,
      redirect_uri: fenceConfig.redirectUri ?? '',
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
    res.redirect('/Login?error=token_exchange');
    return;
  }

  const tokens = (await tokenRes.json()) as TokenResponse;
  const secure = process.env.NODE_ENV === 'production';

  // Exchange for a user-level token that services like Hatchery accept.
  // The OAuth access token has the client ID in aud/azp which causes rejections.
  const fenceBaseUrl = fenceConfig.baseUrl;
  const userToken = fenceBaseUrl
    ? await exchangeForUserToken(tokens.access_token, fenceBaseUrl)
    : null;

  const credentialsTokenValue = userToken?.token ?? tokens.access_token;
  const credentialsMaxAge = userToken?.lifetime ?? tokens.expires_in ?? 1200;

  const cookies = [
    serialize('access_token', tokens.access_token, {
      httpOnly: process.env.NODE_ENV === 'production', // dev: client-readable
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: tokens.expires_in ?? 1200,
    }),
    serialize('credentials_token', credentialsTokenValue, {
      httpOnly: process.env.NODE_ENV === 'production', // dev: client-readable
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: credentialsMaxAge,
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
