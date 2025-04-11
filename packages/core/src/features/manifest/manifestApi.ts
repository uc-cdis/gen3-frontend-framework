import { gen3Api } from '../gen3';
import { GEN3_MANIFEST_API } from '../../constants';

const TAGS = 'manifest';

export const manifestTags = gen3Api.enhanceEndpoints({
  addTagTypes: [TAGS],
});

export const manifestApi = manifestTags.injectEndpoints({
  endpoints: (builder) => ({
    getManifest: builder.query<any, void>({
      query: () => `${GEN3_MANIFEST_API}/manifest`,
    }),
  }),
});

export const { useGetManifestQuery } = manifestApi;
