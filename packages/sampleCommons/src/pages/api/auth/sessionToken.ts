import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';
import { decodeJwt, JWTPayload, jwtVerify, importSPKI} from 'jose';
import { GEN3_AUTH_API } from '@gen3/core';

export const isExpired = (value: number) => value - Date.now() > 0;

export interface JWTPayloadAndUser extends JWTPayload {
  context: Record<string, string>;
}

interface JWTKeyResponse {
  keys?: ReadonlyArray<string[2]>;
  isSuccess: boolean;
  isError: boolean;
}
const fetchJWKKeys = async () : Promise<JWTKeyResponse> => {
  const response = await fetch(`${GEN3_AUTH_API}/auth/jwk`);
  if (response.ok) {
    try {
      const data = await response.json();
      return { keys: data.keys, isSuccess: true, isError: false };
    } catch {
      return { keys: undefined, isSuccess: false, isError: true };
    }
  }
  return { keys: undefined, isSuccess: false, isError: true };
};

/**
 * returns the access_token expiration, user, and status
 * @param req
 * @param res
 */
export default async function (req: NextApiRequest, res: NextApiResponse) {

  const access_token = getCookie('access_token', { req, res });
  const { keys, isSuccess, isError } = await fetchJWKKeys();
  if (access_token && typeof access_token === 'string') {
    const algorithm = 'ES256';
    if (isSuccess && keys) {
      const keyStr = keys[0];
      const publicKey = await importSPKI(keyStr, algorithm);

      const verify = await jwtVerify(access_token, publicKey);
      if (verify) {
        const decodedAccessToken = decodeJwt(
          access_token
        ) as unknown as JWTPayloadAndUser;
        return res.status(200).json({
          issued: decodedAccessToken.iat,
          expires: decodedAccessToken.exp,
          user: decodedAccessToken.context.user,
          status: decodedAccessToken.exp
            ? isExpired(decodedAccessToken.exp)
              ? 'expired'
              : 'issued'
            : 'invalid',
        });
      }
    }
  }

  return res.status(200).json({
    status: 'not present',
  });
}
