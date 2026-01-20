import { gen3Api } from '../gen3';
import { GEN3_MANIFEST_API } from '../../constants';
import { Manifest } from './types';
import { JSONObject } from '../../types';

const TAGS = 'manifest';

export const manifestTags = gen3Api.enhanceEndpoints({
  addTagTypes: [TAGS],
});

export interface MDSStatusResponse {
  status: string;
  timestamp: string;
  aggregateMDSEnabled: boolean;
}

export const manifestApi = manifestTags.injectEndpoints({
  endpoints: (builder) => ({
    getManifestServiceStatus: builder.query<MDSStatusResponse, void>({
      query: () => `${GEN3_MANIFEST_API}/_status`,
      transformResponse: (data: JSONObject) => ({
        status: data?.status?.toString() === 'OK' ? 'ok' : 'error',
        timestamp: data?.timestamp?.toString() ?? 'error',
        aggregateMDSEnabled: (data?.aggregateMDSEnabled as boolean) ?? false,
      }),
    }),
    getFileManifest: builder.query<Manifest, void>({
      query: () => `${GEN3_MANIFEST_API}`,
    }),
    getFileFromManifest: builder.query<Manifest, string>({
      query: (id) => `${GEN3_MANIFEST_API}/file/${id}`,
    }),
    addFileManifest: builder.mutation<string, Manifest>({
      query: (manifest) => ({
        url: `${GEN3_MANIFEST_API}`,
        method: 'POST',
        body: manifest,
      }),
      transformResponse: (response: { filename: string }) => {
        return response.filename;
      },
      invalidatesTags: [TAGS],
    }),
    getCohortManifest: builder.query<Manifest, void>({
      query: () => `${GEN3_MANIFEST_API}/cohorts`,
    }),
    addCohortManifest: builder.mutation<string, Manifest>({
      query: (manifest) => ({
        url: `${GEN3_MANIFEST_API}/cohorts`,
        method: 'POST',
        body: manifest,
      }),
      transformResponse: (response: { guid: string }) => {
        return response.guid;
      },
      invalidatesTags: [TAGS],
    }),
    getMetadataManifest: builder.query<Manifest, void>({
      query: () => `${GEN3_MANIFEST_API}/metadata`,
    }),
    getMetadataFromManifest: builder.query<Manifest, string>({
      query: (id) => `${GEN3_MANIFEST_API}/metadata/${id}`,
    }),
    addMetadataManifest: builder.mutation<string, Record<string, unknown>>({
      query: (data) => ({
        url: `${GEN3_MANIFEST_API}/metadata`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { guid: string }) => {
        return response.guid;
      },
      invalidatesTags: [TAGS],
    }),
  }),
});

export const {
  useGetManifestServiceStatusQuery,
  useLazyGetManifestServiceStatusQuery,
  useGetFileManifestQuery,
  useGetCohortManifestQuery,
  useGetMetadataManifestQuery,
  useGetFileFromManifestQuery,
  useGetMetadataFromManifestQuery,
  useAddCohortManifestMutation,
  useAddFileManifestMutation,
  useAddMetadataManifestMutation,
} = manifestApi;
