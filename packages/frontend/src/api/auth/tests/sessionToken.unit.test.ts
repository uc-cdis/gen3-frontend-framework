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

// `jest.mock` factories are hoisted above every other statement in this file,
// including these declarations. Class declarations are TDZ-restricted, so a
// hoisted reference to one throws `ReferenceError` before it runs — function
// declarations are hoisted with their body instead, so these use the old
// ES5 subclassing pattern rather than `class ... extends Error`.
function MockJWTExpired(this: Error, message?: string) {
  Error.call(this, message);
}
MockJWTExpired.prototype = Object.create(Error.prototype);

function MockJWTInvalid(this: Error, message?: string) {
  Error.call(this, message);
}
MockJWTInvalid.prototype = Object.create(Error.prototype);

function MockJWSInvalid(this: Error, message?: string) {
  Error.call(this, message);
}
MockJWSInvalid.prototype = Object.create(Error.prototype);

function MockJWKSNoMatchingKey(this: Error, message?: string) {
  Error.call(this, message);
}
MockJWKSNoMatchingKey.prototype = Object.create(Error.prototype);

// These ES5-style constructors have no construct signature TS can see, so
// `new`-ing them directly is a type error. This is the one place that casts.
type MockErrorCtor = new (message?: string) => Error;
const newMockError = (Ctor: unknown, message?: string): Error =>
  new (Ctor as MockErrorCtor)(message);

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
  // `expiresInMs` is computed from this server's own clock; pin it so the
  // expected value in each test is exact rather than a moving target.
  jest.spyOn(Date, 'now').mockReturnValue(NOW_SECONDS * 1000);
  mockFetchJWTKey.mockResolvedValue('-----BEGIN PUBLIC KEY-----');
  mockJwtVerify.mockResolvedValue({ payload: {} });
  mockDecodeJwt.mockReturnValue(claimsFor());
});

afterEach(() => {
  jest.restoreAllMocks();
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
      expiresInMs: 1200 * 1000,
      userContext: { name: 'alice' },
      status: 'issued',
    });
  });

  it('reports an expired token as a definitive 200, not an error', async () => {
    // jwtVerify checks the signature before the claims, so an expired token has
    // already proven its signature and its claims can be reported. Answering with
    // an error instead would tell the client "state unknown" and make it retry a
    // token that is never coming back.
    mockJwtVerify.mockRejectedValue(newMockError(MockJWTExpired, 'exp'));
    mockDecodeJwt.mockReturnValue(claimsFor({ exp: NOW_SECONDS - 60 }));

    const res = makeRes();
    await handler(makeReq('access_token=a.b.c'), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      issued: NOW_SECONDS,
      expires: NOW_SECONDS - 60,
      expiresInMs: -60 * 1000,
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
    mockJwtVerify.mockRejectedValue(
      newMockError(MockJWSInvalid, 'bad signature'),
    );

    const res = makeRes();
    await handler(makeReq('access_token=a.b.c'), res);

    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBeUndefined();
  });

  it('does not decode a token it could not verify', async () => {
    mockJwtVerify.mockRejectedValue(
      newMockError(MockJWSInvalid, 'bad signature'),
    );

    await handler(makeReq('access_token=a.b.c'), makeRes());

    // Claims from an unverified token are attacker-controlled
    expect(mockDecodeJwt).not.toHaveBeenCalled();
  });

  describe('fence session cookie', () => {
    // Fence signs the `fence` session cookie with the same key as
    // `access_token`, but on its own SESSION_TIMEOUT/SESSION_LIFETIME
    // schedule. These claims are distinguished from the access token's by
    // decodeJwt's mock return value differing per call.
    const accessClaims = claimsFor();
    const fenceClaims = claimsFor({ exp: NOW_SECONDS + 7200 });

    it('reports a healthy fence cookie alongside the access token', async () => {
      mockDecodeJwt
        .mockReturnValueOnce(accessClaims)
        .mockReturnValueOnce(fenceClaims);

      const res = makeRes();
      await handler(makeReq('access_token=a.b.c; fence=f.g.h'), res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        issued: NOW_SECONDS,
        expires: NOW_SECONDS + 1200,
        expiresInMs: 1200 * 1000,
        userContext: { name: 'alice' },
        status: 'issued',
        fenceStatus: 'issued',
        fenceIssued: NOW_SECONDS,
        fenceExpires: NOW_SECONDS + 7200,
        fenceExpiresInMs: 7200 * 1000,
      });
    });

    it('reports an expired fence cookie as a definitive status, not an error', async () => {
      const expiredFenceClaims = claimsFor({ exp: NOW_SECONDS - 60 });
      mockJwtVerify
        .mockResolvedValueOnce({ payload: {} }) // access_token
        .mockRejectedValueOnce(newMockError(MockJWTExpired, 'exp')); // fence
      mockDecodeJwt
        .mockReturnValueOnce(accessClaims)
        .mockReturnValueOnce(expiredFenceClaims);

      const res = makeRes();
      await handler(makeReq('access_token=a.b.c; fence=f.g.h'), res);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('issued');
      expect(res.body.fenceStatus).toBe('expired');
      expect(res.body.fenceExpires).toBe(NOW_SECONDS - 60);
    });

    it('omits fence fields and leaves the access token result unaffected when fence fails verification', async () => {
      mockJwtVerify
        .mockResolvedValueOnce({ payload: {} }) // access_token
        .mockRejectedValueOnce(newMockError(MockJWSInvalid, 'bad signature')); // fence
      mockDecodeJwt.mockReturnValueOnce(accessClaims);

      const res = makeRes();
      await handler(makeReq('access_token=a.b.c; fence=f.g.h'), res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        issued: NOW_SECONDS,
        expires: NOW_SECONDS + 1200,
        expiresInMs: 1200 * 1000,
        userContext: { name: 'alice' },
        status: 'issued',
      });
    });

    it('does not read a fence cookie when none is present', async () => {
      const res = makeRes();
      await handler(makeReq('access_token=a.b.c'), res);

      expect(res.statusCode).toBe(200);
      expect(res.body.fenceStatus).toBeUndefined();
      expect(mockJwtVerify).toHaveBeenCalledTimes(1);
    });
  });
});
