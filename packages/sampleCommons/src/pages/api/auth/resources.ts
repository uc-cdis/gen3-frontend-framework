import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthzEnabled, getRouteConfig } from '../../../lib/auth/arboristConfig';
import { fetchArboristResources } from '@gen3/core/server';

const ARBORIST_COOKIE_NAME = 'arborist_resources';
const RESOURCES_TTL_SECONDS = 300;

interface ArboristCookiePayload {
  expires: number;
  resources: string[];
  userKey: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authzEnabled = getAuthzEnabled();
  const routeConfig = getRouteConfig();

  // If authz is disabled, just return that fact to the client.
  if (!authzEnabled) {
    return res.status(200).json({
      disabled: true,
      resources: [],
      routeConfig,
    });
  }

  let currentUserKey = 'anonymous';
  try {
    const url = new URL('/api/auth/sessionToken',req.url);
  const tokenResponse = await fetch('/api/auth/sessionToken');
  const sessionToken = await tokenResponse.json();
  currentUserKey = sessionToken.user.username;
  } catch (e) {
    console.warn('Failed to fetch sessionToken in API:', e);
  }

  const now = Date.now();

  let cookiePayload: ArboristCookiePayload | null = null;
  const rawCookie = req.cookies[ARBORIST_COOKIE_NAME];

  if (rawCookie) {
    try {
      cookiePayload = JSON.parse(rawCookie) as ArboristCookiePayload;
    } catch (e) {
      console.warn('Failed to parse arborist cookie in API:', e);
    }
  }

  const cacheValid =
    cookiePayload &&
    cookiePayload.expires > now &&
    cookiePayload.userKey === currentUserKey;

  let resources: string[];
  if (cacheValid) {
    resources = cookiePayload!.resources;
  } else {
    resources = await fetchArboristResources(null);

    const newPayload: ArboristCookiePayload = {
      expires: now + RESOURCES_TTL_SECONDS * 1000,
      resources,
      userKey: currentUserKey,
    };

    res.setHeader(
      'Set-Cookie',
      `${ARBORIST_COOKIE_NAME}=${encodeURIComponent(
        JSON.stringify(newPayload),
      )}; Max-Age=${RESOURCES_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`,
    );
  }

  res.status(200).json({
    disabled: false,
    resources,
    routeConfig,
  });
}
