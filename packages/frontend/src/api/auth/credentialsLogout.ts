import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    serialize('credentials_token', '', {
      maxAge: -1,
      path: '/',
      sameSite: 'lax',
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
    }),
  );
  res.redirect(307, '/');
}
