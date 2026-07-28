import { coreStore } from '../../store';
import { userAuthApi } from './userSliceRTK';
import { fetchJSONDataFromURL, HttpMethod } from '../../utils';
import { GEN3_WTS_API } from '../../constants';
import { ExternalProvider } from './types';

let cachedToken: string | null = null;

export class CsrfTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsrfTokenError';
  }
}

export const getCsrfToken = async (): Promise<string> => {
  if (cachedToken) return cachedToken;

  // Get the current state
  const currentState = coreStore.getState();

  // Check if token is already in the RTK Query cache
  const tokenResult = userAuthApi.endpoints.getCSRF.select()(currentState);

  if (tokenResult?.data?.csrfToken) {
    cachedToken = tokenResult.data.csrfToken;
    return cachedToken;
  }

  // If not in cache, trigger the query manually
  try {
    const result = await coreStore.dispatch(
      userAuthApi.endpoints.getCSRF.initiate(),
    );

    if ('error' in result) {
      throw new CsrfTokenError(
        `Failed to fetch CSRF token: ${JSON.stringify(result.error)}`,
      );
    }

    if (!result.data) {
      throw new CsrfTokenError('No token received from server');
    }

    cachedToken = result.data.csrfToken;
    return cachedToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
};

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

export const makeAuthenticatedRequest = async <T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> => {
  const csrfToken = await getCsrfToken();

  const mergedHeaders = new Headers(options?.headers);

  // 2. Safely append or overwrite the new keys
  mergedHeaders.set('X-CSRF-Token', csrfToken);
  mergedHeaders.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders, // Pass the valid Headers object directly
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

interface ExternalProviders {
  providers: ExternalProvider[];
}

interface ExternalProvidersResponse extends ExternalProviders {
  error?: Error;
}

export const queryWTSFederatedLoginStatus = async (
  signal?: AbortSignal,
): Promise<ExternalProvidersResponse> => {
  try {
    const results = await fetchJSONDataFromURL<ExternalProviders>(
      `${GEN3_WTS_API}/external_oidc/`,
      false,
      HttpMethod.GET,
      undefined,
      signal,
    );

    // Handle both null response and response without providers
    if (!results || !results.providers) {
      return { providers: [] };
    }

    return results;
  } catch (error: unknown) {
    return {
      providers: [],
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
};
