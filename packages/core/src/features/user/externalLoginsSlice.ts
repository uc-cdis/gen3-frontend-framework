import { gen3Api } from '../gen3';
import type { ExternalProvider } from './types';
import { GEN3_WTS_API } from '../../constants';
import type { ResourceAuthzMapping } from '../authz';

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
      query: () => ({
        url: `${GEN3_WTS_API}/external_oidc/`,
      }),
    }),
    isExternalConnected: builder.query<boolean, string>({
      query: (idp: string) => ({
        url: `${GEN3_WTS_API}/oauth2/connected?idp=${idp}`,
      }),
      transformResponse: () => {
        return true; // if success then connected is true
      },
    }),
    getAggregateWTSResourceAuthzMapping: builder.query<
      ResourceAuthzMapping,
      void
    >({
      query: () => ({
        url: `${GEN3_WTS_API}/aggregate/authz/mapping`,
      }),
    }),
  }),
});

export const {
  useGetExternalLoginsQuery,
  useLazyGetExternalLoginsQuery,
  useLazyIsExternalConnectedQuery,
  useIsExternalConnectedQuery,
  useGetAggregateWTSResourceAuthzMappingQuery,
  useLazyGetAggregateWTSResourceAuthzMappingQuery,
} = externalLoginApi;

export const selectMeshAuthzMapping =
  externalLoginApi.endpoints.getAggregateWTSResourceAuthzMapping.select();
