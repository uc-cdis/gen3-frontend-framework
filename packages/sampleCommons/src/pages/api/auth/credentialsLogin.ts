import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteCookie, setCookie } from 'cookies-next';
import { decodeJwt, JWTPayload } from 'jose';
import { GEN3_FENCE_API } from '@gen3/core';

/**
 * Credentials login set up a access_token cookie. This is used to authenticate the user
 * Note that in development mode, the access token is stored in a cookie but in production
 * it should be stored in a secure httpOnly cookie.
 * @param req - NextApiRequest
 * @param res - NextApiResponse
 */
export default async function (req: NextApiRequest, res: NextApiResponse) {

  const params = req.body;

  const response = await fetch(`${GEN3_FENCE_API}/user/credentials/api/access_token`,
      {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
      api_key: params.api_key,
      key_id: params.key_id,
  }),
});

  if (response.status !== 200) {
    deleteCookie( 'access_token', {
      req, res,
      sameSite: 'lax',
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
    });
    console.log("Session token NOT set");
    return res.status(response.status).json({ message: 'Invalid token' });
  }

  const json = await response.json();
  const {
    access_token
  } = json;

  // TODO: validate the token
  const payload = decodeJwt(access_token) as JWTPayload;

  if (!payload) {
    deleteCookie( 'access_token', {
      req, res,
      sameSite: 'lax',
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
    });
    console.log("Session token NOT set");
    return res.status(400).json({ message: 'Invalid token' });
  }
  setCookie( 'access_token', access_token, {
    req, res,
    maxAge: payload && payload.exp && payload.iat ? payload.exp - payload.iat : 60 * 60 * 20,
    sameSite: 'lax',
    httpOnly: process.env.NODE_ENV === 'production',
    secure: process.env.NODE_ENV === 'production',
  });
  console.log("Session token set");
  return res.status(200).json({ message: 'Session token set' });
}
