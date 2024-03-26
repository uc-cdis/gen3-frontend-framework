import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteCookie, setCookie } from 'cookies-next';
import { decodeJwt, JWTPayload } from 'jose';

/**
 * Set the access token to a HttpOnly cookie
 * @param req - NextApiRequest
 * @param res - NextApiResponse
 */
export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { access_token } = req.body;

  // TODO: validate the token
  const payload = decodeJwt(access_token) as JWTPayload;

  if (!payload) {
    res.status(400).json({ message: 'Invalid token' });
    deleteCookie( 'access_token', {
      req, res,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  }
  setCookie( 'access_token', access_token, {
    req, res,
    maxAge: payload && payload.exp && payload.iat ? payload.exp - payload.iat : 60 * 60 * 20,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  return res.status(200).json({ message: 'Session token set' });
}
