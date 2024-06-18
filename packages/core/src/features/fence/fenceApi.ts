import { gen3Api } from '../gen3/gen3Api';
import { GEN3_FENCE_API, GEN3_REDIRECT_URL } from '../../constants';
import { fetchFence } from './utils';

export interface NameUrl {
  readonly name: string;
  readonly url: string;
}

export interface Gen3LoginProvider {
  readonly desc?: string;
  readonly id: string;
  readonly idp: string;
  readonly name: string;
  readonly secondary: boolean;
  readonly url: string;
  readonly urls: Array<NameUrl>;
}

export interface Gen3FenceLoginProviders {
  readonly default_provider: Gen3LoginProvider;
  readonly providers: Array<Gen3LoginProvider>;
}

/**
 * Creates a fence API endpoint for handling login processes
 * @param endpoints - defined endpoint query for logging in
 * @returns: The generated fence login API slice
 */
export const loginProvidersApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getLoginProviders: builder.query<Gen3FenceLoginProviders, void>({
      query: () => `${GEN3_FENCE_API}/user/login`,
    }),
  }),
});

export const { useGetLoginProvidersQuery } = loginProvidersApi;

export interface FetchRequest {
  readonly endpoint: string;
  readonly method?: 'GET' | 'POST';
  readonly body?: object;
  readonly headers?: Record<string, string>;
  readonly isJSON?: boolean;
}

/**
 * Logout from fence
 */

export const logoutFence = async (redirect = '/') =>
  await fetchFence({
    endpoint: `${GEN3_FENCE_API}/user/logout?next=${GEN3_REDIRECT_URL}${redirect}`,
    method: 'GET',
  });
