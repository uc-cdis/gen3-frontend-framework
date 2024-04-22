import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteCookie } from 'cookies-next';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  deleteCookie( 'credentials_token', {
    req, res,
    sameSite: 'lax',
    httpOnly: process.env.NODE_ENV === 'production',
    secure: process.env.NODE_ENV === 'production',
  });
  res.redirect(307, '/');
}
