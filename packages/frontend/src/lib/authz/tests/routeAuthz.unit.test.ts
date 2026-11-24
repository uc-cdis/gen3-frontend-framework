import raw from './authz.fixture.json';
import { checkRuleAccess, parseAuthzConfig, resolveRoute } from '../routeAuthz';
import type { AuthzMapping } from '../hasPermission';

const config = parseAuthzConfig(raw);
const access = (path: string, isLoggedIn: boolean, mapping?: AuthzMapping) =>
  checkRuleAccess(resolveRoute(config.routes, path), { isLoggedIn, mapping });

const requestorOnly: AuthzMapping = {
  '/workspace': [{ service: 'requestor', method: 'create' }],
};
const workspaceUser: AuthzMapping = {
  '/workspace': [{ service: 'jupyterhub', method: 'access' }],
};

describe('resolveRoute', () => {
  it('matches exact, prefix, then wildcard', () => {
    expect(resolveRoute(config.routes, '/Workspace')).toBe(
      config.routes['/Workspace'],
    );
    expect(resolveRoute(config.routes, '/Workspace/abc')).toBe(
      config.routes['/Workspace'],
    );
    expect(resolveRoute(config.routes, '/WorkspaceX')).toBe(config.routes['*']);
    expect(resolveRoute(config.routes, '/Discovery')).toBe(config.routes['*']);
  });
});

describe('checkRuleAccess', () => {
  it('requires login before authz', () => {
    expect(access('/Workspace', false)).toBe('loginRequired');
  });
  it('path alone is not workspace access', () => {
    expect(access('/Workspace', true, requestorOnly)).toBe('forbidden');
  });
  it('full tuple grants access, including subroutes', () => {
    expect(access('/Workspace', true, workspaceUser)).toBe('allowed');
    expect(access('/Workspace/abc', true, workspaceUser)).toBe('allowed');
  });
  it('bare string entries default to any service and method', () => {
    const m: AuthzMapping = {
      '/reports/2026': [{ service: 'x', method: 'y' }],
    };
    expect(access('/Reports', true, m)).toBe('forbidden'); // child grant doesn't cover parent
    expect(
      access('/Reports', true, { '/reports': [{ service: 'x', method: 'y' }] }),
    ).toBe('allowed');
  });
  it('anonymous mappings can satisfy routes without loginRequired', () => {
    expect(
      access('/Reports', false, {
        '/reports': [{ service: '*', method: '*' }],
      }),
    ).toBe('allowed');
    expect(access('/Reports', false, {})).toBe('loginRequired');
  });
  it('authzMatch any (default) vs all', () => {
    const updater: AuthzMapping = {
      '/programs': [{ service: 'sheepdog', method: 'update' }],
    };
    expect(access('/Submission', true, updater)).toBe('allowed');
    const strict = {
      authzMatch: 'all' as const,
      authz: config.routes['/Submission'].authz,
    };
    expect(
      checkRuleAccess(strict, { isLoggedIn: true, mapping: updater }),
    ).toBe('forbidden');
  });
  it('login-only and public routes', () => {
    expect(access('/Profile', false)).toBe('loginRequired');
    expect(access('/Profile', true, {})).toBe('allowed');
    expect(access('/Discovery', false)).toBe('allowed');
  });
});

describe('parseAuthzConfig', () => {
  it('rejects malformed entries', () => {
    expect(() =>
      parseAuthzConfig({ routes: { '/X': { authz: ['workspace'] } } }),
    ).toThrow(/starting with/);
    expect(() =>
      parseAuthzConfig({
        routes: { '/X': { authz: [{ resource: '/w', servce: 'a' }] } },
      }),
    ).toThrow(/servce/);
    expect(() => parseAuthzConfig({ routes: { X: {} } })).toThrow(/must start/);
    expect(() =>
      parseAuthzConfig({ routes: { '/X': { authzMatch: 'some' } } }),
    ).toThrow(/authzMatch/);
  });
});
