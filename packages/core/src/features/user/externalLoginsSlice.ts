import { gen3Api } from '../gen3';
import { ExternalProvider } from './types';
import { GEN3_WTS_API } from '../../constants';


export interface ExternalProviderResponse {
  providers: ExternalProvider[];
}

/**
 *  @description Creates a externalLoginApi for listing the configured identity providers
 *  in workspace token service. Includes user token expiration time.
 *  @see https://github.com/uc-cdis/workspace-token-service/tree/master
 */
export const externalLoginApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getExternalLogins: builder.query<ExternalProviderResponse, void>({
      query: () => GEN3_WTS_API
    }),
  }),
});

export const { useGetExternalLoginsQuery } = externalLoginApi;
