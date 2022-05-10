import {  fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { coreCreateApi } from "../../api";
import {Reducer, Middleware} from "@reduxjs/toolkit";

export interface Metadata {
    readonly entries:Record<string, Array<Record<string, unknown>>>;
}

// Define a service using a base URL and expected endpoints
export const aggMetadataApi = coreCreateApi({
    reducerPath: 'aggMetadataApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://healdata.org/mds/aggregate/' }),
    endpoints: (builder) => ({
        getMetadata: builder.query<Metadata, { limit: number, offset:number }>({
            query: (params) => `metadata?limit=${params.limit}&offset=${params.offset}`,
        }),
        getTags: builder.query<Metadata, string>({
            query: () => `tags`,
        }),
    }),
});


export const { useGetMetadataQuery, useGetTagsQuery } = aggMetadataApi;
export const aggReducerPath:string = aggMetadataApi.reducerPath;
export const aggReducer: Reducer =  aggMetadataApi.reducer as Reducer;
export const aggReducerMiddleware = aggMetadataApi.middleware as Middleware;
