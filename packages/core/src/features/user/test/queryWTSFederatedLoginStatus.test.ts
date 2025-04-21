import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { GEN3_WTS_API } from '../../../constants';
import { queryWTSFederatedLoginStatus } from '../queryWTSFederatedLoginStatus';

// Define the MSW server and handlers
const mockURL = `${GEN3_WTS_API}/external_oidc/`;

const handlers = [
  http.get(mockURL, () => {
    // This default handler will be overridden in each test
    return HttpResponse.json({ providers: [] });
  }),
];

const server = setupServer(...handlers);

// Setup MSW server before tests
beforeAll(() => server.listen());
// Reset handlers after each test
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('queryWTSFederatedLoginStatus', () => {
  it('should return providers when API returns a valid response', async () => {
    // Setup the mock response for this test
    server.use(
      http.get(mockURL, () => {
        return HttpResponse.json({ providers: ['provider1', 'provider2'] });
      }),
    );

    const result = await queryWTSFederatedLoginStatus();

    expect(result).toEqual({ providers: ['provider1', 'provider2'] });
  });

  it('should return an empty providers array if API response is null', async () => {
    // Setup a null response
    server.use(
      http.get(mockURL, () => {
        return HttpResponse.json(null);
      }),
    );

    const result = await queryWTSFederatedLoginStatus();

    expect(result).toEqual({ providers: [] });
  });

  it('should return an empty providers array if response has no providers', async () => {
    server.use(
      http.get(mockURL, () => {
        return HttpResponse.json({});
      }),
    );

    const result = await queryWTSFederatedLoginStatus();

    expect(result).toEqual({ providers: [] });
  });

  it('should return an error if the request fails with an error', async () => {
    server.use(
      http.get(mockURL, () => {
        return HttpResponse.error();
      }),
    );

    const result = await queryWTSFederatedLoginStatus();

    expect(result.providers).toEqual([]);
    expect(result.error).toBeInstanceOf(Error);
  });

  it('should return a generic error if the request fails with a non-standard response', async () => {
    server.use(
      http.get(mockURL, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const result = await queryWTSFederatedLoginStatus();

    expect(result.providers).toEqual([]);
    expect(result.error).toBeInstanceOf(Error);
  });
});
