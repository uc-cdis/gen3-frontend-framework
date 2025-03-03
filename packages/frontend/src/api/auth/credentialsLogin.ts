import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteCookie, setCookie } from 'cookies-next';
import { decodeJwt, jwtVerify, importSPKI, JWTPayload } from 'jose';
import { fetchFence } from '@gen3/core';
import { getWebTokenErrorResponse } from './errorHandler';
import { fetchJWTKey } from './utils';

/**
 * Credentials login set up a access_token cookie. This is used to authenticate the user
 * Note that in development mode, the access token is stored in a cookie but in production
 * it should be stored in a secure httpOnly cookie.
 * @param req - NextApiRequest
 * @param res - NextApiResponse
 */
export default async function (req: NextApiRequest, res: NextApiResponse) {
  const params = req.body;

  try {
    const response = await fetchFence<Record<string, string>>({
      endpoint: '/credentials/api/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        api_key: params.api_key,
        key_id: params.key_id,
      },
    });

    if (response.status !== 200) {
      deleteCookie('credentials_token', {
        req,
        res,
        sameSite: 'lax',
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
      });
      return res.status(response.status).json({ message: 'Invalid token' });
    }

    const json = response.data;
    const { access_token } = json;

    const jwtKey = await fetchJWTKey();
    if (!jwtKey) {
      return res
        .status(response.status)
        .json({ message: 'No JWT Key to verify token' });
    }
    // validate the token
    const publicKey = await importSPKI(jwtKey, 'RS256');
    await jwtVerify(access_token, publicKey);
    const payload = decodeJwt(access_token) as JWTPayload;

    if (!payload) {
      deleteCookie('credentials_token', {
        req,
        res,
        sameSite: 'lax',
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
      });
      return res.status(400).json({ message: 'Invalid token' });
    }
    setCookie('credentials_token', access_token, {
      req,
      res,
      maxAge:
        payload && payload.exp && payload.iat
          ? payload.exp - payload.iat
          : 60 * 60 * 20,
      sameSite: 'lax',
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({ message: 'Session token set' });
  } catch (error: unknown) {
    getWebTokenErrorResponse(error, res); // will update res with error
  }
}
