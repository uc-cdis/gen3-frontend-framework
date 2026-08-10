/**
 * Unit tests for the /api/auth/sessionToken handler.
 *
 * The contract this endpoint owes the client is that every token state it can
 * determine — issued, expired, invalid, not present — comes back as a 200 with an
 * explicit `status`, and only a failure to determine the state at all is an error
 * response. SessionProvider relies on that distinction: a definitive answer stops
 * its refresh scheduling, an error makes it retry.
 *
 * `jose` is ESM-only and cannot be loaded by this jest config, so it is mocked;
 * the error classes are declared here and shared with the code under test.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../sessionToken';

class MockJWTExpired extends Error {}
class MockJWTInvalid extends Error {}
class MockJWSInvalid extends Error {}
class MockJWKSNoMatchingKey extends Error {}

const mockJwtVerify = jest.fn();
const mockDecodeJwt = jest.fn();

jest.mock('jose', () => ({
  errors: {
    JWTExpired: MockJWTExpired,
    JWTInvalid: MockJWTInvalid,
    JWSInvalid: MockJWSInvalid,
    JWKSNoMatchingKey: MockJWKSNoMatchingKey,
  },
  importSPKI: jest.fn().mockResolvedValue({ type: 'public' }),
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
  decodeJwt: (...args: unknown[]) => mockDecodeJwt(...args),
}));

const mockFetchJWTKey = jest.fn();
jest.mock('../../../lib/auth/utils', () => ({
  fetchJWTKey: () => mockFetchJWTKey(),
}));

jest.mock('@gen3/core/server', () => ({
  isFetchError: () => false,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeRes = () => {
  const res = {
    statusCode: -1,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
  };
  return res as unknown as NextApiResponse & {
    statusCode: number;
    body: Record<string, unknown>;
  };
};

const makeReq = (cookie?: string) =>
  ({ headers: cookie ? { cookie } : {} }) as NextApiRequest;

const NOW_SECONDS = 1_700_000_000;

const claimsFor = (overrides: Record<string, unknown> = {}) => ({
  iat: NOW_SECONDS,
  exp: NOW_SECONDS + 1200,
  context: { user: { name: 'alice' } },
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchJWTKey.mockResolvedValue('-----BEGIN PUBLIC KEY-----');
  mockJwtVerify.mockResolvedValue({ payload: {} });
  mockDecodeJwt.mockReturnValue(claimsFor());
});

// ---------------------------------------------------------------------------

describe('sessionToken handler', () => {
  it('reports a valid token as issued, with its claims', async () => {
    const res = makeRes();
    await handler(makeReq('access_token=a.b.c'), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      issued: NOW_SECONDS,
      expires: NOW_SECONDS + 1200,
      userContext: { name: 'alice' },
      status: 'issued',
    });
  });

  it('reports an expired token as a definitive 200, not an error', async () => {
    // jwtVerify checks the signature before the claims, so an expired token has
    // already proven its signature and its claims can be reported. Answering with
    // an error instead would tell the client "state unknown" and make it retry a
    // token that is never coming back.
    mockJwtVerify.mockRejectedValue(new MockJWTExpired('exp'));
    mockDecodeJwt.mockReturnValue(claimsFor({ exp: NOW_SECONDS - 60 }));

    const res = makeRes();
    await handler(makeReq('access_token=a.b.c'), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      issued: NOW_SECONDS,
      expires: NOW_SECONDS - 60,
      userContext: { name: 'alice' },
      status: 'expired',
    });
  });

  it('reports a token with no exp as invalid', async () => {
    // A token with no expiry never expires, which is not something we honour
    mockDecodeJwt.mockReturnValue(claimsFor({ exp: undefined }));

    const res = makeRes();
    await handler(makeReq('access_token=a.b.c'), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('invalid');
  });

  it('reports no cookie as not present', async () => {
    const res = makeRes();
    await handler(makeReq(), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'not present' });
  });

  it('survives a token whose payload has no user context', async () => {
    mockDecodeJwt.mockReturnValue(claimsFor({ context: undefined }));

    const res = makeRes();
    await handler(makeReq('access_token=a.b.c'), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('issued');
    expect(res.body.userContext).toBeUndefined();
  });

  it('errors when the token state cannot be determined', async () => {
    // No verification key: this is the case the client must treat as "unknown"
    // and retry, as distinct from any definitive token state.
    mockFetchJWTKey.mockResolvedValue(undefined);

    const res = makeRes();
    await handler(makeReq('access_token=a.b.c'), res);

    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBeUndefined();
  });

  it('errors on a signature failure rather than reporting a token state', async () => {
    mockJwtVerify.mockRejectedValue(new MockJWSInvalid('bad signature'));

    const res = makeRes();
    await handler(makeReq('access_token=a.b.c'), res);

    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBeUndefined();
  });

  it('does not decode a token it could not verify', async () => {
    mockJwtVerify.mockRejectedValue(new MockJWSInvalid('bad signature'));

    await handler(makeReq('access_token=a.b.c'), makeRes());

    // Claims from an unverified token are attacker-controlled
    expect(mockDecodeJwt).not.toHaveBeenCalled();
  });
});
