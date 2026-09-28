import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import type { CryptoKey, JWTPayload } from 'jose';
import { decodeJwt, errors as joseErrors, importSPKI, jwtVerify } from 'jose';
import type { JWTSessionStatus } from '@gen3/core';
import { fetchJWTKey } from '../../lib/auth/utils';
import { getWebTokenErrorResponse } from './errorHandler';

export interface JWTPayloadAndUser extends JWTPayload {
  /**
   * Fence puts the user in here. Optional because nothing in the JWT spec
   * requires it: a token signed by the same key without one would otherwise
   * crash the handler on a property access.
   */
  context?: Record<string, string>;
}

/**
 * Claims the client needs from a token whose signature has already been verified.
 *
 * `expiresInMs` is computed here, against this server's own clock, rather than
 * left for the client to compute from `expires` against its own — the browser's
 * clock may be skewed from this server's, but this server's clock and `exp`
 * (also stamped by a server) agree.
 */
const tokenClaims = (accessToken: string) => {
  const decoded = decodeJwt(accessToken) as JWTPayloadAndUser;
  const expires = decoded.exp;
  return {
    issued: decoded.iat,
    expires,
    expiresInMs:
      expires !== undefined ? expires * 1000 - Date.now() : undefined,
    userContext: decoded.context?.user,
  };
};

/**
 * Verifies a token's signature, then decodes its claims — the same
 * verify-then-decode sequence used for `access_token` below, shared so the
 * `fence` session cookie (signed with the same key) can be read the same way.
 *
 * jwtVerify checks the signature before the claims, so an expired token has
 * already proven its signature and its claims can still be reported as
 * `'expired'` rather than thrown away. Any other verification failure (bad
 * signature, wrong key, malformed token) is left to the caller.
 */
const verifyAndDecodeToken = async (
  token: string,
  publicKey: CryptoKey,
): Promise<ReturnType<typeof tokenClaims> & { status: JWTSessionStatus }> => {
  try {
    await jwtVerify(token, publicKey);
  } catch (error: unknown) {
    if (error instanceof joseErrors.JWTExpired) {
      return { ...tokenClaims(token), status: 'expired' };
    }
    throw error;
  }
  const claims = tokenClaims(token);
  // A token with no `exp` never expires, which we will not honour
  return { ...claims, status: claims.expires ? 'issued' : 'invalid' };
};

/**
 * returns the access_token expiration, user, and status
 *
 * Every token state this endpoint can determine — issued, expired, invalid,
 * not present — is reported as a 200 with an explicit `status`. Only a failure
 * to determine the state at all (no JWKS key, an unreachable key source, a
 * malformed request) is an error response, so the client can tell "your token is
 * expired" from "I could not find out" and stop retrying the former.
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
      accessToken = cookies.credentials_token;
    }

    if (accessToken) {
      const jwtKey = await fetchJWTKey(process.env.NODE_ENV === 'production');
      if (!jwtKey) {
        res.status(500).json({
          message: 'No JWT Key to verify token',
        });
        return;
      }
      // validate the token
      const publicKey = await importSPKI(jwtKey, 'RS256');
      const accessResult = await verifyAndDecodeToken(accessToken, publicKey);

      // Fence's own session cookie (`SESSION_COOKIE_NAME`, default `fence`) is
      // an RS256 JWT signed with the same key as `access_token`, but on
      // Fence's own SESSION_TIMEOUT/SESSION_LIFETIME schedule — independent of
      // the access token's lifetime. Decoded in its own try/catch: a
      // malformed, tampered, or key-rotated `fence` cookie must not turn an
      // otherwise-healthy `access_token` read into a 500. On any failure it is
      // simply omitted, and the caller falls back to `access_token` alone.
      let fenceResult:
        | (ReturnType<typeof tokenClaims> & {
            status: JWTSessionStatus;
          })
        | undefined;
      if (cookies.fence) {
        try {
          fenceResult = await verifyAndDecodeToken(cookies.fence, publicKey);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error: unknown) {
          fenceResult = undefined;
        }
      }

      res.status(200).json({
        ...accessResult,
        ...(fenceResult && {
          fenceStatus: fenceResult.status,
          fenceIssued: fenceResult.issued,
          fenceExpires: fenceResult.expires,
          fenceExpiresInMs: fenceResult.expiresInMs,
        }),
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
