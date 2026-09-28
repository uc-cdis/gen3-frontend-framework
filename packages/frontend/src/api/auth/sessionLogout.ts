import type { NextApiRequest, NextApiResponse } from 'next';

import { GEN3_FENCE_API, GEN3_FENCE_SERVICE } from '@gen3/core/server';
import { serialize } from 'cookie';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const FENCE_API =
    process.env.NODE_ENV === 'development'
      ? GEN3_FENCE_API
      : GEN3_FENCE_SERVICE;

  try {
    const fenceCookies = [
      req.cookies.fence && `fence=${encodeURIComponent(req.cookies.fence)}`,
      req.cookies.access_token &&
        `access_token=${encodeURIComponent(req.cookies.access_token)}`,
    ].filter((cookie): cookie is string => Boolean(cookie));

    const fenceResponse = await fetch(`${FENCE_API}/logout`, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/html',
        ...(fenceCookies.length > 0 ? { Cookie: fenceCookies.join('; ') } : {}),
      },
      redirect: 'manual',
    });

    if (!fenceResponse.ok) {
      console.warn(`Fence logout failed (${fenceResponse.status})`);
    }
  } catch (error: unknown) {
    // GEN3_FENCE_SERVICE is an internal, cluster-only URL. Some deployments
    // (e.g. local dev, or a frontend that isn't network-adjacent to Fence)
    // cannot reach it at all — that must not block logout, since the part
    // that matters to this app is clearing its own cookies below.
    console.warn('Unable to reach Fence to complete logout', error);
  }

  // Clear local authentication regardless of whether Fence could be reached.
  // This is what actually logs the user out of this app; telling Fence is
  // best-effort on top of it.
  res.setHeader('Set-Cookie', [
    serialize('fence', '', {
      sameSite: 'lax',
      httpOnly: true,
      secure: true,
      path: '/',
      expires: new Date(0),
    }),
    serialize('access_token', '', {
      sameSite: 'lax',
      httpOnly: true,
      secure: true,
      path: '/',
      expires: new Date(0),
    }),
    // delete the credentials_token cookie for credentials login
    serialize('credentials_token', '', {
      sameSite: 'lax',
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: new Date(0),
    }),
  ]);

  res.status(200).json({ success: 'success' });
}
