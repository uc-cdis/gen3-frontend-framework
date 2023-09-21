import { gen3Api } from '../gen3';
import { ExternalProvider, FileMetadata } from './types';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { GUID_PREFIX_PATTERN } from '../../constants';
import { resolveDRSObjectId } from '../drsResolver/utils';

export interface ExternalProviderResponse {
  providers: ExternalProvider[];
}

export interface FederatedLoginStatusForDownloadsResponse
  extends ExternalProviderResponse {
  download_url?: string;
}

interface FederatedLoginStatusForDownloadsArgs {
  selectedResources: ReadonlyArray<Record<string, FileMetadata[]>>;
  manifestFieldName: string;
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
    getFederatedLogin: builder.query<
      FederatedLoginStatusForDownloadsResponse,
      FederatedLoginStatusForDownloadsArgs
    >({
      async queryFn(
        { selectedResources, manifestFieldName },
        _queryApi,
        _extraOptions,
        fetchWithBQ,
      ) {
        const wtsResults = await fetchWithBQ({
          headers: {
            credentials: 'include',
          },
          url: 'wts/external_oidc/',
        });
        if (wtsResults.error)
          return { error: wtsResults.error as FetchBaseQueryError };

        // const providers = wtsResults.data as ExternalProvider[];

        // const unauthenticatedProviders = providers.filter(
        //   (provider) => !provider.refresh_token_expiration,
        // );

        const guidsForHostnameResolution: string[] = [];
        const guidPrefixes: string[] = [];
        selectedResources.forEach((selectedResource) => {
          (selectedResource[manifestFieldName] || []).forEach(
            (fileMetadata) => {
              if (fileMetadata.object_id) {
                const guidDomainPrefix = (
                  fileMetadata.object_id.match(GUID_PREFIX_PATTERN) || []
                ).shift();
                if (guidDomainPrefix) {
                  if (!guidPrefixes.includes(guidDomainPrefix)) {
                    guidPrefixes.push(guidDomainPrefix);
                    guidsForHostnameResolution.push(fileMetadata.object_id);
                  }
                } else {
                  guidsForHostnameResolution.push(fileMetadata.object_id);
                }
              }
            },
          );
        });
        const guidResolutions = resolveDRSObjectId(guidsForHostnameResolution);

        const externalHosts = guidResolutions
          .filter(
            (resolvedGuid) => resolvedGuid && resolvedGuid.from_index_service,
          )
          .map(
            (resolvedGuid) =>
              new URL(resolvedGuid.from_index_service.host).host,
          );

        return wtsResults.data
          ? {
              data: wtsResults.data as FederatedLoginStatusForDownloadsResponse,
            }
          : { error: wtsResults.error as unknown as FetchBaseQueryError };
      },
    }),
  }),
});

export const { useGetExternalLoginsQuery } = externalLoginApi;
