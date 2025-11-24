import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt, JWTPayload } from 'jose';
import { getAuthzEnabled, getRouteConfig, RouteConfig, } from './lib/authz/arboristConfig';
import { fetchArboristResources } from '@gen3/core/server';

const ARBORIST_COOKIE_NAME = 'arborist_resources';
const RESOURCES_TTL_SECONDS = 300;
const ANONYMOUS_USER_KEY = 'anonymous';

interface ArboristCookiePayload {
  expires: number;
  resources: string[];
  userKey: string;
}

function getUserKeyFromToken(token: string | null): string {
  if (!token) return ANONYMOUS_USER_KEY;

  try {
    const payload = decodeJwt(token) as JWTPayload & {
      context?: { user?: { name?: string } };
    };

    return (
      payload.sub ??
      payload.context?.user?.name ??
      ANONYMOUS_USER_KEY
    );
  } catch {
    return ANONYMOUS_USER_KEY;
  }
}

const WILDCARD_ROUTE_KEY = '*';

function getRouteRuleForPath(pathname: string, routeConfig: RouteConfig) {
  return routeConfig[pathname] ?? routeConfig[WILDCARD_ROUTE_KEY];
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
async function isLoggedIn(req: NextRequest): Promise<boolean> {
  try {
    const url = new URL('/api/auth/sessionToken', req.nextUrl.origin);
    console.log("url", url);
    const res = await fetch(url.toString(), {
      method: 'GET',
      // Forward cookies so sessionToken endpoint can see Fence cookies, etc.
      headers: {
        cookie: req.headers.get('cookie') ?? '',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return false;
    }

    const json = (await res.json()) as { status?: string };
    return json.status === 'issued';
  } catch (e) {
    console.error('Failed to determine server session status:', e);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Avoid recursion: let the sessionToken endpoint (and any other auth APIs)
  // run without this middleware trying to call them again.
  if (pathname.startsWith('/api/auth/sessionToken')) {
    return NextResponse.next();
  }

  const routeConfig = getRouteConfig();
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
  const loggedIn = await isLoggedIn(req);


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
  if (!getAuthzEnabled()) {
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
  // NOTE: fetchArboristResources from @gen3/core/server is expected to
  // understand the current session via cookies; we can pass null token here
  // and let it rely on server-side auth.
  const tokenFromCookieOrHeader =
    req.cookies.get('jwt')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '') ||
    null;

  const currentUserKey = getUserKeyFromToken(tokenFromCookieOrHeader);
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
    // Run on almost everything, but skip Next.js internals & common assets
    '/((?!_next/static|_next/image|favicon.ico|api/*|.*\\.ico$|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.json$).*)',
  ],
};
