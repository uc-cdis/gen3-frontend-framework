import { gen3Api } from '../gen3/gen3Api';
import { GEN3_FENCE_API, GEN3_REDIRECT_URL } from '../../constants';

import { fetchFence } from './fetchFence';

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

interface PresignedUrlRequest {
  readonly guid: string;
  readonly what: string;
}

export interface PresignedUrlResponse {
  readonly url: string;
}

/**
 * Creates a fence API endpoint for handling login/data processes
 * @param endpoints - defined endpoint query for logging in
 * @returns: The generated fence login API slice
 */
export const loginProvidersApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getLoginProviders: builder.query<Gen3FenceLoginProviders, void>({
      query: () => `${GEN3_FENCE_API}/login`,
    }),
    getDownload: builder.query<PresignedUrlResponse, string>({
      query: (guid) => `${GEN3_FENCE_API}/data/download/${guid}`,
    }),
    getPresignedUrl: builder.query<PresignedUrlResponse, PresignedUrlRequest>({
      query: ({ guid, what }) => `${GEN3_FENCE_API}/data/${what}/${guid}`,
    }),
  }),
});

export const {
  useGetLoginProvidersQuery,
  useGetDownloadQuery,
  useLazyGetDownloadQuery,
  useGetPresignedUrlQuery,
  useLazyGetPresignedUrlQuery,
} = loginProvidersApi;

/**
 * Logout from fence
 */

export const logoutFence = async (redirect = '/') =>
  // possibly change here
  await fetchFence({
    endpoint: `${GEN3_FENCE_API}/logout?next=${GEN3_REDIRECT_URL}${redirect}`,
    method: 'GET',
  });
