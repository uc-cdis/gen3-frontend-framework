import {
  type AuthzMapping,
  hasPermission,
  isPathPrefixOfPath,
} from '../hasPermission';

describe('isPathPrefixOfPath', () => {
  it.each([
    ['/a', '/a', true],
    ['/a', '/a/b', true],
    ['/a', '/a/b/c', true],
    ['/a/b', '/a/b/c/d', true],
    ['/a/', '/a/b', true], // trailing slash on prefix
    ['/a', '/a/b/', true], // trailing slash on path
    ['/', '/a/b', true], // root covers everything
    ['/a', '/ab', false], // segment boundary, not string prefix
    ['/a/b', '/a', false], // child does not cover parent
    ['/a/b', '/a/c', false], // siblings
    ['/b', '/a/b', false], // not anchored at root
  ])('%s covers %s -> %s', (prefix, path, expected) => {
    expect(isPathPrefixOfPath(prefix, path)).toBe(expected);
  });
});

describe('hasPermission with hierarchical resources', () => {
  const mapping: AuthzMapping = {
    '/programs/demo': [{ service: 'fence', method: 'read-storage' }],
    '/workspace': [{ service: 'jupyterhub', method: 'access' }],
  };
  const download = { service: 'fence', method: 'read-storage' };

  it('grants undeclared subresources for the same service+method', () => {
    expect(
      hasPermission(mapping, {
        resource: '/programs/demo/projects/p1',
        ...download,
      }),
    ).toBe(true);
    expect(
      hasPermission(mapping, {
        resource: '/programs/demo/projects/p1/files/f1',
        ...download,
      }),
    ).toBe(true);
  });

  it('does not grant a different method on a subresource', () => {
    expect(
      hasPermission(mapping, {
        resource: '/programs/demo/projects/p1',
        service: 'fence',
        method: 'create',
      }),
    ).toBe(false);
  });

  it('does not grant a different service on a subresource', () => {
    expect(
      hasPermission(mapping, {
        resource: '/programs/demo/projects/p1',
        service: 'sheepdog',
        method: 'read-storage',
      }),
    ).toBe(false);
  });

  it('does not grant the parent or a similarly named sibling', () => {
    expect(hasPermission(mapping, { resource: '/programs', ...download })).toBe(
      false,
    );
    expect(
      hasPermission(mapping, { resource: '/programs/demo2', ...download }),
    ).toBe(false);
  });

  it('combines wildcard grants with inheritance', () => {
    const admin: AuthzMapping = {
      '/programs': [{ service: '*', method: '*' }],
    };
    expect(
      hasPermission(admin, {
        resource: '/programs/x/projects/y',
        service: 'sheepdog',
        method: 'create',
      }),
    ).toBe(true);
  });

  it('accumulates grants from parent and child paths', () => {
    const m: AuthzMapping = {
      '/programs/demo': [{ service: 'peregrine', method: 'read' }],
      '/programs/demo/projects/p1': [
        { service: 'fence', method: 'read-storage' },
      ],
    };
    expect(
      hasPermission(m, {
        resource: '/programs/demo/projects/p1',
        service: 'peregrine',
        method: 'read',
      }),
    ).toBe(true);
    expect(
      hasPermission(m, { resource: '/programs/demo/projects/p2', ...download }),
    ).toBe(false);
  });
});
