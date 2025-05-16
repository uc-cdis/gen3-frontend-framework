import { fetchJSONDataFromURL, HttpMethod } from '../../utils';
import { GEN3_WTS_API } from '../../constants';
import { ExternalProvider } from './types';

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
