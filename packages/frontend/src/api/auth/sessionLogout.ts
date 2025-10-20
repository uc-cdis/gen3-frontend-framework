import type { NextApiRequest, NextApiResponse } from 'next';

import { GEN3_FENCE_API } from '@gen3/core';
import { serialize } from 'cookie';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  await fetch(`${GEN3_FENCE_API}/logout`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

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
