import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { EventEmitter } from 'events';
import fs from 'fs';
import http from 'http';
import os from 'os';
import type { AddressInfo } from 'net';
import nodePath from 'path';
import { exportJWK, generateKeyPair, type JWK, SignJWT } from 'jose';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createWorkspaceAssetsHandler } from '../workspaceAssetsHandler';

jest.mock('cookies-next', () => ({ getCookie: jest.fn() }));

describe('workspace assets extension proxy auth and header filtering', () => {
  let assetRoot: string;
  let privateKey: CryptoKey;
  let otherPrivateKey: CryptoKey;
  let proxyCalls: http.RequestOptions[];
  let jwksServer: http.Server;
  let JWKS_URL: string;

  const sign = (key: CryptoKey, claims: Record<string, unknown>, exp = '1h') =>
    new SignJWT(claims)
      .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
      .setExpirationTime(exp)
      .sign(key);

  beforeAll(async () => {
    assetRoot = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'gff-auth-'));
    fs.mkdirSync(nodePath.join(assetRoot, 'remote'));
    fs.mkdirSync(nodePath.join(assetRoot, 'free'));
    const pair = await generateKeyPair('RS256');
    privateKey = pair.privateKey;
    otherPrivateKey = (await generateKeyPair('RS256')).privateKey;
    const publicJwk: JWK = {
      ...(await exportJWK(pair.publicKey)),
      kid: 'k1',
      alg: 'RS256',
    };
    // Real HTTP JWKS endpoint, so createRemoteJWKSet is exercised end to end.
    jwksServer = http.createServer((_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ keys: [publicJwk] }));
    });
    await new Promise<void>((resolve) =>
      jwksServer.listen(0, '127.0.0.1', resolve),
    );
    const { port } = jwksServer.address() as AddressInfo;
    JWKS_URL = `http://127.0.0.1:${port}/.well-known/jwks`;
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterAll(async () => {
    await new Promise((resolve) => jwksServer.close(resolve));
    fs.rmSync(assetRoot, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    proxyCalls = [];
    jest.spyOn(http, 'request').mockImplementation(((
      opts: http.RequestOptions,
    ) => {
      proxyCalls.push(opts);
      const proxyReq = new EventEmitter() as unknown as http.ClientRequest;
      Object.assign(proxyReq, {
        end: () =>
          setImmediate(() => proxyReq.emit('error', new Error('stub'))),
        write: jest.fn(),
        destroy: jest.fn(),
      });
      return proxyReq;
    }) as unknown as typeof http.request);
  });

  const run = async (
    headers: Record<string, string>,
    options: Parameters<typeof createWorkspaceAssetsHandler>[0] = {},
  ) => {
    const handler = createWorkspaceAssetsHandler({
      assetRoot,
      serverExtensionProxyPath: '/lw-workspace/proxy',
      ...options,
    });
    const req = new EventEmitter() as unknown as NextApiRequest;
    Object.assign(req, {
      method: 'GET',
      url: '/api/workspace-assets/remote/module/list',
      query: { tier: 'remote', path: ['module', 'list'] },
      headers: { host: 'localhost:3000', ...headers },
      cookies: {},
    });
    const res = {
      statusCode: 0,
      status: jest.fn((code: number) => {
        res.statusCode = code;
        return res;
      }),
      end: jest.fn(() => res),
      setHeader: jest.fn(),
      headersSent: false,
    };
    await handler(req, res as unknown as NextApiResponse);
    return res;
  };

  const forwarded = () => proxyCalls[0]?.headers as Record<string, string>;
  const claims = {
    sub: '42',
    context: { user: { name: 'alice@example.org' } },
  };

  describe('header filtering', () => {
    it('drops Cookie access_token, Authorization and X-Forwarded-* by default', async () => {
      await run({
        cookie: 'access_token=secret; _xsrf=abc; other=1',
        authorization: 'Bearer not-a-jwt',
        'x-forwarded-for': '1.2.3.4',
        'x-custom': 'nope',
        accept: 'application/json',
        'x-xsrftoken': 'abc',
      });
      const headers = forwarded();
      expect(headers.cookie).toBe('_xsrf=abc');
      expect(headers.authorization).toBeUndefined();
      expect(headers['x-forwarded-for']).toBeUndefined();
      expect(headers['x-custom']).toBeUndefined();
      expect(headers.accept).toBe('application/json');
      expect(headers['x-xsrftoken']).toBe('abc');
    });

    it('omits the Cookie header when no allowed cookie is present', async () => {
      await run({ cookie: 'access_token=secret' });
      expect(forwarded().cookie).toBeUndefined();
    });

    it('forwards extra configured headers and cookies', async () => {
      await run(
        { cookie: 'access_token=s; session=1', 'x-custom': 'yes' },
        { forwardedHeaders: ['X-Custom'], forwardedCookies: ['session'] },
      );
      expect(forwarded()['x-custom']).toBe('yes');
      expect(forwarded().cookie).toBe('session=1');
    });
  });

  describe('JWT verification', () => {
    it('injects identity headers for a validly signed token', async () => {
      const jwt = await sign(privateKey, claims);
      const res = await run(
        { authorization: `Bearer ${jwt}` },
        { jwksUrl: JWKS_URL },
      );
      expect(res.statusCode).not.toBe(401);
      const headers = forwarded();
      expect(headers['REMOTE_USER']).toBe('uid:42,alice@example.org');
      expect(headers['X-Gen3-User-ID']).toBe('uid:42,alice@example.org');
      expect(headers['Authorization']).toBe(`Bearer ${jwt}`);
    });

    it('rejects a token signed by an unknown key', async () => {
      const jwt = await sign(otherPrivateKey, claims);
      const res = await run(
        { authorization: `Bearer ${jwt}` },
        { jwksUrl: JWKS_URL },
      );
      expect(res.statusCode).toBe(401);
      expect(proxyCalls).toHaveLength(0);
    });

    it('rejects an expired token', async () => {
      const jwt = await sign(privateKey, claims, '-1h');
      const res = await run(
        { authorization: `Bearer ${jwt}` },
        { jwksUrl: JWKS_URL },
      );
      expect(res.statusCode).toBe(401);
      expect(proxyCalls).toHaveLength(0);
    });

    it('rejects an unsigned / malformed token', async () => {
      const forged = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(
        JSON.stringify(claims),
      ).toString('base64url')}.`;
      const res = await run(
        { authorization: `Bearer ${forged}` },
        { jwksUrl: JWKS_URL },
      );
      expect(res.statusCode).toBe(401);
      expect(proxyCalls).toHaveLength(0);
    });

    it('proxies without identity headers when there is no token', async () => {
      const res = await run({}, { jwksUrl: JWKS_URL });
      expect(res.statusCode).not.toBe(401);
      expect(forwarded()['REMOTE_USER']).toBeUndefined();
    });

    it('still decodes unverified claims when jwksUrl is not set', async () => {
      const jwt = await sign(otherPrivateKey, claims);
      await run({ authorization: `Bearer ${jwt}` });
      expect(forwarded()['REMOTE_USER']).toBe('uid:42,alice@example.org');
    });
  });
});
