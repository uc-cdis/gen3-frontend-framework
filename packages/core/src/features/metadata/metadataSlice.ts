import {  fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { coreCreateApi } from "../../store/api";
import {Reducer} from "@reduxjs/toolkit";

export interface Metadata {
    readonly entries:Array<Record<string, unknown>>
}

// Define a service using a base URL and expected endpoints
export const aggMetadataApi = coreCreateApi({
    reducerPath: 'aggMetadataApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://healdata.org/mds/aggregate/' }),
    endpoints: (builder) => ({
        getMetadata: builder.query<Metadata, string>({
            query: () => `metadata`,
        }),
    }),
})


export const { useGetMetadataQuery } = aggMetadataApi;
export const aggReducerPath:string = aggMetadataApi.reducerPath;
export const aggReducer: any =  aggMetadataApi.reducer as Reducer;
