import { gen3Api } from '../gen3';
import { GEN3_MANIFEST_API } from '../../constants';
import { Manifest } from './types';

const TAGS = 'manifest';

export const manifestTags = gen3Api.enhanceEndpoints({
  addTagTypes: [TAGS],
});

export const manifestApi = manifestTags.injectEndpoints({
  endpoints: (builder) => ({
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
  useGetFileManifestQuery,
  useGetCohortManifestQuery,
  useGetMetadataManifestQuery,
  useGetFileFromManifestQuery,
  useGetMetadataFromManifestQuery,
  useAddCohortManifestMutation,
  useAddFileManifestMutation,
  useAddMetadataManifestMutation,
} = manifestApi;
