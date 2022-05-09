import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Metadata {
    readonly entries:Array<Record<string, unknown>>
}


// Define a service using a base URL and expected endpoints
export const aggMetadataApi = createApi({
  reducerPath: 'aggMetadataApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/aggregate' }),
  endpoints: (builder) => ({
    getMetadata: builder.query<Metadata, string>({
      query: () => 'metadata',
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetMetadataQuery } = aggMetadataApi;
