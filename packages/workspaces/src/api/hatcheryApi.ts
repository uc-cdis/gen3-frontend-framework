import { gen3Api } from '@gen3/core';
import { GEN3_HATCHERY_API } from '../constants';

const HacheryWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['Hacheru'],
});

interface HatcheryItem {
  name?: string;
  hash?: string;
  id?: string;
}

export interface HatcheryStatusRequest {
  id: string;
  containerHash: string;
}

export const hacheryApi = HacheryWithTags.injectEndpoints({
  endpoints: (builder) => ({
    hatcheryOptions: builder.query<string | null, string>({
      query: () => `${GEN3_HATCHERY_API}/options`,
      transformResponse: (response: Array<HatcheryItem>, _meta, tag) => {
        const match = response.find((o) => o.name?.includes(tag));
        return match?.hash ?? match?.id ?? null;
      },
    }),
    hatcheryStatus: builder.query<string, HatcheryStatusRequest>({
      query: ({ id, containerHash }) => {
        const hash = containerHash;
        const query = hash ? `?id=${encodeURIComponent(hash)}` : '';
        return `${GEN3_HATCHERY_API}/status/${query}`;
      },
      transformErrorResponse: (error) => {
        console.error('Hatchery status query error:', error);
        return null;
      },
      transformResponse: (response: { status?: string }) => {
        return (response.status || '').toLowerCase();
      },
    }),
  }),
});

export const {
  useHatcheryOptionsQuery,
  useLazyHatcheryOptionsQuery,
  useHatcheryStatusQuery,
  useLazyHatcheryStatusQuery,
} = hacheryApi;
