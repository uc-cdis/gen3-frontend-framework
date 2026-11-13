import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRouteConfig } from './lib/auth/arboristConfig';
import { getLoginStatus, type LoginStatus } from './lib/auth/getLoginStatus';
import { fetchArboristResources } from './lib/auth/fetchAuthz';
import type { ForbiddenAction, RouteRule } from '@gen3/frontend/server';
import {
  getAccessToken,
  getRouteRuleForPath,
  NO_WORKSPACE_ACCESS_ROUTE,
  resolveForbiddenAction,
  WORKSPACE_ROUTE,
} from '@gen3/frontend/server';

function isLoggedIn(loginStatus: LoginStatus) {
  return loginStatus.status === 'issued';
}

function handleForbidden(req: NextRequest, rule?: RouteRule) {
  const action: ForbiddenAction = resolveForbiddenAction(rule);
  if (action.type === 'redirect') {
    return NextResponse.redirect(new URL(action.destination, req.url));
  }
  const forbiddenUrl = req.nextUrl.clone();
  forbiddenUrl.pathname = action.destination;
  return NextResponse.rewrite(forbiddenUrl);
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const { routes: routeConfig } = await getRouteConfig();
  let rule = getRouteRuleForPath(pathname, routeConfig);
  const loginStatus = await getLoginStatus(req.headers.get('Cookie') || '');
  const loggedIn = isLoggedIn(loginStatus);

  // Logged in users have no reason to see the Login page: send them to Profile.
  if (pathname === '/Login') {
    if (loggedIn) {
      return NextResponse.redirect(new URL('/Profile', req.url));
    } else {
      return NextResponse.next();
    }
  }

  // nginx sends users here when the workspace proxy denies them. It is a denial
  // landing page, not a protected resource: handle it with the /Workspace rule's
  // 403 handling. Must run before login enforcement to avoid a login loop.
  if (pathname === NO_WORKSPACE_ACCESS_ROUTE) {
    return handleForbidden(
      req,
      getRouteRuleForPath(WORKSPACE_ROUTE, routeConfig),
    );
  }

  // check if there is a wildcard route
  if (!rule) {
    rule = getRouteRuleForPath('*', routeConfig);
  }

  // Public route: not listed in Arborist config
  if (!rule) {
    return NextResponse.next();
  }

  const loginRequired = rule.loginRequired ?? true;

  if (!loginRequired) {
    return NextResponse.next();
  }

  // Enforce login if required
  if (!loggedIn) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/Login';
    loginUrl.searchParams.set('referer', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const needsAuthz = Array.isArray(rule?.authz) && rule?.authz.length > 0;

  // If no authz resources configured, login is enough
  if (!needsAuthz) {
    return NextResponse.next();
  }

  // Authz is enabled, AND route has authzResources → check Arborist resources
  const tokenFromCookie =
    getAccessToken(req.headers.get('Cookie') || '') ?? null;

  // Let the server-side helper resolve resources using the active Gen3 session.
  const resources = await fetchArboristResources(
    tokenFromCookie,
    process.env.NODE_ENV === 'production',
  );

  const allowed = (rule.authz ?? []).some((needed) =>
    resources.includes(needed),
  );
  if (!allowed) {
    // Already logged in if required; they just lack authz for this resource
    return handleForbidden(req, rule);
  }

  return NextResponse.next();
}
