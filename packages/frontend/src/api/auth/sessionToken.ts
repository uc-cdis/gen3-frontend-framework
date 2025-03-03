import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';
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
export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const access_token = getCookie('access_token', { req, res });
    if (access_token) {
      const jwtKey = await fetchJWTKey();
      if (!jwtKey) {
        res.status(500).json({
          message: 'No JWT Key to verify token',
        });
        return res;
      }
      // validate the token
      const publicKey = await importSPKI(jwtKey, 'RS256');
      await jwtVerify(access_token, publicKey);
      const decodedAccessToken = decodeJwt(access_token) as JWTPayloadAndUser;
      return res.status(200).json({
        issued: decodedAccessToken.iat,
        expires: decodedAccessToken.exp,
        userContext: decodedAccessToken.context.user,
        status: decodedAccessToken.exp
          ? isExpired(decodedAccessToken.exp)
            ? 'expired'
            : 'issued'
          : 'invalid',
      });
    }

    return res.status(200).json({
      status: 'not present',
    });
  } catch (error: unknown) {
    getWebTokenErrorResponse(error, res); // will update the res object with error
  }
}
