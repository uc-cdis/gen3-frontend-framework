import {  fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { coreCreateApi} from "../../store/hooks";

export interface Metadata {
    readonly entries:Array<Record<string, unknown>>
}


// Define a service using a base URL and expected endpoints
export const aggMetadataApi = coreCreateApi({
    reducerPath: 'aggMetadataApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/aggregate' }),
    // @ts-ignore
    endpoints: (builder) => ({
        // @ts-ignore
        getMetadata: builder.query<Metadata, string>({
            query: () => `metadata`,
        }),
    }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetMetadataQuery } = aggMetadataApi;
