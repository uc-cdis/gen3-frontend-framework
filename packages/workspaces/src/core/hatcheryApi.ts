import { gen3Api } from '@gen3/core';
import { GEN3_HATCHERY_API } from '../constants';

const HatcheryWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['Hatchery'],
});

interface HatcheryItem {
  name?: string;
  hash?: string;
  id?: string;
}

export const hatcheryApi = HatcheryWithTags.injectEndpoints({
  endpoints: (builder) => ({
    hatcheryOptions: builder.query<string | null, string>({
      query: () => `${GEN3_HATCHERY_API}/options`,
      transformResponse: (response: Array<HatcheryItem>, _meta, tag) => {
        const match = response.find((o) => o.name?.includes(tag));
        return match?.hash ?? match?.id ?? null;
      },
    }),
    hatcheryStatus: builder.query<string, string | null>({
      query: (containerHash) => {
        const hash = containerHash;
        const query = hash ? `?id=${encodeURIComponent(hash)}` : '';
        return `${GEN3_HATCHERY_API}/status/${query}`;
      },
      transformErrorResponse: (error) => {
        console.error('Hatchery status query error:', error);
        return 'error';
      },
      transformResponse: (response: { status?: string }) => {
        return (response.status || 'unknown').toLowerCase();
      },
    }),
    launchHatcheryWorkspace: builder.mutation<boolean, string>({
      query: (id) => {
        return {
          url: `${GEN3_HATCHERY_API}/launch?id=${id}`,
          method: 'POST',
          invalidatesTags: ['Hatchery'],
          responseHandler: (response) => response.text(),
        };
      },
      transformResponse: async (response: string) => {
        return !!(response && response === 'Success');
      },
    }),
    terminateHatcheryWorkspace: builder.mutation<void, void>({
      query: () => ({
        url: `${GEN3_HATCHERY_API}/terminate`,
        method: 'POST',
        invalidatesTags: ['Hatchery'],
        responseHandler: (response) => response.text(),
      }),
    }),
  }),
});

export const {
  useHatcheryOptionsQuery,
  useLazyHatcheryOptionsQuery,
  useHatcheryStatusQuery,
  useLazyHatcheryStatusQuery,
  useLaunchHatcheryWorkspaceMutation,
  useTerminateHatcheryWorkspaceMutation,
} = hatcheryApi;
