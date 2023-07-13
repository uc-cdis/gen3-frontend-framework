import useSWR from 'swr';
import { AuthTokenData } from './types';
import type { IncomingMessage } from 'http';
import { getCookie } from 'cookies-next';
import { decodeJwt } from 'jose';
import {
  isExpired,
  JWTPayloadAndUser,
} from '../../pages/api/auth/sessionToken';

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<AuthTokenData>);

export const useAuthSession = (): AuthTokenData => {
  const { data: sessionToken, error } = useSWR<AuthTokenData>(
    '/api/auth/sessionToken',
    fetcher,
  );
  console.log(
    'useAuthSession',
    sessionToken,
    typeof window === 'undefined' ? 'server' : 'client',
  );
  return error || sessionToken === undefined
    ? { status: 'error' }
    : sessionToken;
};

/**
 * For server side rendering only
 * @param ctx
 */
export const getAuthSession = async <T>(req: IncomingMessage) => {
  const access_token = getCookie('access_token', { req });

  if (access_token && typeof access_token === 'string') {
    const decodedAccessToken = (await decodeJwt(
      access_token,
    )) as unknown as JWTPayloadAndUser;
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
  }

  return {
    status: 'not present',
  };
};
