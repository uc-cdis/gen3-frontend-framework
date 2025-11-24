import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { decodeJwt, importSPKI, JWTPayload, jwtVerify } from 'jose';
import { fetchJWTKey } from './utils';
import { getWebTokenErrorResponse } from './errorHandler';

export const isExpired = (value: number) => value - Date.now() > 0;

export interface JWTPayloadAndUser extends JWTPayload {
  context: Record<string, string>;
}

/**
 * returns the access_token expiration, user, and status
 * @param req
 * @param res
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {


  try {
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    let accessToken = cookies.access_token;

    // in development mode we support "credentials login"
    if (!accessToken && process.env.NODE_ENV === 'development') {
      // NOTE: This cookie can only be accessed from the client side
      // in development mode. Otherwise, the cookie is set as httpOnly
      accessToken =cookies.credentials_token;
    }

    if (accessToken) {
      const jwtKey = await fetchJWTKey();
      if (!jwtKey) {
        res.status(500).json({
          message: 'No JWT Key to verify token',
        });
        return;
      }
      // validate the token
      const publicKey = await importSPKI(jwtKey, 'RS256');
      await jwtVerify(accessToken, publicKey);
      const decodedAccessToken = decodeJwt(accessToken) as JWTPayloadAndUser;

      res.status(200).json({
        issued: decodedAccessToken.iat,
        expires: decodedAccessToken.exp,
        userContext: decodedAccessToken.context.user,
        status: decodedAccessToken.exp
          ? isExpired(decodedAccessToken.exp)
            ? 'expired'
            : 'issued'
          : 'invalid',
      });
      return;
    }

    res.status(200).json({
      status: 'not present',
    });
  } catch (error: unknown) {
    getWebTokenErrorResponse(error, res); // will update the res object with error
  }
}
