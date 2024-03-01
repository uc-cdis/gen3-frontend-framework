import type { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'cookies-next';
import { decodeJwt, JWTPayload } from 'jose';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { access_token } = req.body;
  const payload = decodeJwt(access_token) as JWTPayload;

  if (!payload) {
    res.status(400).json({ message: 'Invalid token' });
    return;
  }
  console.log("payload: ", payload);
  setCookie( 'access_token', access_token, {
    req, res,
    maxAge: payload && payload.exp && payload.iat ? payload.exp - payload.iat : 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(200).json({ message: 'Session token set' });
}
