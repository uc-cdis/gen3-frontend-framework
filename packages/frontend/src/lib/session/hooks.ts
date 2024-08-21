import { useState } from 'react';
import { useDeepCompareEffect } from 'use-deep-compare';
import useSWR from 'swr';
import { AuthTokenData } from './types';
import type { IncomingMessage } from 'http';
import { getCookie } from 'cookies-next';
import { decodeJwt } from 'jose';
import { isExpired, JWTPayloadAndUser } from '../../api/auth/sessionToken';
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

/**
 * For server side rendering only
 * @param ctx
 */
export const getAuthSession = async (req: IncomingMessage) => {
  const access_token = getCookie('access_token', { req });

  if (access_token && typeof access_token === 'string') {
    // TODO get secret and verify JWT
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
