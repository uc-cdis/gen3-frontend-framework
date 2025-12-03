import { NextRequest, NextResponse } from 'next/server';
import { getRouteConfig, } from './lib/auth/arboristConfig';
import { getLoginStatus, type LoginStatus } from './lib/auth/getLoginStatus';
import { fetchArboristResources } from './lib/auth/fetchAuthz';
import { ANONYMOUS_USER_KEY, ARBORIST_COOKIE_NAME, RESOURCES_TTL_SECONDS } from './lib/auth/constants';
import { RouteConfig } from '@gen3/frontend/server';

interface ArboristCookiePayload {
  expires: number;
  resources: string[];
  userKey: string;
}

const WILDCARD_ROUTE_KEY = '*';

function getRouteRuleForPath(pathname: string, routeConfig: RouteConfig) {
  return routeConfig?.[pathname] ?? routeConfig?.[WILDCARD_ROUTE_KEY];
}

function parseArboristCookie(
  value: string | undefined,
): ArboristCookiePayload | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<ArboristCookiePayload>;

    if (
      typeof parsed.expires === 'number' &&
      Array.isArray(parsed.resources) &&
      typeof parsed.userKey === 'string'
    ) {
      return parsed as ArboristCookiePayload;
    }
  } catch (e) {
    console.warn('Failed to parse arborist cookie:', e);
  }

  return null;
}

/**
 * Gen3 way of determining login status on the server:
 * delegate to the same /api/auth/sessionToken endpoint that the
 * SessionProvider uses (getSession()).
 *
 * We treat status === "issued" as "logged in".
 */
function isLoggedIn(loginStatus: LoginStatus) { return loginStatus.status === "issued"}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const {enableAuthz,  routes: routeConfig } = await getRouteConfig();
  let rule = getRouteRuleForPath(pathname, routeConfig);
  // check if there is a wildcard route
  if (!rule) {
    rule = getRouteRuleForPath('*', routeConfig);
  }

  // Public route: not listed in Arborist config
  if (!rule) {
    return NextResponse.next();
  }

  const loginRequired = rule.loginRequired ?? true;
  const needsAuthz =
    Array.isArray(rule.authzResources) && rule.authzResources.length > 0;

  // Gen3 login check
  const loginStatus = await getLoginStatus(req.headers.get('Cookie') || '');
  const loggedIn = await isLoggedIn(loginStatus);

  // 1) Enforce login if required
  if (loginRequired && !loggedIn) {
    const loginUrl = new URL('/Login', req.url);
    loginUrl.searchParams.set('referer', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2) If no authz resources configured, login is enough
  if (!needsAuthz) {
    return NextResponse.next();
  }

  // 3) If authz is globally disabled, treat as login-only
  if (!enableAuthz) {
    return NextResponse.next();
  }

  // Defensive: if authz is required but we somehow aren't logged in,
  // send to login (even though in practice loginRequired will almost
  // always be true when authz is configured).
  if (!loggedIn) {
    const loginUrl = new URL('/Login', req.url);
    loginUrl.searchParams.set('referer', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4) Authz is enabled AND route has authzResources → check Arborist resources
  const tokenFromCookieOrHeader =
    req.cookies.get('access_token')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '') ||
    null;

  const currentUserKey = isLoggedIn(loginStatus) ? loginStatus?.userContext?.name: ANONYMOUS_USER_KEY;
  const cached = parseArboristCookie(
    req.cookies.get(ARBORIST_COOKIE_NAME)?.value,
  );

  const now = Date.now();
  const cacheValid =
    !!cached && cached.expires > now && cached.userKey === currentUserKey;

  let resources: string[];

  if (cacheValid) {
    resources = cached.resources;
  } else {
    // Let the server-side helper resolve resources using the active Gen3 session.
    resources = await fetchArboristResources(tokenFromCookieOrHeader);
  }

  const allowed = rule.authzResources!.some((needed) =>
    resources.includes(needed),
  );

  if (!allowed) {
    // Already logged in if required; they just lack authz for this resource
    return NextResponse.redirect(new URL('/403', req.url));
  }

  const res = NextResponse.next();

  if (!cacheValid) {
    const payload: ArboristCookiePayload = {
      expires: now + RESOURCES_TTL_SECONDS * 1000,
      resources,
      userKey: currentUserKey,
    };

    res.cookies.set(ARBORIST_COOKIE_NAME, JSON.stringify(payload), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: RESOURCES_TTL_SECONDS,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return res;
}

export const config = {
  matcher: [
    // Run on almost everything, but skip Next.js internals and common assets
    '/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.ico$|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.json$).*)',
  ],
};
