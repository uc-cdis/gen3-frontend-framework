import { checkRouteAccess } from '../utils';
import { LinkAuthStatus } from '../types';
import type { AuthorizedRoutesConfig } from '../../../lib/authz/type';

const routesConfig: AuthorizedRoutesConfig = {
  routes: {
    '/Public': { loginRequired: false },
    '/DataLibrary': { loginRequired: true },
    '/Admin': { loginRequired: true, authz: ['/admin'] },
    '/Ws': {
      loginRequired: true,
      authz: [
        { resource: '/workspace', service: 'jupyterhub', method: 'access' },
      ],
    },
  },
};

describe('checkRouteAccess', () => {
  it('treats unconfigured and public routes as authorized, even while pending', () => {
    expect(checkRouteAccess('/Other', {}, routesConfig, false, true)).toBe(
      LinkAuthStatus.Authorized,
    );
    expect(checkRouteAccess('/Public', {}, routesConfig, false, true)).toBe(
      LinkAuthStatus.Authorized,
    );
  });

  it('reports pending, not login required, while the session is resolving', () => {
    expect(
      checkRouteAccess('/DataLibrary', {}, routesConfig, false, true),
    ).toBe(LinkAuthStatus.Pending);
    expect(checkRouteAccess('/Admin', {}, routesConfig, false, true)).toBe(
      LinkAuthStatus.Pending,
    );
  });

  it('reports login required once the session resolves as logged out', () => {
    expect(
      checkRouteAccess('/DataLibrary', {}, routesConfig, false, false),
    ).toBe(LinkAuthStatus.LoginRequired);
  });

  it('authorizes login-only routes for a logged-in user', () => {
    expect(checkRouteAccess('/DataLibrary', {}, routesConfig, true, true)).toBe(
      LinkAuthStatus.Authorized,
    );
  });

  it('reports pending, not unauthorized, while authz resources are loading', () => {
    expect(checkRouteAccess('/Admin', {}, routesConfig, true, true)).toBe(
      LinkAuthStatus.Pending,
    );
  });

  it('checks authz resources once loaded', () => {
    expect(checkRouteAccess('/Admin', {}, routesConfig, true, false)).toBe(
      LinkAuthStatus.Unauthorized,
    );
    expect(
      checkRouteAccess(
        '/Admin',
        { '/admin': [{ service: 'x', method: 'y' }] },
        routesConfig,
        true,
        false,
      ),
    ).toBe(LinkAuthStatus.Authorized);
  });

  it('requires the service and method, not just the resource path', () => {
    const requestorOnly = {
      '/workspace': [{ service: 'requestor', method: 'create' }],
    };
    const workspaceUser = {
      '/workspace': [{ service: 'jupyterhub', method: 'access' }],
    };
    expect(
      checkRouteAccess('/Ws', requestorOnly, routesConfig, true, false),
    ).toBe(LinkAuthStatus.Unauthorized);
    expect(
      checkRouteAccess('/Ws', workspaceUser, routesConfig, true, false),
    ).toBe(LinkAuthStatus.Authorized);
  });
});
