import { useState } from 'react';
import { useDeepCompareEffect } from 'use-deep-compare';
import useSWR from 'swr';
import { AuthTokenData } from './types';
import type { IncomingMessage } from 'http';
import { getCookie } from 'cookies-next';
import { decodeJwt, importSPKI, jwtVerify } from 'jose';
import { isExpired, JWTPayloadAndUser } from '../../api/auth/sessionToken';
import { fetchJWTKey } from '../../api/auth/';
import { type LoginStatus, type JWTSessionStatus } from '@gen3/core';

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<AuthTokenData>);

export const useAuthSession = (): AuthTokenData => {
  const { data: sessionToken, error } = useSWR<AuthTokenData>(
    '/api/auth/sessionToken',
    fetcher,
  );
  return error || sessionToken === undefined
    ? { status: 'error' }
    : sessionToken;
};

interface AuthSessionResponse {
  status: 'expired' | 'issued' | 'invalid' | 'not present';
  issued?: number;
  expires?: number;
  user?: string;
}

/**
 * Asynchronously retrieves and validates an authentication session based on the provided request.
 *
 * This function extracts an access token from the request's cookies and validates it using a public key
 * retrieved from a JWKS source. If the token is valid, decodes it to extract user and session information.
 * If the token is missing, invalid, expired, or if an error occurs during validation, it returns a status
 * indicating the token is not present or invalid.
 *
 * @param {IncomingMessage} req - The incoming HTTP request object containing cookies.
 * @returns {Promise<AuthSessionResponse>} A promise resolving to an authentication session response containing:
 * - `issued`: The timestamp when the token was issued.
 * - `expires`: The timestamp when the token expires.
 * - `user`: The user information extracted from the token's context.
 * - `status`: The status of the token, which can be 'issued', 'expired', or 'invalid'.
 */
export const getAuthSession = async (
  req: IncomingMessage,
): Promise<AuthSessionResponse> => {
  const access_token = getCookie('access_token', { req });

  if (access_token && typeof access_token === 'string') {
    if (access_token) {
      try {
        const jwtKey = await fetchJWTKey();
        if (!jwtKey) {
          return {
            status: 'not present',
          };
        }
        // validate the token
        const publicKey = await importSPKI(jwtKey, 'RS256');
        await jwtVerify(access_token, publicKey);
        const decodedAccessToken = decodeJwt(access_token) as JWTPayloadAndUser;

        return {
          issued: decodedAccessToken.iat,
          expires: decodedAccessToken.exp,
          user: decodedAccessToken.context.user,
          status: decodedAccessToken.exp
            ? isExpired(decodedAccessToken.exp)
              ? 'expired'
              : 'issued'
            : 'invalid',
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error: unknown) {
        return {
          status: 'not present',
        };
      }
    }
  }
  return {
    status: 'not present',
  };
};

export type SessionContextValue = {
  userStatus?: LoginStatus;
  status: JWTSessionStatus;
  pending: boolean;
};

export const useManageSession = (
  userStatus: LoginStatus,
): SessionContextValue => {
  const [session, setSession] = useState<SessionContextValue>({
    status: 'not present',
    pending: true,
  });

  useDeepCompareEffect(() => {
    if (userStatus === 'authenticated') {
      setSession((prev) => ({
        ...prev,
        userStatus: 'authenticated',
        status: 'issued',
        pending: false,
      }));
    } else if (userStatus === 'not present') {
      // if (isSuccess && existingSession && existingSession.status === 'issued') {
      setSession((prev) => ({
        ...prev,
        userStatus: 'not present',
        status: 'not present',
        pending: true,
      }));
    } else if (userStatus === 'pending') {
      setSession((prev) => ({
        ...prev,
        pending: true,
        status: 'not present',
        userStatus: 'pending',
      }));
    } else if (userStatus === 'unauthenticated') {
      setSession((prev) => ({
        ...prev,
        pending: false,
        status: 'invalid',
        userStatus: 'unauthenticated',
      }));
    }
  }, [userStatus]);

  return session;
};
