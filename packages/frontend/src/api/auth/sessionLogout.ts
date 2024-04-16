import type { NextApiRequest, NextApiResponse } from 'next';

import { GEN3_FENCE_API } from '@gen3/core';
import cookie from "cookie";
import { deleteCookie } from 'cookies-next';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  let redirect = req.query?.next;
  redirect = Array.isArray(redirect) ? redirect[0] : redirect;
  const response = await fetch(`${GEN3_FENCE_API}/user/logout`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

  res.setHeader('Set-Cookie', [
    cookie.serialize('fence', '', {
      sameSite: 'lax',
      httpOnly: true,
      secure: true,
      path: '/',
      expires: new Date(0),
    }),
    cookie.serialize('access_token', '', {
      sameSite: 'lax',
      httpOnly: true,
      secure: true,
      path: '/',
      expires: new Date(0),
    }),
    // delete the credentials_token cookie for credentials login
    cookie.serialize('credentials_token', '', {
      sameSite: 'lax',
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: new Date(0),
    }),
  ]);
  deleteCookie( 'credentials_token', {
    req, res,
    sameSite: 'lax',
    httpOnly: process.env.NODE_ENV === 'production',
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(200).json({ success: "success" });
}
