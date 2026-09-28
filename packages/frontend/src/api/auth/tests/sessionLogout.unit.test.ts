import type { NextApiRequest, NextApiResponse } from 'next';
import sessionLogout from '../sessionLogout';

jest.mock('@gen3/core/server', () => ({
  GEN3_FENCE_SERVICE: 'https://fence.example.com',
}));

type ResponseBody = { success?: string; error?: string };

const makeResponse = () => {
  const response = {
    setHeader: jest.fn(),
    status: jest.fn(),
    json: jest.fn(),
  };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response as unknown as NextApiResponse<ResponseBody>;
};

describe('sessionLogout API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('only accepts POST', async () => {
    const request = { method: 'GET', headers: {} } as NextApiRequest;
    const response = makeResponse();

    await sessionLogout(request, response);

    expect(response.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(response.status).toHaveBeenCalledWith(405);
    expect(response.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('forwards browser cookies to Fence and clears local auth cookies', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    const request = {
      method: 'POST',
      headers: { cookie: 'fence=session; access_token=token' },
      cookies: { fence: 'session', access_token: 'token' },
    } as unknown as NextApiRequest;
    const response = makeResponse();

    await sessionLogout(request, response);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://fence.example.com/logout',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Cookie: 'fence=session; access_token=token',
        }),
      }),
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.arrayContaining([
        expect.stringContaining('fence='),
        expect.stringContaining('access_token='),
        expect.stringContaining('credentials_token='),
      ]),
    );
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('still clears local cookies and succeeds when Fence responds with an error', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    const request = {
      method: 'POST',
      headers: {},
      cookies: {},
    } as NextApiRequest;
    const response = makeResponse();

    await sessionLogout(request, response);

    expect(response.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.any(Array),
    );
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ success: 'success' });
  });

  it('still clears local cookies and succeeds when Fence is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    const request = {
      method: 'POST',
      headers: {},
      cookies: {},
    } as NextApiRequest;
    const response = makeResponse();

    await sessionLogout(request, response);

    expect(response.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.any(Array),
    );
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ success: 'success' });
  });
});
