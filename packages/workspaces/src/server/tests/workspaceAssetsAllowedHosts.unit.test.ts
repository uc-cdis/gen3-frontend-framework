import {
  afterAll,
  afterEach,
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
import nodePath from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createWorkspaceAssetsHandler,
  type WorkspaceAssetsHandlerOptions,
} from '../workspaceAssetsHandler';

jest.mock('cookies-next', () => ({ getCookie: jest.fn() }));

const makeRequest = (
  headers: Record<string, string>,
  path = 'module/list',
): NextApiRequest => {
  const req = new EventEmitter() as unknown as NextApiRequest;
  Object.assign(req, {
    method: 'GET',
    url: `/api/workspace-assets/remote/${path}`,
    query: { tier: 'remote', path: path.split('/') },
    headers,
    cookies: {},
  });
  return req;
};

const makeResponse = () => {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status: jest.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    end: jest.fn((body?: unknown) => {
      res.body = body;
      return res;
    }),
    setHeader: jest.fn(),
    headersSent: false,
  };
  return res;
};

describe('workspace assets extension proxy host allowlist', () => {
  let assetRoot: string;
  let requestSpy: jest.SpiedFunction<typeof http.request>;

  beforeAll(() => {
    assetRoot = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'gff-assets-'));
    fs.mkdirSync(nodePath.join(assetRoot, 'remote'));
    fs.mkdirSync(nodePath.join(assetRoot, 'free'));
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterAll(() => {
    fs.rmSync(assetRoot, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    requestSpy = jest.spyOn(http, 'request').mockImplementation((() => {
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

  afterEach(() => {
    requestSpy.mockRestore();
  });

  const run = async (
    headers: Record<string, string>,
    options: Partial<WorkspaceAssetsHandlerOptions> = {},
  ) => {
    const handler = createWorkspaceAssetsHandler({
      assetRoot,
      serverExtensionProxyPath: '/lw-workspace/proxy',
      ...options,
    });
    const res = makeResponse();
    await handler(makeRequest(headers), res as unknown as NextApiResponse);
    return res;
  };

  it('allows loopback hosts by default', async () => {
    const res = await run({ host: 'localhost:3000' });
    expect(res.statusCode).not.toBe(403);
    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy.mock.calls[0][0]).toMatchObject({
      hostname: 'localhost',
      path: '/lw-workspace/proxy/module/list',
    });
  });

  it('rejects non-loopback hosts by default', async () => {
    const res = await run({ host: 'evil.example.com' });
    expect(res.statusCode).toBe(403);
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('rejects an attacker-supplied X-Forwarded-Host', async () => {
    const res = await run({
      host: 'localhost:3000',
      'x-forwarded-host': 'internal-svc:8080',
    });
    expect(res.statusCode).toBe(403);
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('rejects hosts that fail syntax validation', async () => {
    const res = await run({ host: 'localhost@evil.com/x' });
    // falls back to the default localhost:8890, which is loopback and allowed
    expect(res.statusCode).not.toBe(403);
    expect(requestSpy.mock.calls[0][0]).toMatchObject({
      hostname: 'localhost',
      port: '8890',
    });
  });

  it('allows a configured hostname on any port, case-insensitively', async () => {
    const res = await run(
      { host: 'MyCommons.Example.org:8443' },
      { allowedHosts: ['mycommons.example.org'] },
    );
    expect(res.statusCode).not.toBe(403);
    expect(requestSpy).toHaveBeenCalledTimes(1);
  });

  it('matches a full host:port entry exactly', async () => {
    const options = { allowedHosts: ['mycommons.example.org:8443'] };
    const ok = await run({ host: 'mycommons.example.org:8443' }, options);
    expect(ok.statusCode).not.toBe(403);

    requestSpy.mockClear();
    const denied = await run({ host: 'mycommons.example.org:9999' }, options);
    expect(denied.statusCode).toBe(403);
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('replaces the loopback default when allowedHosts is set', async () => {
    const res = await run(
      { host: 'localhost:3000' },
      { allowedHosts: ['mycommons.example.org'] },
    );
    expect(res.statusCode).toBe(403);
  });

  it('denies everything when allowedHosts is empty', async () => {
    const res = await run({ host: 'localhost:3000' }, { allowedHosts: [] });
    expect(res.statusCode).toBe(403);
  });

  it('ignores allowedHosts when serverExtensionProxyBaseUrl is set', async () => {
    const res = await run(
      { host: 'evil.example.com' },
      {
        serverExtensionProxyBaseUrl: 'http://workspace-proxy.internal:9000',
        allowedHosts: [],
      },
    );
    expect(res.statusCode).not.toBe(403);
    expect(requestSpy.mock.calls[0][0]).toMatchObject({
      hostname: 'workspace-proxy.internal',
      port: '9000',
    });
  });
});
