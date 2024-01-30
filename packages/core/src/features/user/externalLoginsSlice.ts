import { gen3Api } from '../gen3';
import { ExternalProvider } from './types';


export interface ExternalProviderResponse {
  providers: ExternalProvider[];
}

export const externalLoginApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getExternalLogins: builder.query<ExternalProviderResponse, void>({
      query: () => ({
        headers: {
          credentials: 'include',
        },
        url: 'wts/external_oidc/',
      }),
    }),
  }),
});

export const { useGetExternalLoginsQuery } = externalLoginApi;
